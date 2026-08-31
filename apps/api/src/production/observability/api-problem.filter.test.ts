import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import type { ArgumentsHost } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { describe, expect, it } from "vitest";
import { ApiProblemFilter } from "./api-problem.filter.js";
import type { RequestWithContext } from "./request-context.js";

// Blocker 2 (Phase 8): the frontend must be able to recognize a required
// authLevel (mfa vs step_up) from a *structured* field on the response, not
// by parsing the human-readable `detail` string. These tests exercise the
// same path a route protected by CapabilityGuard's auth-level check takes:
// the guard throws a ForbiddenException carrying a structured
// `requiredAuthLevel`, and this filter must forward exactly that field (and
// only that field) into the wire-level ApiProblem body.

describe("ApiProblemFilter requiredAuthLevel forwarding", () => {
  it("forwards requiredAuthLevel=mfa unambiguously for a route requiring MFA", () => {
    const exception = new ForbiddenException({
      message: "Required authentication level is missing.",
      requiredAuthLevel: "mfa",
    });

    const problem = sendAndCapture(exception);

    expect(problem.status).toBe(403);
    expect(problem.requiredAuthLevel).toBe("mfa");
    expect(problem.detail).toBe("Required authentication level is missing.");
  });

  it("forwards requiredAuthLevel=step_up unambiguously for a route requiring step-up", () => {
    const exception = new ForbiddenException({
      message: "Required authentication level is missing.",
      requiredAuthLevel: "step_up",
    });

    const problem = sendAndCapture(exception);

    expect(problem.status).toBe(403);
    expect(problem.requiredAuthLevel).toBe("step_up");
  });

  it("does not attach a requiredAuthLevel to a plain capability-denied 403", () => {
    const exception = new ForbiddenException("Required capability is missing.");

    const problem = sendAndCapture(exception);

    expect(problem.status).toBe(403);
    expect("requiredAuthLevel" in problem).toBe(false);
  });

  it("does not attach a requiredAuthLevel to a scope-mismatch 403", () => {
    const exception = new ForbiddenException("Request scope is outside the principal.");

    const problem = sendAndCapture(exception);

    expect(problem.status).toBe(403);
    expect("requiredAuthLevel" in problem).toBe(false);
  });

  it("ignores a forged/stray requiredAuthLevel value that is not exactly mfa or step_up", () => {
    const exception = new ForbiddenException({
      message: "Required capability is missing.",
      requiredAuthLevel: "admin",
    });

    const problem = sendAndCapture(exception);

    expect("requiredAuthLevel" in problem).toBe(false);
  });

  it("never attaches requiredAuthLevel to a non-403 status, even if the payload carries one", () => {
    // A genuine 401 (getStatus() !== 403) whose response payload happens to
    // carry a requiredAuthLevel-shaped field -- the filter must gate on the
    // actual HTTP status, not just field presence.
    const exception = new UnauthorizedException({ message: "irrelevant", requiredAuthLevel: "mfa" });

    const problem = sendAndCapture(exception);

    expect(problem.status).toBe(401);
    expect("requiredAuthLevel" in problem).toBe(false);
  });
});

function sendAndCapture(exception: unknown): Record<string, unknown> {
  const filter = new ApiProblemFilter();
  let sentBody: unknown;
  let sentStatus: number | null = null;
  const reply = {
    header: () => reply,
    status(code: number) {
      sentStatus = code;
      return reply;
    },
    send(body: unknown) {
      sentBody = body;
      return reply;
    },
  } as unknown as FastifyReply;
  const request: RequestWithContext = { correlationId: "corr-1", operationId: "op-1" };
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => reply,
    }),
  } as unknown as ArgumentsHost;

  filter.catch(exception, host);

  expect(sentStatus).not.toBeNull();
  return sentBody as Record<string, unknown>;
}
