import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useMemo,
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  Checkbox,
  DataTable,
  FilterBar,
  SearchField,
  SegmentedControl,
  Select,
  SortControl,
  StatusBadge,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';
import {
  Localized,
  copy,
} from './cross-cutting-story-helpers';

const rowAction = fn();
const bulkExportAction = fn();
const exportAllAction = fn();

type ChannelFilter =
  | 'all'
  | 'meta'
  | 'google'
  | 'tiktok'
  | 'email';

type StatusFilter =
  | 'all'
  | 'opportunity'
  | 'stable'
  | 'watch'
  | 'risk';

type RangeFilter =
  | '7d'
  | '30d'
  | '90d';

type DataMode =
  | 'ready'
  | 'loading'
  | 'error';

type SortId =
  | 'campaign'
  | 'revenue'
  | 'change'
  | 'cost'
  | 'roas'
  | 'cvr'
  | 'orders'
  | 'margin'
  | 'status';

type ColumnId =
  | SortId
  | 'trend';

type CampaignRecord = {
  readonly campaign: string;
  readonly channel: Exclude<ChannelFilter, 'all'>;
  readonly channelLabel: string;
  readonly cost: number;
  readonly cvr: number;
  readonly id: string;
  readonly margin: number;
  readonly nextStep: string;
  readonly note: string;
  readonly orders: number;
  readonly owner: string;
  readonly rangeIds: readonly RangeFilter[];
  readonly revenue: number;
  readonly revenueChange: number;
  readonly roas: number;
  readonly status: string;
  readonly statusId: Exclude<StatusFilter, 'all'>;
  readonly trend: readonly number[];
};

const pageSize = 6;

const columnOrder: readonly ColumnId[] = [
  'campaign',
  'revenue',
  'change',
  'cost',
  'roas',
  'cvr',
  'orders',
  'margin',
  'trend',
  'status',
];

const fixedColumnIds: readonly ColumnId[] = [
  'campaign',
  'status',
];

const optionalColumnIds: readonly ColumnId[] = [
  'revenue',
  'change',
  'cost',
  'roas',
  'cvr',
  'orders',
  'margin',
  'trend',
];

const sortColumnIds: readonly SortId[] = [
  'campaign',
  'revenue',
  'change',
  'cost',
  'roas',
  'cvr',
  'orders',
  'margin',
  'status',
];

const initialVisibleColumnIds: readonly ColumnId[] = [
  'campaign',
  'revenue',
  'change',
  'cost',
  'roas',
  'orders',
  'status',
];

const columnCatalog: Record<ColumnId, DataColumn> = {
  campaign: {
    id: 'campaign',
    label: 'Kampania',
    sortable: true,
    width: 250,
  },
  revenue: {
    align: 'right',
    id: 'revenue',
    label: 'Przychód',
    sortable: true,
    width: 150,
  },
  change: {
    align: 'right',
    id: 'change',
    label: 'Zmiana',
    sortable: true,
    width: 118,
  },
  cost: {
    align: 'right',
    id: 'cost',
    label: 'Koszt',
    sortable: true,
    width: 142,
  },
  roas: {
    align: 'right',
    id: 'roas',
    label: 'ROAS',
    sortable: true,
    width: 104,
  },
  cvr: {
    align: 'right',
    id: 'cvr',
    label: 'CVR',
    sortable: true,
    width: 100,
  },
  orders: {
    align: 'right',
    id: 'orders',
    label: 'Zamówienia',
    sortable: true,
    width: 126,
  },
  margin: {
    align: 'right',
    id: 'margin',
    label: 'Marża',
    sortable: true,
    width: 132,
  },
  trend: {
    align: 'center',
    id: 'trend',
    label: 'Trend',
    sortable: false,
    width: 126,
  },
  status: {
    align: 'center',
    id: 'status',
    label: 'Sygnał',
    sortable: true,
    width: 180,
  },
};

