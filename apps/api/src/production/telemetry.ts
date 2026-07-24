import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

export async function startTelemetry(endpoint: string): Promise<NodeSDK> {
  process.env.OTEL_SERVICE_NAME ??= "papadata-api";
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  await sdk.start();
  return sdk;
}
