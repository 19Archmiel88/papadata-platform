import { sseData } from "./sse.js";
import { createHash } from "node:crypto";
import OpenAI, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
} from "openai";
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

export type AiProviderFailureCode =
  | "AI_PROVIDER_AUTHENTICATION"
  | "AI_PROVIDER_CANCELLED"
  | "AI_PROVIDER_FORBIDDEN"
  | "AI_PROVIDER_INVALID_RESPONSE"
  | "AI_PROVIDER_NETWORK"
  | "AI_PROVIDER_QUOTA"
  | "AI_PROVIDER_RATE_LIMIT"
  | "AI_PROVIDER_TIMEOUT"
  | "AI_PROVIDER_UNAVAILABLE"
  | "AI_PROVIDER_VALIDATION";

const AI_PROVIDER_ERROR_BRAND = Symbol.for("@papadata/ai-runtime/AiProviderError");

const aiProviderFailureCodes = new Set<AiProviderFailureCode>([
  "AI_PROVIDER_AUTHENTICATION",
  "AI_PROVIDER_CANCELLED",
  "AI_PROVIDER_FORBIDDEN",
  "AI_PROVIDER_INVALID_RESPONSE",
  "AI_PROVIDER_NETWORK",
  "AI_PROVIDER_QUOTA",
  "AI_PROVIDER_RATE_LIMIT",
  "AI_PROVIDER_TIMEOUT",
  "AI_PROVIDER_UNAVAILABLE",
  "AI_PROVIDER_VALIDATION",
]);

export class AiProviderError extends Error {
  readonly [AI_PROVIDER_ERROR_BRAND] = true;
  readonly code: AiProviderFailureCode;
  readonly status: number | null;
  readonly retryable: boolean;
  readonly providerErrorCode: string | null;
  readonly providerErrorParam: string | null;
  readonly providerErrorType: string | null;
  readonly providerRequestId: string | null;

  constructor(
    code: AiProviderFailureCode,
    message: string,
    input: {
      readonly providerErrorCode?: string | null;
      readonly providerErrorParam?: string | null;
      readonly providerErrorType?: string | null;
      readonly providerRequestId?: string | null;
      readonly status?: number | null;
      readonly retryable?: boolean;
    } = {},
  ) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
    this.status = input.status ?? null;
    this.retryable = input.retryable ?? false;
    this.providerErrorCode = input.providerErrorCode ?? null;
    this.providerErrorParam = input.providerErrorParam ?? null;
    this.providerErrorType = input.providerErrorType ?? null;
    this.providerRequestId = input.providerRequestId ?? null;
  }
}

export function isAiProviderError(error: unknown): error is AiProviderError {
  if (error instanceof AiProviderError) return true;
  if (!error || typeof error !== "object") return false;
  const value = error as {
    readonly [AI_PROVIDER_ERROR_BRAND]?: unknown;
    readonly code?: unknown;
    readonly status?: unknown;
    readonly retryable?: unknown;
  };
  return value[AI_PROVIDER_ERROR_BRAND] === true
    && typeof value.code === "string"
    && aiProviderFailureCodes.has(value.code as AiProviderFailureCode)
    && (typeof value.status === "number" || value.status === null)
    && typeof value.retryable === "boolean";
}

export function aiProviderErrorMetadata(error: unknown): {
  readonly providerErrorCode: AiProviderFailureCode | null;
  readonly httpStatus: number | null;
  readonly retryable: boolean | null;
  readonly upstreamProviderErrorCode: string | null;
  readonly upstreamProviderErrorParam: string | null;
  readonly upstreamProviderErrorType: string | null;
  readonly upstreamProviderRequestId: string | null;
} {
  if (!isAiProviderError(error)) {
    return {
      providerErrorCode: null,
      httpStatus: null,
      retryable: null,
      upstreamProviderErrorCode: null,
      upstreamProviderErrorParam: null,
      upstreamProviderErrorType: null,
      upstreamProviderRequestId: null,
    };
  }
  return {
    providerErrorCode: error.code,
    httpStatus: error.status,
    retryable: error.retryable,
    upstreamProviderErrorCode: error.providerErrorCode ?? null,
    upstreamProviderErrorParam: error.providerErrorParam ?? null,
    upstreamProviderErrorType: error.providerErrorType ?? null,
    upstreamProviderRequestId: error.providerRequestId ?? null,
  };
}

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

