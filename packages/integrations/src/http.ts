import { setTimeout as delay } from "node:timers/promises";
import { ProviderAdapterError } from "./provider-adapter.js";

const MAX_BACKOFF_DELAY_MS = 5_000;

export type ProviderHttpRequest = {
  readonly url: string;
  readonly method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: string | URLSearchParams | Uint8Array | null;
  readonly timeoutMs?: number;
  readonly maxAttempts?: number;
  readonly baseDelayMs?: number;
};

export type ProviderHttpResult<T> = {
  readonly data: T;
  readonly headers: Headers;
  readonly status: number;
};

export type ProviderHttpClient = {
  requestJson<T>(request: ProviderHttpRequest): Promise<ProviderHttpResult<T>>;
};

export class FetchProviderHttpClient implements ProviderHttpClient {
  private readonly fetchImpl: typeof fetch;
  private readonly delayImpl: (ms: number) => Promise<void>;

  constructor(
    fetchImpl: typeof fetch = fetch,
    // Injectable only so tests can prove a long Retry-After (e.g. beyond
    // the old, now-removed 10-minute ceiling) is passed through unclamped
    // without a test actually having to wait that long.
    delayImpl: (ms: number) => Promise<void> = delay,
  ) {
    this.fetchImpl = fetchImpl;
    this.delayImpl = delayImpl;
  }

  async requestJson<T>(request: ProviderHttpRequest): Promise<ProviderHttpResult<T>> {
    const maxAttempts = Math.max(1, request.maxAttempts ?? 3);
    const timeoutMs = Math.max(100, request.timeoutMs ?? 15_000);
    const baseDelayMs = Math.max(25, request.baseDelayMs ?? 250);
    let lastFailure: ProviderAdapterError | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("provider_timeout"), timeoutMs);
      // Only an actual `Retry-After` response header counts as the
      // provider telling us how long to wait; ProviderAdapterError.retryAfterSeconds
      // also carries our own synthetic fallback guesses (e.g. 30s for a
      // bare 5xx) which must stay bounded by the short backoff ceiling, not
      // be honoured as if the provider had asked for that long.
      let retryAfterHeaderSeconds: number | null = null;

      try {
        const response = await this.fetchImpl(request.url, {
          body: request.body,
          headers: request.headers,
          method: request.method ?? "GET",
          redirect: "manual",
          signal: controller.signal,
        });
        const raw = await response.text();
        const data = parseJsonBody(raw);

        if (response.ok) {
          return {
            data: data as T,
            headers: response.headers,
            status: response.status,
          };
        }

        retryAfterHeaderSeconds = readRetryAfter(response.headers);
        const failure = mapHttpFailure(response.status, data, response.headers);
        lastFailure = failure;

        if (!isRetryableFailure(failure) || attempt === maxAttempts) {
          throw failure;
        }
      } catch (error) {
        const failure = normalizeTransportFailure(error, controller.signal.aborted);
        lastFailure = failure;

        if (!isRetryableFailure(failure) || attempt === maxAttempts) {
          throw failure;
        }
      } finally {
        clearTimeout(timeout);
      }

      if (retryAfterHeaderSeconds !== null) {
        // Honour the provider's Retry-After header exactly, with no ceiling
        // at all -- a prior version of this code capped it at 10 minutes,
        // which is itself a truncation the same way the old 5s cap was:
        // ad networks (Google Ads, Meta Ads) can legitimately return
        // Retry-After values well past 10 minutes under sustained rate
        // limiting, and silently shortening that is exactly the bug this
        // client exists to avoid. `readRetryAfter` already rejects
        // non-finite/negative values, so what reaches here is a real,
        // finite value the provider actually sent.
        await this.delayImpl(retryAfterHeaderSeconds * 1_000);
      } else {
        const backoffMs = baseDelayMs * 2 ** (attempt - 1);
        await this.delayImpl(Math.min(backoffMs, MAX_BACKOFF_DELAY_MS));
      }
    }

    throw lastFailure ?? new ProviderAdapterError(
      "Provider request failed",
      "transient",
      30,
    );
  }
}

