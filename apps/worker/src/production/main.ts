import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { WorkerProductionModule } from "./worker.module.js";
import { readWorkerConfig } from "./config.js";
import { startTelemetry } from "./telemetry.js";

const config = readWorkerConfig();
const telemetry = await startTelemetry(config.otlpEndpoint);

const app = await NestFactory.createApplicationContext(WorkerProductionModule, {
  logger: ["log", "warn", "error"],
});
app.enableShutdownHooks();

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