type OpenAiResponsesClient = {
  readonly responses: {
    create(
      body: Readonly<Record<string, unknown>>,
      options?: { readonly signal?: AbortSignal },
    ): Promise<unknown> | AsyncIterable<unknown>;
  };
};

type OpenAiResponsesProviderOptions = {
  readonly apiKey: string;
  readonly modelId?: string;
  readonly providerId?: string;
  readonly timeoutMs?: number;
  readonly reserveMinorPerCall?: number;
  readonly reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
  readonly verbosity?: "low" | "medium" | "high";
  readonly client?: OpenAiResponsesClient;
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
    if (Date.now() < this.circuitOpenUntil) throw new Error("AI provider circuit is open");
    const controller = new AbortController();
    const abort = () => controller.abort(signal?.reason);
    const timeout = setTimeout(() => controller.abort("provider_timeout"), this.timeoutMs);
    if (signal?.aborted) abort();
    signal?.addEventListener("abort", abort, { once: true });
    let streamId: string | null = null;
    let body: ReadableStream<Uint8Array> | null = null;
    let completed = false;
    let size = 0;
    try {
      // Never replay a partially delivered generation automatically.
      const response = await fetch(`${this.endpoint}/chat/completions`, {
        method: "POST", redirect: "error", signal: controller.signal,
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ model: request.modelId, messages: redactMessages(request.messages),
          max_tokens: request.maxOutputTokens, temperature: request.temperature, stream: true }),
      });
      body = response.body;
      if (!response.ok || !body || !response.headers.get("content-type")?.toLowerCase().includes("text/event-stream")) {
        await body?.cancel();
        throw new Error(`AI_STREAM_HTTP_${response.status}`);
      }
      for await (const data of sseData(body, controller.signal)) {
        if (data === "[DONE]") { completed = true; break; }
        const chunk: unknown = JSON.parse(data);
        if (!chunk || typeof chunk !== "object") throw new Error("AI_STREAM_INVALID_EVENT");
        const value = chunk as { id?: unknown; error?: unknown; choices?: Array<{ delta?: { content?: unknown }; finish_reason?: unknown }> };
        if (value.error) throw new Error("AI_STREAM_PROVIDER_ERROR");
        if (typeof value.id === "string" && streamId === null) { streamId = value.id; this.activeRequests.set(streamId, controller); }
        const choice = value.choices?.[0];
        const content = choice?.delta?.content;
        if (typeof content === "string" && content) {
          size += content.length;
          if (size > 100_000) throw new Error("AI_STREAM_TOO_LARGE");
          yield content;
        }
        // A finish marker alone is not treated as end-of-stream: require [DONE].
        if (choice?.finish_reason === "length") throw new Error("AI_STREAM_OUTPUT_LIMIT");
        if (choice?.finish_reason === "content_filter") throw new Error("AI_STREAM_CONTENT_FILTER");
      }
      if (!completed) throw new Error("AI_STREAM_INTERRUPTED");
      this.consecutiveFailures = 0;
    } catch (error) {
      if (!signal?.aborted && ++this.consecutiveFailures >= 3) this.circuitOpenUntil = Date.now() + 30_000;
      throw error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      if (streamId) this.activeRequests.delete(streamId);
      if (body && !body.locked) await body.cancel().catch(() => undefined);
    }
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

export class OpenAiResponsesProvider implements AiProviderAdapter {
  readonly providerId: string;
  private readonly client: OpenAiResponsesClient;
  private readonly timeoutMs: number;
  private readonly reserveMinorPerCall: number;
  private readonly reasoningEffort: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
  private readonly verbosity: "low" | "medium" | "high";
  private readonly activeRequests = new Map<string, AbortController>();

  constructor(input: OpenAiResponsesProviderOptions) {
    const apiKey = input.apiKey.trim();
    if (!apiKey) {
      throw new AiProviderError(
        "AI_PROVIDER_AUTHENTICATION",
        "OPENAI_API_KEY is required for AI_PROVIDER=openai.",
        { status: 401 },
      );
    }
    this.providerId = input.providerId ?? "openai-responses";
    this.timeoutMs = input.timeoutMs ?? 90_000;
    this.reserveMinorPerCall = Math.max(1, Math.ceil(input.reserveMinorPerCall ?? 50));
    this.reasoningEffort = input.reasoningEffort ?? "low";
    this.verbosity = input.verbosity ?? "medium";
    this.client = input.client ?? new OpenAI({ apiKey, maxRetries: 0 });
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
    const response = await this.withAbort(
      "complete",
      signal,
      async (requestSignal) => {
        try {
          return await this.client.responses.create(
            this.responsesBody(request, false),
            { signal: requestSignal },
          );
        } catch (error) {
          throw normalizeOpenAiError(error);
        }
      },
    );
    return parseOpenAiResponse(response);
  }

