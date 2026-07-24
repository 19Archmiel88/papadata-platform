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
    logger: true,
    trustProxy: true,
  }),
  {
    rawBody: true,
  },
);

app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
  }),
);

app.enableShutdownHooks();

await app.listen({
  host: "0.0.0.0",
  port: config.port,
});

const shutdown = async (): Promise<void> => {
  await app.close();
  await telemetry.shutdown();
};

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());
