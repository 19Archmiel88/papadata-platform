import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { WorkerProductionModule } from "./worker.module.js";

const app = await NestFactory.createApplicationContext(WorkerProductionModule, {
  logger: ["log", "warn", "error"],
});
app.enableShutdownHooks();