export function readArrayField(
  payload: unknown,
  ...keys: readonly string[]
): readonly unknown[] {
  if (!isRecord(payload)) return [];

  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

export function readStringField(
  payload: unknown,
  ...keys: readonly string[]
): string | null {
  if (!isRecord(payload)) return null;

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

export function readNumberField(
  payload: unknown,
  ...keys: readonly string[]
): number | null {
  if (!isRecord(payload)) return null;

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function safeProviderErrorMessage(value: unknown): string {
  const candidate = extractProviderMessage(value) ?? "Provider request failed";
  return candidate
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/giu, "$1 [REDACTED]")
    .replace(
      /\b(access[_-]?token|refresh[_-]?token|authorization|api[_-]?key|consumer[_-]?secret|consumer[_-]?key|developer[_-]?token|password|secret)\b\s*[:=]\s*[^\s,;]+/giu,
      "$1=[REDACTED]",
    )
    .slice(0, 320);
}

function parseJsonBody(raw: string): unknown {
  if (raw.trim().length === 0) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: "Provider returned a non-JSON response" };
  }
}

function mapHttpFailure(
  status: number,
  payload: unknown,
  headers: Headers,
): ProviderAdapterError {
  const message = safeProviderErrorMessage(payload);
  const retryAfterSeconds = readRetryAfter(headers);

  if (status === 401) {
    return new ProviderAdapterError(message, "authentication", null);
  }
  if (status === 403) {
    return new ProviderAdapterError(message, "authorization", null);
  }
  if (status === 408 || status === 409 || status === 425) {
    return new ProviderAdapterError(message, "transient", retryAfterSeconds ?? 15);
  }
  if (status === 429) {
    return new ProviderAdapterError(message, "rate_limit", retryAfterSeconds ?? 60);
  }
  if (status >= 500) {
    return new ProviderAdapterError(message, "provider_outage", retryAfterSeconds ?? 30);
  }
  if (status === 400 || status === 404 || status === 422) {
    return new ProviderAdapterError(message, "validation", null);
  }
  return new ProviderAdapterError(message, "permanent", null);
}

function normalizeTransportFailure(error: unknown, timedOut: boolean): ProviderAdapterError {
  if (error instanceof ProviderAdapterError) return error;

  // Prefer the timeout signal we control (`controller.signal.aborted`) over
  // inspecting the error's shape: when `AbortController.abort(reason)` is
  // called with a plain string reason (as this client does), fetch/undici
  // can reject with that reason string directly rather than an
  // Error/DOMException named "AbortError" -- so a `name === "AbortError"`
  // check alone silently missed our own timeout and fell through to the
  // generic branch, surfacing the confusing raw abort reason ("provider_timeout")
  // as the error message instead of "Provider request timed out".
  if (timedOut || (error instanceof Error && error.name === "AbortError")) {
    return new ProviderAdapterError("Provider request timed out", "transient", 15);
  }

  return new ProviderAdapterError(
    safeProviderErrorMessage(error instanceof Error ? error.message : error),
    "transient",
    15,
  );
}

function isRetryableFailure(error: ProviderAdapterError): boolean {
  return error.failureClass === "rate_limit"
    || error.failureClass === "transient"
    || error.failureClass === "provider_outage";
}

function readRetryAfter(headers: Headers): number | null {
  const raw = headers.get("retry-after");
  if (!raw) return null;
  const numeric = Number.parseInt(raw, 10);
  if (Number.isFinite(numeric) && numeric >= 0) return numeric;
  const date = Date.parse(raw);
  if (!Number.isFinite(date)) return null;
  return Math.max(0, Math.ceil((date - Date.now()) / 1_000));
}

function extractProviderMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (!isRecord(value)) return null;

  const directKeys = [
    "message",
    "error_message",
    "error_description",
    "detail",
    "title",
  ] as const;
  for (const key of directKeys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  const nested = value.error;
  if (typeof nested === "string") return nested;
  if (isRecord(nested)) return extractProviderMessage(nested);
  return null;
}
