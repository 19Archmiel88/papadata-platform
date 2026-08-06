import {
  Inject,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { randomUUID } from "node:crypto";
import type { Observable } from "rxjs";
import type { FastifyReply } from "fastify";
import { operationIdMetadataKey } from "../auth/route-policy.js";
import type { RequestWithContext } from "./request-context.js";

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const supplied = readHeader(request.headers, "x-correlation-id");
    const correlationId = supplied && /^[A-Za-z0-9._:-]{1,128}$/u.test(supplied)
      ? supplied
      : randomUUID();
    const operationId = this.reflector.getAllAndOverride<string>(
      operationIdMetadataKey,
      [context.getHandler(), context.getClass()],
    ) ?? "unknown";

    request.correlationId = correlationId;
    request.operationId = operationId;
    reply.header("x-correlation-id", correlationId);
    reply.header("x-operation-id", operationId);
    return next.handle();
  }
}

function readHeader(
  headers: RequestWithContext["headers"],
  name: string,
): string | null {
  const value = headers?.[name];
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.length > 0 ? first : null;
}
