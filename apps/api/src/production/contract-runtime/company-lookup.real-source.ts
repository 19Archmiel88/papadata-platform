import { randomUUID } from "node:crypto";
import type { CompanyProfile } from "@papadata/contracts";
import type { CompanyLookupAuditRepository } from "@papadata/database";
import type { GusBirAdapter } from "@papadata/integrations";

export type CompanyLookupCache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

export type CompanyLookupOutcome =
  | {
      readonly ok: true;
      readonly normalized: CompanyProfile;
      readonly source: "gus_bir";
      readonly retrievedAt: string;
      readonly servedFromCache: boolean;
    }
  | {
      readonly ok: false;
      readonly code: "timeout" | "not_found" | "rate_limited" | "upstream_error";
      readonly message: string;
    };

type CachedLookupPayload = {
  readonly normalized: CompanyProfile;
  readonly source: "gus_bir";
  readonly retrievedAt: string;
};

const CACHE_KEY_PREFIX = "gus-bir:lookup:";

/**
 * company.lookup's orchestration: cache -> adapter -> audit, in the style
 * of this directory's other *.real-source.ts functions (e.g.
 * fetchOrdersList in orders-analytics.real-source.ts) -- contract-
 * runtime.service.ts only validates the NIP and maps the returned outcome
 * to an HTTP response/exception; this function holds the actual GUS/BIR
 * domain logic so it stays framework-agnostic and unit-testable.
 *
 * `nip` must already be normalizeNip()-ed and isValidNip()-checked by the
 * caller. The audit write (task 3 of DOC-P0-005) happens exactly once per
 * *real* lookup -- i.e. on a cache miss, right after a successful adapter
 * call -- never on a cache hit, so repeat lookups for the same NIP within
 * the TTL window don't duplicate audit rows.
 */
export async function lookupCompanyRegistry(input: {
  readonly nip: string;
  readonly cache: CompanyLookupCache;
  readonly adapter: GusBirAdapter;
  readonly auditRepository: CompanyLookupAuditRepository;
  readonly cacheTtlSeconds: number;
  readonly correlationId: string | null;
}): Promise<CompanyLookupOutcome> {
  const cacheKey = `${CACHE_KEY_PREFIX}${input.nip}`;

  const cached = await safeCacheGet(input.cache, cacheKey);
  if (cached) {
    return { ok: true, ...cached, servedFromCache: true };
  }

  const result = await input.adapter.lookup(input.nip);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  const payload: CachedLookupPayload = {
    normalized: result.normalized,
    source: result.source,
    retrievedAt: result.retrievedAt,
  };

  // Audit first, cache second: if the process dies between the two, the
  // worst case is a redundant adapter call on the next request, never a
  // lookup that's cached but unaudited.
  await input.auditRepository.record({
    id: randomUUID(),
    nip: input.nip,
    rawPayload: result.rawPayload,
    normalized: result.normalized,
    source: result.source,
    retrievedAt: result.retrievedAt,
    correlationId: input.correlationId,
  });

  await safeCacheSet(input.cache, cacheKey, payload, input.cacheTtlSeconds);

  return { ok: true, ...payload, servedFromCache: false };
}

// The cache is a performance optimization, not a correctness dependency --
// spec step 6 requires an explicit TTL and that the cache "does not hide
// the data source" (servedFromCache is always reported honestly), but
// nothing requires the cache to be available. A Redis outage must not turn
// a working GUS/BIR lookup into a failure, so cache errors are swallowed
// here and the caller falls through to a fresh adapter call / an uncached
// response instead.
async function safeCacheGet(cache: CompanyLookupCache, key: string): Promise<CachedLookupPayload | null> {
  try {
    const raw = await cache.get(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCachedLookupPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function safeCacheSet(
  cache: CompanyLookupCache,
  key: string,
  payload: CachedLookupPayload,
  ttlSeconds: number,
): Promise<void> {
  try {
    await cache.set(key, JSON.stringify(payload), ttlSeconds);
  } catch {
    // Best-effort -- see safeCacheGet.
  }
}

function isCachedLookupPayload(value: unknown): value is CachedLookupPayload {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return row.source === "gus_bir"
    && typeof row.retrievedAt === "string"
    && !!row.normalized
    && typeof row.normalized === "object";
}
