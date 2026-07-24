export type ProductionConfig = {
  readonly port: number;
  readonly databaseUrl: string;
  readonly redisUrl: string;
  readonly storageDriver: "minio" | "gcs";
  readonly storageBucket: string;
  readonly storageEndpoint: string | null;
  readonly storageAccessKey: string | null;
  readonly storageSecretKey: string | null;
  readonly gcpProjectId: string | null;
  readonly otlpEndpoint: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function readProductionConfig(): ProductionConfig {
  const storageDriver = process.env.PAPADATA_STORAGE_DRIVER === "gcs" ? "gcs" : "minio";
  return {
    port: Number(process.env.API_PORT ?? 4000),
    databaseUrl: required("DATABASE_URL"),
    redisUrl: required("REDIS_URL"),
    storageDriver,
    storageBucket: required("PAPADATA_STORAGE_BUCKET"),
    storageEndpoint: process.env.PAPADATA_STORAGE_ENDPOINT ?? null,
    storageAccessKey: process.env.PAPADATA_STORAGE_ACCESS_KEY ?? null,
    storageSecretKey: process.env.PAPADATA_STORAGE_SECRET_KEY ?? null,
    gcpProjectId: process.env.GOOGLE_CLOUD_PROJECT ?? null,
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://otel-collector:4318",
  };
}
