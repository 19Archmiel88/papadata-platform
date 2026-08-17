import type {
  CommandCenterRecord,
  ReadinessStatus,
} from '../../../../../contracts/api-schemas';
import type {
  ReadinessState,
} from '../../../../../contracts/ui-contract-types';
import type {
  AnalyticsDataState,
} from '../../design-system';
import {
  defaultWorkspaceContext,
} from './businessData';

export function resolveDataStateLabel(
  state: AnalyticsDataState,
): string {
  switch (state) {
    case 'ready':
      return 'Gotowe';
    case 'loading':
      return 'Ładowanie';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'error':
      return 'Błąd źródła';
    case 'noData':
      return 'Brak danych';
    default:
      return state;
  }
}

export function resolveDataStateTone(
  state: AnalyticsDataState,
): 'critical' | 'neutral' | 'success' | 'warning' {
  switch (state) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
    case 'loading':
      return 'warning';
    case 'error':
      return 'critical';
    case 'noData':
    default:
      return 'neutral';
  }
}

export function resolveReadinessState(
  state: AnalyticsDataState,
): ReadinessState {
  switch (state) {
    case 'ready':
      return 'ready';
    case 'loading':
      return 'processing';
    case 'partial':
      return 'partial';
    case 'stale':
      return 'stale';
    case 'error':
      return 'sourceError';
    case 'noData':
      return 'noData';
    default:
      return 'partial';
  }
}

export function mapReadinessToAnalyticsState(
  readiness: ReadinessStatus,
): AnalyticsDataState {
  switch (readiness) {
    case 'ready':
      return 'ready';
    case 'partial':
      return 'partial';
    case 'stale':
      return 'stale';
    case 'unavailable':
      return 'error';
    default:
      return 'partial';
  }
}

export function resolveReadinessLabel(
  readiness: ReadinessStatus,
): string {
  switch (readiness) {
    case 'ready':
      return 'Gotowe';
    case 'partial':
      return 'Częściowe';
    case 'stale':
      return 'Nieświeże';
    case 'unavailable':
      return 'Niedostępne';
    default:
      return readiness;
  }
}

export function resolveReadinessTone(
  readiness: ReadinessStatus,
): 'critical' | 'neutral' | 'success' | 'warning' {
  switch (readiness) {
    case 'ready':
      return 'success';
    case 'partial':
    case 'stale':
      return 'warning';
    case 'unavailable':
      return 'critical';
    default:
      return 'neutral';
  }
}

export function resolveImpactLabel(
  impact: 'high' | 'low' | 'medium',
): string {
  switch (impact) {
    case 'high':
      return 'Wysoki';
    case 'medium':
      return 'Średni';
    case 'low':
      return 'Niski';
    default:
      return impact;
  }
}

export function resolveUnitLabel(
  unit: CommandCenterRecord['unit'] | undefined,
): string | null {
  switch (unit) {
    case 'currency':
      return 'PLN';
    case 'percent':
      return '%';
    case 'duration':
      return 's';
    case 'ratio':
    case 'number':
      return null;
    default:
      return null;
  }
}

export function formatMetricValue(
  value: number,
  unit: CommandCenterRecord['unit'],
): string {
  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('pl-PL', {
        currency: 'PLN',
        maximumFractionDigits: 0,
        style: 'currency',
      }).format(value);
    case 'percent':
      return new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 1,
        style: 'percent',
      }).format(value);
    case 'duration':
      return `${new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 1,
      }).format(value)} s`;
    case 'ratio':
    case 'number':
    default:
      return new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 2,
      }).format(value);
  }
}

export function formatSignedPercent(
  value: number,
): string {
  const formatted = new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    signDisplay: 'always',
    style: 'percent',
  }).format(value);

  return formatted;
}

export function formatPercent(
  value: number,
): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(value);
}

export function formatInteger(
  value: number,
): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: defaultWorkspaceContext.range?.timezone ?? 'UTC',
  }).format(date);
}

export function slugify(
  value: string,
): string {
  return value
    .toLocaleLowerCase('pl-PL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');
}