  async *stream(
    request: AiProviderRequest,
    signal?: AbortSignal,
  ): AsyncIterable<string> {
    const stream = await this.withAbort(
      "stream",
      signal,
      async (requestSignal) => {
        try {
          return await this.client.responses.create(
            this.responsesBody(request, true),
            { signal: requestSignal },
          );
        } catch (error) {
          throw normalizeOpenAiError(error);
        }
      },
    );
    if (!isAsyncIterable(stream)) {
      throw new AiProviderError(
        "AI_PROVIDER_INVALID_RESPONSE",
        "OpenAI Responses API did not return a stream.",
      );
    }

    let completed = false;
    try {
      for await (const event of stream) {
        signal?.throwIfAborted();
        const parsed = parseOpenAiStreamEvent(event);
        if (parsed.kind === "delta") yield parsed.text;
        if (parsed.kind === "completed") completed = true;
        if (parsed.kind === "failed") throw parsed.error;
      }
    } catch (error) {
      throw normalizeOpenAiError(error);
    }
    if (!completed) {
      throw new AiProviderError(
        "AI_PROVIDER_NETWORK",
        "OpenAI Responses stream ended before completion.",
        { retryable: true },
      );
    }
  }

  embed(): Promise<AiEmbeddingResponse> {
    throw new AiProviderError(
      "AI_PROVIDER_VALIDATION",
      "Embeddings are not enabled for Papa Assistant OpenAI Responses provider.",
    );
  }

  async health(signal?: AbortSignal): Promise<AiProviderHealth> {
    const startedAt = performance.now();
    try {
      await this.withAbort("health", signal, async (requestSignal) => {
        await this.client.responses.create(
          {
            input: "ping",
            instructions: "Reply with exactly: ok",
            max_output_tokens: 8,
            model: "gpt-5.6-luna",
            reasoning: { effort: "minimal" },
            store: false,
            text: { verbosity: "low" },
          },
          { signal: requestSignal },
        );
      });
      return {
        healthy: true,
        latencyMs: Math.round(performance.now() - startedAt),
        detail: null,
      };
    } catch (error) {
      const normalized = normalizeOpenAiError(error);
      return {
        healthy: false,
        latencyMs: Math.round(performance.now() - startedAt),
        detail: normalized.code,
      };
    }
  }

  estimateCost(request: AiProviderRequest): AiCostEstimate {
    const estimatedInputTokens = estimateTokens(
      request.messages.map((message) => message.content).join("\n"),
    );
    return {
      currency: "USD",
      costMinor: this.reserveMinorPerCall,
      estimatedInputTokens,
      estimatedOutputTokens: request.maxOutputTokens,
    };
  }

  cancel(requestId: string): Promise<void> {
    this.activeRequests.get(requestId)?.abort("cancelled");
    this.activeRequests.delete(requestId);
    return Promise.resolve();
  }

  private responsesBody(
    request: AiProviderRequest,
    stream: boolean,
  ): Readonly<Record<string, unknown>> {
    return {
      input: buildResponsesInput(request.messages),
      instructions: buildResponsesInstructions(request.messages),
      max_output_tokens: request.maxOutputTokens,
      model: request.modelId,
      parallel_tool_calls: false,
      reasoning: { effort: this.reasoningEffort },
      store: false,
      stream,
      text: { verbosity: this.verbosity },
    };
  }

