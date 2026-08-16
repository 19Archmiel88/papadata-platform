import type {
  FormEvent,
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useId,
  useState,
} from 'react';

import type {
  AttributionComparisonProps as ContractAttributionComparisonProps,
  BudgetPacingProps as ContractBudgetPacingProps,
  CohortMatrixProps as ContractCohortMatrixProps,
  CustomerSegmentsProps as ContractCustomerSegmentsProps,
  DataStatusBannerProps as ContractDataStatusBannerProps,
  DecisionQueueProps as ContractDecisionQueueProps,
  EvidencePanelProps as ContractEvidencePanelProps,
  FunnelStepProps as ContractFunnelStepProps,
  LineageGraphProps as ContractLineageGraphProps,
  MorningBriefProps as ContractMorningBriefProps,
  PairingFlowProps as ContractPairingFlowProps,
  PlanPerformanceProps as ContractPlanPerformanceProps,
  ReconciliationPanelProps as ContractReconciliationPanelProps,
  RecommendationCardProps as ContractRecommendationCardProps,
  ResultDriversProps as ContractResultDriversProps,
  SalesFunnelProps as ContractSalesFunnelProps,
  SalesSourcesProps as ContractSalesSourcesProps,
  SyncTimelineProps as ContractSyncTimelineProps,
} from '../../../../../../contracts/domain-component-contracts';
import type {
  DecisionCardProps as ContractDecisionCardProps,
} from '../../../../../../contracts/components/decisioncard';
import type {
  DetailPanelProps as ContractDetailPanelProps,
} from '../../../../../../contracts/components/detailpanel';
import type {
  FunnelChartProps as ContractFunnelChartProps,
} from '../../../../../../contracts/components/funnelchart';
import type {
  PageHeaderProps as ContractPageHeaderProps,
} from '../../../../../../contracts/components/pageheader';
import type {
  PanelProps as ContractPanelProps,
} from '../../../../../../contracts/components/panel';
import type {
  WaterfallChartProps as ContractWaterfallChartProps,
} from '../../../../../../contracts/components/waterfallchart';
import type {
  PapaDataIconName,
} from '../../icons';
import {
  Button,
  TextAction,
} from '../Button';
import {
  InlineNotice,
} from '../InlineNotice';
import {
  ProgressIndicator,
} from '../ProgressIndicator';
import {
  StatusBadge,
} from '../StatusBadge';
import type {
  StatusBadgeTone,
} from '../Feedback/feedbackTone';
import {
  Textarea,
} from '../Field';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import './domain-components.css';

export type {
  FormEvent,
  HTMLAttributes,
  ReactNode,
  ContractAttributionComparisonProps,
  ContractBudgetPacingProps,
  ContractCohortMatrixProps,
  ContractCustomerSegmentsProps,
  ContractDataStatusBannerProps,
  ContractDecisionCardProps,
  ContractDecisionQueueProps,
  ContractDetailPanelProps,
  ContractEvidencePanelProps,
  ContractFunnelChartProps,
  ContractFunnelStepProps,
  ContractLineageGraphProps,
  ContractMorningBriefProps,
  ContractPageHeaderProps,
  ContractPairingFlowProps,
  ContractPanelProps,
  ContractPlanPerformanceProps,
  ContractReconciliationPanelProps,
  ContractRecommendationCardProps,
  ContractResultDriversProps,
  ContractSalesFunnelProps,
  ContractSalesSourcesProps,
  ContractSyncTimelineProps,
  ContractWaterfallChartProps,
  PapaDataIconName,
  StatusBadgeTone,
};

export {
  Button,
  TextAction,
  InlineNotice,
  ProgressIndicator,
  StatusBadge,
  Textarea,
  forwardRef,
  joinClassNames,
  useId,
  useState,
};

export type BaseComponentContractKeys =
  | 'actions'
  | 'ariaLabel'
  | 'ariaLive'
  | 'context'
  | 'description'
  | 'disabled'
  | 'disabledReason'
  | 'evidence'
  | 'id'
  | 'label'
  | 'state'
  | 'testId'
  | 'variant';

export type PageHeaderContractRuntimeKeys =
  | BaseComponentContractKeys
  | 'primaryActionId'
  | 'secondaryActionIds';

export function formatWorkspaceLabel(value: string): string {
  return value
    .replace(/^workspace[_-]?/u, '')
    .replace(/[_-]+/gu, ' ');
}

export function resolveReadinessLabel(value: string): string {
  switch (value) {
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'processing':
      return 'Przetwarzanie';
    case 'noData':
      return 'Brak danych';
    case 'sourceError':
      return 'Błąd źródła';
    case 'blocked':
      return 'Zablokowane';
    case 'unavailable':
      return 'Niedostępne';
    default:
      return value;
  }
}

export function resolveReadinessTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
    case 'processing':
      return 'warning';
    case 'sourceError':
    case 'blocked':
    case 'unavailable':
      return 'critical';
    case 'noData':
    default:
      return 'neutral';
  }
}

