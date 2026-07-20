import { z } from 'zod';

import {
  applicationSessionContextSchema,
  type ApplicationSessionContext,
} from '../../domain-contracts';
import {
  commandCenterProjectionSchema,
  drillDownSchema,
  metricExportSchema,
  moduleProjectionSchema,
  trustDrawerSchema,
  type AnalyticsReadinessStatus,
  type CommandCenterProjection,
} from './analyticsContracts';
import {
  createReferenceWave4Analytics,
  createWave4Context,
  wave4Period,
} from './analyticsTestUtils';

const fixtureIds = [
  'default',
  'loading',
  'empty_confirmed',
  'missing_data',
  'partial',
  'stale',
  'invalid',
  'blocked',
  'processing',
  'recalculation',
  'permission_denied',
  'entitlement_required',
  'recoverable_error',
  'critical_issue',
  'historical_snapshot',
  'long_content',
  'desktop',
  'tablet',
  'mobile',
  'keyboard_navigation',
  'reduced_motion',
  'light',
  'dark',
  'high_contrast',
  'orders',
  'products_gated',
  'customers_gated',
  'traffic_gated',
  'paid_campaigns_gated',
  'd2c',
  'marketplace_gated',
  'marketing_attribution_gated',
  'profitability_blocked',
  'data_trust',
  'alerts',
  'tasks',
  'workspace_switch',
] as const;

export const analyticsFixtureIdSchema = z.enum(fixtureIds);
export type AnalyticsFixtureId = z.infer<typeof analyticsFixtureIdSchema>;

const analyticsStoryStateSchema = z.enum([
  'blocked',
  'data_trust',
  'error',
  'gated',
  'loading',
  'module',
  'permission',
  'ready',
  'responsive',
  'workspace_switch',
]);

export const analyticsStoryFixtureSchema = z.object({
  commandCenter: commandCenterProjectionSchema,
  context: applicationSessionContextSchema,
  drillDown: drillDownSchema,
  exportObject: metricExportSchema,
  fixtureId: analyticsFixtureIdSchema,
  module: moduleProjectionSchema,
  notes: z.array(z.string().min(1)),
  state: analyticsStoryStateSchema,
  title: z.string().min(1),
  trustDrawer: trustDrawerSchema,
});

export type AnalyticsStoryFixture = z.infer<typeof analyticsStoryFixtureSchema>;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function firstSnapshot(commandCenter: CommandCenterProjection) {
  const snapshot = commandCenter.kpis[0]?.snapshot;

  if (!snapshot) {
    throw new Error('READY_FIXTURE_WITHOUT_SNAPSHOT');
  }

  return snapshot;
}

function createBaseFixture(): AnalyticsStoryFixture {
  const { context, runtime } = createReferenceWave4Analytics();
  const commandCenter = runtime.getCommandCenterProjection(context);
  const snapshot = firstSnapshot(commandCenter);
  const trustDrawer = runtime.openTrustDrawer(context, snapshot.id);
  const drillDown = runtime.openDrillDown(context, snapshot.id);
  const exportObject = runtime.requestMetricExport(context, {
    metricSnapshotIds: commandCenter.kpis.map((kpi) => kpi.snapshot.id),
    period: wave4Period,
  });

  return analyticsStoryFixtureSchema.parse({
    commandCenter,
    context,
    drillDown,
    exportObject,
    fixtureId: 'default',
    module: commandCenter.modules[0],
    notes: [
      'Command Center korzysta z Query Service i opublikowanych MetricSnapshot.',
      'Trust Drawer zachowuje definicję, readiness, lineage, reconciliation i evidence.',
    ],
    state: 'ready',
    title: 'Command Center Fali 4',
    trustDrawer,
  });
}

const readyBase = createBaseFixture();

