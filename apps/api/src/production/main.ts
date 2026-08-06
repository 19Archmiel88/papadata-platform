import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { ProductionAppModule } from "./app.module.js";
import { readProductionConfig } from "./config.js";
import { startTelemetry } from "./telemetry.js";

const config = readProductionConfig();
const telemetry = await startTelemetry(config.otlpEndpoint);

const app = await NestFactory.create<NestFastifyApplication>(
  ProductionAppModule,
  new FastifyAdapter({
    bodyLimit: 1_048_576,
    logger: true,
    trustProxy: true,
  }),
  {
    rawBody: true,
  },
);

app.useGlobalPipes(
  new ValidationPipe({
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    whitelist: true,
  }),
);

app.enableShutdownHooks();

await app.listen({
  host: "0.0.0.0",
  port: config.port,
});

let shutdownPromise: Promise<void> | null = null;
const shutdown = (): Promise<void> => {
  shutdownPromise ??= Promise.allSettled([
    app.close(),
    telemetry.shutdown(),
  ]).then((results) => {
    const rejected = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (rejected) {
      throw rejected.reason;
    }
  });
  return shutdownPromise;
};

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    void shutdown().catch((error: unknown) => {
      console.error("Graceful shutdown failed", error);
      process.exitCode = 1;
    });
  });
}
