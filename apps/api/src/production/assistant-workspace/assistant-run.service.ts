import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { createPapaProviderRuntime } from "@papadata/ai-runtime";
import type { AssistantRun, AssistantStreamEvent } from "@papadata/contracts";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { LivePrincipalAuthorizationService } from "../auth/live-principal-authorization.service.js";
import {
  PRINCIPAL_SESSION_STORE,
  type PrincipalSessionStore,
} from "../auth/principal.service.js";
import { object, onlyKeys, string, uuid } from "../platform-operations/validation.js";
import { PlatformQueueService } from "../queue/platform-queue.service.js";
import { AssistantWorkspaceService } from "./assistant-workspace.service.js";

const columns = `id,conversation_id AS "conversationId",case_thread_id AS "caseThreadId",status,partial_text AS "partialText",result,error_code AS "errorCode",native_streaming AS "nativeStreaming",updated_at::text AS "updatedAt"`;

const terminal = (status: string): boolean => !["queued", "running", "interrupted"].includes(status);

function positive(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid ${name}`);
  return value;
}

@Injectable()
export class AssistantRunService {
  constructor(
    @Inject(AssistantWorkspaceService)
    private readonly workspace: AssistantWorkspaceService,
    @Inject(LivePrincipalAuthorizationService)
    private readonly authorization: LivePrincipalAuthorizationService,
    @Inject(PRINCIPAL_SESSION_STORE)
    private readonly sessions: PrincipalSessionStore,
    @Inject(PlatformQueueService)
    private readonly queue: PlatformQueueService,
  ) {}

  async currentAuthority(principal: RequestPrincipal): Promise<void> {
    const session = await this.sessions.findSession(principal.sessionId);
    if (
      !session
      || session.revokedAt
      || Date.parse(session.expiresAt) <= Date.now()
      || session.userId !== principal.userId
      || session.activeTenantId !== principal.tenantId
      || session.activeWorkspaceId !== principal.workspaceId
    ) {
      throw new ForbiddenException("Session or workspace changed.");
    }

    const result = await this.authorization.authorize({
      principal,
      requiredCapabilities: ["ai.assistant.run", "ai.history.read"],
    });
    if (!result.allowed) throw new ForbiddenException("Assistant permission changed.");
  }

  async start(principal: RequestPrincipal, input: unknown): Promise<AssistantRun> {
    const body = object(input);
    onlyKeys(body, [
      "requestId",
      "conversationId",
      "caseThreadId",
      "prompt",
      "attachmentIds",
      "useMemory",
    ]);

    const id = uuid(body.requestId);
    const conversationId = uuid(body.conversationId);
    const caseThreadId = body.caseThreadId ? uuid(body.caseThreadId) : null;
    const prompt = string(body.prompt, 1, 8000);
    if (!Array.isArray(body.attachmentIds) || body.attachmentIds.length > 5 || typeof body.useMemory !== "boolean") {
      throw new BadRequestException("Invalid context selection.");
    }
    const attachmentIds = [...new Set(body.attachmentIds.map(uuid))];
    const useMemory = body.useMemory;

    await this.currentAuthority(principal);
    const thread = await this.workspace.requireThread(principal, conversationId);
    if (thread.thread_kind !== "conversation" || thread.archived_at) {
      throw new ConflictException("Use an active conversation.");
    }

    if (caseThreadId) {
      const child = await this.workspace.requireThread(principal, caseThreadId);
      if (
        child.thread_kind !== "case"
        || child.parent_thread_id !== conversationId
        || child.archived_at
      ) {
        throw new BadRequestException("Case does not belong to the conversation.");
      }
    }

    const preferences = await this.workspace.preferences(principal);
    if (!["context", "evidence", "metrics"].every((tool) => preferences.allowedReadTools.includes(tool))) {
      throw new ForbiddenException("Grounded generation requires context, evidence and metric access.");
    }
    const supplementaryContext = await this.workspace.additionalContext(
      principal,
      conversationId,
      attachmentIds,
      useMemory,
    );

    let providerRuntime: ReturnType<typeof createPapaProviderRuntime>;
    try {
      providerRuntime = createPapaProviderRuntime();
    } catch {
      throw new ServiceUnavailableException("Configured AI provider is unavailable.");
    }

    const requestHash = createHash("sha256")
      .update(JSON.stringify({
        conversationId,
        caseThreadId,
        prompt,
        attachmentIds,
        useMemory,
        policyVersion: preferences.version,
      }))
      .digest("hex");

    const created = await this.workspace.scoped(principal, async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        [`assistant-run:${principal.tenantId}:${principal.workspaceId}`],
      );

      const prior = (await client.query<{ request_hash: string; user_id: string }>(
        `SELECT request_hash,user_id
         FROM app.assistant_generation_runs
         WHERE tenant_id=$1 AND workspace_id=$2 AND id=$3`,
        [principal.tenantId, principal.workspaceId, id],
      )).rows[0];
      if (prior) {
        if (prior.request_hash !== requestHash || prior.user_id !== principal.userId) {
          throw new ConflictException("Run identifier has different content or policy.");
        }
        return false;
      }

      const count = (await client.query<{ count: number }>(
        `SELECT count(*)::int AS count
         FROM app.assistant_generation_runs
         WHERE tenant_id=$1 AND workspace_id=$2
           AND status IN ('queued','running','interrupted')`,
        [principal.tenantId, principal.workspaceId],
      )).rows[0]?.count ?? 0;
      if (count >= 1) {
        throw new ConflictException("A generation is already active in this workspace. Wait or cancel it.");
      }

      const spent = (await client.query<{ workspace: string; actor: string }>(
        `SELECT
           coalesce(sum(reserved_cost_minor),0)::text AS workspace,
           coalesce(sum(reserved_cost_minor) FILTER(WHERE user_id=$3),0)::text AS actor
         FROM app.assistant_generation_runs
         WHERE tenant_id=$1 AND workspace_id=$2
           AND created_at>=date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`,
        [principal.tenantId, principal.workspaceId, principal.userId],
      )).rows[0];
      if (
        Number(spent?.workspace ?? 0) + providerRuntime.reserveMinorPerCall
          > positive("AI_WORKSPACE_BUDGET_MINOR_PER_MONTH", 20_000)
        || Number(spent?.actor ?? 0) + providerRuntime.reserveMinorPerCall
          > positive("AI_USER_BUDGET_MINOR_PER_MONTH", 4_000)
      ) {
        throw new ForbiddenException("Monthly AI safety allocation exhausted. Cancelled calls also count.");
      }

      await client.query(
        `INSERT INTO app.assistant_generation_runs(
           id,tenant_id,workspace_id,user_id,conversation_id,case_thread_id,
           request_hash,status,native_streaming,reserved_cost_minor,request_payload
         ) VALUES($1,$2,$3,$4,$5,$6,$7,'queued',$8,$9,$10::jsonb)`,
        [
          id,
          principal.tenantId,
          principal.workspaceId,
          principal.userId,
          conversationId,
          caseThreadId,
          requestHash,
          providerRuntime.nativeStreaming,
          providerRuntime.reserveMinorPerCall,
          JSON.stringify({
            prompt,
            supplementaryContext,
            historyEnabled: preferences.historyEnabled,
            contextDays: preferences.contextDays,
            policyVersion: preferences.version,
          }),
        ],
      );
      return true;
    });

    if (created) {
      try {
        await this.queue.enqueue({
          jobType: "assistant_generation",
          tenantId: principal.tenantId,
          workspaceId: principal.workspaceId,
          payload: { runId: id },
          idempotencyKey: `assistant-generation:${id}`,
        });
      } catch {
        await this.workspace.scoped(principal, (client) => client.query(
          `UPDATE app.assistant_generation_runs
           SET status='failed',error_code='QUEUE_ENQUEUE_FAILED',updated_at=now()
           WHERE tenant_id=$1 AND workspace_id=$2 AND id=$3 AND status='queued'`,
          [principal.tenantId, principal.workspaceId, id],
        ));
        throw new ServiceUnavailableException("Assistant generation queue is unavailable.");
      }
    }

    return this.read(principal, id);
  }

  async read(principal: RequestPrincipal, id: string): Promise<AssistantRun> {
    return this.workspace.scoped(principal, async (client) => {
      const runId = uuid(id);
      const row = (await client.query<AssistantRun>(
        `SELECT ${columns}
         FROM app.assistant_generation_runs
         WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4`,
        [principal.tenantId, principal.workspaceId, principal.userId, runId],
      )).rows[0];
      if (!row) throw new NotFoundException("Run not found.");
      return row;
    });
  }

  async cancel(principal: RequestPrincipal, id: string): Promise<object> {
    const runId = uuid(id);
    const run = await this.read(principal, runId);
    if (terminal(run.status)) return { id: runId, status: run.status };

    await this.workspace.scoped(principal, (client) => client.query(
      `UPDATE app.assistant_generation_runs
       SET status='cancelled',error_code='CANCEL_REQUESTED',updated_at=now()
       WHERE tenant_id=$1 AND workspace_id=$2 AND user_id=$3 AND id=$4
         AND status IN('queued','running','interrupted')`,
      [principal.tenantId, principal.workspaceId, principal.userId, runId],
    ));
    return { id: runId, status: "cancelled" };
  }

  async *events(
    principal: RequestPrincipal,
    id: string,
    signal: AbortSignal,
  ): AsyncIterable<string> {
    let previous = "";
    const deadline = Date.now() + 100_000;
    while (!signal.aborted && Date.now() < deadline) {
      await this.currentAuthority(principal);
      const run = await this.read(principal, id);
      let event: AssistantStreamEvent;
      if (run.status === "completed") {
        event = { type: "completed", result: run.result };
      } else if (terminal(run.status)) {
        event = {
          type: "stopped",
          status: run.status as "failed" | "cancelled" | "interrupted",
          code: run.errorCode ?? "GENERATION_STOPPED",
        };
      } else if (run.partialText !== previous) {
        event = { type: "delta", text: run.partialText };
        previous = run.partialText;
      } else {
        event = { type: "run", runId: id, nativeStreaming: run.nativeStreaming };
      }

      yield `data: ${JSON.stringify(event)}\n\n`;
      if (terminal(run.status)) return;
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(done, 500);
        function done(): void {
          clearTimeout(timeout);
          signal.removeEventListener("abort", done);
          resolve();
        }
        signal.addEventListener("abort", done, { once: true });
      });
    }
  }
}