const campaignRows: readonly CampaignRecord[] = [
  {
    campaign: 'Brand Search',
    channel: 'google',
    channelLabel: 'Google Ads',
    cost: 14200,
    cvr: 4.7,
    id: 'brand-search',
    margin: 38.4,
    nextStep: 'Zwiększ limit budżetu o 10–15% i obserwuj utrzymanie ROAS.',
    note: 'Najmocniejszy wzrost przy zachowaniu kosztu pozyskania poniżej celu.',
    orders: 812,
    owner: 'Performance',
    rangeIds: ['7d', '30d', '90d'],
    revenue: 82430,
    revenueChange: 21.4,
    roas: 5.81,
    status: 'Szansa',
    statusId: 'opportunity',
    trend: [46, 49, 52, 55, 61, 64, 69, 76],
  },
  {
    campaign: 'Meta Prospecting',
    channel: 'meta',
    channelLabel: 'Meta Ads',
    cost: 18900,
    cvr: 3.2,
    id: 'meta-prospecting',
    margin: 31.2,
    nextStep: 'Przenieś część budżetu do zestawów z najwyższą marżą.',
    note: 'Przychód rośnie szybciej niż koszt, ale efektywność kreacji jest nierówna.',
    orders: 624,
    owner: 'Growth',
    rangeIds: ['7d', '30d', '90d'],
    revenue: 64120,
    revenueChange: 8.2,
    roas: 3.39,
    status: 'Szansa',
    statusId: 'opportunity',
    trend: [50, 52, 49, 55, 58, 59, 63, 66],
  },
  {
    campaign: 'Shopping / Core',
    channel: 'google',
    channelLabel: 'Google Ads',
    cost: 27600,
    cvr: 4.1,
    id: 'shopping-core',
    margin: 29.7,
    nextStep: 'Utrzymaj budżet i zweryfikuj produkty o najniższej marży.',
    note: 'Duży wolumen i stabilna rentowność bez istotnej zmiany jakości ruchu.',
    orders: 934,
    owner: 'Commerce',
    rangeIds: ['7d', '30d', '90d'],
    revenue: 97840,
    revenueChange: 2.7,
    roas: 3.54,
    status: 'Stabilnie',
    statusId: 'stable',
    trend: [61, 63, 62, 64, 64, 65, 65, 66],
  },
  {
    campaign: 'Meta Retargeting',
    channel: 'meta',
    channelLabel: 'Meta Ads',
    cost: 9800,
    cvr: 2.8,
    id: 'meta-retargeting',
    margin: 27.5,
    nextStep: 'Ogranicz częstotliwość i odśwież grupę kreacji remarketingowych.',
    note: 'Spadek przychodu przy rosnącej częstotliwości kontaktu z tym samym segmentem.',
    orders: 318,
    owner: 'Lifecycle',
    rangeIds: ['7d', '30d', '90d'],
    revenue: 31840,
    revenueChange: -12.6,
    roas: 3.25,
    status: 'Obserwuj',
    statusId: 'watch',
    trend: [70, 68, 66, 64, 60, 59, 57, 54],
  },
  {
    campaign: 'TikTok Acquisition',
    channel: 'tiktok',
    channelLabel: 'TikTok Ads',
    cost: 11400,
    cvr: 1.9,
    id: 'tiktok-acquisition',
    margin: 18.2,
    nextStep: 'Wstrzymaj najsłabsze zestawy i przebuduj landing page dla mobile.',
    note: 'Koszt utrzymuje się wysoko przy jednoczesnym spadku CVR i ROAS.',
    orders: 196,
    owner: 'Growth',
    rangeIds: ['7d', '30d', '90d'],
    revenue: 18260,
    revenueChange: -23.1,
    roas: 1.6,
    status: 'Ryzyko',
    statusId: 'risk',
    trend: [66, 62, 58, 54, 49, 44, 41, 36],
  },
  {
    campaign: 'Newsletter / Returning',
    channel: 'email',
    channelLabel: 'Email',
    cost: 2180,
    cvr: 6.8,
    id: 'newsletter-returning',
    margin: 44.1,
    nextStep: 'Rozszerz segment podobnych klientów przy zachowaniu obecnego frequency cap.',
    note: 'Najwyższa marża i CVR w zestawie, przy ograniczonej skali wolumenu.',
    orders: 426,
    owner: 'Lifecycle',
    rangeIds: ['7d', '30d', '90d'],
    revenue: 28640,
    revenueChange: 16.8,
    roas: 13.14,
    status: 'Szansa',
    statusId: 'opportunity',
    trend: [41, 44, 47, 52, 55, 61, 64, 69],
  },
  {
    campaign: 'Performance Max',
    channel: 'google',
    channelLabel: 'Google Ads',
    cost: 31800,
    cvr: 3.6,
    id: 'performance-max',
    margin: 25.9,
    nextStep: 'Rozdziel raportowanie brand / non-brand przed kolejną zmianą budżetu.',
    note: 'Skala jest wysoka, ale miks brandowy utrudnia ocenę inkrementalnego wpływu.',
    orders: 1028,
    owner: 'Performance',
    rangeIds: ['30d', '90d'],
    revenue: 108700,
    revenueChange: 4.1,
    roas: 3.42,
    status: 'Obserwuj',
    statusId: 'watch',
    trend: [58, 59, 61, 60, 63, 65, 64, 66],
  },
  {
    campaign: 'Meta Advantage+',
    channel: 'meta',
    channelLabel: 'Meta Ads',
    cost: 24300,
    cvr: 3.9,
    id: 'meta-advantage',
    margin: 34.6,
    nextStep: 'Skaluj budżet etapami i utrzymaj kontrolę marży na poziomie SKU.',
    note: 'Wyraźny wzrost sprzedaży przy dobrym ROAS i stabilnej konwersji.',
    orders: 846,
    owner: 'Growth',
    rangeIds: ['30d', '90d'],
    revenue: 93210,
    revenueChange: 18.7,
    roas: 3.84,
    status: 'Szansa',
    statusId: 'opportunity',
    trend: [47, 51, 54, 57, 62, 67, 72, 78],
  },
  {
    campaign: 'TikTok Retargeting',
    channel: 'tiktok',
    channelLabel: 'TikTok Ads',
    cost: 6700,
    cvr: 2.4,
    id: 'tiktok-retargeting',
    margin: 22.8,
    nextStep: 'Zweryfikuj overlap odbiorców z Meta i ogranicz powtarzalność.',
    note: 'Wynik blisko progu akceptacji, ale trend ROAS pogarsza się trzeci okres z rzędu.',
    orders: 214,
    owner: 'Performance',
    rangeIds: ['30d', '90d'],
    revenue: 16790,
    revenueChange: -8.4,
    roas: 2.51,
    status: 'Obserwuj',
    statusId: 'watch',
    trend: [63, 61, 60, 59, 57, 56, 53, 51],
  },
  {
    campaign: 'CRM Reactivation',
    channel: 'email',
    channelLabel: 'Email',
    cost: 1640,
    cvr: 5.4,
    id: 'crm-reactivation',
    margin: 41.7,
    nextStep: 'Rozszerz kampanię na kolejny segment klientów nieaktywnych 90–180 dni.',
    note: 'Niski koszt reaktywacji przy ponadprzeciętnej marży i rosnącym wolumenie.',
    orders: 302,
    owner: 'CRM',
    rangeIds: ['30d', '90d'],
    revenue: 21480,
    revenueChange: 12.3,
    roas: 13.1,
    status: 'Szansa',
    statusId: 'opportunity',
    trend: [42, 45, 48, 49, 54, 58, 62, 66],
  },
  {
    campaign: 'Generic Search',
    channel: 'google',
    channelLabel: 'Google Ads',
    cost: 22100,
    cvr: 2.6,
    id: 'generic-search',
    margin: 19.8,
    nextStep: 'Obniż stawki dla zapytań o niskiej intencji i popraw listę wykluczeń.',
    note: 'Koszt rośnie szybciej niż przychód; marża zbliża się do minimalnego progu.',
    orders: 488,
    owner: 'Performance',
    rangeIds: ['90d'],
    revenue: 49380,
    revenueChange: -14.2,
    roas: 2.23,
    status: 'Ryzyko',
    statusId: 'risk',
    trend: [71, 68, 65, 61, 58, 53, 49, 45],
  },
  {
    campaign: 'Winback Automation',
    channel: 'email',
    channelLabel: 'Email',
    cost: 1280,
    cvr: 4.9,
    id: 'winback-automation',
    margin: 39.3,
    nextStep: 'Utrzymaj automat i przetestuj drugie okno kontaktu po 14 dniach.',
    note: 'Stabilny kanał odzyskiwania klientów z wysoką rentownością.',
    orders: 224,
    owner: 'Lifecycle',
    rangeIds: ['90d'],
    revenue: 14840,
    revenueChange: 1.6,
    roas: 11.59,
    status: 'Stabilnie',
    statusId: 'stable',
    trend: [55, 54, 55, 56, 55, 56, 57, 57],
  },
];

const channelLabels: Record<ChannelFilter, string> = {
  all: 'Wszystkie kanały',
  email: 'Email',
  google: 'Google Ads',
  meta: 'Meta Ads',
  tiktok: 'TikTok Ads',
};

const statusLabels: Record<StatusFilter, string> = {
  all: 'Wszystkie sygnały',
  opportunity: 'Szansa',
  risk: 'Ryzyko',
  stable: 'Stabilnie',
  watch: 'Obserwuj',
};