export function resolveIssueTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'critical':
    case 'error':
      return 'critical';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
}

export function resolveSeverityLabel(value: string): string {
  switch (value) {
    case 'critical':
      return 'Krytyczne';
    case 'warning':
      return 'Ostrzeżenie';
    case 'info':
    default:
      return 'Informacja';
  }
}

export function resolveImpactLabel(value: string): string {
  switch (value) {
    case 'high':
      return 'Wysoki';
    case 'medium':
      return 'Średni';
    case 'low':
      return 'Niski';
    default:
      return value;
  }
}

export function resolveImpactTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    case 'low':
    default:
      return 'info';
  }
}

export function resolveDecisionStatusLabel(value: string): string {
  switch (value) {
    case 'proposed':
      return 'Propozycja';
    case 'approved':
      return 'Zatwierdzona';
    case 'rejected':
      return 'Odrzucona';
    case 'executing':
      return 'W realizacji';
    case 'measured':
      return 'Zmierzona';
    default:
      return value;
  }
}

export function resolveDecisionTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'approved':
    case 'measured':
      return 'success';
    case 'rejected':
      return 'critical';
    case 'executing':
    case 'proposed':
    default:
      return 'warning';
  }
}

export function mapQueueDecisionStatus(
  value: 'new' | 'review' | 'approved' | 'rejected' | 'measured',
): 'proposed' | 'approved' | 'rejected' | 'executing' | 'measured' {
  switch (value) {
    case 'approved':
    case 'rejected':
    case 'measured':
      return value;
    case 'review':
      return 'executing';
    case 'new':
    default:
      return 'proposed';
  }
}

export function resolveBudgetPacingLabel(value: string): string {
  switch (value) {
    case 'underPace':
      return 'Poniżej tempa';
    case 'onPace':
      return 'W tempie';
    case 'overPace':
      return 'Powyżej tempa';
    case 'risk':
      return 'Ryzyko';
    default:
      return value;
  }
}

export function resolveBudgetPacingTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'onPace':
      return 'success';
    case 'risk':
      return 'critical';
    case 'underPace':
    case 'overPace':
    default:
      return 'warning';
  }
}

export function resolveSyncStatusLabel(value: string): string {
  switch (value) {
    case 'queued':
      return 'W kolejce';
    case 'running':
      return 'W toku';
    case 'partial':
      return 'Częściowo';
    case 'completed':
      return 'Zakończone';
    case 'failed':
      return 'Błąd';
    default:
      return value;
  }
}

export function resolveSyncStatusTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'critical';
    case 'partial':
    case 'running':
    case 'queued':
    default:
      return 'warning';
  }
}

export function resolvePairingStepLabel(value: string): string {
  switch (value) {
    case 'notStarted':
      return 'Nie rozpoczęto';
    case 'active':
      return 'Aktywny';
    case 'waitingForProvider':
      return 'Czeka na providera';
    case 'verified':
      return 'Zweryfikowany';
    case 'failed':
      return 'Błąd';
    case 'expired':
      return 'Wygasł';
    default:
      return value;
  }
}

export function resolvePairingStepTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'verified':
      return 'success';
    case 'failed':
    case 'expired':
      return 'critical';
    case 'active':
    case 'waitingForProvider':
      return 'warning';
    case 'notStarted':
    default:
      return 'neutral';
  }
}

export function resolveDevicePairingLabel(value: string): string {
  switch (value) {
    case 'unpaired':
      return 'Niepołączone';
    case 'pending':
      return 'Oczekuje';
    case 'paired':
      return 'Połączone';
    case 'revoked':
      return 'Odwołane';
    default:
      return value;
  }
}

export function resolveBudgetPacingProgressTone(
  value: string,
): 'critical' | 'neutral' | 'success' | 'warning' {
  switch (value) {
    case 'onPace':
      return 'success';
    case 'risk':
      return 'critical';
    case 'underPace':
    case 'overPace':
    default:
      return 'warning';
  }
}

export function resolvePaceLabel(value: string): string {
  switch (value) {
    case 'behind':
      return 'Poniżej planu';
    case 'onTrack':
      return 'Zgodnie z planem';
    case 'ahead':
      return 'Powyżej planu';
    default:
      return value;
  }
}

export function resolvePaceTone(value: string): StatusBadgeTone {
  switch (value) {
    case 'ahead':
    case 'onTrack':
      return 'success';
    case 'behind':
    default:
      return 'warning';
  }
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatSignedNumber(value: number): string {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    currency: 'PLN',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

export function formatPercent(value: number): string {
  const normalized = Math.abs(value) <= 1
    ? value
    : value / 100;

  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(normalized);
}

export function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatUnitValue(value: number, unit: string): string {
  if (unit === 'PLN') {
    return formatCurrency(value);
  }

  return `${formatSignedNumber(value)} ${unit}`;
}

export type DomainIconName = PapaDataIconName;
