import { describe, expect, it } from 'vitest';

import {
  asCorrelationId,
  asTenantId,
  asWorkspaceId,
} from '../../domain-contracts';
import { wave3RuleVersions } from '../data-quality/dataQualityContracts';
import {
  analyticsApiRoutes,
  analyticsCachePolicyVersion,
  analyticsContractVersion,
  analyticsProjectionVersion,
  createAnalyticsCacheKey,
  metricSnapshotSchema,
  mvpMetricDefinitions,
} from './analyticsContracts';

const tenantId = asTenantId('ten_northstar');
const workspaceId = asWorkspaceId('wrk_northstar_main');
const period = {
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-19T00:00:00.000Z',
};

describe('Fala 4 analytics contracts', () => {
  it('publikuje zatwierdzone i gated definicje KPI z pełnym kontraktem', () => {
    expect(analyticsContractVersion).toBe('analytics.v1');
    expect(mvpMetricDefinitions.map((definition) => definition.kpiId)).toEqual([
      'order_count',
      'gross_revenue',
      'refund_value',
      'net_revenue',
      'marketplace_fees',
      'revenue_after_marketplace_fees',
      'advertising_spend',
      'attributed_conversion_value',
      'roas',
      'contribution_margin',
    ]);
    expect(
      mvpMetricDefinitions.find((definition) => definition.kpiId === 'contribution_margin'),
    ).toMatchObject({
      lifecycleStatus: 'BLOCKED',
      blockedReason:
        'Brak potwierdzonego kosztu produktu i innych wymaganych kosztów zmiennych.',
    });
  });

  it('waliduje MetricSnapshot z wersjami datasetu, reguł, readiness i evidence', () => {
    const snapshot = metricSnapshotSchema.parse({
      allowedDecisionTypes: ['review'],
      blockedDecisionTypes: ['financial_action'],
      calculatedAt: '2026-07-20T00:00:00.000Z',
      currency: 'PLN',
      datasetIds: ['dataset_orders_contract'],
      datasetVersions: [wave3RuleVersions.canonicalSchema],
      deduplicationVersion: wave3RuleVersions.deduplication,
      evidenceReferences: ['docs/evidence/wave-4/pipeline.md'],
      formulaVersion: 'formula.gross-revenue.2026-07',
      fxPolicyVersion: wave3RuleVersions.currencyPolicy,
      id: 'metric_snapshot_contract',
      inputHash: 'fnv1a:contract',
      invalidationStatus: 'VALID',
      limitations: ['częściowy zakres'],
      mappingVersion: wave3RuleVersions.normalizationMapping,
      metricCode: 'gross_revenue',
      metricDefinitionVersion: 'metric.gross-revenue.v1',
      missingData: [{
        confirmedZero: false,
        fields: ['amounts.gross'],
        reason: 'Brak nie jest zerem.',
      }],
      periodEnd: period.to,
      periodStart: period.from,
      previousSnapshotId: null,
      publishedAt: '2026-07-20T00:00:00.000Z',
      readiness: 'PARTIAL',
      readinessReasons: [{
        affectedScope: 'gross_revenue',
        businessImpact: 'Wynik tylko z ograniczeniem.',
        missing: ['amounts.gross'],
        nextAction: 'Napraw źródło.',
        ownerId: 'PapaData Analytics',
        reliableScope: 'Pozostałe zamówienia.',
        summary: 'Brak pola gross.',
      }],
      scope: {
        channel: null,
        dataScope: 'workspace',
        filters: {},
        segment: null,
      },
      sourceAuthorityVersion: wave3RuleVersions.sourceAuthority,
      statusMappingVersion: wave3RuleVersions.statusMapping,
      supersededBySnapshotId: null,
      tenantId,
      timezone: 'Europe/Warsaw',
      unit: 'money',
      value: '420.00',
      valueType: 'MONEY',
      workspaceId,
    });

    expect(snapshot.readiness).toBe('PARTIAL');
    expect(snapshot.missingData[0]?.confirmedZero).toBe(false);
  });

  it('buduje cache key bez kolizji między tenantem, workspace i wersją definicji', () => {
    const base = {
      currency: 'PLN',
      dataScope: 'command-center',
      metricCode: 'order_count' as const,
      metricDefinitionVersion: 'metric.order-count.v1',
      period,
      policyVersion: analyticsCachePolicyVersion,
      projectionVersion: analyticsProjectionVersion,
      readiness: 'READY' as const,
      tenantId,
      timezone: 'Europe/Warsaw',
      workspaceId,
    };
    const same = createAnalyticsCacheKey(base);
    const otherWorkspace = createAnalyticsCacheKey({
      ...base,
      workspaceId: asWorkspaceId('wrk_baltic_marketplace'),
    });
    const changedDefinition = createAnalyticsCacheKey({
      ...base,
      metricDefinitionVersion: 'metric.order-count.v2',
    });

    expect(same).not.toBe(otherWorkspace);
    expect(same).not.toBe(changedDefinition);
  });

  it('rejestruje endpointy wymagane przez API Fali 4', () => {
    expect(analyticsApiRoutes.metricDefinitions).toBe('/v1/metric-definitions');
    expect(analyticsApiRoutes.analyticsCommandCenter).toBe('/v1/analytics/command-center');
    expect(analyticsApiRoutes.metricSnapshotEvidence).toBe('/v1/metric-snapshots/{snapshotId}/evidence');
    expect(asCorrelationId('cor_analytics_response')).toBe('cor_analytics_response');
  });
});
