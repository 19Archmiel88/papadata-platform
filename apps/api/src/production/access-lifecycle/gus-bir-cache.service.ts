import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import IORedis from "ioredis";
import { readProductionConfig } from "../config.js";

/**
 * Generic get/set-with-TTL cache for company.lookup (GUS_BIR_CACHE_TTL_SECONDS),
 * connected the same way as IntegrationQueueService/PlatformQueueService
 * (queue/queue.service.ts, queue/platform-queue.service.ts) -- same
 * readProductionConfig() fields, same IORedis options, same
 * NODE_ENV=test + PAPADATA_API_QUEUE_DRIVER=test-memory escape hatch so
 * tests don't need a real Redis instance. Not BullMQ-based (this is a plain
 * cache, not a job queue), so it owns its own IORedis connection rather
 * than reusing either queue service.
 */
@Injectable()
export class GusBirCacheService implements OnModuleDestroy {
  private readonly connection: IORedis | null;
  private readonly memory: Map<string, { readonly value: string; readonly expiresAt: number }> | null;

  constructor() {
    if (isTestMemoryCache()) {
      this.connection = null;
      this.memory = new Map();
      return;
    }

    const config = readProductionConfig();
    this.connection = new IORedis(config.redisUrl, {
      connectTimeout: config.redisConnectTimeoutMs,
      maxRetriesPerRequest: null,
      ...(config.redisCaBase64
        ? { tls: { ca: Buffer.from(config.redisCaBase64, "base64").toString("utf8") } }
        : {}),
    });
    this.memory = null;
  }

  async get(key: string): Promise<string | null> {
    if (this.memory) {
      const entry = this.memory.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= Date.now()) {
        this.memory.delete(key);
        return null;
      }
      return entry.value;
    }
    return requiredConnection(this.connection).get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.memory) {
      this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
      return;
    }
    await requiredConnection(this.connection).set(key, value, "EX", ttlSeconds);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connection) await this.connection.quit();
  }
}

function isTestMemoryCache(): boolean {
  return process.env.NODE_ENV === "test"
    && process.env.PAPADATA_API_QUEUE_DRIVER === "test-memory";
}

function requiredConnection(connection: IORedis | null): IORedis {
  if (!connection) throw new Error("GUS/BIR cache connection is unavailable.");
  return connection;
}
