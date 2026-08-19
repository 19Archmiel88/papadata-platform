import assert from "node:assert/strict";
import { test } from "node:test";
import { findBusinessScreenDefinition } from "./businessData.ts";

test("findBusinessScreenDefinition resolves each command-center deep link to its own screen, not 30.01", () => {
  const kpi = findBusinessScreenDefinition("/app/command-center/kpi");
  assert.ok(kpi, "expected a definition for /app/command-center/kpi");
  assert.equal(kpi?.id, "30.03");

  const planVsWynik = findBusinessScreenDefinition("/app/command-center/plan-vs-wynik");
  assert.ok(planVsWynik);
  assert.equal(planVsWynik?.id, "30.04");

  const drivers = findBusinessScreenDefinition("/app/command-center/drivery-wyniku");
  assert.ok(drivers);
  assert.equal(drivers?.id, "30.05");
});

test("findBusinessScreenDefinition also resolves a trailing sub-path (e.g. a detail record) under a screen route", () => {
  const definition = findBusinessScreenDefinition("/app/command-center/kpi/some-record-id");
  assert.ok(definition, "expected the parent screen definition for a nested detail path");
  assert.equal(definition?.id, "30.03");
});

test("findBusinessScreenDefinition resolves by screen id directly", () => {
  const definition = findBusinessScreenDefinition("30.04");
  assert.ok(definition);
  assert.equal(definition?.route, "/app/command-center/plan-vs-wynik");
});

test("findBusinessScreenDefinition returns null for an unknown path", () => {
  assert.equal(findBusinessScreenDefinition("/app/does-not-exist"), null);
});
