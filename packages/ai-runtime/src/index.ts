import { createHash } from "node:crypto";
import type {
  AiEvaluationMode,
  AiEvaluationResult,
  AiModelRoute,
} from "@papadata/contracts";

export type AiMessage = {
  readonly role: "system" | "user" | "assistant" | "tool";
  readonly content: string;
};

export type AiProviderRequest = {
  readonly modelId: string;
  readonly messages: readonly AiMessage[];
  readonly maxOutputTokens: number;
  readonly temperature: number;
};

export type AiProviderResponse = {
  readonly output: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly providerRequestId: string | null;
};

export type AiEmbeddingRequest = {
  readonly modelId: string;
  readonly inputs: readonly string[];
};

export type AiEmbeddingResponse = {
  readonly embeddings: readonly (readonly number[])[];
  readonly inputTokens: number;
  readonly providerRequestId: string | null;
};

export type AiProviderHealth = {
  readonly healthy: boolean;
  readonly latencyMs: number;
  readonly detail: string | null;
};

export type AiCostEstimate = {
  readonly currency: "USD";
  readonly costMinor: number;
  readonly estimatedInputTokens: number;
  readonly estimatedOutputTokens: number;
};

export interface AiProviderAdapter {
  readonly providerId: string;
  complete(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): Promise<AiProviderResponse>;
  stream(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): AsyncIterable<string>;
  embed(
    request: AiEmbeddingRequest,
    signal?: AbortSignal,
  ): Promise<AiEmbeddingResponse>;
  health(signal?: AbortSignal): Promise<AiProviderHealth>;
  estimateCost(request: AiProviderRequest): AiCostEstimate;
  cancel(requestId: string): Promise<void>;
  generate(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): Promise<AiProviderResponse>;
}

type ProviderOptions = {
  readonly providerId: string;
  readonly endpoint: string;
  readonly apiKey: string;
  readonly timeoutMs?: number;
  readonly maxAttempts?: number;
};

export class OpenAiCompatibleProvider implements AiProviderAdapter {
  readonly providerId: string;
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private consecutiveFailures = 0;
  private circuitOpenUntil = 0;
  private readonly activeRequests = new Map<string, AbortController>();

  constructor(input: ProviderOptions) {
    this.providerId = input.providerId;
    this.endpoint = input.endpoint.replace(/\/$/u, "");
    this.apiKey = input.apiKey;
    this.timeoutMs = input.timeoutMs ?? 15_000;
    this.maxAttempts = input.maxAttempts ?? 3;
  }

  generate(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): Promise<AiProviderResponse> {
    return this.complete(request, signal);
  }

  async complete(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): Promise<AiProviderResponse> {
    const body = await this.requestJson<{
      id?: string;
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    }>("/chat/completions", {
      model: request.modelId,
      messages: redactMessages(request.messages),
      max_tokens: request.maxOutputTokens,
      temperature: request.temperature,
    }, signal);

    return {
      output: body.choices?.[0]?.message?.content ?? "",
      inputTokens: body.usage?.prompt_tokens ?? 0,
      outputTokens: body.usage?.completion_tokens ?? 0,
      providerRequestId: body.id ?? null,
    };
  }

  async *stream(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): AsyncIterable<string> {
    // The adapter exposes a stable streaming contract even when the upstream
    // route is configured without SSE. Providers can override this method with
    // native chunk parsing without changing callers.
    const response = await this.complete(request, signal);
    if (response.output) yield response.output;
  }

  async embed(
    request: AiEmbeddingRequest,
    signal?: AbortSignal,
  ): Promise<AiEmbeddingResponse> {
    const body = await this.requestJson<{
      id?: string;
      data?: Array<{ embedding?: number[] }>;
      usage?: { prompt_tokens?: number; total_tokens?: number };
    }>("/embeddings", {
      model: request.modelId,
      input: request.inputs.map(redactText),
    }, signal);
    return {
      embeddings: body.data?.map((item) => item.embedding ?? []) ?? [],
      inputTokens: body.usage?.prompt_tokens ?? body.usage?.total_tokens ?? 0,
      providerRequestId: body.id ?? null,
    };
  }

