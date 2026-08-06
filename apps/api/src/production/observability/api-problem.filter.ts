import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import type { RequestWithContext } from "./request-context.js";

export type ApiProblem = {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly correlationId: string;
  readonly recoverable: boolean;
  readonly fieldErrors?: readonly {
    readonly field: string;
    readonly code: string;
    readonly message: string;
  }[];
};

@Catch()
export class ApiProblemFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const request = host.switchToHttp().getRequest<RequestWithContext>();
    const correlationId = request.correlationId ?? request.id ?? "unknown";
    const operationId = request.operationId ?? "unknown";
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException
      ? exception.getResponse()
      : null;
    const validationMessages = readValidationMessages(payload);
    const code = validationMessages.length > 0
      ? "VALIDATION_FAILED"
      : status === HttpStatus.NOT_FOUND
        ? "RESOURCE_NOT_FOUND"
        : status === HttpStatus.CONFLICT
          ? "RESOURCE_CONFLICT"
          : status === HttpStatus.TOO_MANY_REQUESTS
            ? "RATE_LIMITED"
            : status >= 500
              ? "INTERNAL_ERROR"
              : "REQUEST_REJECTED";

    const problem: ApiProblem = {
      type: `https://papadata.pl/problems/${code.toLowerCase().replaceAll("_", "-")}`,
      title: titleForStatus(status),
      status,
      code,
      detail: status >= 500
        ? "Request could not be completed."
        : safeDetail(payload, exception),
      correlationId,
      recoverable: status === 408 || status === 429 || status >= 500,
      ...(validationMessages.length > 0
        ? {
            fieldErrors: validationMessages.map((message) => ({
              field: readField(message),
              code: "INVALID_VALUE",
              message,
            })),
          }
        : {}),
    };

    response.header("x-correlation-id", correlationId);
    response.status(status).send(problem);

    if (status >= 500) {
      console.error("API request failed", {
        correlationId,
        operationId,
        error: exception instanceof Error ? exception.message : "unknown",
      });
    }
  }
}

function readValidationMessages(payload: unknown): readonly string[] {
  if (
    payload !== null
    && typeof payload === "object"
    && "message" in payload
    && Array.isArray((payload as { message?: unknown }).message)
  ) {
    return (payload as { message: unknown[] }).message.filter(
      (value): value is string => typeof value === "string",
    );
  }
  return [];
}

function safeDetail(payload: unknown, exception: unknown): string {
  if (typeof payload === "string") {
    return payload.slice(0, 500);
  }
  if (
    payload !== null
    && typeof payload === "object"
    && "message" in payload
    && typeof (payload as { message?: unknown }).message === "string"
  ) {
    return String((payload as { message: string }).message).slice(0, 500);
  }
  return exception instanceof Error
    ? exception.message.slice(0, 500)
    : "Request was rejected.";
}

function titleForStatus(status: number): string {
  if (status === 400) return "Invalid request";
  if (status === 401) return "Authentication required";
  if (status === 403) return "Access denied";
  if (status === 404) return "Resource not found";
  if (status === 409) return "Request conflict";
  if (status === 429) return "Too many requests";
  if (status >= 500) return "Service error";
  return "Request rejected";
}

function readField(message: string): string {
  const [field] = message.split(" ", 1);
  return field || "request";
}
