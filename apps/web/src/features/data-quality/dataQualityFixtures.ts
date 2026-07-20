import { z } from 'zod';

import {
  applicationSessionContextSchema,
  asCapability,
  asCorrelationId,
  asOperationId,
  type ApplicationSessionContext,
} from '../../domain-contracts';
import {
  dataImpactReportSchema,
  dataIssueSchema,
  datasetSchema,
  operationAcceptedSchema,
  qualityAssessmentSchema,
  readinessAssessmentSchema,
  reconciliationReportSchema,
  sourceAuthorityRuleSchema,
  type DataImpactReport,
  type DataIssue,
  type DatasetReadinessStatus,
  type QualityAssessment,
  type SourceAuthorityRule,
} from './dataQualityContracts';
import {
  createReferenceWave3Pipeline,
  createWave3Context,
} from './dataQualityTestUtils';

const fixtureIds = [
  'no_data',
  'ingesting',
  'partial',
  'delayed',
  'invalid',
  'processing',
  'ready',
  'resync_required',
  'blocked',
  'schema_mismatch',
  'missing_required_field',
  'unknown_status',
  'missing_currency',
  'freshness_exceeded',
  'duplicate_source_record',
  'exact_match',
  'confirmed_overlap',
  'ambiguous_overlap',
  'unresolved_overlap',
  'source_authority_missing',
  'source_authority_active',
  'source_authority_changed',
  'manual_review_required',
  'stale_manual_review',
  'no_capability',
  'second_approval_required',
  'issue_without_owner',
  'issue_assigned',
  'issue_resolved',
  'reprocess_queued',
  'reprocess_running',
  'reprocess_failed',
  'reprocess_completed',
  'reconciliation_within_tolerance',
  'reconciliation_outside_tolerance',
  'old_new_impact',
  'historical_periods_invalidated',
  'missing_lineage',
  'forbidden',
  'expired_session',
  'workspace_switched_during_operation',
] as const;

export const dataQualityFixtureIdSchema = z.enum(fixtureIds);
export type DataQualityFixtureId = z.infer<typeof dataQualityFixtureIdSchema>;

const dataQualityUiStateSchema = z.enum([
  'authority',
  'blocked',
  'forbidden',
  'issue',
  'lineage',
  'loading',
  'manual_review',
  'no_data',
  'quality',
  'reconciliation',
  'reprocess',
  'workspace_switch',
]);

export const dataQualityStoryFixtureSchema = z.object({
  context: applicationSessionContextSchema,
  dataset: datasetSchema,
  fixtureId: dataQualityFixtureIdSchema,
  impact: z.string().min(1),
  issues: z.array(dataIssueSchema),
  nextAction: z.string().min(1),
  operation: operationAcceptedSchema.optional(),
  quality: qualityAssessmentSchema,
  readiness: readinessAssessmentSchema,
  reconciliation: reconciliationReportSchema,
  impactReports: z.array(dataImpactReportSchema),
  sourceAuthorityRules: z.array(sourceAuthorityRuleSchema),
  title: z.string().min(1),
  uiState: dataQualityUiStateSchema,
});

export type DataQualityStoryFixture = z.infer<typeof dataQualityStoryFixtureSchema>;

function clone<T>(value: T): T {
  return structuredClone(value);
}

const reference = createReferenceWave3Pipeline();
const referenceSnapshot = reference.runtime.getSnapshot();
const readyBase = dataQualityStoryFixtureSchema.parse({
  context: reference.context,
  dataset: referenceSnapshot.datasets[0],
  fixtureId: 'ready',
  impact:
    'Orders dataset ma source, normalized, canonical, lineage, quality assessment i reconciliation w tolerancji.',
  impactReports: referenceSnapshot.impactReports,
  issues: referenceSnapshot.issues,
  nextAction: 'Dataset może wejść do Fali 4 dla Order Count i Gross Revenue.',
  quality: referenceSnapshot.qualityAssessments[0],
  readiness: referenceSnapshot.readinessAssessments[0],
  reconciliation: referenceSnapshot.reconciliations[0],
  sourceAuthorityRules: referenceSnapshot.sourceAuthorities,
  title: 'Dataset zamówień gotowy',
  uiState: 'quality',
});

