import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';

import {
  StatusBadge,
} from '../StatusBadge';

export const dataTableColumns: readonly DataColumn[] = [
  {
    id: 'source',
    label: 'Źródło danych',
    sortable: true,
    width: 220,
  },
  {
    id: 'type',
    label: 'Typ',
    width: 130,
  },
  {
    id: 'status',
    label: 'Status',
    width: 150,
  },
  {
    align: 'right',
    id: 'records',
    label: 'Liczba rekordów',
    sortable: true,
    width: 140,
  },
  {
    id: 'updatedAt',
    label: 'Ostatnia synchronizacja',
    sortable: true,
    width: 180,
  },
] as const;

export const dataTableRows: readonly DataRow[] = [
  {
    id: 'shopify-pl',
    records: 145203,
    source: 'Shopify PL',
    status: 'Stabilne',
    type: 'Integracja',
    updatedAt: '30 lipca 2026, 09:14',
  },
  {
    id: 'ga4-web',
    records: 982311,
    source: 'GA4 Web',
    status: 'Przetwarzanie',
    type: 'Analityka',
    updatedAt: '30 lipca 2026, 09:02',
  },
  {
    id: 'erp-magazyn',
    records: 42598,
    source: 'ERP magazyn',
    status: 'Do sprawdzenia',
    type: 'Backoffice',
    updatedAt: '30 lipca 2026, 08:41',
  },
  {
    id: 'billing-hub',
    records: 1287,
    source: 'Billing Hub',
    status: 'Błąd synchronizacji',
    type: 'Rozliczenia',
    updatedAt: '30 lipca 2026, 08:17',
  },
] as const;

export const dataTableStatusTone = {
  'Błąd synchronizacji': 'danger',
  'Do sprawdzenia': 'warning',
  Stabilne: 'success',
  Przetwarzanie: 'neutral',
} as const;

export const wideTableColumns = [
  ...dataTableColumns,
  {
    id: 'owner',
    label: 'Właściciel obszaru',
    width: 220,
  },
  {
    align: 'right' as const,
    id: 'latency',
    label: 'Opóźnienie',
    width: 120,
  },
  {
    id: 'notes',
    label: 'Uwagi operacyjne',
    width: 360,
  },
] as const;

export const wideTableRows = dataTableRows.map((row, index) => ({
  ...row,
  latency: [
    '4 min',
    '11 min',
    '26 min',
    '43 min',
  ][index],
  notes: [
    'Kanał główny dla sprzedaży D2C. Dane są kompletne i zsynchronizowane z ostatnim zamknięciem doby.',
    'Import działa poprawnie, ale widoczny jest zwiększony czas agregacji po nocnym eksporcie zdarzeń.',
    'Źródło wymaga przeglądu mapowania pól magazynowych przed następnym oknem synchronizacji.',
    'Błąd po stronie rozliczeń blokuje odświeżenie faktur i wymaga ponownego uwierzytelnienia konektora.',
  ][index],
  owner: [
    'Zespół commerce',
    'Zespół analityki ruchu',
    'Zespół operacji danych',
    'Zespół finansów',
  ][index],
}));

export const dataListItems = [
  {
    action: 'Pokaż szczegóły',
    description:
      'Kanał synchronizacji gotowy do kolejnego przeliczenia i bez aktywnych ostrzeżeń jakości.',
    icon: 'integration' as const,
    id: 'sync-01',
    meta: [
      'JOB-2048',
      '30 lipca 2026, 09:14',
      'Workspace: Commerce',
    ],
    status: {
      status: 'Status',
      text: 'Stabilne',
      tone: 'success' as const,
    },
    title: 'Synchronizacja katalogu Shopify PL',
  },
  {
    action: 'Otwórz raport',
    description:
      'Proces agregacji zdarzeń webowych nadal trwa, ale mieści się w założonym oknie czasowym.',
    icon: 'data' as const,
    id: 'sync-02',
    meta: [
      'RUN-8821',
      '30 lipca 2026, 09:02',
      'Źródło: GA4 Web',
    ],
    status: {
      status: 'Status',
      text: 'Przetwarzanie',
      tone: 'processing' as const,
    },
    title: 'Agregacja ruchu i lejka',
  },
  {
    action: 'Sprawdź mapowanie',
    description:
      'Pole magazynowe wymaga ręcznego potwierdzenia po zmianie schematu w ERP.',
    icon: 'warning' as const,
    id: 'sync-03',
    meta: [
      'SYNC-409',
      '30 lipca 2026, 08:41',
      'Źródło: ERP magazyn',
    ],
    status: {
      status: 'Status',
      text: 'Do sprawdzenia',
      tone: 'warning' as const,
    },
    title: 'Mapowanie stanów magazynowych',
  },
] as const;

export const keyValueGroups = [
  {
    id: 'workspace',
    items: [
      {
        id: 'workspace-name',
        label: 'Obszar roboczy',
        value: 'Commerce PL',
      },
      {
        id: 'workspace-status',
        label: 'Status gotowości',
        value: (
          <StatusBadge
            status="Status"
            text="Stabilne"
            tone="success"
          />
        ),
      },
      {
        id: 'workspace-owner',
        label: 'Właściciel',
        value: 'Zespół operacji danych',
      },
    ],
    title: 'Kontekst obszaru',
  },
  {
    id: 'quality',
    items: [
      {
        id: 'quality-updated',
        label: 'Ostatnia kontrola',
        value: '30 lipca 2026, 08:55',
      },
      {
        id: 'quality-latency',
        label: 'Opóźnienie przetwarzania',
        value: '11 minut',
      },
      {
        id: 'quality-note',
        label: 'Uwagi',
        value:
          'Długi opis pozostaje czytelny także przy węższym układzie i może bezpiecznie zawijać się do kolejnych linii bez łamania rytmu panelu szczegółów.',
      },
    ],
    title: 'Jakość i operacje',
  },
] as const;