const rangeLabels: Record<RangeFilter, string> = {
  '7d': 'Ostatnie 7 dni',
  '30d': 'Ostatnie 30 dni',
  '90d': 'Ostatnie 90 dni',
};

const dataModeLabels: Record<DataMode, string> = {
  error: 'Błąd odświeżenia',
  loading: 'Ładowanie danych',
  ready: 'Dane gotowe',
};

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    'pl-PL',
    {
      currency: 'PLN',
      maximumFractionDigits: 0,
      style: 'currency',
    },
  ).format(value);
}

function formatInteger(
  value: number,
) {
  return new Intl.NumberFormat(
    'pl-PL',
  ).format(value);
}

function formatPercentage(
  value: number,
) {
  return `${new Intl.NumberFormat(
    'pl-PL',
    {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    },
  ).format(value)}%`;
}

function formatSignedPercentage(
  value: number,
) {
  const formatted =
    formatPercentage(Math.abs(value));

  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `−${formatted}`;
  }

  return formatted;
}

function formatRoas(
  value: number,
) {
  return new Intl.NumberFormat(
    'pl-PL',
    {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    },
  ).format(value);
}

function formatResultCount(
  count: number,
) {
  if (count === 1) {
    return '1 kampania';
  }

  if (
    count > 1
    && count < 5
  ) {
    return `${count} kampanie`;
  }

  return `${count} kampanii`;
}

function formatSelectedCount(
  count: number,
) {
  if (count === 1) {
    return '1 zaznaczenie';
  }

  if (
    count > 1
    && count < 5
  ) {
    return `${count} zaznaczenia`;
  }

  return `${count} zaznaczeń`;
}

function formatPageRange(
  start: number,
  end: number,
  total: number,
) {
  if (total === 0) {
    return '0 z 0';
  }

  return `${start}–${end} z ${total}`;
}

function resolveDataModeTone(
  dataMode: DataMode,
) {
  switch (dataMode) {
    case 'error':
      return 'critical';
    case 'loading':
      return 'info';
    case 'ready':
    default:
      return 'success';
  }
}

function resolveSortValue(
  row: CampaignRecord,
  sortId: SortId,
) {
  switch (sortId) {
    case 'revenue':
      return row.revenue;
    case 'change':
      return row.revenueChange;
    case 'cost':
      return row.cost;
    case 'roas':
      return row.roas;
    case 'cvr':
      return row.cvr;
    case 'orders':
      return row.orders;
    case 'margin':
      return row.margin;
    case 'status':
      return row.status;
    case 'campaign':
    default:
      return row.campaign;
  }
}

function sortRows(
  inputRows: readonly CampaignRecord[],
  sortId: SortId,
  direction: 'asc' | 'desc',
) {
  const sorted = [...inputRows].sort(
    (left, right) => {
      const leftValue =
        resolveSortValue(left, sortId);
      const rightValue =
        resolveSortValue(right, sortId);

      if (
        typeof leftValue === 'number'
        && typeof rightValue === 'number'
      ) {
        return leftValue - rightValue;
      }

      return String(leftValue).localeCompare(
        String(rightValue),
        'pl',
        {
          numeric: true,
        },
      );
    },
  );

  return direction === 'asc'
    ? sorted
    : sorted.reverse();
}

function toDataRow(
  row: CampaignRecord,
): DataRow {
  return {
    campaign: row.campaign,
    change:
      formatSignedPercentage(
        row.revenueChange,
      ),
    channel: row.channelLabel,
    cost: formatCurrency(row.cost),
    cvr: formatPercentage(row.cvr),
    id: row.id,
    margin: formatPercentage(row.margin),
    orders: formatInteger(row.orders),
    owner: row.owner,
    revenue: formatCurrency(row.revenue),
    roas: formatRoas(row.roas),
    status: row.status,
    trend: '',
  };
}

function resolveDeltaTone(
  value: number,
) {
  if (value > 0.2) {
    return 'positive';
  }

  if (value < -0.2) {
    return 'negative';
  }

  return 'neutral';
}

