import { Inject } from "@nestjs/common";
import { Controller, Get, Res } from "@nestjs/common";
import { ProductionDatabase } from "@papadata/database";
import type { FastifyReply } from "fastify";
import { createClient } from "redis";
import { OperationId, PublicEndpoint } from "./auth/route-policy.js";
import { readProductionConfig } from "./config.js";
import { ObjectStorageService } from "./storage/object-storage.service.js";

type DependencyStatus = {
  readonly name: "postgresql" | "redis" | "storage";
  readonly ready: boolean;
  readonly latencyMs: number;
};

// See the /healthz vs /health vs /readyz vs /startupz contract note at the
// top of health.controller.ts (same directory) -- /readyz is the only
// endpoint in this pair that checks dependencies.
@Controller()
export class ReadinessController {
  constructor(
    @Inject(ProductionDatabase) private readonly database: ProductionDatabase,
    @Inject(ObjectStorageService) private readonly storage: ObjectStorageService,
  ) {}

  @Get("readyz")
  @PublicEndpoint()
  @OperationId("infrastructure.health.ready")
  async ready(@Res({ passthrough: true }) reply: FastifyReply): Promise<object> {
    const config = readProductionConfig();
    const checks = await Promise.all([
      timedCheck("postgresql", () => this.database.checkHealth()),
      timedCheck("redis", async () => {
        const redis = createClient({
          url: config.redisUrl,
          socket: new URL(config.redisUrl).protocol === "rediss:"
            ? {
                connectTimeout: config.redisConnectTimeoutMs,
                reconnectStrategy: false,
                tls: true as const,
                ...(config.redisCaBase64
                  ? {
                      ca: Buffer.from(
                        config.redisCaBase64,
                        "base64",
                      ).toString("utf8"),
                    }
                  : {}),
              }
            : {
                connectTimeout: config.redisConnectTimeoutMs,
                reconnectStrategy: false,
              },
        });
        try {
          await redis.connect();
          return await redis.ping() === "PONG";
        } finally {
          if (redis.isOpen) {
            await redis.quit().catch(() => redis.disconnect());
          }
        }
      }),
      timedCheck("storage", async () => {
        // A non-mutating metadata lookup verifies connectivity without creating
        // health-check objects or polluting retention evidence.
        await this.storage.exists(".papadata-readiness-sentinel");
        return true;
      }),
    ]);

    const ready = checks.every((item) => item.ready);
    const response = {
      status: ready ? "ready" : "blocked",
      dependencies: checks,
    };

    // The generic ApiProblemFilter collapses every 5xx into a sanitized,
    // dependency-agnostic envelope -- correct for business endpoints, but it
    // would defeat the entire point of /readyz, whose payload exists so
    // operators/monitoring can see *which* dependency is unhealthy. Setting
    // the status directly (instead of throwing) keeps the full per-
    // dependency body on the failure path too.
    if (!ready) {
      reply.status(503);
    }

    return response;
  }

  @Get("startupz")
  @PublicEndpoint()
  @OperationId("infrastructure.health.startup")
  startup(): object {
    return { status: "started" };
  }
}

async function timedCheck(
  name: DependencyStatus["name"],
  check: () => Promise<boolean>,
): Promise<DependencyStatus> {
  const startedAt = performance.now();
  let ready = false;
  try {
    ready = await withTimeout(check(), 5_000);
  } catch {
    ready = false;
  }
  return {
    name,
    ready,
    latencyMs: Math.round(performance.now() - startedAt),
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Dependency check timed out.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
