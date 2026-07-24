import {
  All,
  Controller,
  Inject,
  PayloadTooLargeException,
  Req,
  Res,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import type { BffConfig } from "./config.js";
import { signInternalPrincipalToken } from "./internal-principal.js";
import {
  BffSecurityService,
  isStateChangingMethod,
  readHeader,
} from "./security.service.js";
import { BFF_CONFIG } from "./tokens.js";
@Controller("api")
export class ProxyController {
  constructor(
    @Inject(BFF_CONFIG)
    private readonly config: BffConfig,

    @Inject(BffSecurityService)
    private readonly security: BffSecurityService,
  ) {}

  @All("*")
  async proxy(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    this.security.validateHost(request);
    const origin = readHeader(request.headers, "origin");

    for (const [header, value] of Object.entries(
      this.security.corsHeaders(origin),
    )) {
      reply.header(header, value);
    }

    if (request.method === "OPTIONS") {
      reply.status(204).send();
      return;
    }

    const session = await this.security.requireSession(request);

    if (isStateChangingMethod(request.method)) {
      this.security.validateOrigin(request);
      this.security.validateCsrf(request, session);
    }

    const target = `${this.config.apiOrigin}${request.url.replace(
      /^\/api/u,
      "",
    )}`;
    const { body, contentType } = serializeBody(request);
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort("upstream_timeout"),
      this.config.upstreamTimeoutMs,
    );
    const abortOnDisconnect = (): void => controller.abort("client_closed");
    request.raw.once("close", abortOnDisconnect);

    try {
      const response = await fetch(target, {
        body,
        headers: this.forwardHeaders(request, session, contentType),
        method: request.method,
        redirect: "manual",
        signal: controller.signal,
      });

      for (const [key, value] of response.headers.entries()) {
        if (safeResponseHeader(key)) {
          reply.header(key, value);
        }
      }

      reply
        .status(response.status)
        .send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      if (controller.signal.aborted) {
        reply.status(504).send({
          error: {
            code: "UPSTREAM_TIMEOUT",
            message: "Upstream request timed out.",
          },
        });
        return;
      }

      reply.status(502).send({
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "Upstream request failed.",
        },
      });
    } finally {
      clearTimeout(timeout);
      request.raw.off("close", abortOnDisconnect);
    }
  }

  private forwardHeaders(
    request: FastifyRequest,
    session: Parameters<typeof signInternalPrincipalToken>[0],
    contentType: string | null,
  ): Headers {
    const headers = new Headers();
    const accept = readHeader(request.headers, "accept");
    const acceptLanguage = readHeader(request.headers, "accept-language");
    const correlationId =
      sanitizeHeaderToken(readHeader(request.headers, "x-correlation-id"))
      ?? randomUUID();

    if (accept) {
      headers.set("accept", accept);
    }

    if (acceptLanguage) {
      headers.set("accept-language", acceptLanguage);
    }

    if (contentType) {
      headers.set("content-type", contentType);
    }

    headers.set("x-correlation-id", correlationId);
    headers.set(this.config.requestIdHeaderName, randomUUID());
    headers.set(
      this.config.internalPrincipalHeaderName,
      signInternalPrincipalToken(session, this.config, new Date()),
    );

    return headers;
  }
}

function serializeBody(
  request: FastifyRequest,
): { readonly body: string | undefined; readonly contentType: string | null } {
  if (["GET", "HEAD"].includes(request.method)) {
    return { body: undefined, contentType: null };
  }

  const contentType = readHeader(request.headers, "content-type");

  if (request.body === undefined || request.body === null) {
    return { body: undefined, contentType: null };
  }

  if (!contentType?.toLowerCase().startsWith("application/json")) {
    throw new UnsupportedMediaTypeException(
      "Only application/json request bodies are accepted.",
    );
  }

  const body = JSON.stringify(request.body);

  if (Buffer.byteLength(body, "utf8") > 10 * 1_048_576) {
    throw new PayloadTooLargeException("Request body is too large.");
  }

  return { body, contentType: "application/json" };
}

function sanitizeHeaderToken(value: string | null): string | null {
  return value && /^[a-zA-Z0-9._:-]{1,128}$/u.test(value) ? value : null;
}

function safeResponseHeader(name: string): boolean {
  return ![
    "connection",
    "content-encoding",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
  ].includes(name.toLowerCase());
}