function MiniTrend({
  points,
}: {
  readonly points: readonly number[];
}) {
  const width = 96;
  const height = 30;
  const padding = 2;

  const minimum = Math.min(...points);
  const maximum = Math.max(...points);
  const range = Math.max(
    1,
    maximum - minimum,
  );

  const coordinates = points.map(
    (point, index) => {
      const x =
        padding
        + (
          index
          / Math.max(
            1,
            points.length - 1,
          )
        ) * (
          width
          - padding * 2
        );

      const y =
        height
        - padding
        - (
          (
            point - minimum
          ) / range
        ) * (
          height
          - padding * 2
        );

      return `${x},${y}`;
    },
  );

  const first = points[0] ?? 0;
  const last =
    points[points.length - 1]
    ?? first;

  const change =
    first === 0
      ? 0
      : (
        (
          last - first
        ) / Math.abs(first)
      ) * 100;

  return (
    <span
      className="pd-x18-analytics-trend"
      data-tone={resolveDeltaTone(change)}
    >
      <svg
        aria-label={`Trend ${formatSignedPercentage(change)}`}
        className="pd-x18-analytics-trend__svg"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline
          fill="none"
          points={coordinates.join(' ')}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

function FilteredTablePattern() {
  const [query, setQuery] = useState('');
  const [channelFilter, setChannelFilter] =
    useState<ChannelFilter>('all');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');
  const [rangeFilter, setRangeFilter] =
    useState<RangeFilter>('30d');
  const [dataMode, setDataMode] =
    useState<DataMode>('ready');
  const [sortId, setSortId] =
    useState<SortId>('revenue');
  const [sortDirection, setSortDirection] =
    useState<'asc' | 'desc'>('desc');
  const [density, setDensity] =
    useState<'comfortable' | 'compact'>(
      'comfortable',
    );
  const [
    visibleColumnIds,
    setVisibleColumnIds,
  ] = useState<readonly ColumnId[]>(
    initialVisibleColumnIds,
  );
  const [pageIndex, setPageIndex] =
    useState(0);
  const [
    selectedRowIds,
    setSelectedRowIds,
  ] = useState<readonly string[]>([]);
  const [
    searchResetVersion,
    setSearchResetVersion,
  ] = useState(0);
  const [
    detailRecordId,
    setDetailRecordId,
  ] = useState<string | null>(null);
  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);
  const [
    actionMessage,
    setActionMessage,
  ] = useState(
    'Tabela jest gotowa do analizy.',
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery =
      query
        .trim()
        .toLocaleLowerCase('pl');

    return sortRows(
      campaignRows.filter((row) => {
        const matchesQuery =
          normalizedQuery.length === 0
          || row.campaign
            .toLocaleLowerCase('pl')
            .includes(normalizedQuery)
          || row.channelLabel
            .toLocaleLowerCase('pl')
            .includes(normalizedQuery)
          || row.owner
            .toLocaleLowerCase('pl')
            .includes(normalizedQuery);

        const matchesChannel =
          channelFilter === 'all'
          || row.channel === channelFilter;

        const matchesStatus =
          statusFilter === 'all'
          || row.statusId === statusFilter;

        const matchesRange =
          row.rangeIds.includes(
            rangeFilter,
          );

        return (
          matchesQuery
          && matchesChannel
          && matchesStatus
          && matchesRange
        );
      }),
      sortId,
      sortDirection,
    );
  }, [
    channelFilter,
    query,
    rangeFilter,
    sortDirection,
    sortId,
    statusFilter,
  ]);

  const pageCount = Math.max(
    1,
    Math.ceil(
      filteredRows.length / pageSize,
    ),
  );

  const resolvedPageIndex =
    filteredRows.length === 0
      ? 0
      : Math.min(
        pageIndex,
        pageCount - 1,
      );

  const pageStartIndex =
    resolvedPageIndex * pageSize;

  const pageRows =
    filteredRows.slice(
      pageStartIndex,
      pageStartIndex + pageSize,
    );

  const pageStart =
    filteredRows.length === 0
      ? 0
      : pageStartIndex + 1;

  const pageEnd = Math.min(
    pageStartIndex + pageSize,
    filteredRows.length,
  );

  const pageRangeLabel =
    formatPageRange(
      pageStart,
      pageEnd,
      filteredRows.length,
    );

  const visibleColumns =
    columnOrder
      .filter((columnId) =>
        visibleColumnIds.includes(
          columnId,
        ),
      )
      .map((columnId) => ({
        ...columnCatalog[columnId],
        sortable: false,
      }));

  const sortOptions =
    sortColumnIds
      .filter((columnId) =>
        visibleColumnIds.includes(
          columnId,
        ),
      )
      .map((columnId) => ({
        id: columnId,
        label: columnCatalog[columnId].label,
      }));

  const pageDataRows =
    pageRows.map(toDataRow);

  const selectedRows =
    campaignRows.filter((row) =>
      selectedRowIds.includes(
        row.id,
      ),
    );

  const pageRowIds =
    pageRows.map((row) => row.id);

  const selectedVisibleCount =
    pageRowIds.filter((rowId) =>
      selectedRowIds.includes(rowId),
    ).length;

  const pageRowsSelected =
    pageRowIds.length > 0
    && pageRowIds.every((rowId) =>
      selectedRowIds.includes(rowId),
    );

  const somePageRowsSelected =
    selectedVisibleCount > 0
    && !pageRowsSelected;

  const detailRecord =
    detailRecordId
      ? campaignRows.find(
        (row) =>
          row.id === detailRecordId,
      ) ?? null
      : null;

  const activeFilters = [
    {
      id: 'query',
      label: 'Wyszukiwanie',
      removable: true,
      tone: 'accent' as const,
      type: 'search' as const,
      value:
        query.trim()
          ? query.trim()
          : null,
    },
    {
      id: 'channel',
      label: 'Kanał',
      removable: true,
      tone: 'neutral' as const,
      type: 'select' as const,
      value:
        channelFilter === 'all'
          ? null
          : channelLabels[
            channelFilter
          ],
    },
    {
      id: 'status',
      label: 'Sygnał',
      removable: true,
      tone: 'neutral' as const,
      type: 'select' as const,
      value:
        statusFilter === 'all'
          ? null
          : statusLabels[
            statusFilter
          ],
    },
    {
      id: 'range',
      label: 'Okres',
      removable: true,
      tone: 'neutral' as const,
      type: 'date' as const,
      value:
        rangeFilter === '30d'
          ? null
          : rangeLabels[
            rangeFilter
          ],
    },
  ];

  const activeFilterCount =
    activeFilters.filter(
      (item) =>
        item.value !== null,
    ).length;

  const totalRevenue =
    filteredRows.reduce(
      (sum, row) =>
        sum + row.revenue,
      0,
    );

  const totalCost =
    filteredRows.reduce(
      (sum, row) =>
        sum + row.cost,
      0,
    );

  const totalOrders =
    filteredRows.reduce(
      (sum, row) =>
        sum + row.orders,
      0,
    );

  const aggregateRoas =
    totalCost > 0
      ? totalRevenue / totalCost
      : 0;

  const resultCountLabel =
    formatResultCount(
      filteredRows.length,
    );

  const selectedCountLabel =
    formatSelectedCount(
      selectedRowIds.length,
    );

  const visibleColumnLabel =
    `${visibleColumns.length} z ${columnOrder.length}`;

  const hasCustomView =
    query.length > 0
    || channelFilter !== 'all'
    || statusFilter !== 'all'
    || rangeFilter !== '30d'
    || sortId !== 'revenue'
    || sortDirection !== 'desc'
    || density !== 'comfortable'
    || visibleColumnIds.length
      !== initialVisibleColumnIds.length;

  const resetPage = () => {
    setPageIndex(0);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResetVersion(
      (current) => current + 1,
    );
  };

  const handleRowSelection = (
    rowId: string,
  ) => {
    setSelectedRowIds((current) => (
      current.includes(rowId)
        ? current.filter(
          (id) => id !== rowId,
        )
        : [
            ...current,
            rowId,
          ]
    ));
  };

  const handlePageSelection = () => {
    setSelectedRowIds((current) => {
      if (pageRowsSelected) {
        return current.filter(
          (rowId) =>
            !pageRowIds.includes(
              rowId,
            ),
        );
      }

      return Array.from(
        new Set([
          ...current,
          ...pageRowIds,
        ]),
      );
    });

    setActionMessage(
      pageRowsSelected
        ? 'Usunięto zaznaczenie bieżącej strony.'
        : `Zaznaczono ${formatResultCount(pageRowIds.length)} na bieżącej stronie.`,
    );
  };

  const handleColumnToggle = (
    columnId: ColumnId,
  ) => {
    if (
      fixedColumnIds.includes(
        columnId,
      )
    ) {
      return;
    }

    setVisibleColumnIds(
      (current) => {
        if (
          current.includes(
            columnId,
          )
        ) {
          const next =
            current.filter(
              (id) =>
                id !== columnId,
            );

          if (
            sortId === columnId
          ) {
            setSortId('revenue');
            setSortDirection('desc');
          }

          setActionMessage(
            `Ukryto kolumnę ${columnCatalog[columnId].label}.`,
          );

          return next;
        }

        setActionMessage(
          `Pokazano kolumnę ${columnCatalog[columnId].label}.`,
        );

        return columnOrder.filter(
          (id) =>
            current.includes(id)
            || id === columnId,
        );
      },
    );
  };

  const resetView = () => {
    clearSearch();
    setChannelFilter('all');
    setStatusFilter('all');
    setRangeFilter('30d');
    setDataMode('ready');
    setSortId('revenue');
    setSortDirection('desc');
    setDensity('comfortable');
    setVisibleColumnIds(
      initialVisibleColumnIds,
    );
    setPageIndex(0);
    setSelectedRowIds([]);
    setDetailRecordId(null);
    setSettingsOpen(false);
    setActionMessage(
      'Przywrócono domyślny widok analityczny.',
    );
  };

  const cellRenderers = {
    campaign: (row: DataRow) => (
      <span className="pd-x18-analytics-entity">
        <span className="pd-x18-analytics-entity__name">
          {String(row.campaign)}
        </span>
        <span className="pd-x18-analytics-entity__meta">
          {String(row.channel)}
          {' · '}
          {String(row.owner)}
        </span>
      </span>
    ),
    change: (row: DataRow) => {
      const record =
        campaignRows.find(
          (item) =>
            item.id === String(row.id),
        );

      const value =
        record?.revenueChange ?? 0;

      return (
        <span
          className="pd-x18-analytics-delta"
          data-tone={
            resolveDeltaTone(value)
          }
        >
          {formatSignedPercentage(
            value,
          )}
        </span>
      );
    },
    cost: (row: DataRow) => (
      <span className="pd-x18-analytics-number">
        {String(row.cost)}
      </span>
    ),
    cvr: (row: DataRow) => (
      <span className="pd-x18-analytics-number">
        {String(row.cvr)}
      </span>
    ),
    margin: (row: DataRow) => (
      <span className="pd-x18-analytics-number">
        {String(row.margin)}
      </span>
    ),
    orders: (row: DataRow) => (
      <span className="pd-x18-analytics-number">
        {String(row.orders)}
      </span>
    ),
    revenue: (row: DataRow) => (
      <span className="pd-x18-analytics-number pd-x18-analytics-number--primary">
        {String(row.revenue)}
      </span>
    ),
    roas: (row: DataRow) => {
      const record =
        campaignRows.find(
          (item) =>
            item.id === String(row.id),
        );

      const value =
        record?.roas ?? 0;

      return (
        <span
          className="pd-x18-analytics-number"
          data-performance={
            value >= 4
              ? 'strong'
              : value < 2.5
                ? 'weak'
                : 'standard'
          }
        >
          {formatRoas(value)}
        </span>
      );
    },
    trend: (row: DataRow) => {
      const record =
        campaignRows.find(
          (item) =>
            item.id === String(row.id),
        );

      if (!record) {
        return '—';
      }

      return (
        <MiniTrend
          points={record.trend}
        />
      );
    },
  } as const;

  return (
    <div className="pd-x18-analytics-table">
      <section
        aria-labelledby="pd-x18-analytics-title"
        className="pd-x18-analytics-table__workspace"
      >
        <header className="pd-x18-analytics-header">
          <div className="pd-x18-analytics-header__copy">
            <p className="pd-x18-region__eyebrow">
              Kampanie / {rangeLabels[rangeFilter]}
            </p>

            <h3
              className="pd-x18-analytics-header__title"
              id="pd-x18-analytics-title"
            >
              Wyniki kampanii
            </h3>

            <p className="pd-x18-analytics-header__text">
              Porównuj przychód, koszt, efektywność i trend.
              Sygnały wskazują miejsca wymagające decyzji,
              bez odrywania od danych źródłowych.
            </p>
          </div>

          <dl className="pd-x18-analytics-summary">
            <div>
              <dt>Przychód</dt>
              <dd>
                {formatCurrency(
                  totalRevenue,
                )}
              </dd>
            </div>

            <div>
              <dt>Koszt</dt>
              <dd>
                {formatCurrency(
                  totalCost,
                )}
              </dd>
            </div>

            <div>
              <dt>ROAS</dt>
              <dd>
                {formatRoas(
                  aggregateRoas,
                )}
              </dd>
            </div>

            <div>
              <dt>Zamówienia</dt>
              <dd>
                {formatInteger(
                  totalOrders,
                )}
              </dd>
            </div>
          </dl>
        </header>

        <FilterBar
          activeCount={activeFilterCount}
          availableFilters={(
            <div className="pd-x18-analytics-filters">
              <Select
                className="pd-x18-analytics-filter-select"
                label="Kanał"
                options={[
                  {
                    label: 'Wszystkie kanały',
                    value: 'all',
                  },
                  {
                    label: 'Meta Ads',
                    value: 'meta',
                  },
                  {
                    label: 'Google Ads',
                    value: 'google',
                  },
                  {
                    label: 'TikTok Ads',
                    value: 'tiktok',
                  },
                  {
                    label: 'Email',
                    value: 'email',
                  },
                ]}
                placeholder={copy({ en: 'Select channel', pl: 'Wybierz kanał' })}
                value={channelFilter}
                onChange={(event) => {
                  setChannelFilter(
                    event.currentTarget
                      .value as ChannelFilter,
                  );
                  resetPage();
                }}
              />

              <Select
                className="pd-x18-analytics-filter-select"
                label="Sygnał"
                options={[
                  {
                    label: 'Wszystkie sygnały',
                    value: 'all',
                  },
                  {
                    label: 'Szansa',
                    value: 'opportunity',
                  },
                  {
                    label: 'Stabilnie',
                    value: 'stable',
                  },
                  {
                    label: 'Obserwuj',
                    value: 'watch',
                  },
                  {
                    label: 'Ryzyko',
                    value: 'risk',
                  },
                ]}
                placeholder={copy({ en: 'Select signal', pl: 'Wybierz sygnał' })}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.currentTarget
                      .value as StatusFilter,
                  );
                  resetPage();
                }}
              />

              <Select
                className="pd-x18-analytics-filter-select"
                label="Okres"
                options={[
                  {
                    label: 'Ostatnie 7 dni',
                    value: '7d',
                  },
                  {
                    label: 'Ostatnie 30 dni',
                    value: '30d',
                  },
                  {
                    label: 'Ostatnie 90 dni',
                    value: '90d',
                  },
                ]}
                placeholder={copy({ en: 'Select period', pl: 'Wybierz okres' })}
                value={rangeFilter}
                onChange={(event) => {
                  setRangeFilter(
                    event.currentTarget
                      .value as RangeFilter,
                  );
                  resetPage();
                }}
              />

              <SortControl
                ariaLabel="Sortowanie wyników kampanii"
                className="pd-x18-analytics-filter-sort"
                direction={sortDirection}
                label="Sortuj"
                options={sortOptions}
                selectedId={sortId}
                size="compact"
                onDirectionChange={(nextDirection) => {
                  setSortDirection(nextDirection);
                  resetPage();
                  setActionMessage(
                    nextDirection === 'asc'
                      ? 'Zmieniono kierunek sortowania na rosnący.'
                      : 'Zmieniono kierunek sortowania na malejący.',
                  );
                }}
                onSelectedIdChange={(nextSortId) => {
                  const resolvedSortId =
                    nextSortId as SortId;

                  setSortId(resolvedSortId);
                  resetPage();
                  setActionMessage(
                    `Sortowanie ustawiono na kolumnę ${columnCatalog[resolvedSortId].label}.`,
                  );
                }}
              />

              <div className="pd-x18-analytics-filter-actions">
                <Button
                  aria-expanded={settingsOpen}
                  size="small"
                  variant="ghost"
                  onClick={() => {
                    setSettingsOpen(
                      (current) =>
                        !current,
                    );
                  }}
                >
                  Widok tabeli
                </Button>

                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => {
                    exportAllAction();
                    setActionMessage(
                      `Eksport obejmuje ${resultCountLabel} i ${visibleColumnLabel} widocznych kolumn.`,
                    );
                  }}
                >
                  Eksportuj
                </Button>
              </div>
            </div>
          )}
          className="pd-x18-analytics-filter-bar"
          clearFiltersLabel="Wyczyść filtry"
          collapsible={false}
          compact
          emptyLabel=""
          filters={activeFilters}
          resultCount={null}
          search={(
            <SearchField
              className="pd-x18-analytics-search"
              debounceMs={0}
              hideLabel={false}
              key={`campaign-search-${searchResetVersion}`}
              label="Szukaj kampanii"
              loading={false}
              placeholder={copy({
                en: 'Campaign, channel or owner',
                pl: 'Kampania, kanał lub właściciel',
              })}
              query={query}
              resultCount={filteredRows.length}
              onClear={() => {
                clearSearch();
                resetPage();
              }}
              onQueryChange={(nextQuery) => {
                setQuery(nextQuery);
                resetPage();
              }}
            />
          )}
          onClearFilters={() => {
            clearSearch();
            setChannelFilter('all');
            setStatusFilter('all');
            setRangeFilter('30d');
            resetPage();
          }}
          onRemoveFilter={(filterId) => {
            if (filterId === 'query') {
              clearSearch();
              resetPage();
            }

            if (filterId === 'channel') {
              setChannelFilter('all');
              resetPage();
            }

            if (filterId === 'status') {
              setStatusFilter('all');
              resetPage();
            }

            if (filterId === 'range') {
              setRangeFilter('30d');
              resetPage();
            }
          }}
        />

        {settingsOpen ? (
          <aside
            aria-label="Ustawienia widoku tabeli"
            className="pd-x18-analytics-settings"
          >
            <div className="pd-x18-analytics-settings__header">
              <div>
                <p className="pd-x18-region__eyebrow">
                  Widok tabeli
                </p>
                <h4 className="pd-x18-analytics-settings__title">
                  Kolumny i gęstość
                </h4>
              </div>

              <Button
                size="small"
                variant="ghost"
                onClick={() => {
                  setSettingsOpen(false);
                }}
              >
                Zamknij
              </Button>
            </div>

            <fieldset className="pd-x18-analytics-column-picker">
              <legend>
                Widoczne kolumny
              </legend>

              <p>
                Kampania i sygnał pozostają widoczne.
              </p>

              <div className="pd-x18-analytics-column-list">
                {optionalColumnIds.map(
                  (columnId) => (
                    <Checkbox
                      checked={
                        visibleColumnIds.includes(
                          columnId,
                        )
                      }
                      key={columnId}
                      label={
                        columnCatalog[
                          columnId
                        ].label
                      }
                      value={columnId}
                      onChange={() => {
                        handleColumnToggle(
                          columnId,
                        );
                      }}
                    />
                  ),
                )}
              </div>
            </fieldset>

            <div className="pd-x18-analytics-settings__row">
              <div className="pd-x18-analytics-setting">
                <span>
                  Gęstość
                </span>

                <SegmentedControl
                  ariaLabel="Gęstość tabeli"
                  items={[
                    {
                      label: 'Wygodna',
                      value: 'comfortable',
                    },
                    {
                      label: 'Kompaktowa',
                      value: 'compact',
                    },
                  ]}
                  size="compact"
                  value={density}
                  onValueChange={(nextValue) => {
                    setDensity(
                      nextValue as
                        | 'comfortable'
                        | 'compact',
                    );
                  }}
                />
              </div>

              <div className="pd-x18-analytics-setting">
                <Select
                  label="Stan demonstracyjny"
                  options={[
                    {
                      label: 'Dane gotowe',
                      value: 'ready',
                    },
                    {
                      label: 'Ładowanie danych',
                      value: 'loading',
                    },
                    {
                      label: 'Błąd odświeżenia',
                      value: 'error',
                    },
                  ]}
                  placeholder={copy({ en: 'Select state', pl: 'Wybierz stan' })}
                  value={dataMode}
                  onChange={(event) => {
                    setDataMode(
                      event.currentTarget
                        .value as DataMode,
                    );
                  }}
                />
              </div>
            </div>
          </aside>
        ) : null}

        {selectedRowIds.length > 0 ? (
          <div
            aria-label="Akcje dla zaznaczonych kampanii"
            className="pd-x18-analytics-bulk-bar"
          >
            <div className="pd-x18-analytics-selection">
              <span className="pd-x18-analytics-selection__count">
                {selectedCountLabel}
              </span>
              <span>
                {selectedVisibleCount} na bieżącej stronie
              </span>
            </div>

            <div className="pd-x18-analytics-actions">
              <Button
                size="small"
                variant="ghost"
                onClick={() => {
                  setSelectedRowIds([]);
                  setActionMessage(
                    'Wyczyszczono zaznaczenie.',
                  );
                }}
              >
                Wyczyść
              </Button>

              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  bulkExportAction();

                  setActionMessage(
                    `Eksport zaznaczenia obejmuje: ${selectedRows.map((row) => row.campaign).join(', ')}.`,
                  );
                }}
              >
                Eksportuj zaznaczenie
              </Button>
            </div>
          </div>
        ) : null}

        <div className="pd-x18-analytics-results-header">
          <div>
            <span className="pd-x18-analytics-results-header__count">
              {resultCountLabel}
            </span>
            <span className="pd-x18-analytics-results-header__meta">
              {pageRangeLabel}
              {' · '}
              {rangeLabels[rangeFilter]}
            </span>
          </div>

          <StatusBadge
            status="Stan danych"
            text={dataModeLabels[dataMode]}
            tone={resolveDataModeTone(dataMode)}
          />
        </div>

        <div className="pd-x18-analytics-stage">
          <DataTable
            actionsLabel="Akcje"
            actionsMenuItems={(row) => {
              const rowId =
                String(row.id);

              const selected =
                selectedRowIds.includes(
                  rowId,
                );

              return [
                {
                  id: 'details',
                  label: 'Pokaż szczegóły',
                  shortcut: 'Enter',
                },
                {
                  id: selected
                    ? 'unselect'
                    : 'select',
                  label: selected
                    ? 'Usuń z zaznaczenia'
                    : 'Dodaj do zaznaczenia',
                },
              ];
            }}
            actionsTriggerLabel="…"
            ariaLabel="Analityczna tabela wyników kampanii"
            cellRenderers={cellRenderers}
            className="pd-x18-analytics-data-table"
            columns={visibleColumns}
            density={density}
            emptyMessage="Brak kampanii w bieżącym zakresie."
            errorMessage={
              dataMode === 'error'
                ? 'Nie udało się odświeżyć części danych. Bieżące filtry, sortowanie i zaznaczenie zostały zachowane.'
                : null
            }
            loading={
              dataMode === 'loading'
            }
            minWidth="82rem"
            noResults={
              filteredRows.length === 0
            }
            noResultsMessage="Żadna kampania nie spełnia aktywnych filtrów."
            pagination={{
              cursor:
                filteredRows.length === 0
                  ? null
                  : `page-${resolvedPageIndex + 1}`,
              loading:
                dataMode === 'loading',
              nextCursor:
                resolvedPageIndex
                  < pageCount - 1
                  ? `page-${resolvedPageIndex + 2}`
                  : null,
              previousCursor:
                resolvedPageIndex > 0
                  ? `page-${resolvedPageIndex}`
                  : null,
              summary: pageRangeLabel,
              onNavigate: (direction) => {
                const nextPage =
                  direction === 'next'
                    ? Math.min(
                      resolvedPageIndex + 1,
                      pageCount - 1,
                    )
                    : Math.max(
                      resolvedPageIndex - 1,
                      0,
                    );

                setPageIndex(nextPage);

                setActionMessage(
                  direction === 'next'
                    ? `Pobrano następną stronę: ${nextPage + 1}.`
                    : `Pobrano poprzednią stronę: ${nextPage + 1}.`,
                );
              },
            }}
            rowCount={filteredRows.length}
            rowHeaderColumnId="campaign"
            rows={pageDataRows}
            selectedRowIds={selectedRowIds}
            selection={{
              allVisibleSelected:
                pageRowsSelected,
              someVisibleSelected:
                somePageRowsSelected,
              onToggleRow:
                handleRowSelection,
              onToggleVisible:
                handlePageSelection,
            }}
            sort={null}
            statusColumn={{
              columnId: 'status',
              label: 'Sygnał analityczny',
              mapTone: {
                Obserwuj: 'warning',
                Ryzyko: 'danger',
                Stabilnie: 'neutral',
                Szansa: 'success',
              },
            }}
            stickyHeader
            summary={`Tabela pokazuje ${pageRangeLabel}; ${visibleColumnLabel} kolumn; okres ${rangeLabels[rangeFilter]}.`}
            onAction={(rowId, actionId) => {
              const record =
                campaignRows.find(
                  (row) =>
                    row.id === rowId,
                );

              const recordLabel =
                record?.campaign
                ?? rowId;

              rowAction(
                rowId,
                actionId,
              );

              if (
                actionId === 'details'
              ) {
                setDetailRecordId(
                  rowId,
                );

                setActionMessage(
                  `Otwarto szczegół kampanii ${recordLabel}.`,
                );

                return;
              }

              if (
                actionId === 'select'
                || actionId === 'unselect'
              ) {
                handleRowSelection(
                  rowId,
                );

                setActionMessage(
                  actionId === 'select'
                    ? `Dodano kampanię ${recordLabel} do zaznaczenia.`
                    : `Usunięto kampanię ${recordLabel} z zaznaczenia.`,
                );
              }
            }}
          />

          {detailRecord ? (
            <aside
              aria-labelledby="pd-x18-analytics-detail-title"
              className="pd-x18-analytics-detail"
            >
              <div className="pd-x18-analytics-detail__header">
                <div>
                  <p className="pd-x18-region__eyebrow">
                    Szczegół kampanii
                  </p>

                  <h4
                    className="pd-x18-analytics-detail__title"
                    id="pd-x18-analytics-detail-title"
                  >
                    {detailRecord.campaign}
                  </h4>

                  <p className="pd-x18-analytics-detail__meta">
                    {detailRecord.channelLabel}
                    {' · '}
                    {detailRecord.owner}
                  </p>
                </div>

                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => {
                    setDetailRecordId(
                      null,
                    );

                    setActionMessage(
                      'Zamknięto szczegół kampanii.',
                    );
                  }}
                >
                  Zamknij
                </Button>
              </div>

              <StatusBadge
                status="Sygnał analityczny"
                text={detailRecord.status}
                tone={
                  detailRecord.statusId
                    === 'opportunity'
                    ? 'success'
                    : detailRecord.statusId
                      === 'risk'
                      ? 'critical'
                      : detailRecord.statusId
                        === 'watch'
                        ? 'warning'
                        : 'neutral'
                }
              />

              <p className="pd-x18-analytics-detail__note">
                {detailRecord.note}
              </p>

              <dl className="pd-x18-analytics-detail__metrics">
                <div>
                  <dt>Przychód</dt>
                  <dd>
                    {formatCurrency(
                      detailRecord.revenue,
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Zmiana</dt>
                  <dd
                    data-tone={
                      resolveDeltaTone(
                        detailRecord
                          .revenueChange,
                      )
                    }
                  >
                    {formatSignedPercentage(
                      detailRecord
                        .revenueChange,
                    )}
                  </dd>
                </div>

                <div>
                  <dt>ROAS</dt>
                  <dd>
                    {formatRoas(
                      detailRecord.roas,
                    )}
                  </dd>
                </div>

                <div>
                  <dt>CVR</dt>
                  <dd>
                    {formatPercentage(
                      detailRecord.cvr,
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Marża</dt>
                  <dd>
                    {formatPercentage(
                      detailRecord.margin,
                    )}
                  </dd>
                </div>

                <div>
                  <dt>Zamówienia</dt>
                  <dd>
                    {formatInteger(
                      detailRecord.orders,
                    )}
                  </dd>
                </div>
              </dl>

              <div className="pd-x18-analytics-detail__trend">
                <span>
                  Trend
                </span>

                <MiniTrend
                  points={
                    detailRecord.trend
                  }
                />
              </div>

              <div className="pd-x18-analytics-detail__decision">
                <span>
                  Następny krok
                </span>
                <p>
                  {detailRecord.nextStep}
                </p>
              </div>

              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setActionMessage(
                    `Przekazano kampanię ${detailRecord.campaign} do pełnej analizy.`,
                  );
                }}
              >
                Analizuj kampanię
              </Button>
            </aside>
          ) : null}
        </div>

        <div
          aria-live="polite"
          className="pd-x18-analytics-message"
        >
          <span>
            {actionMessage}
          </span>

          {hasCustomView ? (
            <Button
              size="small"
              variant="ghost"
              onClick={resetView}
            >
              Przywróć widok
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title:
    '18 Wzorce interfejsu/Tabela z filtrami i akcjami',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FilteredTableActionsStory: Story = {
  name: 'Tabela z filtrami i akcjami',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca tabeli"
          items={[
            {
              label: <Localized en="Contract" pl="Kontrakt" />,
              value: '18.04',
            },
            {
              label: <Localized en="Surface" pl="Powierzchnia" />,
              value: 'DataTable',
            },
            {
              label: <Localized en="Status" pl="Status" />,
              value: <Localized en="In review" pl="W przeglądzie" />,
            },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel={<Localized en="Interface patterns" pl="Wzorce interfejsu" />}
      storyId="18.04"
      summary={<Localized
        en="The analytics table combines filtering, sorting, selection, column configuration, export and record details with business metrics, momentum and trend."
        pl="Analityczna tabela łączy filtrowanie, sortowanie, selekcję, konfigurację kolumn, eksport i szczegół rekordu z metrykami biznesowymi, dynamiką oraz trendem."
      />}
      title={<Localized en="Table with filters and actions" pl="Tabela z filtrami i akcjami" />}
    >
      <StoryPresentationSection
        index="01"
        summary={<Localized
          en="The main surface supports campaign performance analysis. Controls stay compact, while configuration and details work as supporting layers."
          pl="Główna powierzchnia służy analizie wyników kampanii. Sterowanie pozostaje kompaktowe, a konfiguracja i szczegół działają jako warstwy pomocnicze."
        />}
        title={<Localized en="Results analysis without losing context" pl="Analiza wyników bez utraty kontekstu" />}
      >
        <FilteredTablePattern />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas =
      within(canvasElement);

    await expect(
      canvas.getByRole(
        'heading',
        {
          name: 'Tabela z filtrami i akcjami',
        },
      ),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole(
        'heading',
        {
          name: 'Wyniki kampanii',
        },
      ),
    ).toBeInTheDocument();

    const rangeFilter =
      canvas.getByRole(
        'combobox',
        {
          name: 'Okres',
        },
      );

    await userEvent.click(
      rangeFilter,
    );

    await userEvent.click(
      canvas.getByRole(
        'option',
        {
          name: 'Ostatnie 90 dni',
        },
      ),
    );

    await userEvent.click(
      canvas.getByRole(
        'button',
        {
          name: 'Pobierz następny zakres wyników',
        },
      ),
    );

    await expect(
      await canvas.findByText(
        'Pobrano następną stronę: 2.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole(
        'button',
        {
          name: 'Sortowanie wyników kampanii',
        },
      ),
    );

    await userEvent.click(
      canvas.getByRole(
        'menuitem',
        {
          name: 'ROAS',
        },
      ),
    );

    await expect(
      await canvas.findByText(
        'Sortowanie ustawiono na kolumnę ROAS.',
      ),
    ).toBeInTheDocument();

    const search =
      canvas.getByRole(
        'searchbox',
        {
          name: 'Szukaj kampanii',
        },
      );

    await userEvent.type(
      search,
      'meta',
    );

    await expect(
      canvas.getByText(
        'Meta Prospecting',
      ),
    ).toBeInTheDocument();

    const statusFilter =
      canvas.getByRole(
        'combobox',
        {
          name: 'Sygnał',
        },
      );

    await userEvent.click(
      statusFilter,
    );

    await userEvent.click(
      canvas.getByRole(
        'option',
        {
          name: 'Szansa',
        },
      ),
    );

    await expect(
      canvas.getByText(
        'Meta Prospecting',
      ),
    ).toBeInTheDocument();

    const actionTrigger =
      canvas.getByRole(
        'button',
        {
          name:
            /Akcje dla wiersza meta-prospecting/,
        },
      );

    await userEvent.click(
      actionTrigger,
    );

    await userEvent.click(
      canvas.getByRole(
        'menuitem',
        {
          name: /Pokaż szczegóły/,
        },
      ),
    );

    await expect(
      canvas.getByRole(
        'heading',
        {
          name: 'Meta Prospecting',
        },
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole(
        'button',
        {
          name: 'Zamknij',
        },
      ),
    );

    await userEvent.click(
      actionTrigger,
    );

    await userEvent.click(
      canvas.getByRole(
        'menuitem',
        {
          name: /Dodaj do zaznaczenia/,
        },
      ),
    );

    await expect(
      canvas.getByText(
        '1 zaznaczenie',
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole(
        'button',
        {
          name: 'Eksportuj zaznaczenie',
        },
      ),
    );

    await expect(
      await canvas.findByText(
        /Eksport zaznaczenia obejmuje/,
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole(
        'button',
        {
          name: 'Widok tabeli',
        },
      ),
    );

    await userEvent.click(
      canvas.getByRole(
        'radio',
        {
          name: 'Kompaktowa',
        },
      ),
    );

    await expect(
      canvas.getByRole(
        'radio',
        {
          name: 'Kompaktowa',
        },
      ),
    ).toBeChecked();

    const trendColumnToggle =
      canvas.getByRole(
        'checkbox',
        {
          name: 'Trend',
        },
      );
    const trendColumnLabel =
      trendColumnToggle.closest('label');

    await userEvent.click(
      trendColumnLabel
        ?? trendColumnToggle,
    );

    await expect(
      canvas.getByText(
        'Pokazano kolumnę Trend.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole(
        'button',
        {
          name: 'Przywróć widok',
        },
      ),
    );

    const tableScroll =
      canvasElement.querySelector<HTMLElement>(
        '.pd-x18-analytics-data-table .pd-table__scroll',
      );

    if (tableScroll) {
      tableScroll.scrollLeft = 0;
    }

    await expect(
      canvas.getByRole(
        'searchbox',
        {
          name: 'Szukaj kampanii',
        },
      ),
    ).toHaveValue('');

    await expect(
      canvas.getByRole(
        'button',
        {
          name: 'Widok tabeli',
        },
      ),
    ).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};