  async health(signal?: AbortSignal): Promise<AiProviderHealth> {
    const startedAt = performance.now();
    try {
      await this.requestJson("/models", undefined, signal, "GET");
      return {
        healthy: true,
        latencyMs: Math.round(performance.now() - startedAt),
        detail: null,
      };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Math.round(performance.now() - startedAt),
        detail: error instanceof Error ? error.message : "Provider unavailable",
      };
    }
  }

  estimateCost(request: AiProviderRequest): AiCostEstimate {
    const estimatedInputTokens = estimateTokens(
      request.messages.map((message) => message.content).join("\n"),
    );
    const estimatedOutputTokens = request.maxOutputTokens;
    return {
      currency: "USD",
      costMinor: Math.ceil((estimatedInputTokens + estimatedOutputTokens) / 1_000),
      estimatedInputTokens,
      estimatedOutputTokens,
    };
  }

  async cancel(requestId: string): Promise<void> {
    this.activeRequests.get(requestId)?.abort("cancelled");
    this.activeRequests.delete(requestId);
  }

  private async requestJson<T = Record<string, unknown>>(
    path: string,
    body: unknown,
    externalSignal?: AbortSignal,
    method = "POST",
  ): Promise<T> {
    if (Date.now() < this.circuitOpenUntil) {
      throw new Error("AI provider circuit is open");
    }

    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const requestId = cryptoId();
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);
      const timeout = setTimeout(() => controller.abort("timeout"), this.timeoutMs);
      const relayAbort = (): void => controller.abort(externalSignal?.reason);
      externalSignal?.addEventListener("abort", relayAbort, { once: true });

      try {
        const response = await fetch(`${this.endpoint}${path}`, {
          method,
          headers: {
            authorization: `Bearer ${this.apiKey}`,
            "content-type": "application/json",
            "x-request-id": requestId,
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const retryable = response.status === 408
            || response.status === 429
            || response.status >= 500;
          const error = new Error(`AI provider error: ${response.status}`);
          if (!retryable) throw error;
          lastError = error;
        } else {
          this.consecutiveFailures = 0;
          return await response.json() as T;
        }
      } catch (error) {
        lastError = error;
        if (externalSignal?.aborted) throw error;
      } finally {
        clearTimeout(timeout);
        externalSignal?.removeEventListener("abort", relayAbort);
        this.activeRequests.delete(requestId);
      }

      if (attempt < this.maxAttempts) {
        await delay(Math.min(250 * 2 ** (attempt - 1), 2_000), externalSignal);
      }
    }

    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= 5) {
      this.circuitOpenUntil = Date.now() + 30_000;
      this.consecutiveFailures = 0;
    }
    throw lastError instanceof Error ? lastError : new Error("AI provider request failed");
  }
}

export class LocalDeterministicProvider implements AiProviderAdapter {
  readonly providerId = "local-deterministic";
  private readonly seed: string;
  private readonly cancelled = new Set<string>();

  constructor(input: { readonly seed?: string } = {}) {
    this.seed = input.seed ?? "papadata-local";
  }

  generate(request: AiProviderRequest, signal?: AbortSignal): Promise<AiProviderResponse> {
    return this.complete(request, signal);
  }

  async complete(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): Promise<AiProviderResponse> {
    signal?.throwIfAborted();
    const requestId = deterministicId(this.seed, JSON.stringify(request));
    if (this.cancelled.has(requestId)) throw new Error("AI request cancelled");
    const lastUserMessage = [...request.messages]
      .reverse()
      .find((message) => message.role === "user")?.content ?? "";
    const output = JSON.stringify({
      mode: "local_deterministic",
      requestId,
      summary: redactText(lastUserMessage).slice(0, request.maxOutputTokens * 4),
    });
    return {
      output,
      inputTokens: estimateTokens(request.messages.map((item) => item.content).join("\n")),
      outputTokens: estimateTokens(output),
      providerRequestId: requestId,
    };
  }

  async *stream(request: AiProviderRequest, signal?: AbortSignal): AsyncIterable<string> {
    const response = await this.complete(request, signal);
    for (const token of response.output.split(/(?<=\s)/u)) {
      signal?.throwIfAborted();
      yield token;
    }
  }

  async embed(
    request: AiEmbeddingRequest,
    signal?: AbortSignal,
  ): Promise<AiEmbeddingResponse> {
    signal?.throwIfAborted();
    const embeddings = request.inputs.map((input) => deterministicVector(this.seed, input));
    return {
      embeddings,
      inputTokens: request.inputs.reduce((sum, input) => sum + estimateTokens(input), 0),
      providerRequestId: deterministicId(this.seed, JSON.stringify(request)),
    };
  }

