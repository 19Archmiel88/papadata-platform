import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { createHash } from "node:crypto";
import { createClient, type RedisClientType } from "redis";
import type { BffConfig } from "./config.js";
import { BFF_CONFIG } from "./tokens.js";

const consumeScript = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {current, ttl}
`;

type RateScope = "account" | "ip" | "session" | "tenant";

@Injectable()
export class BffRateLimitService implements OnModuleDestroy {
  private readonly redis: RedisClientType | null;
  private readonly memory = new Map<string, { count: number; resetAt: number }>();
  private connectPromise: Promise<void> | null = null;

  constructor(@Inject(BFF_CONFIG) private readonly config: BffConfig) {
    this.redis = config.sessionStoreMode === "redis-auth-state"
      ? createClient({
          url: config.sessionRedisUrl,
          socket: new URL(config.sessionRedisUrl).protocol === "rediss:"
            ? {
                connectTimeout: config.redisConnectTimeoutMs,
                tls: true as const,
                ...(config.redisCaBase64
                  ? {
                      ca: Buffer.from(
                        config.redisCaBase64,
                        "base64",
                      ).toString("utf8"),
                    }
                  : {}),
                reconnectStrategy: (retries: number) =>
                  Math.min(100 * 2 ** retries, 2_000),
              }
            : {
                connectTimeout: config.redisConnectTimeoutMs,
                reconnectStrategy: (retries: number) =>
                  Math.min(100 * 2 ** retries, 2_000),
              },
        })
      : null;
    this.redis?.on("error", (error: Error) => {
      console.error("BFF rate limiter Redis error", { message: error.message });
    });
  }

  async consumePublic(input: {
    readonly ipAddress: string;
    readonly route: "login" | "register" | "public-contract";
  }): Promise<void> {
    const max = input.route === "login"
      ? Math.max(5, Math.floor(this.config.rateLimitMax / 20))
      : input.route === "register"
        ? Math.max(3, Math.floor(this.config.rateLimitMax / 50))
        : Math.max(10, Math.floor(this.config.rateLimitMax / 10));
    await this.consume("ip", `${input.route}:${input.ipAddress}`, max);
  }

  async consumeRequest(input: {
    readonly accountId: string;
    readonly ipAddress: string;
    readonly sessionId: string;
    readonly tenantId: string;
  }): Promise<void> {
    await Promise.all([
      this.consume("ip", input.ipAddress, this.config.rateLimitMax * 2),
      this.consume("session", input.sessionId, this.config.rateLimitMax),
      this.consume("account", input.accountId, this.config.rateLimitMax),
      this.consume("tenant", input.tenantId, this.config.rateLimitMax * 10),
    ]);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis?.isOpen) {
      await this.redis.quit().catch(() => this.redis?.disconnect());
    }
  }

  private async consume(scope: RateScope, subject: string, max: number): Promise<void> {
    const now = Date.now();
    const subjectHash = createHash("sha256").update(subject).digest("hex").slice(0, 32);
    const bucket = Math.floor(now / this.config.rateLimitWindowMs);
    const key = `${this.config.sessionRedisPrefix}:rate:${scope}:${bucket}:${subjectHash}`;
    let count: number;
    let retryAfterMs: number;

    if (this.redis) {
      await this.ensureConnected();
      const result = await withTimeout(
        this.redis.eval(consumeScript, {
          keys: [key],
          arguments: [String(this.config.rateLimitWindowMs)],
        }),
        this.config.redisCommandTimeoutMs,
      );
      const values = Array.isArray(result) ? result : [];
      count = Number(values[0] ?? 0);
      retryAfterMs = Math.max(
        1,
        Number(values[1] ?? this.config.rateLimitWindowMs),
      );
    } else {
      const existing = this.memory.get(key);
      const entry = existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + this.config.rateLimitWindowMs };
      entry.count += 1;
      this.memory.set(key, entry);
      count = entry.count;
      retryAfterMs = entry.resetAt - now;
    }

    if (count > max) {
      throw new HttpException({
        code: "RATE_LIMITED",
        scope,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1_000),
      }, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.redis || this.redis.isReady) return;
    const connecting = this.connectPromise ??= this.redis.connect().then(() => undefined).finally(() => {
      this.connectPromise = null;
    });
    await withTimeout(connecting, this.config.redisConnectTimeoutMs);
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Redis command timed out.")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
