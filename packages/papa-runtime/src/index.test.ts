import { AiBudgetExceededError } from "@papadata/ai-runtime";
import { describe, expect, it } from "vitest";
import {
  papaBudgetExceededRefusalCode,
  papaGenerationErrorStage,
  type PapaGenerationStage,
} from "./index.js";

describe("Papa runtime generation safety", () => {
  it("maps budget failures to assistant refusal codes allowed by the database contract", () => {
    expect(papaBudgetExceededRefusalCode(new AiBudgetExceededError("plan", "AI disabled")))
      .toBe("ENTITLEMENT_REQUIRED");
    expect(papaBudgetExceededRefusalCode(new AiBudgetExceededError("route", "route budget")))
      .toBe("COST_LIMIT_REACHED");
    expect(papaBudgetExceededRefusalCode(new AiBudgetExceededError("user", "user budget")))
      .toBe("COST_LIMIT_REACHED");
    expect(papaBudgetExceededRefusalCode(new AiBudgetExceededError("workspace", "workspace budget")))
      .toBe("COST_LIMIT_REACHED");
  });

  it("does not treat arbitrary error properties as a Papa runtime stage", () => {
    expect(papaGenerationErrorStage({ stage: "budget_reservation" })).toBeNull();
  });

  it("can read a branded Papa runtime stage from an error", () => {
    const error = new Error("redacted");
    Object.defineProperty(error, Symbol.for("@papadata/papa-runtime/generationStage"), {
      value: "budget_reservation" satisfies PapaGenerationStage,
    });

    expect(papaGenerationErrorStage(error)).toBe("budget_reservation");
  });
});
