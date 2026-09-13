import "reflect-metadata";
import { createBffApplication } from "./app.factory.js";
import { readBffConfig } from "./config.js";
import { startTelemetry } from "./telemetry.js";

const config = readBffConfig();
const telemetry = await startTelemetry(config.otlpEndpoint);
const app = await createBffApplication(config);

await app.listen({ host: "0.0.0.0", port: config.port });

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
