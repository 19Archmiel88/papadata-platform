export type ThemeMode = 'light' | 'dark';
export type LocaleMode = 'pl' | 'en';
export type OverlayName = 'alert' | 'bottom-sheet' | 'dialog' | 'drawer' | 'overlay-root' | null;

export type EvidenceAction = {
  readonly id: string;
  readonly label: string;
};

export const componentIds = [
  'PapaDataBrand',
  'Icon',
  'ButtonGroup',
  'FileInput',
  'VerificationCodeInput',
  'Button',
  'IconButton',
  'TextAction',
  'LinkAction',
  'TextField',
  'PasswordField',
  'Textarea',
  'Select',
  'Combobox',
  'Checkbox',
  'RadioGroup',
  'Switch',
  'DateRangePicker',
  'SearchField',
  'FilterBar',
  'SortControl',
  'DataTable',
  'ColumnPicker',
  'BulkActionBar',
  'Pagination',
  'Tabs',
  'Menu',
  'Popover',
  'Tooltip',
  'Dialog',
  'AlertDialog',
  'Drawer',
  'OverlayRoot',
  'BottomSheet',
  'InlineNotice',
  'Toast',
  'StatusBadge',
  'EmptyState',
  'ErrorState',
  'Skeleton',
  'Spinner',
  'ProgressIndicator',
  'BackgroundOperationItem',
  'PageHeader',
  'SectionNavigation',
  'Breadcrumbs',
  'ChartFrame',
  'MetricCard',
  'TrendChart',
  'ComparisonChart',
  'CorrelationChart',
  'ForecastChart',
  'ShareChart',
  'ChartDataState',
  'ChartInteractionLayer',
  'DataStatusBanner',
  'EvidencePanel',
  'RecommendationCard',
  'DecisionQueue',
  'BudgetPacing',
  'AttributionComparison',
  'ReconciliationPanel',
  'SyncTimeline',
  'LineageGraph',
  'CohortMatrix',
  'CustomerSegments',
  'SalesFunnel',
  'FunnelStep',
  'MorningBrief',
  'AssistantComposer',
  'PairingFlow',
  'ApprovalPanel',
  'DataList',
  'DetailPanel',
  'DecisionCard',
  'Panel',
  'PlanPerformance',
  'ResultDrivers',
  'SalesSources',
  'WaterfallChart',
  'Toolbar',
  'FilterChip',
  'SegmentedControl',
] as const;

export const workspaceContext = {
  locale: 'pl' as const,
  range: {
    from: '2026-08-01',
    preset: 'last30d' as const,
    timezone: 'Europe/Warsaw',
    to: '2026-08-16',
  },
  tenantId: 'tenant-papadata',
  userId: 'user-demo',
  workspaceId: 'workspace-command-center',
};

export const componentContext = {
  density: 'comfortable' as const,
  locale: 'pl' as const,
  tenantId: 'tenant-papadata',
  workspaceId: 'workspace-command-center',
};

export const evidence = [
  {
    confidence: 0.92,
    id: 'ev-orders',
    label: 'Zamówienia zsynchronizowane z Shopify',
    source: 'Shopify Orders API',
  },
  {
    confidence: 0.86,
    id: 'ev-attribution',
    label: 'Porównanie atrybucji z Meta Ads i GA4',
    source: 'Warehouse mart_attribution_daily',
  },
];

export const dataSources = [
  {
    completeness: 0.98,
    dataset: 'orders',
    lastSyncAt: '2026-08-16T01:45:00+01:00',
    provider: 'Shopify',
  },
  {
    completeness: 0.93,
    dataset: 'campaigns',
    lastSyncAt: '2026-08-16T01:30:00+01:00',
    provider: 'Meta Ads',
  },
];

export const tableColumns = [
  {
    id: 'source',
    label: 'Źródło',
    sortable: true,
    width: 220,
  },
  {
    align: 'right' as const,
    id: 'orders',
    label: 'Zamówienia',
    sortable: true,
    width: 140,
  },
  {
    id: 'status',
    label: 'Status',
    width: 160,
  },
];

export const tableRows = [
  {
    id: 'allegro',
    orders: 128,
    source: 'Allegro',
    status: 'stable',
  },
  {
    id: 'shopify',
    orders: 48,
    source: 'Shopify',
    status: 'risk',
  },
  {
    id: 'meta',
    orders: 86,
    source: 'Meta Ads',
    status: 'opportunity',
  },
];

export const trendData = [
  { actual: 81, label: 'Pn', movingAverage: 78, plan: 76, previousPeriod: 72 },
  { actual: 86, label: 'Wt', movingAverage: 81, plan: 78, previousPeriod: 75 },
  { actual: 84, label: 'Śr', movingAverage: 83, plan: 80, previousPeriod: 74 },
  { actual: 91, label: 'Cz', movingAverage: 86, plan: 82, previousPeriod: 77 },
  { actual: 96, label: 'Pt', movingAverage: 90, plan: 85, previousPeriod: 82 },
];

export const comparisonSeries = [
  { key: 'current', label: 'Bieżący okres' },
  { key: 'previous', label: 'Poprzedni okres' },
];

export const comparisonData = [
  { id: 'paid', label: 'Paid', values: { current: 128, previous: 110 } },
  { id: 'organic', label: 'Organic', values: { current: 74, previous: 80 } },
  { id: 'email', label: 'Email', values: { current: 42, previous: 36 } },
];

export const shareSegments = [
  { id: 'paid', label: 'Paid', percent: 52, value: 520000 },
  { id: 'organic', label: 'Organic', percent: 31, value: 310000 },
  { id: 'email', label: 'Email', percent: 17, value: 170000 },
];

export const forecastActual = [
  { label: 'T-3', value: 72 },
  { label: 'T-2', value: 78 },
  { label: 'T-1', value: 83 },
];

export const forecast = [
  { label: 'T', value: 88 },
  { label: 'T+1', value: 92 },
  { label: 'T+2', value: 97 },
];

export const lowerBound = [
  { label: 'T', value: 80 },
  { label: 'T+1', value: 84 },
  { label: 'T+2', value: 88 },
];

export const upperBound = [
  { label: 'T', value: 94 },
  { label: 'T+1', value: 101 },
  { label: 'T+2', value: 108 },
];

export const correlationPoints = [
  { id: 'a', label: 'Paid search', role: 'driver-hypothesis' as const, x: 68, y: 82 },
  { id: 'b', label: 'Retargeting', role: 'standard' as const, x: 52, y: 63 },
  { id: 'c', label: 'Brand', role: 'cluster' as const, x: 78, y: 88 },
  { id: 'd', label: 'Offline spike', role: 'outlier' as const, x: 24, y: 70 },
];

export const chartPoints = [
  {
    detail: 'Paid search wniósł największą różnicę w konwersji.',
    drillDownLabel: 'Pokaż źródło',
    filterId: 'paid',
    id: 'paid-search',
    label: 'Paid search',
    seriesLabel: 'Konwersja',
    valueLabel: '82%',
  },
  {
    detail: 'Email stabilizuje retencję po zakupie.',
    drillDownLabel: 'Pokaż segment',
    filterId: 'email',
    id: 'email',
    label: 'Email',
    seriesLabel: 'Retencja',
    valueLabel: '41%',
  },
];


