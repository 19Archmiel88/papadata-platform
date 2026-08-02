import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';

import type {
  FilterBarFilter,
} from '../FilterBar';
import type {
  SegmentedControlItem,
} from '../SegmentedControl';
import type {
  SortControlOption,
} from '../SortControl';

export const searchPlaceholder =
  'Wyszukaj źródło, właściciela lub identyfikator procesu';

export const searchExamples = {
  empty: '',
  populated: 'sync',
} as const;

export const filterBarFilters: readonly FilterBarFilter[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    value: 'Wymaga uwagi',
  },
  {
    id: 'owner',
    label: 'Właściciel',
    type: 'select',
    value: 'Operacje danych',
  },
  {
    id: 'period',
    label: 'Zakres dat',
    type: 'date',
    value: 'Ostatnie 7 dni',
  },
] as const;

export const viewSegments: readonly SegmentedControlItem[] = [
  {
    value: 'all',
    label: 'Wszystkie',
    count: 24,
  },
  {
    value: 'processing',
    label: 'W toku',
    count: 7,
    icon: 'trend',
  },
  {
    value: 'attention',
    label: 'Wymaga uwagi',
    count: 4,
    icon: 'warning',
  },
  {
    value: 'stable',
    label: 'Stabilne',
    count: 13,
    icon: 'success',
  },
  {
    value: 'archived',
    label: 'Archiwum',
    disabled: true,
  },
] as const;

export const sortOptions: readonly SortControlOption[] = [
  {
    id: 'updatedAt',
    label: 'Ostatnia synchronizacja',
  },
  {
    id: 'source',
    label: 'Nazwa źródła',
  },
  {
    id: 'owner',
    label: 'Właściciel procesu',
  },
  {
    id: 'incidents',
    label: 'Liczba incydentów',
  },
] as const;

export const statusFilterOptions = [
  {
    value: 'all',
    label: 'Wszystkie statusy',
  },
  {
    value: 'stable',
    label: 'Stabilne',
  },
  {
    value: 'processing',
    label: 'W toku',
  },
  {
    value: 'attention',
    label: 'Wymaga uwagi',
  },
] as const;

export const ownerFilterOptions = [
  {
    value: 'all',
    label: 'Wszyscy właściciele',
  },
  {
    value: 'operations',
    label: 'Operacje danych',
  },
  {
    value: 'revenue',
    label: 'Revenue Intelligence',
  },
  {
    value: 'support',
    label: 'Wsparcie wdrożeń',
  },
] as const;

export const integrationColumns: readonly DataColumn[] = [
  {
    id: 'source',
    label: 'Źródło',
    sortable: true,
    width: 220,
  },
  {
    id: 'type',
    label: 'Typ integracji',
    width: 160,
  },
  {
    id: 'status',
    label: 'Status',
    width: 160,
  },
  {
    id: 'owner',
    label: 'Właściciel procesu',
    sortable: true,
    width: 180,
  },
  {
    align: 'right',
    id: 'incidents',
    label: 'Incydenty',
    sortable: true,
    width: 120,
  },
  {
    id: 'updatedAt',
    label: 'Ostatnia synchronizacja',
    sortable: true,
    width: 180,
  },
] as const;

export const integrationRows: readonly DataRow[] = [
  {
    id: 'sync-2048',
    incidents: 0,
    owner: 'Operacje danych',
    source: 'Shopify Commerce PL',
    status: 'Stabilne',
    type: 'Commerce',
    updatedAt: '30 lipca 2026, 09:14',
  },
  {
    id: 'sync-2051',
    incidents: 2,
    owner: 'Operacje danych',
    source: 'ERP magazyn centralny',
    status: 'Wymaga uwagi',
    type: 'Backoffice',
    updatedAt: '30 lipca 2026, 09:02',
  },
  {
    id: 'sync-2053',
    incidents: 1,
    owner: 'Revenue Intelligence',
    source: 'Meta Ads EMEA',
    status: 'W toku',
    type: 'Reklamy',
    updatedAt: '30 lipca 2026, 08:56',
  },
  {
    id: 'sync-2057',
    incidents: 0,
    owner: 'Wsparcie wdrożeń',
    source: 'Google Analytics 4',
    status: 'Stabilne',
    type: 'Analityka',
    updatedAt: '30 lipca 2026, 08:41',
  },
] as const;

export const integrationStatusTone = {
  Stabilne: 'success',
  'W toku': 'neutral',
  'Wymaga uwagi': 'warning',
} as const;
