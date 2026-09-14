import { APIError } from "openai";
import { describe, expect, it, vi } from "vitest";
import {
  AiProviderError,
  createPapaProviderRuntime,
  LocalDeterministicProvider,
  OpenAiResponsesProvider,
  type AiMessage,
  aiProviderErrorMetadata,
} from "./index.js";

const messages: readonly AiMessage[] = [
  { role: "system", content: "System Papa." },
  { role: "user", content: "Pytanie o marze." },
  { role: "assistant", content: "Poprzednia odpowiedz." },
  { role: "user", content: "Kontynuuj." },
];

function apiError(
  status: number,
  code = "provider_error",
  input: {
    readonly message?: string;
    readonly param?: string;
    readonly requestId?: string;
    readonly type?: string;
  } = {},
): APIError {
  return APIError.generate(
    status,
    {
      error: {
        code,
        message: input.message ?? `status ${status}`,
        param: input.param,
        type: input.type ?? code,
      },
    },
    input.message ?? `status ${status}`,
    new Headers(input.requestId ? { "x-request-id": input.requestId } : undefined),
  );
}

function clientWithCreate(create: (body: Readonly<Record<string, unknown>>, options?: { readonly signal?: AbortSignal }) => unknown) {
  return { responses: { create: vi.fn(create) } };
}

function request() {
  return {
    maxOutputTokens: 321,
    messages,
    modelId: "gpt-5.6-luna",
    temperature: 0,
  };
}

