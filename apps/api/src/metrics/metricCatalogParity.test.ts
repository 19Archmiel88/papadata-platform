import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { dashboardMetricCodes } from "./metricEngineCore.ts";

// P0-01 (docs/specyfikacja-docelowa/26-priorytety-p0/01-katalog-58-metryk.md)
// rule 1: "Katalog zawiera dokladnie 58 stabilnych metricKey." The canonical
// machine-readable catalog lives at contracts/metric-catalog-58.json (repo
// root, NOT packages/contracts) and is not imported anywhere in real code
// today (`grep -rln "metric-catalog-58" apps/ packages/` = 0 hits before this
// file) -- this test is the first thing that actually reads it and compares
// it against the Metric Engine's real, shipped metric codes.
const catalogPath = fileURLToPath(
  new URL("../../../../contracts/metric-catalog-58.json", import.meta.url),
);

type CatalogMetric = {
  readonly metricKey: string;
  readonly implementationStatus: string;
};

type Catalog = {
  readonly count: number;
  readonly metrics: readonly CatalogMetric[];
};

const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;

describe("metric-catalog-58 <-> Metric Engine parity", () => {
  it("the catalog itself declares exactly 58 metricKeys (sanity check on the fixture, not the engine)", () => {
    expect(catalog.metrics.length).toBe(58);
    expect(new Set(catalog.metrics.map((metric) => metric.metricKey)).size).toBe(58);
  });

  it("every catalog metricKey has a same-keyed Metric Engine code, and vice versa", () => {
    const catalogKeys = new Set(catalog.metrics.map((metric) => metric.metricKey));
    const engineKeys = new Set<string>(dashboardMetricCodes);
    const missingFromEngine = [...catalogKeys].filter((key) => !engineKeys.has(key)).sort();
    const unexpectedInEngine = [...engineKeys].filter((key) => !catalogKeys.has(key)).sort();

    expect(missingFromEngine).toEqual([]);
    expect(unexpectedInEngine).toEqual([]);
  });

});