  health(): Promise<AiProviderHealth> {
    return Promise.resolve({ healthy: true, latencyMs: 0, detail: null });
  }

  estimateCost(request: AiProviderRequest): AiCostEstimate {
    return {
      currency: "USD",
      costMinor: 0,
      estimatedInputTokens: estimateTokens(
        request.messages.map((message) => message.content).join("\n"),
      ),
      estimatedOutputTokens: request.maxOutputTokens,
    };
  }

  cancel(requestId: string): Promise<void> {
    this.cancelled.add(requestId);
    return Promise.resolve();
  }
}

export class AiModelRouter {
  private readonly routes: readonly AiModelRoute[];
  private readonly providers: ReadonlyMap<string, AiProviderAdapter>;

  constructor(routes: readonly AiModelRoute[], providers: readonly AiProviderAdapter[]) {
    this.routes = routes;
    this.providers = new Map(providers.map((provider) => [provider.providerId, provider]));
  }

  resolve(useCase: string, dataClasses: readonly string[]): {
    route: AiModelRoute;
    provider: AiProviderAdapter;
  } {
    const route = this.routes.find((candidate) =>
      candidate.enabled
      && candidate.useCase === useCase
      && dataClasses.every((value) => candidate.dataClasses.includes(value))
    );
    if (!route) throw new Error("No allowed AI model route");
    const provider = this.providers.get(route.providerId);
    if (!provider) throw new Error("AI provider is not configured");
    return { route, provider };
  }
}

export class AiBudgetGuard {
  assertWithinBudget(input: {
    estimatedCostMinor: number;
    route: AiModelRoute;
    consumedCostMinor: number;
    workspaceBudgetMinor: number;
  }): void {
    if (input.estimatedCostMinor > input.route.maxCostMinor) {
      throw new Error("AI route cost limit exceeded");
    }
    if (input.consumedCostMinor + input.estimatedCostMinor > input.workspaceBudgetMinor) {
      throw new Error("AI workspace budget exceeded");
    }
  }
}

export type EvaluationCase = {
  readonly caseId: string;
  readonly execute: () => Promise<boolean>;
  readonly evidenceReference: string;
};

export async function runEvaluationSuite(input: {
  runId: string;
  mode: AiEvaluationMode;
  providerId: string | null;
  modelId: string | null;
  cases: readonly EvaluationCase[];
}): Promise<AiEvaluationResult> {
  let passed = 0;
  const evidenceReferences: string[] = [];
  for (const testCase of input.cases) {
    if (await testCase.execute()) passed += 1;
    evidenceReferences.push(testCase.evidenceReference);
  }
  return {
    runId: input.runId,
    mode: input.mode,
    providerId: input.providerId,
    modelId: input.modelId,
    casesExecuted: input.cases.length,
    casesPassed: passed,
    metrics: { passRate: input.cases.length === 0 ? 0 : passed / input.cases.length },
    evidenceReferences,
    createdAt: new Date().toISOString(),
  };
}

function redactMessages(messages: readonly AiMessage[]): readonly AiMessage[] {
  return messages.map((message) => ({ ...message, content: redactText(message.content) }));
}

function redactText(value: string): string {
  return value
    .replaceAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[REDACTED_EMAIL]")
    .replaceAll(/\b(?:\d[ -]*?){13,19}\b/gu, "[REDACTED_NUMBER]")
    .replaceAll(/\b(?:sk|pk|api)[-_][A-Za-z0-9_-]{16,}\b/gu, "[REDACTED_SECRET]");
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

function deterministicId(seed: string, value: string): string {
  return createHash("sha256").update(`${seed}:${value}`).digest("hex").slice(0, 32);
}

function deterministicVector(seed: string, value: string): readonly number[] {
  const digest = createHash("sha256").update(`${seed}:${value}`).digest();
  return [...digest.subarray(0, 16)].map((byte) => Number(((byte / 255) * 2 - 1).toFixed(6)));
}

function cryptoId(): string {
  return createHash("sha256")
    .update(`${Date.now()}:${Math.random()}:${process.pid}`)
    .digest("hex")
    .slice(0, 32);
}

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    const onAbort = (): void => {
      clearTimeout(timeout);
      reject(signal?.reason ?? new Error("Aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