const partialReference = createReferenceWave3Pipeline({
  payloadPatch: (payload, record) =>
    record.externalId === 'woo_order_1001'
      ? {
          ...payload,
          status: 'provider_new_status',
        }
      : payload,
});
const partialSnapshot = partialReference.runtime.getSnapshot();
const partialIssue = partialSnapshot.issues[0];

const invalidReference = createReferenceWave3Pipeline({
  payloadPatch: (payload, record) =>
    record.externalId === 'woo_order_1001'
      ? {
          ...payload,
          currency: 'XYZ',
          gross: false,
        }
      : payload,
});
const invalidSnapshot = invalidReference.runtime.getSnapshot();
const invalidIssue = invalidSnapshot.issues[0] ?? partialIssue;

const reprocessRequest = reference.runtime.requestReprocess(reference.context, {
  datasetId: readyBase.dataset.id,
  idempotencyKey: 'idem_story_reprocess',
  reason: 'source_authority_changed',
});
const reprocessCompleted = reference.runtime.runReprocess(
  reference.context,
  reprocessRequest.job.id,
);
const impactReport = reference.runtime.getImpactReports(reference.context, readyBase.dataset.id)
  .data[0];

function statusFixture(
  fixtureId: DataQualityFixtureId,
  status: DatasetReadinessStatus,
  input: {
    impact: string;
    nextAction: string;
    title: string;
    uiState?: DataQualityStoryFixture['uiState'];
  },
): DataQualityStoryFixture {
  const base = clone(readyBase);
  const limitation =
    status === 'READY'
      ? []
      : [
          {
            code: status,
            impact: input.impact,
            message: input.nextAction,
          },
        ];

  return dataQualityStoryFixtureSchema.parse({
    ...base,
    dataset: {
      ...base.dataset,
      limitations: limitation,
      readinessStatus: status,
    },
    fixtureId,
    impact: input.impact,
    nextAction: input.nextAction,
    readiness: {
      ...base.readiness,
      blockedMetricCodes:
        status === 'READY'
          ? ['revenue_after_fees']
          : ['order_count', 'gross_revenue', 'revenue_after_fees'],
      limitations: limitation,
      status,
    },
    title: input.title,
    uiState: input.uiState ?? 'quality',
  });
}

function issueFixture(
  fixtureId: DataQualityFixtureId,
  issue: DataIssue | undefined,
  input: {
    impact: string;
    nextAction: string;
    title: string;
    uiState?: DataQualityStoryFixture['uiState'];
  },
): DataQualityStoryFixture {
  const base = statusFixture(fixtureId, fixtureId === 'blocked' ? 'BLOCKED' : 'PARTIAL', {
    impact: input.impact,
    nextAction: input.nextAction,
    title: input.title,
    uiState: input.uiState ?? 'issue',
  });

  return dataQualityStoryFixtureSchema.parse({
    ...base,
    issues: issue ? [issue] : [],
  });
}

function mutateIssue(
  issue: DataIssue | undefined,
  patch: Partial<DataIssue>,
): DataIssue[] {
  if (!issue) {
    return [];
  }

  return [
    dataIssueSchema.parse({
      ...issue,
      ...patch,
    }),
  ];
}

function withQualityStatus(
  fixture: DataQualityStoryFixture,
  patch: Partial<QualityAssessment>,
): DataQualityStoryFixture {
  return dataQualityStoryFixtureSchema.parse({
    ...fixture,
    quality: qualityAssessmentSchema.parse({
      ...fixture.quality,
      ...patch,
    }),
  });
}

function noCapabilityContext(context: ApplicationSessionContext): ApplicationSessionContext {
  return applicationSessionContextSchema.parse({
    ...context,
    capabilities: context.capabilities.filter(
      (capability) => capability !== asCapability('data-quality:reprocess'),
    ),
  });
}

function expiredContext(context: ApplicationSessionContext): ApplicationSessionContext {
  return applicationSessionContextSchema.parse({
    ...context,
    featureFlags: {
      ...context.featureFlags,
      expiredSession: true,
    },
  });
}

