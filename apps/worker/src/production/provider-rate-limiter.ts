import { setTimeout as delay } from "node:timers/promises";
import type IORedis from "ioredis";
import type { ProviderRateLimit, ProviderRateLimiterFactory } from "@papadata/integrations";

const CONSUME_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {current, ttl}
`;

/**
 * Real, proactive per-(provider, credential) rate limiting -- until this
 * existed, the only defense against exceeding a provider's real API limit
 * was reactive: retry/backoff after a 429, scoped to a single HTTP request,
 * with no shared state across concurrent jobs hitting the same account (see
 * packages/integrations/src/http.ts's Retry-After handling and the scaling
 * architecture audit that flagged this gap).
 *
 * Fixed-window counter via Redis INCR/PEXPIRE (same primitive
 * apps/bff/src/rate-limit.service.ts already uses for its own limits, just
 * waiting instead of rejecting): each (key, window bucket) increments
 * atomically; once a bucket exceeds its budget, callers sleep out the
 * bucket's remaining TTL and re-check, so a slot is granted as soon as the
 * next window opens rather than the job failing outright.
 */
export class RedisProviderRateLimiter {
  private readonly redis: IORedis;
  private readonly keyPrefix: string;

  constructor(redis: IORedis, keyPrefix = "papadata:provider-rate") {
    this.redis = redis;
    this.keyPrefix = keyPrefix;
  }

  readonly factory: ProviderRateLimiterFactory = (key, limit) => (
    () => this.acquire(key, limit)
  );

  private async acquire(key: string, limit: ProviderRateLimit): Promise<void> {
    for (;;) {
      const bucket = Math.floor(Date.now() / limit.windowMs);
      const redisKey = `${this.keyPrefix}:${key}:${bucket}`;
      const result = await this.redis.eval(
        CONSUME_SCRIPT,
        1,
        redisKey,
        String(limit.windowMs),
      ) as readonly [number, number];
      const [count, ttlMs] = result;

      if (count <= limit.maxRequests) {
        return;
      }

      await delay(Math.max(10, ttlMs));
    }
  }
}