function withReadiness(
  fixtureId: AnalyticsFixtureId,
  readiness: AnalyticsReadinessStatus,
  input: {
    note: string;
    state?: AnalyticsStoryFixture['state'];
    title: string;
  },
): AnalyticsStoryFixture {
  const base = clone(readyBase);
  const commandCenter = clone(base.commandCenter);
  commandCenter.meta.readiness = readiness;
  commandCenter.meta.limitations = readiness === 'READY' ? [] : [input.note];
  commandCenter.readinessSummary = {
    blocked: readiness === 'BLOCKED' ? 1 : 0,
    invalid: readiness === 'INVALID' ? 1 : 0,
    partial: readiness === 'PARTIAL' ? 1 : 0,
    ready: readiness === 'READY' ? 4 : 0,
    stale: readiness === 'STALE' ? 1 : 0,
  };

  for (const kpi of commandCenter.kpis) {
    kpi.snapshot.readiness = readiness;
    kpi.snapshot.limitations = readiness === 'READY' ? [] : [input.note];
    kpi.snapshot.readinessReasons = [
      {
        affectedScope: kpi.snapshot.metricCode,
        businessImpact: input.note,
        missing: readiness === 'READY' ? [] : ['dataset readiness'],
        nextAction: readiness === 'READY' ? 'Monitoruj.' : 'Otwórz Trust Drawer.',
        ownerId: 'PapaData Analytics',
        reliableScope: readiness === 'READY' ? 'Cały okres.' : 'Część okresu albo brak publikacji.',
        summary: `Fixture ${readiness}.`,
      },
    ];
    if (readiness === 'INVALID' || readiness === 'BLOCKED') {
      kpi.snapshot.value = null;
      kpi.snapshot.valueType = 'UNPUBLISHED';
      kpi.snapshot.publishedAt = null;
    }
  }

  return analyticsStoryFixtureSchema.parse({
    ...base,
    commandCenter,
    fixtureId,
    module: {
      ...base.module,
      meta: {
        ...base.module.meta,
        limitations: commandCenter.meta.limitations,
        readiness,
      },
      status: readiness === 'BLOCKED' ? 'BLOCKED' : readiness === 'READY' ? 'IMPLEMENTED' : 'GATED',
    },
    notes: [input.note, ...base.notes],
    state: input.state ?? (readiness === 'READY' ? 'ready' : 'blocked'),
    title: input.title,
    trustDrawer: {
      ...base.trustDrawer,
      businessImpact: input.note,
      snapshot: commandCenter.kpis[0].snapshot,
    },
  });
}

function moduleFixture(
  fixtureId: AnalyticsFixtureId,
  moduleId: AnalyticsStoryFixture['module']['moduleId'],
  title: string,
): AnalyticsStoryFixture {
  const base = clone(readyBase);
  const module = base.commandCenter.modules.find((item) => item.moduleId === moduleId);

  if (!module) {
    throw new Error(`MODULE_FIXTURE_NOT_FOUND:${moduleId}`);
  }

  return analyticsStoryFixtureSchema.parse({
    ...base,
    fixtureId,
    module,
    notes: [
      module.status === 'IMPLEMENTED'
        ? 'Moduł korzysta z projekcji Query Service.'
        : 'Moduł jest jawnie gated/blocked, bez martwego linku.',
      ...base.notes,
    ],
    state: module.status === 'IMPLEMENTED' ? 'module' : 'gated',
    title,
  });
}

const partialRuntime = createReferenceWave4Analytics({
  wave3Options: {
    payloadPatch: (payload, record) =>
      record.externalId === 'woo_order_1001'
        ? {
            ...payload,
            status: 'provider_new_status',
          }
        : payload,
  },
});
const partialCommandCenter = partialRuntime.runtime.getCommandCenterProjection(partialRuntime.context);
const partialSnapshot = firstSnapshot(partialCommandCenter);

const invalidRuntime = createReferenceWave4Analytics({
  wave3Options: {
    payloadPatch: (payload, record) =>
      record.externalId === 'woo_order_1001'
        ? {
            ...payload,
            currency: 'XYZ',
            gross: false,
          }
        : payload,
  },
});
const invalidCommandCenter = invalidRuntime.runtime.getCommandCenterProjection(invalidRuntime.context);
const invalidSnapshot = firstSnapshot(invalidCommandCenter);