function operationFixture(
  fixtureId: DataQualityFixtureId,
  status: 'accepted' | 'completed' | 'partial' | 'error',
  input: {
    impact: string;
    nextAction: string;
    title: string;
  },
): DataQualityStoryFixture {
  const base = statusFixture(fixtureId, status === 'completed' ? 'READY' : 'PROCESSING', {
    impact: input.impact,
    nextAction: input.nextAction,
    title: input.title,
    uiState: 'reprocess',
  });

  return dataQualityStoryFixtureSchema.parse({
    ...base,
    operation: {
      contractVersion: 'data-quality.v1',
      correlationId: `cor_story_${fixtureId}`,
      operationId: `op_story_${fixtureId}`,
      status,
      tenantId: base.context.tenant.tenantId,
      workspaceId: base.context.activeWorkspace.workspaceId,
    },
  });
}

const outsideTolerance = reconciliationReportSchema.parse({
  ...readyBase.reconciliation,
  evidenceHash: 'fnv1a:outside',
  reasonCodes: ['OUTSIDE_TOLERANCE'],
  status: 'FAIL',
});

const authorityChangedImpact: DataImpactReport[] = impactReport
  ? [
      dataImpactReportSchema.parse({
        ...impactReport,
        proposedVersions: {
          ...impactReport.proposedVersions,
          sourceAuthority: 'authority.woocommerce-orders.2026-08',
        },
      }),
    ]
  : [];

export const dataQualityStoryFixtures: Record<
  DataQualityFixtureId,
  DataQualityStoryFixture
