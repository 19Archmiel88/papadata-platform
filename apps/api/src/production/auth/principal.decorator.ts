import {
  createParamDecorator,
  UnauthorizedException,
} from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type {
  RequestPrincipal,
  RequestWithPrincipal,
} from "./request-principal.js";

export const Principal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestPrincipal => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithPrincipal>();

    if (!request.principal) {
      throw new UnauthorizedException("Request principal is required.");
    }

    return request.principal;
  },
);
