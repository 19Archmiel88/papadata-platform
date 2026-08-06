import type { FastifyRequest } from "fastify";
import type { ContractRuntimeRequest } from "./contract-runtime.service.js";

export function contractRequest(
  operationId: string,
  method: ContractRuntimeRequest["method"],
  servicePath: string,
  request: FastifyRequest,
  correlationId?: string,
  idempotencyKey?: string,
): ContractRuntimeRequest {
  return {
    operationId,
    method,
    servicePath,
    body: request.body,
    query: request.query,
    params: request.params,
    correlationId: correlationId ?? null,
    idempotencyKey: idempotencyKey ?? null,
  };
}
