import "reflect-metadata";

import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { BffAppModule } from "./app.module.js";
import type { BffConfig } from "./config.js";
import { readBffConfig } from "./config.js";

export async function createBffApplication(
  config: BffConfig = readBffConfig(),
): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({
    bodyLimit: config.maxBodyBytes,
    logger: true,
    trustProxy: false,
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    BffAppModule.register(config),
    adapter,
  );

  await app.register(cookie, {
    secret: [
      config.cookieSecret,
      ...(config.cookiePreviousSecret
        ? [config.cookiePreviousSecret]
        : []),
    ],
  });
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        baseUri: ["'none'"],
        defaultSrc: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  });

  app.getHttpAdapter().getInstance().setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = error.statusCode === 413 ? 413 : error.statusCode;

      if (statusCode === 413) {
        sendSanitizedError(reply, request, 413, "PAYLOAD_TOO_LARGE");
        return;
      }

      if (statusCode && statusCode >= 400 && statusCode < 500) {
        sendSanitizedError(reply, request, statusCode, "REQUEST_REJECTED");
        return;
      }

      sendSanitizedError(reply, request, 500, "BFF_INTERNAL_ERROR");
    },
  );

  app.enableShutdownHooks();
  return app;
}

function sendSanitizedError(
  reply: FastifyReply,
  request: FastifyRequest,
  statusCode: number,
  code: string,
): void {
  reply.status(statusCode).send({
    error: {
      code,
      message:
        statusCode === 413
          ? "Request body is too large."
          : "Request could not be completed.",
      requestId: request.id,
    },
  });
}
