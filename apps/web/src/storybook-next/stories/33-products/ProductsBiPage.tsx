import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  Icon,
  MetricCard,
  Panel,
  PriorityBand,
  ProductSectionFrame,
  ProductSectionTopbar,
} from '../../../design-system';
import {
  productAccessibleMatrixRows,
  productBasketInsight,
  productBundleScenario,
  productDeadStockAlert,
  productDefaultFilters,
  productDrawerPriceHistory,
  productFinancialMetrics,
  productInsightAuditSteps,
  productInventoryRisks,
  productKpis,
  productLifecycleCards,
  productMatrixCells,
  productMatrixRows,
  productPromotions,
  productsProvenanceDict,
  productSections,
  productSectionsById,
  productSkuDatabase,
  productTrendLabels,
  productTrendModes,
  productTrendSeries,
} from './ProductsBiPage.data';
import type {
  ProductFilterState,
  ProductMatrixCode,
  ProductSectionId,
  ProductSku,
  ProductStatus,
  ProductTrendMode,
  ProductsProvenanceKey,
  ProductsTone,
} from './ProductsBiPage.data';
import './ProductsBiPage.css';

type ProductSortKey =
  | 'cover'
  | 'margin'
  | 'name'
  | 'revenue'
  | 'stock'
  | 'units';

type ProductExplorerColumn =
  | 'abc'
  | 'cover'
  | 'margin'
  | 'revenue'
  | 'sku'
  | 'status'
  | 'stock'
  | 'units';

const noop = () => undefined;

const chartColors = {
  amber: 'rgb(var(--pd-pbi-amber-600))',
  blue: 'rgb(var(--pd-pbi-blue-600))',
  emerald: 'rgb(var(--pd-pbi-emerald-600))',
  indigo: 'rgb(var(--pd-pbi-indigo-600))',
  red: 'rgb(var(--pd-pbi-red-600))',
  rose: 'rgb(var(--pd-pbi-rose-600))',
  sky: 'rgb(var(--pd-pbi-sky-600))',
  slate: 'rgb(var(--pd-pbi-slate-500))',
  violet: 'rgb(var(--pd-pbi-violet-600))',
} as const satisfies Record<ProductsTone, string>;

const productColumnOptions = [
  {
    label: 'SKU / Produkt',
    value: 'sku',
  },
  {
    label: 'Przychód (Flow)',
    value: 'revenue',
  },
  {
    label: 'Sprzedane szt.',
    value: 'units',
  },
  {
    label: 'Marża Brutto',
    value: 'margin',
  },
  {
    label: 'Dostępny Zapas',
    value: 'stock',
  },
  {
    label: 'Pokrycie DSI',
    value: 'cover',
  },
  {
    label: 'Klasa ABC/XYZ',
    value: 'abc',
  },
  {
    label: 'Status Papa',
    value: 'status',
  },
] as const satisfies readonly {
  readonly label: string;
  readonly value: ProductExplorerColumn;
}[];

export function ProductsBiPage() {
  const [activeSection, setActiveSection] = useState<ProductSectionId>(productSections[0]!.id);
  const [filters, setFilters] = useState<ProductFilterState>(productDefaultFilters);
  const [selectedMatrixCode, setSelectedMatrixCode] = useState<ProductMatrixCode | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [selectedProvenance, setSelectedProvenance] = useState<ProductsProvenanceKey | null>(null);
  const [papaContext, setPapaContext] = useState<string | null>(null);

  const selectedSku = productSkuDatabase.find((sku) => sku.id === selectedSkuId) ?? null;

  function handleSectionChange(sectionId: ProductSectionId) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showStockoutRisk() {
    setFilters({
      ...filters,
      stockStatus: 'stockout_risk',
    });
    setSelectedMatrixCode(null);
  }

  function showDeadStock() {
    setFilters({
      ...filters,
      stockStatus: 'dead_stock',
    });
    setSelectedMatrixCode(null);
  }

  function selectMatrixCode(code: ProductMatrixCode) {
    setFilters({
      ...filters,
      abc: code.slice(0, 1) as ProductFilterState['abc'],
    });
    setSelectedMatrixCode(code);
  }

  return (
    <main className="pd-pbi" data-testid="products-bi-page">
      <ProductSectionTopbar
        activeId={activeSection}
        ariaLabel="Sekcje Produktów"
        items={productSections.map((section) => ({
          id: section.id,
          label: section.navLabel,
        }))}
        onActiveIdChange={(id) => handleSectionChange(id as ProductSectionId)}
      />

      <div className="pd-pbi__content">
        <ProductResultSection
          onAnalyze={() => setPapaContext('stockout_alert')}
          onOpenProvenance={setSelectedProvenance}
          onShowStockout={showStockoutRisk}
        />
        <ProductExplorer
          filters={filters}
          matrixCode={selectedMatrixCode}
          onOpenSku={setSelectedSkuId}
          onResetMatrix={() => setSelectedMatrixCode(null)}
        />
        <ProductAbcXyzMatrix
          activeCode={selectedMatrixCode}
          onSelectCode={selectMatrixCode}
        />
        <ProductInventoryCapital onShowDeadStock={showDeadStock} />
        <ProductPromotionsAndBasket />
        <ProductBundleSimulator />
        <ProductLifecyclePortfolio />
        <ProductAiInsightAudit />
      </div>

      <ProductProvenanceModal
        metricKey={selectedProvenance}
        onClose={() => setSelectedProvenance(null)}
      />
      <ProductSkuDrawer
        onClose={() => setSelectedSkuId(null)}
        sku={selectedSku}
      />
      <ProductPapaModal
        onClose={() => setPapaContext(null)}
        topic={papaContext}
      />
    </main>
  );
}

