import { Inject } from "@nestjs/common";
import {
  ConflictException,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { ProductionDatabase } from "@papadata/database";
import { catchError, concatMap, from, Observable, of, throwError } from "rxjs";
import { AuditService } from "../audit/audit.service.js";
import type { RequestWithPrincipal } from "../auth/request-principal.js";
import type { RequestWithContext } from "../observability/request-context.js";

type CommandRequest = RequestWithPrincipal & RequestWithContext & {
  readonly body?: unknown;
  readonly params?: unknown;
  readonly query?: unknown;
};

type CommandExecutionRow = {
  readonly command_execution_id: string;
  readonly status: "reserved" | "succeeded" | "failed";
  readonly request_hash: string;
  readonly response_body: unknown;
  readonly created_at: string;
};

@Injectable()
export class CommandExecutionInterceptor implements NestInterceptor {
  constructor(
    @Inject(ProductionDatabase) private readonly database: ProductionDatabase,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<CommandRequest>();
    const method = request.method?.toUpperCase() ?? "GET";
    const principal = request.principal;

    if (!principal || !isStateChanging(method)) {
      return next.handle();
    }

    const operationId = request.operationId ?? "unknown";
    const idempotencyKey = readHeader(request.headers, "idempotency-key")
      ?? readBodyIdempotencyKey(request.body);

    if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/u.test(idempotencyKey)) {
      throw new ConflictException(
        "A valid Idempotency-Key header is required for state-changing operations.",
      );
    }

    const correlationId = request.correlationId ?? "unknown";
    const requestHash = hashJson({
      operationId,
      body: request.body ?? null,
      params: request.params ?? null,
      query: request.query ?? null,
    });

    return from(this.reserve({
      tenantId: principal.tenantId,
      workspaceId: principal.workspaceId,
      actorId: principal.userId,
      operationId,
      idempotencyKey,
      correlationId,
      requestHash,
    })).pipe(
      concatMap((reservation) => {
        if (reservation.replay) {
          return of(reservation.responseBody);
        }

        return next.handle().pipe(
          concatMap((result) => from(this.complete({
            commandExecutionId: reservation.commandExecutionId,
            tenantId: principal.tenantId,
            workspaceId: principal.workspaceId,
            actorId: principal.userId,
            operationId,
            correlationId,
            result,
          })).pipe(concatMap(() => of(result)))),
          catchError((error: unknown) => from(this.fail({
            commandExecutionId: reservation.commandExecutionId,
            tenantId: principal.tenantId,
            workspaceId: principal.workspaceId,
            actorId: principal.userId,
            operationId,
            correlationId,
            error,
          })).pipe(concatMap(() => throwError(() => error)))),
        );
      }),
    );
  }

  private async reserve(input: {
    tenantId: string;
    workspaceId: string;
    actorId: string;
    operationId: string;
    idempotencyKey: string;
    correlationId: string;
    requestHash: string;
  }): Promise<{
    commandExecutionId: string;
    replay: boolean;
    responseBody: unknown;
  }> {
    return this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        const inserted = await client.query<CommandExecutionRow>(
          `insert into app.command_executions (
             tenant_id, workspace_id, operation_id, idempotency_key,
             correlation_id, actor_id, status, request_hash
           )
           values ($1, $2, $3, $4, $5, $6, 'reserved', $7)
           on conflict (tenant_id, (coalesce(workspace_id, '')), operation_id, idempotency_key)
           do nothing
           returning *`,
          [
            input.tenantId,
            input.workspaceId,
            input.operationId,
            input.idempotencyKey,
            input.correlationId,
            input.actorId,
            input.requestHash,
          ],
        );
        const created = inserted.rows[0];
        if (created) {
          return {
            commandExecutionId: created.command_execution_id,
            replay: false,
            responseBody: null,
          };
        }

        const existing = (await client.query<CommandExecutionRow>(
          `select * from app.command_executions
           where tenant_id = $1 and workspace_id is not distinct from $2
             and operation_id = $3 and idempotency_key = $4
           for update`,
          [
            input.tenantId,
            input.workspaceId,
            input.operationId,
            input.idempotencyKey,
          ],
        )).rows[0];

        if (!existing) throw new ConflictException("Idempotency reservation failed.");
        if (existing.request_hash !== input.requestHash) {
          throw new ConflictException(
            "Idempotency key was already used for a different request.",
          );
        }
        if (existing.status === "succeeded") {
          return {
            commandExecutionId: existing.command_execution_id,
            replay: true,
            responseBody: existing.response_body,
          };
        }
        if (
          existing.status === "reserved"
          && Date.now() - Date.parse(existing.created_at) < 15 * 60_000
        ) {
          throw new ConflictException("An identical command is already in progress.");
        }

        await client.query(
          `update app.command_executions
           set status = 'reserved', correlation_id = $2, actor_id = $3,
               error_code = null, response_body = null, response_status = null,
               completed_at = null, created_at = now()
           where command_execution_id = $1`,
          [existing.command_execution_id, input.correlationId, input.actorId],
        );
        return {
          commandExecutionId: existing.command_execution_id,
          replay: false,
          responseBody: null,
        };
      },
    );
  }

  private async complete(input: {
    commandExecutionId: string;
    tenantId: string;
    workspaceId: string;
    actorId: string;
    operationId: string;
    correlationId: string;
    result: unknown;
  }): Promise<void> {
    await this.audit.append({
      action: input.operationId,
      actorId: input.actorId,
      actorType: "user",
      correlationId: input.correlationId,
      metadata: { commandExecutionId: input.commandExecutionId },
      outcome: "success",
      resourceId: input.commandExecutionId,
      resourceType: "api_command",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });
    await this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        await client.query(
          `update app.command_executions
           set status = 'succeeded', response_status = 200,
               response_body = $2::jsonb, completed_at = now()
           where command_execution_id = $1`,
          [input.commandExecutionId, JSON.stringify(input.result ?? null)],
        );
      },
    );
  }

  private async fail(input: {
    commandExecutionId: string;
    tenantId: string;
    workspaceId: string;
    actorId: string;
    operationId: string;
    correlationId: string;
    error: unknown;
  }): Promise<void> {
    const errorCode = input.error instanceof Error ? input.error.name : "UnknownError";
    await this.database.withTenantWorkspace(
      input.tenantId,
      input.workspaceId,
      async (client) => {
        await client.query(
          `update app.command_executions
           set status = 'failed', error_code = $2, completed_at = now()
           where command_execution_id = $1`,
          [input.commandExecutionId, errorCode],
        );
      },
    );
    await this.audit.append({
      action: input.operationId,
      actorId: input.actorId,
      actorType: "user",
      correlationId: input.correlationId,
      metadata: {
        commandExecutionId: input.commandExecutionId,
        errorCode,
      },
      outcome: "failure",
      resourceId: input.commandExecutionId,
      resourceType: "api_command",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });
  }
}

function isStateChanging(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

function readHeader(
  headers: CommandRequest["headers"],
  name: string,
): string | null {
  const value = headers?.[name];
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.length > 0 ? first : null;
}

function readBodyIdempotencyKey(body: unknown): string | null {
  if (
    body !== null
    && typeof body === "object"
    && "idempotencyKey" in body
    && typeof (body as { idempotencyKey?: unknown }).idempotencyKey === "string"
  ) {
    return (body as { idempotencyKey: string }).idempotencyKey;
  }
  return null;
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) =>
    `${JSON.stringify(key)}:${stable(record[key])}`
  ).join(",")}}`;
}
