import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import type { FastifyReply } from "fastify";
import { requestCounter, requestDuration } from "./metrics.controller.js";
import type { RequestWithContext } from "./request-context.js";

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = process.hrtime.bigint();
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const method = request.method ?? "UNKNOWN";
    const route = request.operationId
      ?? request.routeOptions?.url
      ?? request.url
      ?? "unknown";

    return next.handle().pipe(
      finalize(() => {
        const seconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
        const status = String(reply.statusCode || 500);
        requestCounter.inc({ method, route, status });
        requestDuration.observe({ method, route }, seconds);
      }),
    );
  }
}