/**
 * "Wynik produktowy": combines the top Papa priority recommendation, the
 * headline product/inventory KPIs, and the sales/margin/stock trend chart
 * into one section frame -- one business answer to "what is the current
 * business result of the product portfolio?", not three separate stories.
 */
export function ProductResultSection({
  onAnalyze = noop,
  onOpenProvenance = noop,
  onShowStockout = noop,
}: {
  readonly onAnalyze?: () => void;
  readonly onOpenProvenance?: (key: ProductsProvenanceKey) => void;
  readonly onShowStockout?: () => void;
}) {
  const section = productSectionsById.wynik;

  return (
    <ProductSectionFrame
      description="Jaki jest aktualny wynik biznesowy portfolio produktowego?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
    <PriorityBand
      actions={(
        <>
          <Button onClick={onShowStockout} variant="primary">
            Pokaż 7 zagrożonych SKU
          </Button>
          <Button
            onClick={onAnalyze}
            startIcon={<Icon decorative name="assistant" size={16} />}
            variant="secondary"
          >
            Analizuj plan dostaw z Papa AI
          </Button>
        </>
      )}
      badgeLabel="Priorytetowa Decyzja Asortymentowa"
      timestampLabel="Wyliczono na podstawie: Wartość SKU × Ryzyko × Pilność"
      title="3 strategiczne SKU klasy AX wyprzedadzą się przed dostawą dostawcy"
    >
      <p>
        Produkty odpowiadają za <strong>21,4% łącznej marży brutto</strong> firmy (182 400 zł sprzedaży / 30 dni).
        Produkt lider <code>SER-C-30</code> posiada tylko 8 dni zapasu przy średniej sprzedaży 23 szt./dzień i lead time dostawcy trwającym 12 dni.
      </p>
      <div className="pd-pbi-hero-metrics">
        <MetricPill label="Najbliższy stockout" value="za 8 dni (5 września)" variant="danger" />
        <MetricPill label="Zagrożony revenue" value="182 400 zł" />
        <MetricPill label="Data confidence" value="Wysoka (100% stock fact)" variant="success" />
      </div>
    </PriorityBand>

    <Panel
      bordered={false}
      collapsed={false}
      collapsible={false}
      description="Wybrany okres: ostatnie 30 dni · DSI Base: Trailing 30 days demand"
      padding="md"
      title="Wynik Produktowy & Zapasy"
    >
      <div className="pd-pbi-kpi-grid">
        {productKpis.map((kpi) => (
          <MetricCard
            comparison={{ direction: kpi.trendDirection === 'warning' ? 'unknown' : kpi.trendDirection, label: kpi.note ? `${kpi.trend} ${kpi.note}` : kpi.trend }}
            detailAction={{ label: `${kpi.badge} · Źródło i wzór`, onAction: () => onOpenProvenance(kpi.provenanceKey) }}
            key={kpi.title}
            label={kpi.title}
            metricId={`products-kpi-${kpi.provenanceKey}`}
            signal={kpi.badgeTone === 'emerald' ? 'positive' : kpi.badgeTone === 'amber' ? 'warning' : 'neutral'}
            sourceLabel={kpi.footer}
            status="ready"
            statusLabel={kpi.badge}
            value={kpi.value}
          />
        ))}
      </div>
    </Panel>

    <ProductTrendChart />
    </ProductSectionFrame>
  );
}