> = {
  ambiguous_overlap: issueFixture('ambiguous_overlap', partialIssue, {
    impact: 'Overlap wymaga manual review, bo exact key nie rozstrzyga źródła nadrzędnego.',
    nextAction: 'Data Steward wybiera source authority i uruchamia reprocess.',
    title: 'Overlap niejednoznaczny',
    uiState: 'manual_review',
  }),
  blocked: issueFixture('blocked', invalidIssue, {
    impact: 'Blokada polityki lub konfliktu nie ma obejścia w UI.',
    nextAction: 'Wskaż ownera i rozstrzygnij decyzję domenową.',
    title: 'Dataset zablokowany',
    uiState: 'blocked',
  }),
  confirmed_overlap: statusFixture('confirmed_overlap', 'READY', {
    impact: 'Overlap został potwierdzony i kontrolowany przez exact matching.',
    nextAction: 'Lineage pokazuje excluded contribution z reason code.',
    title: 'Overlap potwierdzony',
    uiState: 'lineage',
  }),
  delayed: statusFixture('delayed', 'DELAYED', {
    impact: 'Dane przekroczyły próg świeżości dla bieżącego zakresu.',
    nextAction: 'Uruchom catch-up i pokaż ostatni poprawny punkt.',
    title: 'Dataset opóźniony',
  }),
  duplicate_source_record: statusFixture('duplicate_source_record', 'READY', {
    impact: 'Duplikat source record został wykluczony z wkładu kanonicznego.',
    nextAction: 'Zachowaj source records dla audytu i reconciliation.',
    title: 'Duplikat source record',
    uiState: 'lineage',
  }),
  exact_match: statusFixture('exact_match', 'READY', {
    impact: 'Exact matching działa przed fuzzy i opiera się na deterministycznym order number.',
    nextAction: 'Fuzzy matching pozostaje wyłączony.',
    title: 'Exact matching',
    uiState: 'lineage',
  }),
  expired_session: {
    ...statusFixture('expired_session', 'PROCESSING', {
      impact: 'Sesja wygasła podczas operacji jakości danych.',
      nextAction: 'Zaloguj ponownie i odśwież SessionContext.',
      title: 'Wygasła sesja',
      uiState: 'forbidden',
    }),
    context: expiredContext(readyBase.context),
  },
  forbidden: {
    ...statusFixture('forbidden', 'BLOCKED', {
      impact: 'Brak capability blokuje operację po stronie zaufanej.',
      nextAction: 'Poproś administratora workspace o właściwą rolę.',
      title: 'Brak dostępu',
      uiState: 'forbidden',
    }),
    context: noCapabilityContext(readyBase.context),
  },
  freshness_exceeded: statusFixture('freshness_exceeded', 'DELAYED', {
    impact: 'Freshness exceeded blokuje bieżące KPI zależne od aktualnego zakresu.',
    nextAction: 'Sprawdź provider latency i sync job.',
    title: 'Próg świeżości przekroczony',
  }),
  historical_periods_invalidated: {
    ...statusFixture('historical_periods_invalidated', 'RESYNC_REQUIRED', {
      impact: 'Zmiana reguły unieważniła historyczne okresy zależne.',
      nextAction: 'Uruchom reprocess tylko dla wskazanego zakresu.',
      title: 'Okresy historyczne unieważnione',
      uiState: 'reprocess',
    }),
    impactReports: authorityChangedImpact,
  },
  ingesting: operationFixture('ingesting', 'accepted', {
    impact: 'Trwa pobieranie source data; KPI są niedostępne.',
    nextAction: 'Śledź operation ID i checkpoint.',
    title: 'Ingestion w toku',
  }),
  invalid: {
    ...statusFixture('invalid', 'INVALID', {
      impact: 'Naruszenie schematu lub integralności blokuje zależne KPI.',
      nextAction: 'Napraw issue, następnie uruchom walidowany reprocess.',
      title: 'Dataset nieprawidłowy',
    }),
    issues: [...invalidSnapshot.issues],
    quality: invalidSnapshot.qualityAssessments[0] ?? readyBase.quality,
  },
  issue_assigned: {
    ...issueFixture('issue_assigned', partialIssue, {
      impact: 'Issue ma ownera i czeka na review.',
      nextAction: 'Data Steward wykonuje decyzję z rationale.',
      title: 'Issue przypisane',
    }),
    issues: mutateIssue(partialIssue, {
      ownerId: 'data_steward',
      status: 'ASSIGNED',
    }),
  },
  issue_resolved: {
    ...issueFixture('issue_resolved', partialIssue, {
      impact: 'Issue zamknięte nie oznacza automatycznie udanego reprocessingu.',
      nextAction: 'Zweryfikuj wynik reprocessingu i readiness.',
      title: 'Issue rozwiązane',
    }),
    issues: mutateIssue(partialIssue, {
      resolution: {
        actorId: 'usr_artur',
        evidenceRefs: ['evidence://wave-3/manual-review'],
        rationale: 'Mapping potwierdzony.',
        resolvedAt: '2026-07-19T00:00:00.000Z',
        resolutionType: 'REPROCESS_REQUIRED',
      },
      status: 'REPROCESSING',
    }),
  },
  issue_without_owner: {
    ...issueFixture('issue_without_owner', invalidIssue, {
      impact: 'Krytyczne issue bez ownera jest blokerem operacyjnym.',
      nextAction: 'Przypisz ownera przed review.',
      title: 'Issue bez ownera',
    }),
    issues: mutateIssue(invalidIssue, {
      ownerId: null,
      severity: 'CRITICAL',
      status: 'OPEN',
    }),
  },
  manual_review_required: issueFixture('manual_review_required', partialIssue, {
    impact: 'Manual review jest wymagane dla statusu bez zatwierdzonego mappingu.',
    nextAction: 'Zapisz rationale, expected version i impact.',
    title: 'Manual review wymagane',
    uiState: 'manual_review',
  }),
  missing_currency: issueFixture('missing_currency', invalidIssue, {
    impact: 'Brak lub nieznana waluta blokuje agregację finansową.',
    nextAction: 'Zweryfikuj currency policy i source payload.',
    title: 'Brak waluty',
  }),
  missing_lineage: withQualityStatus(
    statusFixture('missing_lineage', 'INVALID', {
      impact: 'Brak lineage blokuje audytowalne KPI.',
      nextAction: 'Odtwórz canonical-source links przed publikacją.',
      title: 'Brak lineage',
      uiState: 'lineage',
    }),
    {
      lineage: {
        ...readyBase.quality.lineage,
        reasonCodes: ['MISSING_LINEAGE'],
        status: 'FAIL',
        value: '0',
      },
      result: 'FAIL',
    },
  ),
  missing_required_field: issueFixture('missing_required_field', invalidIssue, {
    impact: 'Brak required field trafia do DataIssue i blokuje readiness.',
    nextAction: 'Napraw mapping albo skieruj rekord do kwarantanny.',
    title: 'Brak wymaganego pola',
  }),
  no_capability: {
    ...statusFixture('no_capability', 'BLOCKED', {
      impact: 'Użytkownik nie ma capability do reprocessingu.',
      nextAction: 'Akcja pozostaje zablokowana po stronie API.',
      title: 'Brak capability',
      uiState: 'forbidden',
    }),
    context: noCapabilityContext(readyBase.context),
  },
  no_data: statusFixture('no_data', 'NO_DATA', {
    impact: 'Brak danych nie jest zerem i nie tworzy KPI.',
    nextAction: 'Uruchom initial sync dla orders.',
    title: 'Brak danych',
    uiState: 'no_data',
  }),
  old_new_impact: {
    ...statusFixture('old_new_impact', 'PROCESSING', {
      impact: 'Raport old/new pokazuje różnice counts, versions i readiness.',
      nextAction: 'Zweryfikuj impact report przed publikacją wersji.',
      title: 'Impact old/new',
      uiState: 'reprocess',
    }),
    impactReports: authorityChangedImpact,
  },
  partial: {
    ...statusFixture('partial', 'PARTIAL', {
      impact: 'Część zakresu jest użyteczna, ale ograniczenia blokują część KPI.',
      nextAction: 'Pokaż allowed i blocked metrics.',
      title: 'Dataset częściowy',
    }),
    issues: [...partialSnapshot.issues],
    quality: partialSnapshot.qualityAssessments[0] ?? readyBase.quality,
  },
  processing: operationFixture('processing', 'accepted', {
    impact: 'Trwa normalizacja, canonicalization albo reprocessing.',
    nextAction: 'Śledź operation ID i rule version.',
    title: 'Przetwarzanie',
  }),
  ready: readyBase,
  reconciliation_outside_tolerance: {
    ...statusFixture('reconciliation_outside_tolerance', 'INVALID', {
      impact: 'Reconciliation poza tolerancją nie jest sukcesem.',
      nextAction: 'Otwórz drill-down różnic i utwórz DataIssue.',
      title: 'Reconciliation poza tolerancją',
      uiState: 'reconciliation',
    }),
    reconciliation: outsideTolerance,
  },
  reconciliation_within_tolerance: statusFixture('reconciliation_within_tolerance', 'READY', {
    impact: 'Source totals i canonical totals mieszczą się w tolerancji.',
    nextAction: 'Raport jest dowodem bramy datasetu.',
    title: 'Reconciliation w tolerancji',
    uiState: 'reconciliation',
  }),
  reprocess_completed: {
    ...operationFixture('reprocess_completed', 'completed', {
      impact: 'Reprocess zakończony i impact report jest dostępny.',
      nextAction: 'Sprawdź readiness po publikacji wersji.',
      title: 'Reprocess zakończony',
    }),
    impactReports: reference.runtime.getImpactReports(reference.context, readyBase.dataset.id)
      .data as DataImpactReport[],
    operation: {
      contractVersion: 'data-quality.v1',
      correlationId: asCorrelationId('cor_story_reprocess_completed'),
      operationId: asOperationId(`op_${reprocessCompleted.id}`),
      status: 'completed',
      tenantId: readyBase.context.tenant.tenantId,
      workspaceId: readyBase.context.activeWorkspace.workspaceId,
    },
  },
  reprocess_failed: operationFixture('reprocess_failed', 'error', {
    impact: 'Błąd reprocessingu pozostawia poprzedni wynik dostępny zgodnie z polityką.',
    nextAction: 'Sprawdź runbook reconciliation failure i DLQ.',
    title: 'Reprocess z błędem',
  }),
  reprocess_queued: operationFixture('reprocess_queued', 'accepted', {
    impact: 'Reprocess jest nowym jobem z idempotency key.',
    nextAction: 'Czekaj na walidację i impact report.',
    title: 'Reprocess w kolejce',
  }),
  reprocess_running: operationFixture('reprocess_running', 'accepted', {
    impact: 'Reprocess działa dla jawnego zakresu i target rule versions.',
    nextAction: 'Nie nadpisuj poprzedniej wersji przed bramą.',
    title: 'Reprocess w toku',
  }),
  resync_required: statusFixture('resync_required', 'RESYNC_REQUIRED', {
    impact: 'Dataset wymaga ponownej synchronizacji dla wskazanego zakresu.',
    nextAction: 'Uruchom sync/backfill przed oceną readiness.',
    title: 'Wymagana resynchronizacja',
  }),
  schema_mismatch: issueFixture('schema_mismatch', invalidIssue, {
    impact: 'Schema mismatch trafia do kwarantanny i DataIssue.',
    nextAction: 'Zaktualizuj mapping albo provider contract.',
    title: 'Niezgodność schematu',
  }),
  second_approval_required: issueFixture('second_approval_required', partialIssue, {
    impact: 'Wysoki wpływ wymaga drugiego zatwierdzenia przed publikacją.',
    nextAction: 'Zbierz approval i uruchom revalidation.',
    title: 'Wymagane drugie zatwierdzenie',
    uiState: 'manual_review',
  }),
  source_authority_active: statusFixture('source_authority_active', 'READY', {
    impact: 'Aktywna source authority wskazuje WooCommerce orders.',
    nextAction: 'Zachowaj wersję reguły w canonical facts.',
    title: 'Source authority aktywna',
    uiState: 'authority',
  }),
  source_authority_changed: {
    ...statusFixture('source_authority_changed', 'RESYNC_REQUIRED', {
      impact: 'Zmiana source authority wymaga impact analysis i reprocessingu.',
      nextAction: 'Porównaj previous/proposed versions.',
      title: 'Source authority zmieniona',
      uiState: 'authority',
    }),
    impactReports: authorityChangedImpact,
    sourceAuthorityRules: readyBase.sourceAuthorityRules.map((rule) =>
      sourceAuthorityRuleSchema.parse({
        ...rule,
        status: 'SUPERSEDED',
      }),
    ) as SourceAuthorityRule[],
  },
  source_authority_missing: issueFixture('source_authority_missing', invalidIssue, {
    impact: 'Brak source authority blokuje canonicalization i zależne KPI.',
    nextAction: 'Utwórz i aktywuj regułę z ownerem.',
    title: 'Brak source authority',
    uiState: 'authority',
  }),
  stale_manual_review: issueFixture('stale_manual_review', partialIssue, {
    impact: 'Widok manual review jest nieaktualny i expected version nie pasuje.',
    nextAction: 'Odśwież dane przed decyzją.',
    title: 'Manual review nieaktualne',
    uiState: 'manual_review',
  }),
  unknown_status: issueFixture('unknown_status', partialIssue, {
    impact: 'Nieznany status nie może arbitralnie zasilić przychodu.',
    nextAction: 'Zatwierdź status mapping albo wyklucz rekord.',
    title: 'Nieznany status',
  }),
  unresolved_overlap: issueFixture('unresolved_overlap', partialIssue, {
    impact: 'Unresolved overlap blokuje zależne KPI przed podwójnym wkładem.',
    nextAction: 'Rozstrzygnij overlap lub ogranicz zakres.',
    title: 'Overlap nierozstrzygnięty',
    uiState: 'manual_review',
  }),
  workspace_switched_during_operation: {
    ...statusFixture('workspace_switched_during_operation', 'PROCESSING', {
      impact: 'Zmiana workspace czyści cache i odrzuca spóźnione odpowiedzi.',
      nextAction: 'Pobierz nowy SessionContext przed wznowieniem.',
      title: 'Workspace zmieniony podczas operacji',
      uiState: 'workspace_switch',
    }),
    context: createWave3Context(),
  },
};

export const dataQualityFixtureIds = fixtureIds;
