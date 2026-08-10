import "reflect-metadata";

import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { BffAppModule } from "./app.module.js";
import type { BffConfig } from "./config.js";
import { readBffConfig } from "./config.js";

export async function createBffApplication(
  config: BffConfig = readBffConfig(),
): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({
    bodyLimit: config.maxBodyBytes,
    logger: true,
    trustProxy: true,
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    BffAppModule.register(config),
    adapter,
    {
      bodyParser: false,
    },
  );

  const fastify = app.getHttpAdapter().getInstance();
  fastify.addContentTypeParser(
    ["application/octet-stream", "application/x-www-form-urlencoded", "text/csv"],
    { parseAs: "buffer" },
    (_request, body, done) => done(null, body),
  );
  fastify.addContentTypeParser(
    /^text\//u,
    { parseAs: "buffer" },
    (_request, body, done) => done(null, body),
  );
  fastify.addContentTypeParser(
    /^multipart\/form-data(?:;.*)?$/u,
    { parseAs: "buffer" },
    (_request, body, done) => done(null, body),
  );

  await app.register(cookie, {
    secret: [
      config.cookieSecret,
      ...(config.cookiePreviousSecret ? [config.cookiePreviousSecret] : []),
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

  app.enableShutdownHooks();
  return app;
}