function MetricPill({
  label,
  value,
  variant = 'neutral',
}: {
  readonly label: string;
  readonly value: string;
  readonly variant?: 'danger' | 'neutral' | 'success';
}) {
  return (
    <div className={`pd-pbi-metric-pill pd-pbi-metric-pill--${variant}`}>
      <span>{label}:</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProductTrendChart() {
  const [mode, setMode] = useState<ProductTrendMode>('revenue');
  const chartData = useMemo(() => buildTrendData(mode), [mode]);
  const activeLabel = productTrendModes.find((item) => item.value === mode)?.label ?? 'Przychód (zł)';

  return (
    <section className="pd-pbi-panel" aria-labelledby="pd-pbi-trend-title">
      <div className="pd-pbi-panel__heading">
        <div>
          <h2 id="pd-pbi-trend-title">Trend Sprzedaży, Marży i Szacowanego Zapasu</h2>
          <p>Rzeczywisty szereg czasowy (FactOrderLine) zagregowany dziennie.</p>
        </div>
        <div className="pd-pbi-segmented" role="group" aria-label="Metryka trendu produktowego">
          {productTrendModes.map((item) => (
            <button
              className={item.value === mode ? 'pd-pbi-segmented__button pd-pbi-segmented__button--active' : 'pd-pbi-segmented__button'}
              key={item.value}
              onClick={() => setMode(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pd-pbi-chart" role="img" aria-label={`Wykres trendu: ${activeLabel}`}>
        <ResponsiveContainer height="100%" width="100%">
          <RechartsLineChart data={chartData} margin={{ bottom: 8, left: 4, right: 16, top: 10 }}>
            <CartesianGrid stroke="rgb(var(--pd-pbi-slate-200))" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: chartColors.slate, fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: chartColors.slate, fontSize: 11 }} tickFormatter={(value) => formatCompactNumber(Number(value))} tickLine={false} width={52} />
            <Tooltip
              contentStyle={{
                background: 'rgb(58 58 54)',
                border: '0',
                borderRadius: 10,
                color: 'white',
                fontSize: 12,
              }}
              formatter={(value, name) => [formatTrendValue(Number(value), mode, String(name)), name]}
              labelStyle={{ color: 'rgb(190 190 187)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line dataKey="selected" name={activeLabel} stroke={chartColors.indigo} strokeWidth={3} dot={{ r: 3 }} type="monotone" />
            <Line dataKey="margin" name="Marża brutto (zł)" stroke={chartColors.emerald} strokeDasharray="5 5" strokeWidth={2} dot={false} type="monotone" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function ProductExplorer({
  filters = productDefaultFilters,
  matrixCode = null,
  onOpenSku = noop,
  onResetMatrix = noop,
}: {
  readonly filters?: ProductFilterState;
  readonly matrixCode?: ProductMatrixCode | null;
  readonly onOpenSku?: (skuId: string) => void;
  readonly onResetMatrix?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<ProductSortKey>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<ProductExplorerColumn, boolean>>({
    abc: true,
    cover: true,
    margin: true,
    revenue: true,
    sku: true,
    status: true,
    stock: true,
    units: true,
  });

  const filteredRows = useMemo(() => {
    const rows = filterProducts({
      filters,
      matrixCode,
      query,
    });

    return [...rows].sort((first, second) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      const firstValue = getSortableValue(first, sortKey);
      const secondValue = getSortableValue(second, sortKey);

      if (typeof firstValue === 'string' && typeof secondValue === 'string') {
        return firstValue.localeCompare(secondValue, 'pl') * direction;
      }

      return (Number(firstValue) - Number(secondValue)) * direction;
    });
  }, [filters, matrixCode, query, sortDirection, sortKey]);

  function sortBy(key: ProductSortKey) {
    if (key === sortKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(key);
    setSortDirection('desc');
  }

  function toggleColumn(column: ProductExplorerColumn) {
    setVisibleColumns({
      ...visibleColumns,
      [column]: !visibleColumns[column],
    });
  }

  const section = productSectionsById.explorer;

  return (
    <ProductSectionFrame
      actions={(
        <>
          <span className="pd-pbi-context-pill">{filteredRows.length} SKU</span>
          <label className="pd-pbi-search">
            <Icon decorative name="search" size={16} />
            <span className="pd-pbi-sr-only">Szukaj nazwy SKU lub kodu</span>
            <input
              aria-label="Szukaj nazwy SKU lub kodu"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj nazwy SKU lub kodu..."
              type="search"
              value={query}
            />
          </label>
          <button className="pd-pbi-outline-button" onClick={() => setSelectorOpen(!selectorOpen)} type="button">
            Dostosuj kolumny
          </button>
        </>
      )}
      description={(
        <>
          Centrum operacyjne SKU. Kliknij wiersz, aby otworzyć drawer ze szczegółami 360°.
          {matrixCode ? (
            <>
              {' '}
              <button className="pd-pbi-link-button" onClick={onResetMatrix} type="button">
                Wyczyść filtr segmentu {matrixCode}
              </button>
            </>
          ) : null}
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      {selectorOpen ? (
        <div className="pd-pbi-column-panel">
          {productColumnOptions.map((column) => (
            <label key={column.value}>
              <input
                checked={visibleColumns[column.value]}
                onChange={() => toggleColumn(column.value)}
                type="checkbox"
              />
              <span>{column.label}</span>
            </label>
          ))}
        </div>
      ) : null}

      <div className="pd-pbi-table-scroll">
        <table className="pd-pbi-sku-table">
          <thead>
            <tr>
              <SortableHeader
                column="sku"
                label="Produkt / SKU"
                onSort={() => sortBy('name')}
                sortKey={sortKey}
                target="name"
                visible={visibleColumns.sku}
              />
              <th>Kategoria</th>
              <SortableHeader
                align="right"
                column="revenue"
                label="Przychód (zł)"
                onSort={() => sortBy('revenue')}
                sortKey={sortKey}
                target="revenue"
                visible={visibleColumns.revenue}
              />
              <SortableHeader
                align="right"
                column="units"
                label="Sztuki"
                onSort={() => sortBy('units')}
                sortKey={sortKey}
                target="units"
                visible={visibleColumns.units}
              />
              <SortableHeader
                align="right"
                column="margin"
                label="Marża zł (%)"
                onSort={() => sortBy('margin')}
                sortKey={sortKey}
                target="margin"
                visible={visibleColumns.margin}
              />
              <SortableHeader
                align="right"
                column="stock"
                label="Zapas (szt.)"
                onSort={() => sortBy('stock')}
                sortKey={sortKey}
                target="stock"
                visible={visibleColumns.stock}
              />
              <SortableHeader
                align="right"
                column="cover"
                label="DSI (Dni)"
                onSort={() => sortBy('cover')}
                sortKey={sortKey}
                target="cover"
                visible={visibleColumns.cover}
              />
              <th className={visibleColumns.abc ? 'pd-pbi-align-center' : 'pd-pbi-table-cell--hidden'}>ABC / XYZ</th>
              <th className={visibleColumns.status ? 'pd-pbi-align-center' : 'pd-pbi-table-cell--hidden'}>Status Ryzyka</th>
              <th className="pd-pbi-align-center">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((sku) => (
              <tr key={sku.id} onClick={() => onOpenSku(sku.id)}>
                <td className={visibleColumns.sku ? undefined : 'pd-pbi-table-cell--hidden'}>
                  <strong>{sku.name}</strong>
                  <span>{sku.id}</span>
                </td>
                <td>{sku.category}</td>
                <td className={visibleColumns.revenue ? 'pd-pbi-align-right pd-pbi-table-strong' : 'pd-pbi-table-cell--hidden'}>{formatMoney(sku.revenue)}</td>
                <td className={visibleColumns.units ? 'pd-pbi-align-right' : 'pd-pbi-table-cell--hidden'}>{sku.units.toLocaleString('pl-PL')} szt.</td>
                <td className={visibleColumns.margin ? 'pd-pbi-align-right' : 'pd-pbi-table-cell--hidden'}>
                  <strong className="pd-pbi-indigo-text">{formatMoney(sku.margin)}</strong>
                  <span>({sku.marginPct.toFixed(1)}%)</span>
                </td>
                <td className={visibleColumns.stock ? 'pd-pbi-align-right pd-pbi-table-strong' : 'pd-pbi-table-cell--hidden'}>{sku.available} szt.</td>
                <td className={visibleColumns.cover ? 'pd-pbi-align-right' : 'pd-pbi-table-cell--hidden'}>
                  <strong className={sku.dsi < sku.leadTime ? 'pd-pbi-danger-text' : undefined}>{sku.dsi.toLocaleString('pl-PL')} dni</strong>
                  <span>Lead: {sku.leadTime}d</span>
                </td>
                <td className={visibleColumns.abc ? 'pd-pbi-align-center' : 'pd-pbi-table-cell--hidden'}>
                  <span className={`pd-pbi-abc-badge pd-pbi-abc-badge--${sku.abc === 'A' ? 'primary' : 'muted'}`}>{sku.abc}{sku.xyz}</span>
                </td>
                <td className={visibleColumns.status ? 'pd-pbi-align-center' : 'pd-pbi-table-cell--hidden'}>
                  <ProductStatusBadge status={sku.status} text={sku.statusText} />
                </td>
                <td className="pd-pbi-align-center">
                  <button
                    className="pd-pbi-row-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenSku(sku.id);
                    }}
                    type="button"
                  >
                    Szczegóły
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="pd-pbi-table-footer">
        <span>
          Pokazano <strong>{filteredRows.length === 0 ? 0 : 1}</strong> - <strong>{filteredRows.length}</strong> z <strong>{productSkuDatabase.length}</strong> SKU (Filtry aktywne)
        </span>
        <div>
          <button disabled type="button">Poprzednia</button>
          <strong>1</strong>
          <button disabled type="button">Następna</button>
        </div>
      </footer>
    </ProductSectionFrame>
  );
}

function SortableHeader({
  align,
  column,
  label,
  onSort,
  sortKey,
  target,
  visible,
}: {
  readonly align?: 'right';
  readonly column: ProductExplorerColumn;
  readonly label: string;
  readonly onSort: () => void;
  readonly sortKey: ProductSortKey;
  readonly target: ProductSortKey;
  readonly visible: boolean;
}) {
  return (
    <th className={`${visible ? '' : 'pd-pbi-table-cell--hidden'} ${align === 'right' ? 'pd-pbi-align-right' : ''}`}>
      <button className="pd-pbi-table-sort" onClick={onSort} type="button">
        <span>{label}</span>
        <span aria-hidden="true">{sortKey === target ? '↕' : '⇅'}</span>
      </button>
      <span className="pd-pbi-sr-only">Kolumna {column}</span>
    </th>
  );
}

function ProductStatusBadge({
  status,
  text,
}: {
  readonly status: ProductStatus;
  readonly text: string;
}) {
  return (
    <span className={`pd-pbi-status-badge pd-pbi-status-badge--${status}`}>{text}</span>
  );
}

export function ProductAbcXyzMatrix({
  activeCode = null,
  onSelectCode = noop,
}: {
  readonly activeCode?: ProductMatrixCode | null;
  readonly onSelectCode?: (code: ProductMatrixCode) => void;
}) {
  const [tableMode, setTableMode] = useState(false);
  const section = productSectionsById.portfolio;

  return (
    <ProductSectionFrame
      actions={(
        <button className="pd-pbi-outline-button" onClick={() => setTableMode(!tableMode)} type="button">
          {tableMode ? 'Przełącz na wizualną macierz 3x3' : 'Przełącz na widok tabeli A11y'}
        </button>
      )}
      description={(
        <>
          <span className="pd-pbi-context-pill">Parieto Margin × temporal CV</span>
          <br />
          <strong>ABC:</strong> Skumulowany udział marży brutto (A: top 80%, B: 80-95%, C: pozostałe 5%).
          <strong> XYZ:</strong> Zmienność popytu CV (X: CV ≤ 0.5 stabilny, Y: 0.5-1.0, Z: &gt;1.0 niestabilny).
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      {tableMode ? (
        <div className="pd-pbi-table-scroll">
          <table className="pd-pbi-simple-table">
            <caption>Tabela Dostępności (A11y) — Podsumowanie Segmentów ABC/XYZ</caption>
            <thead>
              <tr>
                <th>Segment</th>
                <th>Liczba SKU</th>
                <th>% Udział Marży</th>
                <th>Przeznaczenie Biznesowe</th>
              </tr>
            </thead>
            <tbody>
              {productAccessibleMatrixRows.map((row) => (
                <tr key={row.code}>
                  <td><strong>{row.code}</strong></td>
                  <td>{row.count}</td>
                  <td>{row.margin}</td>
                  <td>{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="pd-pbi-matrix">
          <div className="pd-pbi-matrix__axis">
            {productMatrixRows.map((row) => (
              <article className={`pd-pbi-matrix-axis-card pd-pbi-matrix-axis-card--${row.tone}`} key={row.title}>
                <strong>{row.title}</strong>
                <p>{row.description}</p>
              </article>
            ))}
          </div>
          <div className="pd-pbi-matrix__grid">
            <div className="pd-pbi-matrix__header">X (Stabilny: CV ≤ 0.5)</div>
            <div className="pd-pbi-matrix__header">Y (Zmienny: 0.5 &lt; CV ≤ 1.0)</div>
            <div className="pd-pbi-matrix__header">Z (Niestabilny: CV &gt; 1.0)</div>
            {productMatrixCells.map((cell) => (
              <button
                className={`pd-pbi-matrix-cell pd-pbi-matrix-cell--${cell.tone} pd-pbi-matrix-cell--${cell.weight} ${activeCode === cell.code ? 'pd-pbi-matrix-cell--active' : ''}`}
                key={cell.code}
                onClick={() => onSelectCode(cell.code)}
                type="button"
              >
                <span>
                  <strong>{cell.code}</strong>
                  <small>{cell.label}</small>
                </span>
                <span>
                  <strong>{cell.count}</strong>
                  <small>{cell.margin}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </ProductSectionFrame>
  );
}

export function ProductInventoryCapital({
  onShowDeadStock = noop,
}: {
  readonly onShowDeadStock?: () => void;
}) {
  const section = productSectionsById.zapasy;

  return (
    <ProductSectionFrame
      description="Czy właściwie wykorzystujemy zapas i kapitał?"
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
    <div className="pd-pbi-two-col">
      <article className="pd-pbi-panel">
        <div className="pd-pbi-heading-row pd-pbi-heading-row--spread">
          <h2>Analiza Horyzontu Zapasy vs Lead Time</h2>
          <span>Risk Horizon Calculation</span>
        </div>
        <p className="pd-pbi-section-copy">
          Ryzyko braku towaru występuje, gdy <strong>Pokrycie Zapachu (DSI) &lt; Lead Time Dostawcy + Zapas Bezpieczeństwa</strong>.
        </p>

        <div className="pd-pbi-risk-list">
          {productInventoryRisks.map((item) => (
            <article className={`pd-pbi-risk-card pd-pbi-risk-card--${item.tone}`} key={item.sku}>
              <div>
                <strong>{item.name} ({item.sku})</strong>
                <span>DSI: {item.dsi} | Lead Time: {item.leadTime}</span>
              </div>
              <div className="pd-pbi-progress">
                <span style={{ width: `${item.progress}%` }} />
              </div>
              <footer>
                <span>Zapas dostępny: {item.stock}</span>
                <span>{item.recommendation}</span>
              </footer>
            </article>
          ))}
        </div>
        <p className="pd-pbi-footnote">* Lead Time pobierany ze snapshotów FactInventorySnapshot.</p>
      </article>

      <article className="pd-pbi-panel">
        <div className="pd-pbi-heading-row pd-pbi-heading-row--spread">
          <h2>Zamrożony Kapitał & Wydajność (GMROI)</h2>
          <span>Standardowe Metryki Finansowe</span>
        </div>

        <div className="pd-pbi-finance-grid">
          {productFinancialMetrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.helper}</small>
            </article>
          ))}
        </div>

        <div className="pd-pbi-deadstock-alert">
          <div>
            <strong>
              <Icon decorative name="warning" size={16} />
              {productDeadStockAlert.title}
            </strong>
            <span>{productDeadStockAlert.count}</span>
          </div>
          <h3>{productDeadStockAlert.value}</h3>
          <p>{productDeadStockAlert.description}</p>
        </div>

        <button className="pd-pbi-outline-button pd-pbi-full-button" onClick={onShowDeadStock} type="button">
          Wyświetl listę Dead Stock w Explorerze
        </button>
      </article>
    </div>
    </ProductSectionFrame>
  );
}

/**
 * "Promocje i koszyk": combines the promotions/offer economics table with
 * the basket cross-sell analysis into one section frame -- kept apart from
 * the bundle what-if simulator, which is its own section because it is a
 * decision tool, not just analysis.
 */
export function ProductPromotionsAndBasket() {
  const section = productSectionsById.promocje;

  return (
    <ProductSectionFrame
      description="Rozdzielenie aktywnego katalogu ofert od zrealizowanej sprzedaży promocyjnej oraz analiza koszykowa i rekomendacje cross-sell."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <article className="pd-pbi-panel">
        <div className="pd-pbi-heading-row pd-pbi-heading-row--spread">
          <h2>Promocje i Ekonomika Oferty</h2>
          <span>Katalog vs Realizacje</span>
        </div>

      <div className="pd-pbi-table-scroll">
        <table className="pd-pbi-simple-table">
          <thead>
            <tr>
              <th>Produkt / Oferta</th>
              <th>Cena Reg.</th>
              <th>Cena Promo</th>
              <th>Rabat %</th>
              <th className="pd-pbi-align-right">Sprzedane Szt.</th>
              <th className="pd-pbi-align-right">Przychód Promo</th>
              <th className="pd-pbi-align-right">Marża Po Rabacie</th>
              <th className="pd-pbi-align-center">Status Ekonomiki</th>
            </tr>
          </thead>
          <tbody>
            {productPromotions.map((promotion) => (
              <tr key={promotion.product}>
                <td><strong>{promotion.product}</strong></td>
                <td>{promotion.regularPrice}</td>
                <td><strong>{promotion.promoPrice}</strong></td>
                <td className="pd-pbi-danger-text"><strong>{promotion.discount}</strong></td>
                <td className="pd-pbi-align-right">{promotion.units}</td>
                <td className="pd-pbi-align-right">{promotion.revenue}</td>
                <td className={`pd-pbi-align-right pd-pbi-${promotion.tone}-text`}><strong>{promotion.margin}</strong></td>
                <td className="pd-pbi-align-center">
                  <span className={`pd-pbi-status-badge pd-pbi-status-badge--${promotion.tone}`}>{promotion.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </article>

      <article className="pd-pbi-panel">
        <div className="pd-pbi-heading-row pd-pbi-heading-row--spread">
          <h2>Analiza Koszykowa (Cross-Sell)</h2>
          <span>Prawidłowe Wzory MBA</span>
        </div>
        <p className="pd-pbi-section-copy">Metryki wyliczone na pełnej bazie zamówień: Support, Confidence oraz Lift.</p>

        <div className="pd-pbi-basket-card">
          <div>
            <strong>{productBasketInsight.title}</strong>
            <span>{productBasketInsight.badge}</span>
          </div>
          <div className="pd-pbi-basket-stats">
            <MetricTile label="Wspólne Zamówienia" value={productBasketInsight.sharedOrders} />
            <MetricTile label="Support (A+B)" value={productBasketInsight.support} />
            <MetricTile label="Confidence (A→B)" value={productBasketInsight.confidence} />
          </div>
          <p>{productBasketInsight.description}</p>
        </div>

        <p className="pd-pbi-footnote">{productBasketInsight.formula}</p>
      </article>
    </ProductSectionFrame>
  );
}

/**
 * "Symulator zestawów": kept as its own section, separate from Promocje i
 * koszyk, because it is a decision tool (interactive what-if simulator),
 * not just analysis.
 */
export function ProductBundleSimulator() {
  const [discount, setDiscount] = useState<number>(productBundleScenario.defaultDiscount);
  const finalPrice = productBundleScenario.basePrice * (1 - discount / 100);
  const unitMargin = finalPrice - productBundleScenario.baseCogs;
  const marginPct = (unitMargin / finalPrice) * 100;
  const breakEven = discount * 1.25;
  const section = productSectionsById.zestawy;

  return (
    <ProductSectionFrame
      description="Przeanalizuj marżową opłacalność połączenia dwóch SKU w pakiet promocyjny."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <label className="pd-pbi-range">
        <span>Rabat na zestaw bundle (%): <strong>{discount}%</strong></span>
        <input
          max={30}
          min={0}
          onChange={(event) => setDiscount(Number(event.target.value))}
          type="range"
          value={discount}
        />
      </label>

      <div className="pd-pbi-sim-grid">
        <MetricTile label="Cena regularna sumaryczna:" value={formatDecimalMoney(productBundleScenario.basePrice)} />
        <MetricTile label="Cena pakietu po rabacie:" value={formatDecimalMoney(finalPrice)} />
        <MetricTile label="Marża jednostkowa pakietu:" value={`${formatDecimalMoney(unitMargin)} (${marginPct.toFixed(1)}%)`} tone="emerald" />
        <MetricTile label="Wymagany przyrost attach rate:" value={`+${breakEven.toFixed(1)}% wolumenu`} tone="amber" />
      </div>

      <p className="pd-pbi-footnote">* Symulacja zakłada stałe koszty własne COGS obu produktów. Wylicza punkt rentowności (break-even attach rate).</p>
    </ProductSectionFrame>
  );
}

function MetricTile({
  label,
  tone = 'slate',
  value,
}: {
  readonly label: string;
  readonly tone?: ProductsTone;
  readonly value: string;
}) {
  return (
    <article className="pd-pbi-metric-tile">
      <span>{label}</span>
      <strong className={`pd-pbi-${tone}-text`}>{value}</strong>
    </article>
  );
}

export function ProductLifecyclePortfolio() {
  const section = productSectionsById.cykl;

  return (
    <ProductSectionFrame
      description={(
        <>
          <span className="pd-pbi-context-pill">Real Daily aggregated trend</span>
          <br />
          Klasyfikacja oparta o historyczną trajektorię wolumenu i marży (Intro, Growth, Maturity, Decline).
        </>
      )}
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-pbi-lifecycle-grid">
        {productLifecycleCards.map((card) => (
          <article className={`pd-pbi-lifecycle-card pd-pbi-lifecycle-card--${card.tone}`} key={card.stage}>
            <div>
              <strong>{card.stage}</strong>
              <span>{card.count}</span>
            </div>
            <p>{card.description}</p>
            <strong>{card.product}</strong>
          </article>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

export function ProductAiInsightAudit() {
  const section = productSectionsById.insight;

  return (
    <ProductSectionFrame
      actions={<div className="pd-pbi-ai-mark">P</div>}
      description="Każda rekomendacja AI opiera się na 7-stopniowym standardzie przejrzystości."
      icon={section.icon}
      id={section.id}
      title={section.title}
    >
      <div className="pd-pbi-ai-grid">
        {productInsightAuditSteps.map((step) => (
          <article key={step.label}>
            <strong>{step.label}</strong>
            <span>{step.value}</span>
          </article>
        ))}
      </div>
    </ProductSectionFrame>
  );
}

function ProductProvenanceModal({
  metricKey,
  onClose,
}: {
  readonly metricKey: ProductsProvenanceKey | null;
  readonly onClose: () => void;
}) {
  if (!metricKey) return null;

  const provenance = productsProvenanceDict[metricKey];

  return (
    <div className="pd-pbi-modal-backdrop" role="presentation">
      <section aria-label="Provenance danych produktów" aria-modal="true" className="pd-pbi-modal" role="dialog">
        <div className="pd-pbi-modal__head">
          <div>
            <span className={`pd-pbi-data-badge pd-pbi-data-badge--${dataBadgeTone(provenance.badge)}`}>{provenance.badge}</span>
            <h2>{provenance.title}</h2>
          </div>
          <button aria-label="Zamknij provenance" className="pd-pbi-icon-button" onClick={onClose} type="button">×</button>
        </div>
        <dl className="pd-pbi-definition-list">
          <div>
            <dt>Źródło</dt>
            <dd>{provenance.source}</dd>
          </div>
          <div>
            <dt>Pokrycie</dt>
            <dd>{provenance.coverage}</dd>
          </div>
          <div>
            <dt>Uwagi</dt>
            <dd>{provenance.notes}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function ProductSkuDrawer({
  onClose,
  sku,
}: {
  readonly onClose: () => void;
  readonly sku: ProductSku | null;
}) {
  if (!sku) return null;

  return (
    <div className="pd-pbi-drawer-backdrop" role="presentation">
      <section aria-label="SKU Detail Drawer" aria-modal="true" className="pd-pbi-drawer" role="dialog">
        <div className="pd-pbi-drawer__head">
          <div>
            <div className="pd-pbi-inline-pills">
              <span className="pd-pbi-mono-pill">{sku.id}</span>
              <span className="pd-pbi-abc-badge pd-pbi-abc-badge--primary">Klasa {sku.abc}{sku.xyz}</span>
            </div>
            <h2>{sku.name}</h2>
          </div>
          <button aria-label="Zamknij szczegóły SKU" className="pd-pbi-icon-button pd-pbi-icon-button--dark" onClick={onClose} type="button">×</button>
        </div>

        <div className="pd-pbi-drawer__body">
          <div className="pd-pbi-drawer-metrics">
            <MetricTile label="Sprzedaż 30d" value={formatMoney(sku.revenue)} />
            <MetricTile label="Marża Brutto" value={`${formatMoney(sku.margin)} (${sku.marginPct}%)`} tone="indigo" />
            <MetricTile label="Dostępny Zapas" value={`${sku.available} szt.`} />
          </div>

          <article className="pd-pbi-drawer-card">
            <h3>Historia Ceny Sprzedaży & Rabatu</h3>
            <div className="pd-pbi-drawer-chart" role="img" aria-label="Historia ceny sprzedaży i rabatu">
              <ResponsiveContainer height="100%" width="100%">
                <RechartsLineChart data={productDrawerPriceHistory} margin={{ bottom: 0, left: -8, right: 8, top: 8 }}>
                  <CartesianGrid stroke="rgb(var(--pd-pbi-slate-200))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: chartColors.slate, fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fill: chartColors.slate, fontSize: 10 }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgb(var(--pd-pbi-slate-900))',
                      border: '0',
                      borderRadius: 10,
                      color: 'white',
                      fontSize: 12,
                    }}
                  />
                  <Line dataKey="regular" name="Cena Regularna (zł)" stroke={chartColors.slate} strokeDasharray="4 4" strokeWidth={2} dot={false} type="monotone" />
                  <Line dataKey="effective" name="Cena Effektywna (zł)" stroke={chartColors.indigo} strokeWidth={3} dot={{ r: 3 }} type="monotone" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="pd-pbi-drawer-card">
            <h3>Pochodzenie Metryk (Data Provenance)</h3>
            <table className="pd-pbi-simple-table">
              <tbody>
                <tr>
                  <td><strong>FactOrderLine</strong></td>
                  <td>Observed (Direct Fact)</td>
                </tr>
                <tr>
                  <td><strong>FactInventorySnapshot</strong></td>
                  <td>Snapshot 27.08.2026, 22:04</td>
                </tr>
                <tr>
                  <td><strong>Stockout Forecast</strong></td>
                  <td>Model Forecast (Trailing Demand)</td>
                </tr>
              </tbody>
            </table>
          </article>
        </div>

        <footer className="pd-pbi-drawer__footer">
          <button className="pd-pbi-dark-button" onClick={onClose} type="button">
            Zamknij Szczegóły
          </button>
        </footer>
      </section>
    </div>
  );
}

function ProductPapaModal({
  onClose,
  topic,
}: {
  readonly onClose: () => void;
  readonly topic: string | null;
}) {
  if (!topic) return null;

  return (
    <div className="pd-pbi-modal-backdrop" role="presentation">
      <section aria-label="Papa AI dla Produktów" aria-modal="true" className="pd-pbi-modal" role="dialog">
        <div className="pd-pbi-modal__head">
          <div>
            <span className="pd-pbi-data-badge pd-pbi-data-badge--indigo">Papa AI</span>
            <h2>Analiza planu dostaw z Papa AI</h2>
          </div>
          <button aria-label="Zamknij Papa AI" className="pd-pbi-icon-button" onClick={onClose} type="button">×</button>
        </div>
        <p className="pd-pbi-modal-copy">
          Kontekst: {topic}. Papa porównuje ryzyko stockoutu, marżę brutto, lead time dostawcy i aktywne promocje dla SKU klasy AX.
        </p>
        <div className="pd-pbi-modal-actions">
          <button className="pd-pbi-primary-button" onClick={onClose} type="button">
            Utwórz rekomendację operacyjną
          </button>
        </div>
      </section>
    </div>
  );
}


function buildTrendData(mode: ProductTrendMode) {
  return productTrendLabels.map((label, index) => ({
    label,
    margin: productTrendSeries.margin[index],
    selected: productTrendSeries[mode][index],
  }));
}

function filterProducts({
  filters,
  matrixCode,
  query,
}: {
  readonly filters: ProductFilterState;
  readonly matrixCode: ProductMatrixCode | null;
  readonly query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return productSkuDatabase.filter((sku) => {
    if (filters.category !== 'all' && sku.category !== filters.category) return false;
    if (filters.abc !== 'all' && sku.abc !== filters.abc) return false;
    if (filters.stockStatus !== 'all' && sku.status !== filters.stockStatus) return false;
    if (matrixCode && `${sku.abc}${sku.xyz}` !== matrixCode) return false;
    if (!normalizedQuery) return true;

    return sku.name.toLowerCase().includes(normalizedQuery)
      || sku.id.toLowerCase().includes(normalizedQuery);
  });
}

function getSortableValue(sku: ProductSku, key: ProductSortKey) {
  switch (key) {
    case 'cover':
      return sku.dsi;
    case 'margin':
      return sku.margin;
    case 'name':
      return sku.name;
    case 'revenue':
      return sku.revenue;
    case 'stock':
      return sku.available;
    case 'units':
      return sku.units;
  }
}

function dataBadgeTone(badge: string): ProductsTone {
  switch (badge) {
    case 'Pomiar':
      return 'emerald';
    case 'Snapshot':
      return 'blue';
    case 'Prognoza':
      return 'amber';
    case 'Wyliczone':
      return 'indigo';
    default:
      return 'slate';
  }
}

function formatMoney(value: number) {
  return `${value.toLocaleString('pl-PL')} zł`;
}

function formatDecimalMoney(value: number) {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value) + ' zł';
}

function formatCompactNumber(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

function formatTrendValue(value: number, mode: ProductTrendMode, name: string) {
  if (mode === 'units' && !name.includes('Marża')) return `${value.toLocaleString('pl-PL')} szt.`;
  return formatMoney(value);
}