const permissionContext: ApplicationSessionContext = {
  ...createWave4Context(),
  capabilities: [],
  entitlements: [],
};

const partialFixture = analyticsStoryFixtureSchema.parse({
  ...readyBase,
  commandCenter: partialCommandCenter,
  context: partialRuntime.context,
  drillDown: partialRuntime.runtime.openDrillDown(partialRuntime.context, partialSnapshot.id),
  fixtureId: 'partial',
  module: partialCommandCenter.modules[0],
  notes: ['Ten sam KPI działa jako PARTIAL przy nieznanym statusie providera.'],
  state: 'ready',
  title: 'KPI częściowy',
  trustDrawer: partialRuntime.runtime.openTrustDrawer(partialRuntime.context, partialSnapshot.id),
});

const invalidFixture = analyticsStoryFixtureSchema.parse({
  ...readyBase,
  commandCenter: invalidCommandCenter,
  context: invalidRuntime.context,
  drillDown: invalidRuntime.runtime.openDrillDown(invalidRuntime.context, invalidSnapshot.id),
  fixtureId: 'invalid',
  module: invalidCommandCenter.modules[0],
  notes: ['Ten sam KPI działa jako INVALID i nie publikuje wartości.'],
  state: 'blocked',
  title: 'KPI nieprawidłowy',
  trustDrawer: invalidRuntime.runtime.openTrustDrawer(invalidRuntime.context, invalidSnapshot.id),
});

