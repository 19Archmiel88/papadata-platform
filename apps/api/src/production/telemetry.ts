import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export type TelemetryHandle = {
  shutdown(): Promise<void>;
};

const noOpTelemetry: TelemetryHandle = {
  shutdown: () => Promise.resolve(),
};

export async function startTelemetry(
  endpoint: string | null,
): Promise<TelemetryHandle> {
  process.env.OTEL_SERVICE_NAME ??= "papadata-api";

  if (!endpoint) {
    return noOpTelemetry;
  }

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint.replace(/\/$/u, "")}/v1/traces`,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  await sdk.start();
  return sdk;
}