  private async withAbort<T>(
    scope: string,
    signal: AbortSignal | undefined,
    operation: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const requestId = cryptoId();
    const controller = new AbortController();
    const relayAbort = (): void => controller.abort(signal?.reason ?? "aborted");
    const timeout = setTimeout(() => controller.abort("provider_timeout"), this.timeoutMs);
    if (signal?.aborted) relayAbort();
    signal?.addEventListener("abort", relayAbort, { once: true });
    this.activeRequests.set(`${scope}:${requestId}`, controller);
    try {
      return await operation(controller.signal);
    } catch (error) {
      throw normalizeOpenAiError(error);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", relayAbort);
      this.activeRequests.delete(`${scope}:${requestId}`);
    }
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

export class AiBudgetExceededError extends Error {
  readonly scope: "plan" | "route" | "user" | "workspace";

  constructor(scope: "plan" | "route" | "user" | "workspace", message: string) {
    super(message);
    this.name = "AiBudgetExceededError";
    this.scope = scope;
  }
}

export class AiBudgetGuard {
  /**
   * Checks three independent budgets, cheapest/narrowest first: the route's
   * own per-call ceiling, then the workspace's rolling consumption, then the
   * calling user's own rolling consumption within that same workspace. The
   * user check exists so one user cannot spend an entire workspace's budget
   * alone -- consumedCostMinorForUser/userBudgetMinor are a strict subset of
   * consumedCostMinor/workspaceBudgetMinor (same window, same currency), not
   * an independent pool.
   */
  assertWithinBudget(input: {
    estimatedCostMinor: number;
    route: AiModelRoute;
    consumedCostMinor: number;
    workspaceBudgetMinor: number;
    consumedCostMinorForUser: number;
    userBudgetMinor: number;
  }): void {
    if (input.estimatedCostMinor > input.route.maxCostMinor) {
      throw new AiBudgetExceededError("route", "AI route cost limit exceeded");
    }
    if (input.consumedCostMinor + input.estimatedCostMinor > input.workspaceBudgetMinor) {
      throw new AiBudgetExceededError("workspace", "AI workspace budget exceeded");
    }
    if (input.consumedCostMinorForUser + input.estimatedCostMinor > input.userBudgetMinor) {
      throw new AiBudgetExceededError("user", "AI per-user budget exceeded");
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
  // Quantifiers are bounded (RFC 5321-ish max lengths) rather than
  // unbounded `+`/`*` -- this content comes from AI conversation messages,
  // untrusted input an attacker could shape to trigger catastrophic
  // backtracking (CodeQL js/polynomial-redos) on an unbounded version of
  // this pattern.
  return value
    .replaceAll(/[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,255}\.[A-Z]{2,24}/giu, "[REDACTED_EMAIL]")
    .replaceAll(/\b(?:\d[ -]{0,2}){13,19}\b/gu, "[REDACTED_NUMBER]")
    .replaceAll(/\b(?:sk|pk|api)[-_][A-Za-z0-9_-]{16,64}\b/gu, "[REDACTED_SECRET]");
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

export { sseData } from "./sse.js";
export { redactText };

export type PapaProviderRuntime = {
  readonly provider: AiProviderAdapter;
  readonly modelId: string;
  readonly nativeStreaming: boolean;
  readonly reserveMinorPerCall: number;
};

export function createPapaProviderRuntime(
  env: NodeJS.ProcessEnv = process.env,
): PapaProviderRuntime {
  const providerName = env.AI_PROVIDER?.trim().toLowerCase() ?? "";
  if (providerName === "openai") {
    const modelId = env.OPENAI_MODEL?.trim() || "gpt-5.6-luna";
    return {
      provider: new OpenAiResponsesProvider({
        apiKey: env.OPENAI_API_KEY?.trim() ?? "",
        modelId,
        reasoningEffort: readReasoningEffort(env.OPENAI_REASONING_EFFORT) ?? "low",
        reserveMinorPerCall: readPositiveNumber(env.OPENAI_RESERVE_MINOR_PER_CALL, 50),
        timeoutMs: readPositiveNumber(env.OPENAI_TIMEOUT_MS, 90_000),
        verbosity: readVerbosity(env.OPENAI_VERBOSITY) ?? "medium",
      }),
      modelId,
      nativeStreaming: true,
      reserveMinorPerCall: readPositiveNumber(env.OPENAI_RESERVE_MINOR_PER_CALL, 50),
    };
  }

  if (env.PAPADATA_PAPA_REMOTE_ENABLED !== "true") {
    return {
      provider: new LocalDeterministicProvider(),
      modelId: "local-deterministic",
      nativeStreaming: false,
      reserveMinorPerCall: 0,
    };
  }

  const endpoint = env.PAPADATA_PAPA_REMOTE_ENDPOINT?.trim() ?? "";
  const apiKey = env.PAPADATA_PAPA_REMOTE_API_KEY?.trim() ?? "";
  const modelId = env.PAPADATA_PAPA_REMOTE_MODEL?.trim() ?? "";
  const allowedHosts = (env.PAPADATA_PAPA_REMOTE_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("Remote Papa AI endpoint is not a valid URL.");
  }

  if (
    url.protocol !== "https:"
    || url.username
    || url.password
    || url.search
    || url.hash
    || !allowedHosts.includes(url.hostname.toLowerCase())
    || apiKey.length < 12
    || !modelId
    || modelId.length > 150
  ) {
    throw new Error("Remote Papa AI configuration is incomplete or unsafe.");
  }

  const suffix = "/chat/completions";
  if (!url.pathname.endsWith(suffix)) {
    throw new Error("Remote Papa AI endpoint must end with /chat/completions.");
  }

  const reserveRaw = Number(env.PAPADATA_PAPA_REMOTE_RESERVE_MINOR_PER_CALL ?? 50);
  if (!Number.isFinite(reserveRaw) || reserveRaw <= 0) {
    throw new Error("PAPADATA_PAPA_REMOTE_RESERVE_MINOR_PER_CALL must be positive.");
  }
  const reserveMinorPerCall = Math.ceil(reserveRaw);

  const baseUrl = new URL(url.href);
  baseUrl.pathname = url.pathname.slice(0, -suffix.length) || "/";
  const upstream = new OpenAiCompatibleProvider({
    providerId: "configured-chat-provider",
    endpoint: baseUrl.href.replace(/\/$/u, ""),
    apiKey,
    timeoutMs: 90_000,
    maxAttempts: 1,
  });

  const provider: AiProviderAdapter = {
    providerId: upstream.providerId,
    complete: (request, signal) => upstream.complete(request, signal),
    stream: (request, signal) => upstream.stream(request, signal),
    embed: (request, signal) => upstream.embed(request, signal),
    health: (signal) => upstream.health(signal),
    cancel: (requestId) => upstream.cancel(requestId),
    generate: (request, signal) => upstream.generate(request, signal),
    estimateCost: (request) => ({
      ...upstream.estimateCost(request),
      costMinor: reserveMinorPerCall,
    }),
  };

  return {
    provider,
    modelId,
    nativeStreaming: true,
    reserveMinorPerCall,
  };
}

function buildResponsesInstructions(messages: readonly AiMessage[]): string {
  return messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n")
    .trim();
}

function buildResponsesInput(messages: readonly AiMessage[]): string {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
    .join("\n\n")
    .trim();
}

function parseOpenAiResponse(response: unknown): AiProviderResponse {
  if (!response || typeof response !== "object") {
    throw new AiProviderError(
      "AI_PROVIDER_INVALID_RESPONSE",
      "OpenAI Responses API returned an invalid response.",
    );
  }
  const value = response as {
    readonly id?: unknown;
    readonly error?: { readonly code?: string | null; readonly message?: string | null } | null;
    readonly output?: readonly unknown[];
    readonly output_text?: unknown;
    readonly status?: unknown;
    readonly usage?: {
      readonly input_tokens?: unknown;
      readonly output_tokens?: unknown;
    } | null;
  };
  if (value.error) {
    throw new AiProviderError(
      "AI_PROVIDER_UNAVAILABLE",
      value.error.code ? `OpenAI Responses API failed: ${value.error.code}` : "OpenAI Responses API failed.",
      { retryable: true },
    );
  }
  if (value.status && value.status !== "completed") {
    throw new AiProviderError(
      "AI_PROVIDER_INVALID_RESPONSE",
      `OpenAI Responses API did not complete (${String(value.status)}).`,
    );
  }
  const output = typeof value.output_text === "string"
    ? value.output_text
    : extractResponseOutputText(value.output ?? []);
  if (!output.trim()) {
    throw new AiProviderError(
      "AI_PROVIDER_INVALID_RESPONSE",
      "OpenAI Responses API returned no text output.",
    );
  }
  return {
    output,
    inputTokens: typeof value.usage?.input_tokens === "number" ? value.usage.input_tokens : 0,
    outputTokens: typeof value.usage?.output_tokens === "number" ? value.usage.output_tokens : estimateTokens(output),
    providerRequestId: typeof value.id === "string" ? value.id : null,
  };
}

function extractResponseOutputText(output: readonly unknown[]): string {
  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const value = item as { readonly type?: unknown; readonly content?: readonly unknown[] };
    if (value.type !== "message" || !Array.isArray(value.content)) continue;
    for (const content of value.content) {
      if (!content || typeof content !== "object") continue;
      const chunk = content as { readonly type?: unknown; readonly text?: unknown; readonly refusal?: unknown };
      if (chunk.type === "output_text" && typeof chunk.text === "string") parts.push(chunk.text);
      if (chunk.type === "refusal" && typeof chunk.refusal === "string") parts.push(chunk.refusal);
    }
  }
  return parts.join("");
}

function parseOpenAiStreamEvent(event: unknown):
  | { readonly kind: "delta"; readonly text: string }
  | { readonly kind: "completed" }
  | { readonly kind: "ignored" }
  | { readonly kind: "failed"; readonly error: AiProviderError } {
  if (!event || typeof event !== "object") return { kind: "ignored" };
  const value = event as {
    readonly type?: unknown;
    readonly delta?: unknown;
    readonly response?: unknown;
    readonly error?: { readonly code?: string | null; readonly message?: string | null } | null;
  };
  if (value.type === "response.output_text.delta") {
    return typeof value.delta === "string" && value.delta
      ? { kind: "delta", text: value.delta }
      : { kind: "ignored" };
  }
  if (value.type === "response.completed") return { kind: "completed" };
  if (value.type === "response.failed" || value.type === "response.error") {
    return {
      kind: "failed",
      error: new AiProviderError(
        "AI_PROVIDER_UNAVAILABLE",
        "OpenAI Responses API failed.",
        { providerErrorCode: value.error?.code ?? null, retryable: true },
      ),
    };
  }
  return { kind: "ignored" };
}

function normalizeOpenAiError(error: unknown): AiProviderError {
  if (error instanceof AiProviderError) return error;
  if (error instanceof APIUserAbortError || isAbortError(error)) {
    return new AiProviderError("AI_PROVIDER_CANCELLED", "OpenAI request was cancelled.");
  }
  if (error instanceof APIConnectionTimeoutError) {
    return new AiProviderError("AI_PROVIDER_TIMEOUT", "OpenAI request timed out.", { retryable: true });
  }
  if (error instanceof APIConnectionError) {
    return new AiProviderError("AI_PROVIDER_NETWORK", "OpenAI network request failed.", { retryable: true });
  }
  if (error instanceof APIError) {
    const metadata = openAiErrorMetadata(error);
    if (error.status === 401) {
      return new AiProviderError("AI_PROVIDER_AUTHENTICATION", "OpenAI authentication failed.", { status: 401, ...metadata });
    }
    if (error.status === 403) {
      return new AiProviderError("AI_PROVIDER_FORBIDDEN", "OpenAI request is forbidden.", { status: 403, ...metadata });
    }
    if (error.status === 429) {
      const quota = `${error.code ?? ""} ${error.type ?? ""} ${error.message} ${JSON.stringify(error.error)}`.toLowerCase().includes("quota");
      return new AiProviderError(
        quota ? "AI_PROVIDER_QUOTA" : "AI_PROVIDER_RATE_LIMIT",
        quota ? "OpenAI quota is unavailable." : "OpenAI rate limit was reached.",
        { status: 429, retryable: !quota, ...metadata },
      );
    }
    if (error.status && error.status >= 500) {
      return new AiProviderError("AI_PROVIDER_UNAVAILABLE", "OpenAI service is unavailable.", { status: error.status, retryable: true, ...metadata });
    }
    return new AiProviderError("AI_PROVIDER_VALIDATION", `OpenAI rejected the request (${error.status ?? "unknown"}).`, { status: error.status ?? null, ...metadata });
  }
  if (error instanceof Error && error.message === "provider_timeout") {
    return new AiProviderError("AI_PROVIDER_TIMEOUT", "OpenAI request timed out.", { retryable: true });
  }
  return new AiProviderError("AI_PROVIDER_UNAVAILABLE", "OpenAI request failed.", { retryable: true });
}

function openAiErrorMetadata(error: APIError): {
  readonly providerErrorCode: string | null;
  readonly providerErrorParam: string | null;
  readonly providerErrorType: string | null;
  readonly providerRequestId: string | null;
} {
  return {
    providerErrorCode: typeof error.code === "string" ? error.code : null,
    providerErrorParam: typeof error.param === "string" ? error.param : null,
    providerErrorType: typeof error.type === "string" ? error.type : null,
    providerRequestId: typeof error.requestID === "string" ? error.requestID : null,
  };
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || error.message === "cancelled" || error.message === "aborted";
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return Boolean(value && typeof value === "object" && Symbol.asyncIterator in value);
}

function readPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readReasoningEffort(value: string | undefined):
  | "none"
  | "minimal"
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max"
  | null {
  if (
    value === "none"
    || value === "minimal"
    || value === "low"
    || value === "medium"
    || value === "high"
    || value === "xhigh"
    || value === "max"
  ) return value;
  return null;
}

function readVerbosity(value: string | undefined): "low" | "medium" | "high" | null {
  if (value === "low" || value === "medium" || value === "high") return value;
  return null;
}
