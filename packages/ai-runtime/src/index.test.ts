import assert from "node:assert/strict";
import test from "node:test";
import { AiBudgetGuard, runEvaluationSuite } from "./index.ts";

test("budget guard blocks an over-budget request", () => {
  const guard = new AiBudgetGuard();
  assert.throws(() => guard.assertWithinBudget({
    estimatedCostMinor: 60,
    consumedCostMinor: 50,
    workspaceBudgetMinor: 100,
    route: {
      useCase: "assistant",
      providerId: "provider",
      modelId: "model",
      enabled: true,
      dataClasses: ["analytics"],
      maxInputTokens: 1000,
      maxOutputTokens: 500,
      maxCostMinor: 100,
      currency: "PLN",
    },
  }));
});

test("evaluation results are calculated from executed cases", async () => {
  const result = await runEvaluationSuite({
    runId: "run-1",
    mode: "deterministic_policy_test",
    providerId: null,
    modelId: null,
    cases: [
      { caseId: "pass", evidenceReference: "evidence/pass", execute: async () => true },
      { caseId: "fail", evidenceReference: "evidence/fail", execute: async () => false },
    ],
  });
  assert.equal(result.casesExecuted, 2);
  assert.equal(result.casesPassed, 1);
  assert.equal(result.metrics.passRate, 0.5);
});