describe("OpenAiResponsesProvider", () => {
  it("maps Papa runtime messages to a stable Responses API request without tools or storage", async () => {
    const client = clientWithCreate(() => ({
      id: "resp_1",
      output_text: "Gotowe.",
      status: "completed",
      usage: { input_tokens: 11, output_tokens: 3 },
    }));
    const provider = new OpenAiResponsesProvider({ apiKey: "test-key", client });

    const result = await provider.complete(request());
    const body = client.responses.create.mock.calls[0]![0];

    expect(body).toMatchObject({
      input: "USER:\nPytanie o marze.\n\nASSISTANT:\nPoprzednia odpowiedz.\n\nUSER:\nKontynuuj.",
      instructions: "System Papa.",
      max_output_tokens: 321,
      model: "gpt-5.6-luna",
      parallel_tool_calls: false,
      reasoning: { effort: "low" },
      store: false,
      stream: false,
      text: { verbosity: "medium" },
    });
    expect(client.responses.create).toHaveBeenCalledOnce();
    expect(client.responses.create.mock.calls[0]![1]).toHaveProperty("signal");
    expect(body).not.toHaveProperty("tools");
    expect(body).not.toHaveProperty("betas");
    expect(body).not.toHaveProperty("metadata");
    expect(body).not.toHaveProperty("previous_response_id");
    expect(body).not.toHaveProperty("temperature");
    expect(body).not.toHaveProperty("tool_choice");
    expect(result).toEqual({
      inputTokens: 11,
      output: "Gotowe.",
      outputTokens: 3,
      providerRequestId: "resp_1",
    });
  });

  it("extracts text from structured output when output_text is absent", async () => {
    const client = clientWithCreate(() => ({
      id: "resp_2",
      output: [
        {
          type: "message",
          content: [
            { type: "output_text", text: "Ala " },
            { type: "output_text", text: "ma dane." },
          ],
        },
      ],
      status: "completed",
      usage: { input_tokens: 7, output_tokens: 5 },
    }));
    const provider = new OpenAiResponsesProvider({ apiKey: "test-key", client });

    await expect(provider.complete(request())).resolves.toMatchObject({
      output: "Ala ma dane.",
      providerRequestId: "resp_2",
    });
  });

  it("requires OPENAI_API_KEY when selected by the runtime factory", () => {
    expect(() => createPapaProviderRuntime({ AI_PROVIDER: "openai" })).toThrow(AiProviderError);
  });

  it("maps 401 to a controlled authentication failure", async () => {
    const client = clientWithCreate(() => { throw apiError(401, "invalid_api_key"); });
    const provider = new OpenAiResponsesProvider({ apiKey: "test-key", client });

    await expect(provider.complete(request())).rejects.toMatchObject({
      code: "AI_PROVIDER_AUTHENTICATION",
      status: 401,
    });
  });

  it("maps 429 rate limits and quota separately", async () => {
    const rateLimited = new OpenAiResponsesProvider({
      apiKey: "test-key",
      client: clientWithCreate(() => { throw apiError(429, "rate_limit_exceeded"); }),
    });
    const quota = new OpenAiResponsesProvider({
      apiKey: "test-key",
      client: clientWithCreate(() => { throw apiError(429, "insufficient_quota"); }),
    });

    await expect(rateLimited.complete(request())).rejects.toMatchObject({
      code: "AI_PROVIDER_RATE_LIMIT",
      retryable: true,
    });
    await expect(quota.complete(request())).rejects.toMatchObject({
      code: "AI_PROVIDER_QUOTA",
      retryable: false,
    });
  });

  it("preserves safe OpenAI validation metadata without exposing raw provider messages", async () => {
    const client = clientWithCreate(() => {
      throw apiError(400, "unsupported_parameter", {
        message: "raw provider validation text should stay internal",
        param: "temperature",
        requestId: "req_safe_123",
        type: "invalid_request_error",
      });
    });
    const provider = new OpenAiResponsesProvider({ apiKey: "test-key", client });

    try {
      await provider.complete(request());
      throw new Error("Expected provider validation failure.");
    } catch (error) {
      expect(error).toBeInstanceOf(AiProviderError);
      expect(error).toMatchObject({
        code: "AI_PROVIDER_VALIDATION",
        providerErrorCode: "unsupported_parameter",
        providerErrorParam: "temperature",
        providerErrorType: "invalid_request_error",
        providerRequestId: "req_safe_123",
        retryable: false,
        status: 400,
      });
      expect(error instanceof Error ? error.message : String(error)).not.toContain("raw provider validation text");
      expect(aiProviderErrorMetadata(error)).toEqual({
        httpStatus: 400,
        providerErrorCode: "AI_PROVIDER_VALIDATION",
        retryable: false,
        upstreamProviderErrorCode: "unsupported_parameter",
        upstreamProviderErrorParam: "temperature",
        upstreamProviderErrorType: "invalid_request_error",
        upstreamProviderRequestId: "req_safe_123",
      });
    }
  });

  it("maps timeout, provider 5xx, cancellation and invalid response without leaking secrets", async () => {
    const timeout = new OpenAiResponsesProvider({
      apiKey: "redacted-test-key",
      timeoutMs: 1,
      client: clientWithCreate((_body, options) => new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => reject(new Error("provider_timeout")), { once: true });
      })),
    });
    const outage = new OpenAiResponsesProvider({
      apiKey: "redacted-test-key",
      client: clientWithCreate(() => { throw apiError(500, "server_error"); }),
    });
    const cancelled = new OpenAiResponsesProvider({
      apiKey: "redacted-test-key",
      client: clientWithCreate((_body, options) => new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        }, { once: true });
      })),
    });
    const invalid = new OpenAiResponsesProvider({
      apiKey: "redacted-test-key",
      client: clientWithCreate(() => ({ id: "resp_bad", output_text: "", status: "completed" })),
    });
    const cases = [
      { code: "AI_PROVIDER_TIMEOUT", run: () => timeout.complete(request()) },
      { code: "AI_PROVIDER_UNAVAILABLE", run: () => outage.complete(request()) },
      {
        code: "AI_PROVIDER_CANCELLED",
        run: () => {
          const controller = new AbortController();
          const promise = cancelled.complete(request(), controller.signal);
          controller.abort();
          return promise;
        },
      },
      { code: "AI_PROVIDER_INVALID_RESPONSE", run: () => invalid.complete(request()) },
    ] as const;

    for (const item of cases) {
      try {
        await item.run();
        throw new Error("Expected provider error.");
      } catch (error) {
        expect(error).toBeInstanceOf(AiProviderError);
        expect(error).toMatchObject({ code: item.code });
        expect(error instanceof Error ? error.message : String(error)).not.toMatch(/redacted-test-key/u);
      }
    }
  });

  it("streams only real Responses API text deltas", async () => {
    async function* events() {
      yield { type: "response.created" };
      yield { type: "response.output_text.delta", delta: "Pierwszy " };
      yield { type: "response.output_text.delta", delta: "fragment." };
      yield { type: "response.completed" };
    }
    const client = clientWithCreate(() => events());
    const provider = new OpenAiResponsesProvider({ apiKey: "test-key", client });
    const chunks: string[] = [];

    for await (const chunk of provider.stream(request())) chunks.push(chunk);

    expect(client.responses.create.mock.calls[0]![0]).toMatchObject({ stream: true });
    expect(chunks).toEqual(["Pierwszy ", "fragment."]);
  });

  it("keeps demo/default runtime deterministic and free of OpenAI calls", () => {
    const runtime = createPapaProviderRuntime({});

    expect(runtime.provider).toBeInstanceOf(LocalDeterministicProvider);
    expect(runtime.modelId).toBe("local-deterministic");
    expect(runtime.nativeStreaming).toBe(false);
  });

  it("exposes OpenAI metadata and cost reservation through the runtime factory", () => {
    const runtime = createPapaProviderRuntime({
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "test-key",
      OPENAI_MODEL: "gpt-5.6-luna",
      OPENAI_REASONING_EFFORT: "low",
      OPENAI_RESERVE_MINOR_PER_CALL: "17",
      OPENAI_VERBOSITY: "medium",
    });

    expect(runtime.modelId).toBe("gpt-5.6-luna");
    expect(runtime.provider.providerId).toBe("openai-responses");
    expect(runtime.nativeStreaming).toBe(true);
    expect(runtime.reserveMinorPerCall).toBe(17);
  });
});
