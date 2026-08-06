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
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import type { BffConfig } from "./config.js";
import { signInternalPrincipalToken } from "./internal-principal.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
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

    @Inject(BffRateLimitService)
    private readonly rateLimit: BffRateLimitService,

    @Inject(CloudRunIdentityService)
    private readonly cloudRunIdentity: CloudRunIdentityService,
  ) {}

  @All("*")
  async proxy(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    this.security.validateHost(request);
    const origin = readHeader(request.headers, "origin");

    for (const [header, value] of Object.entries(this.security.corsHeaders(origin))) {
      reply.header(header, value);
    }

    if (request.method === "OPTIONS") {
      reply.status(204).send();
      return;
    }

    const session = await this.security.requireSession(request);
    await this.rateLimit.consumeRequest({
      accountId: session.userId,
      ipAddress: request.ip,
      sessionId: session.sessionId,
      tenantId: session.activeTenantId,
    });

    if (isStateChangingMethod(request.method)) {
      this.security.validateOrigin(request);
      this.security.validateCsrf(request, session);
    }

    const target = `${this.config.apiOrigin}${request.url.replace(/^\/api/u, "")}`;
    const { body, contentType } = serializeBody(request, this.config.maxBodyBytes);
    const upstreamAuthorization = await this.cloudRunIdentity.authorizationHeader();
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
        headers: this.forwardHeaders(
          request,
          session,
          contentType,
          upstreamAuthorization,
        ),
        method: request.method,
        redirect: "manual",
        signal: controller.signal,
      });

      for (const [key, value] of response.headers.entries()) {
        if (safeResponseHeader(key)) reply.header(key, value);
      }

      reply.status(response.status);
      if (!response.body) {
        reply.send();
        return;
      }

      reply.send(
        Readable.fromWeb(
          response.body as unknown as NodeReadableStream<Uint8Array>,
        ),
      );
    } catch {
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
    upstreamAuthorization: string | null,
  ): Headers {
    const headers = new Headers();
    const accept = readHeader(request.headers, "accept");
    const acceptLanguage = readHeader(request.headers, "accept-language");
    const correlationId = sanitizeHeaderToken(
      readHeader(request.headers, "x-correlation-id"),
    ) ?? randomUUID();
    const idempotencyKey = sanitizeHeaderToken(
      readHeader(request.headers, "idempotency-key"),
    );

    if (accept) headers.set("accept", accept);
    if (acceptLanguage) headers.set("accept-language", acceptLanguage);
    if (contentType) headers.set("content-type", contentType);
    if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
    if (upstreamAuthorization) headers.set("authorization", upstreamAuthorization);

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
  maxBodyBytes: number,
): {
  readonly body: Uint8Array<ArrayBuffer> | undefined;
  readonly contentType: string | null;
} {
  if (["GET", "HEAD"].includes(request.method)) {
    return { body: undefined, contentType: null };
  }

  const contentType = readHeader(request.headers, "content-type");
  if (request.body === undefined || request.body === null) {
    return { body: undefined, contentType };
  }
  if (!contentType || !isSupportedContentType(contentType)) {
    throw new UnsupportedMediaTypeException("Unsupported request content type.");
  }

  const body = Buffer.isBuffer(request.body)
    ? request.body
    : typeof request.body === "string"
      ? Buffer.from(request.body, "utf8")
      : contentType.toLowerCase().startsWith("application/json")
        ? Buffer.from(JSON.stringify(request.body), "utf8")
        : null;

  if (!body) {
    throw new UnsupportedMediaTypeException(
      "Request body could not be serialized safely.",
    );
  }
  if (body.byteLength > maxBodyBytes) {
    throw new PayloadTooLargeException("Request body is too large.");
  }

  const fetchBody = new Uint8Array(body.byteLength);
  fetchBody.set(body);

  return { body: fetchBody, contentType };
}

function isSupportedContentType(value: string): boolean {
  const mediaType = value.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  return mediaType === "application/json"
    || mediaType.endsWith("+json")
    || mediaType === "application/octet-stream"
    || mediaType === "application/x-www-form-urlencoded"
    || mediaType === "text/csv"
    || mediaType === "multipart/form-data";
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
