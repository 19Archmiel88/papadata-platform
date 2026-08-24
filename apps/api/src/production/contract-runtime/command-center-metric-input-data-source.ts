import type { IsoDateTime } from "@papadata/contracts";
import type { MetricEngineInput } from "../../metrics/metricEngineCore.ts";
import {
  createRealMetricEngineInput,
  type CommandCenterDataSource,
} from "./command-center-metrics.real-source.js";

type MetricInputOptions = {
  readonly generatedAt: IsoDateTime;
  readonly periodStart: IsoDateTime;
  readonly periodEnd: IsoDateTime;
  readonly tenantId: string;
  readonly timezone?: string;
  readonly workspaceId: string;
};

export class CommandCenterMetricInputDataSource
implements CommandCenterDataSource {
  private readonly inFlightMetricInputs = new Map<string, Promise<MetricEngineInput>>();

  constructor(
    private readonly source: CommandCenterDataSource,
  ) {}

  createMetricEngineInput(options: MetricInputOptions): Promise<MetricEngineInput> {
    const timezone = options.timezone ?? "Europe/Warsaw";
    const periodKey = options.periodEnd === options.generatedAt ? "live" : options.periodEnd;
    const key = JSON.stringify([
      "metric-engine-input",
      options.tenantId,
      options.workspaceId,
      options.periodStart,
      periodKey,
      timezone,
    ]);
    const current = this.inFlightMetricInputs.get(key);
    if (current) {
      return current;
    }

    const pending = createRealMetricEngineInput({
      dataSource: this.source,
      generatedAt: options.generatedAt,
      periodEnd: options.periodEnd,
      periodStart: options.periodStart,
      tenantId: options.tenantId,
      timezone: options.timezone,
      workspaceId: options.workspaceId,
    });
    this.inFlightMetricInputs.set(key, pending);

    const clear = (): void => {
      if (this.inFlightMetricInputs.get(key) === pending) {
        this.inFlightMetricInputs.delete(key);
      }
    };
    void pending.then(clear, clear);

    return pending;
  }

  readMetricEngineInputRows(
    tenantId: string,
    workspaceId: string,
    input: {
      readonly periodStart: string;
      readonly periodEnd: string;
    },
  ): Promise<{
    readonly canonicalRows: readonly Record<string, unknown>[];
    readonly catalogRows: readonly Record<string, unknown>[];
    readonly connectionRows: readonly Record<string, unknown>[];
    readonly checkpointRows: readonly Record<string, unknown>[];
    readonly reconciliationRun: Record<string, unknown> | null;
    readonly openIssueRows: readonly Record<string, unknown>[];
  }> {
    if (!this.source.readMetricEngineInputRows) {
      return Promise.reject(new Error("Wrapped Command Center data source does not support metric input row batches."));
    }

    return this.source.readMetricEngineInputRows(tenantId, workspaceId, input);
  }

  listCanonicalRecords(
    tenantId: string,
    workspaceId: string,
    input: {
      readonly streams: readonly string[];
      readonly businessTimeFrom: string;
      readonly businessTimeTo: string;
    },
  ): Promise<readonly Record<string, unknown>[]> {
    return this.source.listCanonicalRecords(tenantId, workspaceId, input);
  }

  listConnections(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.source.listConnections(tenantId, workspaceId);
  }

  listSyncCheckpoints(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.source.listSyncCheckpoints(tenantId, workspaceId);
  }

  latestReconciliationRun(
    tenantId: string,
    workspaceId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.source.latestReconciliationRun(tenantId, workspaceId);
  }

  listOpenDataIssues(
    tenantId: string,
    workspaceId: string,
  ): Promise<readonly Record<string, unknown>[]> {
    return this.source.listOpenDataIssues(tenantId, workspaceId);
  }
}
