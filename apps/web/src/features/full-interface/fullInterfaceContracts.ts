import { z } from 'zod';

import {
  currencyCodeSchema,
  tenantIdSchema,
  workspaceIdSchema,
} from '../../domain-contracts';

const isoDateTimeSchema = z.string().datetime({ offset: true });
const idValueSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9_:-]*$/);

export const fullInterfaceContractVersion = 'ui-full-interface.2026-07' as const;

export const uiThemeSchema = z.enum(['light', 'dark']);
export const uiViewportSchema = z.enum(['desktop', 'tablet', 'mobile']);

export type UIViewport = z.infer<typeof uiViewportSchema>;

export const uiSurfaceSchema = z.enum([
  'customer_workspace',
  'assistant',
  'internal_control_plane',
  'component_catalog',
  'chart_catalog',
  'date_filters',
]);

export const uiSystemStateSchema = z.enum([
  'loading',
  'empty',
  'no_data',
  'partial',
  'invalid',
  'stale',
  'delayed',
  'processing',
  'ready',
  'success',
  'warning',
  'error',
  'forbidden',
  'blocked',
  'expired',
  'cancelled',
  'needs_review',
  'provider_error',
  'insufficient_data',
  'blocked_by_policy',
]);

export type UISystemState = z.infer<typeof uiSystemStateSchema>;

export const uiStatusToneSchema = z.enum([
  'neutral',
  'info',
  'success',
  'warning',
  'danger',
  'blocked',
]);

export type UIStatusTone = z.infer<typeof uiStatusToneSchema>;

export const uiReadinessSchema = z.enum([
  'READY',
  'PARTIAL',
  'EMPTY',
  'STALE',
  'INVALID',
  'BLOCKED',
  'PROCESSING',
  'NEEDS_REVIEW',
]);

export type UIReadiness = z.infer<typeof uiReadinessSchema>;

export const uiComponentGroupSchema = z.enum(['primitive', 'domain']);

export const uiComponentFixtureSchema = z.object({
  contract: z.string().min(1),
  description: z.string().min(1),
  group: uiComponentGroupSchema,
  name: z.string().min(1),
  states: z.array(uiSystemStateSchema).min(1),
});

export type UIComponentFixture = z.infer<typeof uiComponentFixtureSchema>;

export const uiMetricSchema = z.object({
  delta: z.string().min(1),
  evidenceId: idValueSchema,
  label: z.string().min(1),
  limitation: z.string().min(1).nullable(),
  readiness: uiReadinessSchema,
  source: z.string().min(1),
  unit: z.enum(['currency', 'percent', 'number', 'ratio', 'text']),
  value: z.string().min(1).nullable(),
});

export type UIMetric = z.infer<typeof uiMetricSchema>;

export const uiEvidenceSchema = z.object({
  id: idValueSchema,
  label: z.string().min(1),
  limitation: z.string().min(1).nullable(),
  source: z.string().min(1),
  timestamp: isoDateTimeSchema,
});

export type UIEvidence = z.infer<typeof uiEvidenceSchema>;

export const uiChartTypeSchema = z.enum([
  'LineChart',
  'AreaChart',
  'BarChart',
  'StackedBarChart',
  'PieChart',
  'DonutChart',
  'FunnelChart',
  'ComposedChart',
  'Sparkline',
  'TrendChart',
  'ComparisonChart',
]);

export type UIChartType = z.infer<typeof uiChartTypeSchema>;

export const uiChartPointSchema = z.object({
  label: z.string().min(1),
  readiness: uiReadinessSchema,
  value: z.number().nonnegative().nullable(),
});

export const uiChartFixtureSchema = z.object({
  chartType: uiChartTypeSchema,
  description: z.string().min(1),
  interpretation: z.string().min(1),
  lastSync: isoDateTimeSchema,
  points: z.array(uiChartPointSchema).min(1),
  readiness: uiReadinessSchema,
  sources: z.array(z.string().min(1)).min(1),
  tableAlternativeLabel: z.string().min(1),
  title: z.string().min(1),
  unit: z.enum(['PLN', '%', 'orders', 'users', 'score']),
});

export type UIChartFixture = z.infer<typeof uiChartFixtureSchema>;

export const uiScreenSectionSchema = z.object({
  body: z.string().min(1),
  title: z.string().min(1),
  tone: uiStatusToneSchema,
});

export const uiScreenFixtureSchema = z.object({
  alerts: z.array(z.string().min(1)),
  auditEvents: z.array(z.string().min(1)),
  category: z.string().min(1),
  chart: uiChartFixtureSchema,
  description: z.string().min(1),
  evidence: z.array(uiEvidenceSchema).min(1),
  id: idValueSchema,
  metrics: z.array(uiMetricSchema).min(1),
  nextActions: z.array(z.string().min(1)),
  readiness: uiReadinessSchema,
  requiredCapability: z.string().min(1),
  sections: z.array(uiScreenSectionSchema).min(1),
  state: uiSystemStateSchema,
  title: z.string().min(1),
});

export type UIScreenFixture = z.infer<typeof uiScreenFixtureSchema>;

export const uiAssistantModeSchema = z.enum([
  'Decyzja',
  'Diagnoza',
  'Raport',
  'Plan działań',
  'Prognoza',
  'Alert',
  'Brief dla zespołu',
]);

export const uiAssistantFixtureSchema = z.object({
  confidence: z.enum(['low', 'medium', 'high']),
  evidence: z.array(uiEvidenceSchema).min(1),
  limitations: z.array(z.string().min(1)),
  messages: z.array(
    z.object({
      author: z.enum(['user', 'assistant', 'tool']),
      body: z.string().min(1),
      state: uiSystemStateSchema,
    }),
  ).min(1),
  mode: uiAssistantModeSchema,
  nextActions: z.array(z.string().min(1)),
  threadTitle: z.string().min(1),
  toolActivity: z.string().min(1),
});

export type UIAssistantFixture = z.infer<typeof uiAssistantFixtureSchema>;

export const uiInternalFixtureSchema = z.object({
  gate: z.string().min(1),
  id: idValueSchema,
  metrics: z.array(uiMetricSchema).min(1),
  owner: z.string().min(1),
  rows: z.array(
    z.object({
      impact: z.string().min(1),
      label: z.string().min(1),
      status: uiSystemStateSchema,
    }),
  ).min(1),
  title: z.string().min(1),
});

export type UIInternalFixture = z.infer<typeof uiInternalFixtureSchema>;

export const uiDateFilterSchema = z.object({
  comparison: z.string().min(1),
  disabledReason: z.string().min(1),
  label: z.string().min(1),
  timezone: z.string().min(1),
});

export type UIDateFilter = z.infer<typeof uiDateFilterSchema>;

export const fullInterfaceFixtureSchema = z.object({
  assistant: uiAssistantFixtureSchema,
  charts: z.array(uiChartFixtureSchema).min(1),
  components: z.array(uiComponentFixtureSchema).min(1),
  currency: currencyCodeSchema,
  dateFilters: z.array(uiDateFilterSchema).min(1),
  generatedAt: isoDateTimeSchema,
  internal: z.array(uiInternalFixtureSchema).min(1),
  screens: z.array(uiScreenFixtureSchema).min(1),
  tenantId: tenantIdSchema,
  timezone: z.string().min(1),
  version: z.literal(fullInterfaceContractVersion),
  workspaceId: workspaceIdSchema,
});

export type FullInterfaceFixture = z.infer<typeof fullInterfaceFixtureSchema>;
