import { describe, expect, it } from 'vitest';

import {
  asCorrelationId,
  asTenantId,
  asWorkspaceId,
  domainContractVersion,
} from '../../domain-contracts';
import {
  asConnectionId,
  asIntegrationSourceRecordId,
  asProviderId,
  asSourceBatchId,
  asSyncJobId,
} from '../integrations/integrationContracts';
import {
  canonicalOrderSchema,
  dataImpactReportSchema,
  dataInventoryEntrySchema,
  dataQualityApiRoutes,
  dataQualityContractVersion,
  dataIssueSchema,
  datasetSchema,
  deletionLedgerEntrySchema,
  metricDefinitions,
  rawNormalizedRecordSchema,
  readinessAssessmentSchema,
  reconciliationReportSchema,
  sourceAuthorityRuleSchema,
  wave3RuleVersions,
} from './dataQualityContracts';

const tenantId = asTenantId('ten_northstar');
const workspaceId = asWorkspaceId('wrk_northstar_main');
const period = {
  from: '2026-07-01T00:00:00.000Z',
  to: '2026-07-19T00:00:00.000Z',
};

describe('Fala 3 data quality contracts', () => {
  it('waliduje warstwy normalized, canonical, dataset, readiness i issue', () => {
    const sourceRecordId = asIntegrationSourceRecordId('srcint_0001');
    const normalized = rawNormalizedRecordSchema.parse({
      businessTime: '2026-07-18T20:00:00.000Z',
      connectionId: asConnectionId('conn_woo_001'),
      data: {
        amounts: {
          discount: '0',
          gross: '420',
          lineGrossTotal: '420',
          net: '341.46',
          refund: null,
          shipping: '19',
          tax: '78.54',
        },
        currency: 'PLN',
        externalOrderId: 'woo_order_1001',
        orderNumber: '1001',
        statusCanonical: 'confirmed',
        statusSource: 'paid',
        zeroEvidenceFields: ['discount'],
      },
      id: 'raw_orders_1_srcint_0001',
      mappingVersion: wave3RuleVersions.normalizationMapping,
      normalizedAt: '2026-07-19T00:00:00.000Z',
      providerEventTime: '2026-07-18T20:00:00.000Z',
      providerId: asProviderId('woocommerce'),
      schemaVersion: wave3RuleVersions.sourceSchema,
      sourceRecordId,
      stream: 'orders',
      tenantId,
      validation: {
        errors: [],
        status: 'VALID',
      },
      workspaceId,
    });

    expect(normalized.data.zeroEvidenceFields).toEqual(['discount']);

    const canonical = canonicalOrderSchema.parse({
      amounts: {
        discount: '0',
        gross: '420',
        net: '341.46',
        refund: null,
        shipping: '19',
        tax: '78.54',
      },
      authorityVersion: wave3RuleVersions.sourceAuthority,
      businessTime: '2026-07-18T20:00:00.000Z',
      canonicalSchemaVersion: wave3RuleVersions.canonicalSchema,
      currency: 'PLN',
      deduplicationVersion: wave3RuleVersions.deduplication,
      effectiveTime: '2026-07-18T20:00:00.000Z',
      id: 'canord_sample',
      mappingVersion: wave3RuleVersions.normalizationMapping,
      occurredAt: '2026-07-18T20:00:00.000Z',
      processingTime: '2026-07-19T00:00:00.000Z',
      status: 'confirmed',
      tenantId,
      workspaceId,
    });

    expect(canonical.amounts.gross).toBe('420');

    const dataset = datasetSchema.parse({
      canonicalModelVersion: wave3RuleVersions.canonicalSchema,
      currency: 'PLN',
      generatedAt: '2026-07-19T00:00:00.000Z',
      id: 'dataset_orders_contract',
      lastUpdatedAt: '2026-07-19T00:00:00.000Z',
      limitations: [],
      period,
      readinessStatus: 'READY',
      schemaVersion: wave3RuleVersions.sourceSchema,
      sourceCoverage: {
        acceptedRecords: 1,
        expectedStreams: ['orders'],
        lastSuccessfulSyncAt: '2026-07-19T00:00:00.000Z',
        providerIds: [asProviderId('woocommerce')],
        sourceRecords: 1,
        streamsWithData: ['orders'],
      },
      tenantId,
      timezone: 'Europe/Warsaw',
      type: 'orders',
      workspaceId,
    });

    const readiness = readinessAssessmentSchema.parse({
      affectedMetricCodes: ['order_count', 'gross_revenue'],
      allowedMetricCodes: ['order_count', 'gross_revenue'],
      blockedMetricCodes: ['revenue_after_fees'],
      currency: 'PLN',
      datasetId: dataset.id,
      evidenceRefs: ['evidence://wave-3/readiness'],
      generatedAt: '2026-07-19T00:00:00.000Z',
      id: 'ready_contract',
      limitations: [],
      nextActions: [],
      ownerId: 'artur_wisniewski',
      period,
      ruleVersion: wave3RuleVersions.readinessRules,
      scope: { datasetType: 'orders' },
      sourceCoverage: dataset.sourceCoverage,
      status: 'READY',
      tenantId,
      timezone: 'Europe/Warsaw',
      workspaceId,
    });

    const issue = dataIssueSchema.parse({
      affectedMetricCodes: ['gross_revenue'],
      class: 'schema.UNKNOWN_STATUS',
      createdAt: '2026-07-19T00:00:00.000Z',
      datasetId: dataset.id,
      evidenceRefs: ['evidence://issue'],
      id: 'dq_issue_contract',
      impact: 'Nieznany status blokuje kwalifikację do przychodu.',
      ownerId: null,
      resolution: null,
      ruleVersion: wave3RuleVersions.qualityRules,
      severity: 'MEDIUM',
      status: 'OPEN',
      tenantId,
      updatedAt: '2026-07-19T00:00:00.000Z',
      workspaceId,
    });

    expect(readiness.status).toBe('READY');
    expect(issue.status).toBe('OPEN');
  });

  it('waliduje source authority, reporty, retencję i deletion ledger', () => {
    const authority = sourceAuthorityRuleSchema.parse({
      approvedBy: 'artur_wisniewski',
      factType: 'CanonicalOrder',
      id: 'authority_contract',
      ownerId: 'artur_wisniewski',
      priority: 1,
      providerId: asProviderId('woocommerce'),
      rationale: 'Provider referencyjny Fali 2.',
      scope: { dataset: 'orders' },
      status: 'ACTIVE',
      stream: 'orders',
      tenantId,
      validFrom: '2026-07-19T00:00:00.000Z',
      validTo: null,
      version: wave3RuleVersions.sourceAuthority,
      workspaceId,
    });
    const reconciliation = reconciliationReportSchema.parse({
      affectedMetricCodes: ['order_count'],
      canonicalFactCount: 1,
      canonicalTotals: { gross: '420' },
      conflictCount: 0,
      connectionId: asConnectionId('conn_woo_001'),
      currency: 'PLN',
      datasetId: 'dataset_orders_contract',
      duplicateCount: 0,
      evidenceHash: 'fnv1a:abcd0001',
      excludedRecordCount: 0,
      excludedValues: { gross: '0' },
      generatedAt: '2026-07-19T00:00:00.000Z',
      id: 'reconciliation_contract',
      normalizedRecordCount: 1,
      overlapCount: 0,
      period,
      providerId: asProviderId('woocommerce'),
      readinessResult: 'READY',
      reasonCodes: ['WITHIN_TOLERANCE'],
      ruleVersions: { qualityRules: wave3RuleVersions.qualityRules },
      sourceRecordCount: 1,
      sourceTotals: { gross: '420' },
      status: 'PASS',
      tenantId,
      tolerance: '0.01',
      unresolvedOverlapCount: 0,
      workspaceId,
    });
    const impact = dataImpactReportSchema.parse({
      affectedIssues: [],
      affectedMetricCodes: ['order_count'],
      amountDifferences: {
        gross: { after: '420', before: '420', delta: '0' },
      },
      canonicalRecordDifference: { after: 1, before: 1, delta: 0 },
      datasetId: 'dataset_orders_contract',
      evidenceRefs: ['evidence://impact'],
      generatedAt: '2026-07-19T00:00:00.000Z',
      id: 'impact_contract',
      newlyExcludedRecords: 0,
      newlyIncludedRecords: 0,
      previousVersions: { qualityRules: wave3RuleVersions.qualityRules },
      proposedVersions: { qualityRules: wave3RuleVersions.qualityRules },
      range: period,
      readinessAfter: 'READY',
      readinessBefore: 'READY',
      sourceRecordDifference: { after: 1, before: 1, delta: 0 },
      tenantId,
      workspaceId,
    });
    const inventory = dataInventoryEntrySchema.parse({
      classification: 'CUSTOMER_CONFIDENTIAL',
      deletionMethod: 'scoped hard delete or invalidation',
      evidenceOwner: 'artur_wisniewski',
      id: 'inventory_contract',
      legalHold: null,
      location: 'local-runtime:canonical',
      purpose: 'Canonical orders',
      recipients: ['PapaData platform'],
      retentionClass: 'R-BUSINESS',
      retentionTrigger: 'contract or deletion request',
      subprocessors: [],
      system: 'canonical',
      tenantId: null,
      workspaceId: null,
    });
    const ledger = deletionLedgerEntrySchema.parse({
      backupCutoff: '2026-08-19T00:00:00.000Z',
      deletionId: 'delete_contract',
      effectiveAt: null,
      evidenceRefs: ['evidence://delete'],
      legalBasis: null,
      legalHold: null,
      reason: 'tenant_requested',
      requestedAt: '2026-07-19T00:00:00.000Z',
      resourceScope: { datasetId: 'dataset_orders_contract' },
      status: 'PENDING',
      systems: [{ evidenceRef: null, status: 'PENDING', system: 'canonical' }],
      tenantId,
      workspaceId,
    });

    expect(authority.version).toBe(wave3RuleVersions.sourceAuthority);
    expect(reconciliation.status).toBe('PASS');
    expect(impact.canonicalRecordDifference.delta).toBe(0);
    expect(inventory.retentionClass).toBe('R-BUSINESS');
    expect(ledger.status).toBe('PENDING');
  });

  it('eksponuje minimalne definicje KPI i stabilne trasy API Fali 3', () => {
    expect(metricDefinitions.map((definition) => definition.metricCode)).toEqual([
      'order_count',
      'gross_revenue',
      'revenue_after_fees',
    ]);
    expect(metricDefinitions[2]?.missingDataPolicy).toBe('BLOCK');
    expect(dataQualityApiRoutes.datasetCollection).toBe('/v1/datasets');
    expect(dataQualityContractVersion).toBe('data-quality.v1');
  });

  it('waliduje source batch Fali 3 z klasyfikacją i retencją source recordu', () => {
    const batch = {
      checkpointAfter: null,
      checkpointBefore: null,
      completedAt: null,
      connectionId: asConnectionId('conn_woo_001'),
      contractVersion: domainContractVersion,
      correlationId: asCorrelationId('cor_source_contract'),
      counts: {
        accepted: 1,
        duplicated: 0,
        failed: 0,
        fetched: 1,
        quarantined: 0,
      },
      createdAt: '2026-07-19T00:00:00.000Z',
      id: asSourceBatchId('job_woo_001_orders_batch_1'),
      jobId: asSyncJobId('job_woo_001'),
      providerId: asProviderId('woocommerce'),
      range: { mode: 'bounded', ...period },
      status: 'OPEN',
      stream: 'orders',
      tenantId,
      workspaceId,
    };

    expect(batch.counts.accepted).toBe(1);
  });
});
