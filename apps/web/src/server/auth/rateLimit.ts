export type AuthRateLimitDecision =
  | {
      allowed: true;
      remaining: number;
    }
  | {
      allowed: false;
      retryAfterMs: number;
    };

export type AuthRateLimiter = {
  check(key: string, now: Date): Promise<AuthRateLimitDecision>;
  reset(key: string): Promise<void>;
};

export type InMemoryAuthRateLimiterOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export function createInMemoryAuthRateLimiter(
  options: InMemoryAuthRateLimiterOptions = {
    limit: 5,
    windowMs: 60 * 1000,
  },
): AuthRateLimiter {
  const buckets = new Map<string, RateLimitBucket>();

  return {
    async check(key, now) {
      const nowMs = now.getTime();
      const existing = buckets.get(key);

      if (!existing || existing.resetAt <= nowMs) {
        buckets.set(key, {
          count: 1,
          resetAt: nowMs + options.windowMs,
        });

        return {
          allowed: true,
          remaining: options.limit - 1,
        };
      }

      if (existing.count >= options.limit) {
        return {
          allowed: false,
          retryAfterMs: Math.max(0, existing.resetAt - nowMs),
        };
      }

      existing.count += 1;

      return {
        allowed: true,
        remaining: Math.max(0, options.limit - existing.count),
      };
    },
    async reset(key) {
      buckets.delete(key);
    },
  };
}
