import { afterEach, describe, expect, it } from "vitest";
import { startTelemetry } from "./telemetry.js";

describe("startTelemetry", () => {
  afterEach(() => {
    delete process.env.OTEL_SERVICE_NAME;
  });

  it("defaults OTEL_SERVICE_NAME to papadata-worker", async () => {
    await startTelemetry(null);
    expect(process.env.OTEL_SERVICE_NAME).toBe("papadata-worker");
  });

  it("does not override an already-set OTEL_SERVICE_NAME", async () => {
    process.env.OTEL_SERVICE_NAME = "custom-name";
    await startTelemetry(null);
    expect(process.env.OTEL_SERVICE_NAME).toBe("custom-name");
  });

  it("returns a no-op handle (does not start the SDK) when no endpoint is configured", async () => {
    const telemetry = await startTelemetry(null);
    await expect(telemetry.shutdown()).resolves.toBeUndefined();
  });
});