export const analyticsStoryFixtures: Record<AnalyticsFixtureId, AnalyticsStoryFixture> = {
  alerts: moduleFixture('alerts', 'alerts', 'Alerty analityczne'),
  blocked: withReadiness('blocked', 'BLOCKED', {
    note: 'Brakuje wymaganej kontroli lub źródła.',
    state: 'blocked',
    title: 'Stan BLOCKED',
  }),
  critical_issue: withReadiness('critical_issue', 'INVALID', {
    note: 'Reconciliation mismatch blokuje zależny KPI.',
    state: 'error',
    title: 'Problem krytyczny',
  }),
  customers_gated: moduleFixture('customers_gated', 'customers', 'Klienci gated'),
  d2c: moduleFixture('d2c', 'd2c', 'Sprzedaż D2C'),
  dark: {
    ...readyBase,
    fixtureId: 'dark',
    title: 'Motyw ciemny',
  },
  data_trust: moduleFixture('data_trust', 'data_health', 'Data Trust'),
  default: readyBase,
  desktop: {
    ...readyBase,
    fixtureId: 'desktop',
    state: 'responsive',
    title: 'Desktop',
  },
  empty_confirmed: withReadiness('empty_confirmed', 'EMPTY', {
    note: 'Potwierdzony brak zamówień nie jest tym samym co brak danych.',
    state: 'ready',
    title: 'Empty confirmed',
  }),
  entitlement_required: {
    ...readyBase,
    context: {
      ...permissionContext,
      capabilities: readyBase.context.capabilities,
    },
    fixtureId: 'entitlement_required',
    notes: ['Capability istnieje, ale entitlement nie pozwala na zapytanie.'],
    state: 'permission',
    title: 'Wymagany entitlement',
  },
  high_contrast: {
    ...readyBase,
    fixtureId: 'high_contrast',
    notes: ['Wariant sprawdza, że znaczenie nie jest przekazane wyłącznie kolorem.'],
    state: 'responsive',
    title: 'Wysoki kontrast',
  },
  historical_snapshot: {
    ...readyBase,
    fixtureId: 'historical_snapshot',
    notes: ['Drill-down zachowuje historyczny snapshot ID, okres i wersje.'],
    title: 'Snapshot historyczny',
  },
  invalid: invalidFixture,
  keyboard_navigation: {
    ...readyBase,
    fixtureId: 'keyboard_navigation',
    notes: ['Akcje KPI, Trust Drawer, drill-down i export są przyciskami z focus state.'],
    state: 'responsive',
    title: 'Nawigacja klawiaturą',
  },
  light: {
    ...readyBase,
    fixtureId: 'light',
    title: 'Motyw jasny',
  },
  loading: withReadiness('loading', 'PROCESSING', {
    note: 'Zapytanie lub reprocessing jest w toku.',
    state: 'loading',
    title: 'Ładowanie',
  }),
  long_content: {
    ...readyBase,
    fixtureId: 'long_content',
    notes: [
      'Bardzo długi opis ograniczenia danych sprawdza zawijanie tekstu w nagłówkach, tabelach, panelu zaufania i kolejce uwagi bez nachodzenia na inne elementy.',
      ...readyBase.notes,
    ],
    title: 'Długie treści',
  },
  marketplace_gated: moduleFixture('marketplace_gated', 'marketplace', 'Marketplace gated'),
  marketing_attribution_gated: moduleFixture(
    'marketing_attribution_gated',
    'marketing_attribution',
    'Marketing i atrybucja gated',
  ),
  missing_data: withReadiness('missing_data', 'EMPTY', {
    note: 'Brak danych wejściowych nie jest prezentowany jako zero.',
    state: 'blocked',
    title: 'Brak danych',
  }),
  mobile: {
    ...readyBase,
    fixtureId: 'mobile',
    state: 'responsive',
    title: 'Mobile',
  },
  orders: moduleFixture('orders', 'orders', 'Zamówienia'),
  paid_campaigns_gated: moduleFixture(
    'paid_campaigns_gated',
    'paid_campaigns',
    'Kampanie płatne gated',
  ),
  partial: partialFixture,
  permission_denied: {
    ...readyBase,
    context: permissionContext,
    fixtureId: 'permission_denied',
    notes: ['Serwerowy Query Service odrzuca brak capability; ukrycie przycisku nie jest autoryzacją.'],
    state: 'permission',
    title: 'Brak uprawnień',
  },
  processing: withReadiness('processing', 'PROCESSING', {
    note: 'Metric calculation działa jako proces wersjonowany.',
    state: 'loading',
    title: 'Przetwarzanie',
  }),
  products_gated: moduleFixture('products_gated', 'products', 'Produkty gated'),
  profitability_blocked: moduleFixture(
    'profitability_blocked',
    'profitability',
    'Rentowność blocked',
  ),
  recalculation: withReadiness('recalculation', 'RECALCULATION_REQUIRED', {
    note: 'Zmiana definicji albo datasetu wymaga reprocessingu.',
    state: 'blocked',
    title: 'Wymagane przeliczenie',
  }),
  recoverable_error: withReadiness('recoverable_error', 'STALE', {
    note: 'Lokalna degradacja providera nie blokuje niezależnych KPI.',
    state: 'error',
    title: 'Błąd możliwy do odzyskania',
  }),
  reduced_motion: {
    ...readyBase,
    fixtureId: 'reduced_motion',
    notes: ['Wariant reduced motion bez animowania znaczenia danych.'],
    state: 'responsive',
    title: 'Reduced motion',
  },
  stale: withReadiness('stale', 'STALE', {
    note: 'Dane przekroczyły próg świeżości, a UI wskazuje ostatni dobry zakres.',
    state: 'ready',
    title: 'Stale data',
  }),
  tablet: {
    ...readyBase,
    fixtureId: 'tablet',
    state: 'responsive',
    title: 'Tablet',
  },
  tasks: moduleFixture('tasks', 'tasks_for_me', 'Zadania dla mnie'),
  traffic_gated: moduleFixture('traffic_gated', 'traffic', 'Ruch gated'),
  workspace_switch: {
    ...readyBase,
    fixtureId: 'workspace_switch',
    notes: ['Zmiana workspace czyści cache, zamyka szczegóły i odrzuca późną odpowiedź starego kontekstu.'],
    state: 'workspace_switch',
    title: 'Zmiana workspace',
  },
};
