import { overviewShortDate } from '../command-center/CommandCenterScreen.data';
import { useId, useState } from 'react';
import { useProductLocale } from '../shared/useProductLocale';
import { Button, ExplorerTable, MetricCard } from '../../design-system';
import type { ExplorerTableColumn } from '../../design-system';
import {
  calculateProductBundle,
  filterProductRows,
  productFilterLabels,
  productMoney,
  productNumber,
} from './ProductAnalysis.data';
import type { ProductAnalysis, ProductFilter, ProductResult } from './ProductAnalysis.data';
import { productCategories, productLifecycleLabels } from './ProductsScreen.data';

export const inventoryStatus = (row: ProductResult) =>
  row.status === 'risk'
    ? 'Ryzyko braku'
    : row.status === 'excess'
      ? 'Ponad 90 dni zapasu'
      : row.status === 'unknown'
        ? 'Brak pełnej oceny'
        : 'Zapas wystarcza na dostawę';
export type ProductDetail = { kind: 'sku'; id: string } | { kind: 'definitions' } | null;

export function ProductMetricStrip({
  analysis,
  onDetail,
}: {
  readonly analysis: ProductAnalysis;
  readonly onDetail: (detail: ProductDetail) => void;
}) {
  return (
    <section className="pd-product-analysis__metrics" aria-label="Zyskowność produktów">
      {[
        {
          id: 'sales',
          label: 'Sprzedaż netto',
          value: productMoney(analysis.revenue),
          note: 'Suma sprzedaży produktów w zakresie',
        },
        {
          id: 'margin',
          label: 'Marża z rozliczonym kosztem',
          value: productMoney(analysis.knownMargin),
          note: 'Sprzedaż minus znany koszt produktów',
        },
        {
          id: 'coverage',
          label: 'Pokrycie kosztów',
          value:
            analysis.costCoverage === null ? '—' : `${productNumber(analysis.costCoverage, 1)}%`,
          note: 'Udział sprzedaży z pełnym kosztem',
        },
        {
          id: 'units',
          label: 'Sprzedane sztuki',
          value: productNumber(analysis.units),
          note: `${analysis.rows.length} SKU w wybranym zakresie`,
        },
      ].map((item) => (
        <MetricCard
          key={item.id}
          metricId={`products-${item.id}`}
          label={item.label}
          value={item.value}
          status="ready"
          statusLabel=""
          depth="flat"
          signal="neutral"
          helpText={item.note}
          detailAction={{
            label: 'Definicja i źródło',
            onAction: () => onDetail({ kind: 'definitions' }),
          }}
        />
      ))}
    </section>
  );
}

export function ProductContribution({
  analysis,
  onDetail,
}: {
  readonly analysis: ProductAnalysis;
  readonly onDetail: (detail: ProductDetail) => void;
}) {
  const leaders = [...analysis.rows]
    .filter((row) => row.margin !== null)
    .sort((a, b) => (b.margin ?? -Infinity) - (a.margin ?? -Infinity))
    .slice(0, 5);
  const max = Math.max(1, ...leaders.map((row) => Math.abs(row.margin ?? 0)));
  const missing = analysis.rows.filter((row) => row.cogs === null);
  const { locale } = useProductLocale();
  return (
    <div className="pd-product-analysis__split">
      <section
        className="pd-product-analysis__contribution"
        aria-labelledby="product-contribution-title"
      >
        <h2 id="product-contribution-title">Co buduje marżę</h2>
        <p>Do pięciu SKU z najwyższą rozliczoną marżą. Bez kosztów marketingu i realizacji.</p>
        {!leaders.length && <p>Brak produktów z rozliczoną marżą w tym zakresie.</p>}
        <ol>
          {leaders.map((row, index) => (
            <li key={row.id}>
              <button
                type="button"
                className="pd-product-analysis__contribution-row"
                onClick={() => onDetail({ kind: 'sku', id: row.id })}
              >
                <span className="pd-product-analysis__rank" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="pd-product-analysis__contribution-name">
                  {row.name}
                  <small>{row.id}</small>
                </span>
                <strong data-tone={row.margin !== null && row.margin < 0 ? 'danger' : undefined}>
                  {productMoney(row.margin)}
                </strong>
                <span className="pd-product-analysis__bar" aria-hidden="true">
                  <span style={{ width: `${(Math.abs(row.margin ?? 0) / max) * 100}%` }} />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
      <aside className="pd-product-analysis__attention">
        <h2>Przed decyzją</h2>
        <article>
          <h3>Kompletność kosztów</h3>
          <p>
            {missing.length
              ? `${missing.length} SKU nie ma pełnego kosztu. Ich marża pozostaje niedostępna.`
              : 'Koszty wszystkich produktów w zakresie są kompletne.'}
          </p>
          {missing[0] && (
            <Button
              variant="secondary"
              size="small"
              onClick={() => onDetail({ kind: 'sku', id: missing[0].id })}
            >
              Sprawdź brak kosztu
            </Button>
          )}
        </article>
        <article>
          <h3>Dostępność towaru</h3>
          <p>
            Ocena zapasu pochodzi ze stanu na {overviewShortDate(analysis.inventoryDate, locale)} i popytu z
            poprzednich 30 dni. Nie jest prognozą przyszłej sprzedaży.
          </p>
          <Button variant="ghost" size="small" onClick={() => onDetail({ kind: 'definitions' })}>
            Jak czytać wskaźniki
          </Button>
        </article>
      </aside>
    </div>
  );
}

export function ProductTable({
  rows,
  filter,
  onFilter,
  onDetail,
  rangeLabel,
  inventory = false,
  inventoryDate,
}: {
  readonly rows: readonly ProductResult[];
  readonly filter: ProductFilter;
  readonly onFilter: (filter: ProductFilter) => void;
  readonly onDetail: (detail: ProductDetail) => void;
  readonly rangeLabel: string;
  readonly inventory?: boolean;
  readonly inventoryDate: string;
}) {
  const columns: readonly ExplorerTableColumn<ProductResult>[] = [
    {
      id: 'product',
      label: 'Produkt / SKU',
      required: true,
      width: 240,
      sortAccessor: (row) => row.name,
      csvValue: (row) => `${row.name} (${row.id})`,
      render: (row) => (
        <button
          className="pd-product-analysis__product-link"
          type="button"
          onClick={() => onDetail({ kind: 'sku', id: row.id })}
        >
          {row.name}
          <small>
            {row.id} · {productCategories[row.category]}
          </small>
        </button>
      ),
    },
    {
      id: 'revenue',
      label: 'Sprzedaż netto',
      align: 'right',
      defaultVisible: !inventory,
      sortAccessor: (row) => row.revenue,
      csvValue: (row) => row.revenue,
      render: (row) => productMoney(row.revenue),
    },
    {
      id: 'cost',
      label: 'Koszt produktów',
      align: 'right',
      defaultVisible: false,
      sortAccessor: (row) => row.cogs ?? -Infinity,
      csvValue: (row) => row.cogs ?? 'Brak kosztu',
      render: (row) => productMoney(row.cogs),
    },
    {
      id: 'margin',
      label: 'Marża na produktach',
      align: 'right',
      defaultVisible: !inventory,
      sortAccessor: (row) => row.margin ?? -Infinity,
      csvValue: (row) => row.margin ?? 'Brak pełnego kosztu',
      render: (row) =>
        row.margin === null ? (
          <span data-tone="warning">Brak pełnego kosztu</span>
        ) : (
          <span data-tone={row.margin < 0 ? 'danger' : undefined}>
            {productMoney(row.margin)}
            <small>{productNumber(row.marginPct, 1)}%</small>
          </span>
        ),
    },
    {
      id: 'units',
      label: 'Sprzedane szt.',
      align: 'right',
      defaultVisible: false,
      sortAccessor: (row) => row.units,
      csvValue: (row) => row.units,
      render: (row) => productNumber(row.units),
    },
    {
      id: 'available',
      label: 'Dostępne szt.',
      align: 'right',
      sortAccessor: (row) => row.available ?? -1,
      csvValue: (row) => row.available ?? 'Brak stanu',
      render: (row) => productNumber(row.available),
    },
    {
      id: 'coverage',
      label: 'Pokrycie zapasu',
      align: 'right',
      sortAccessor: (row) => row.coverage ?? -1,
      csvValue: (row) => (row.coverage === null ? 'Brak oceny' : productNumber(row.coverage, 1)),
      render: (row) => (
        <span data-tone={row.status === 'risk' ? 'danger' : undefined}>
          {row.coverage === null ? '—' : `${productNumber(row.coverage, 1)} dni`}
        </span>
      ),
    },
    {
      id: 'leadTime',
      label: 'Czas dostawy',
      align: 'right',
      defaultVisible: inventory,
      csvValue: (row) => row.leadTime ?? 'Brak',
      render: (row) => (row.leadTime === null ? '—' : `${row.leadTime} dni`),
    },
    {
      id: 'capital',
      label: 'Wartość dostępnego zapasu',
      align: 'right',
      defaultVisible: inventory,
      sortAccessor: (row) => row.capital ?? -1,
      csvValue: (row) => row.capital ?? 'Brak kosztu jednostkowego',
      render: (row) => productMoney(row.capital),
    },
    {
      id: 'class',
      label: 'ABC/XYZ',
      defaultVisible: !inventory,
      csvValue: (row) => (row.abc && row.xyz ? `${row.abc}${row.xyz}` : 'Brak klasyfikacji'),
      render: (row) => (row.abc && row.xyz ? `${row.abc}${row.xyz}` : '—'),
    },
  ];
  const filters = inventory
    ? (['all', 'stock_risk', 'excess_stock'] as const)
    : (Object.keys(productFilterLabels) as ProductFilter[]);
  return (
    <section className="pd-product-analysis__table" aria-labelledby="product-table-title">
      <div className="pd-product-analysis__section-heading">
        <div>
          <h2 id="product-table-title">
            {inventory ? 'Zapas według SKU' : 'Produkty w wybranym zakresie'}
          </h2>
          <p>
            {inventory ? `Stan magazynu na ${inventoryDate} · średni popyt z 30 dni` : rangeLabel}
          </p>
        </div>
      </div>
      <div className="pd-product-analysis__filters" role="group" aria-label="Filtry produktów">
        {filters.map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => onFilter(value)}
          >
            {productFilterLabels[value]} <span>{filterProductRows(rows, value).length}</span>
          </button>
        ))}
      </div>
      <ExplorerTable
        key={inventory ? 'inventory' : 'sales'}
        ariaLabel={inventory ? 'Tabela zapasów' : 'Tabela produktów'}
        columns={columns}
        rows={filterProductRows(rows, filter)}
        searchLabel="Szukaj produktu lub SKU"
        searchPlaceholder="Nazwa produktu lub SKU…"
        searchText={(row) => `${row.name} ${row.id} ${row.brand}`}
        exportFilenameBase={`produkty-${inventory ? `stan-${inventoryDate}` : rangeLabel}`}
        emptyMessage="Brak produktów dla tego filtra i wyszukiwania."
        onRowClick={(row) => onDetail({ kind: 'sku', id: row.id })}
      />
    </section>
  );
}

export function ProductInventoryOverview({
  analysis,
  onDetail,
}: {
  readonly analysis: ProductAnalysis;
  readonly onDetail: (detail: ProductDetail) => void;
}) {
  const risks = analysis.inventoryRows
    .filter((row) => row.status === 'risk')
    .sort((a, b) => (a.coverage ?? Infinity) - (b.coverage ?? Infinity));
  const known = analysis.inventoryRows.filter((row) => row.capital !== null);
  return (
    <section className="pd-product-analysis__inventory">
      <h2>Zapasy i kapitał</h2>
      <p>
        Dostępne sztuki = stan magazynu minus rezerwacje. Pokrycie = dostępne sztuki / średnia
        dzienna sprzedaż z 30 dni.
      </p>
      <div className="pd-product-analysis__inventory-summary">
        <div>
          <span>Ryzyko braku przed dostawą</span>
          <strong>{risks.length} SKU</strong>
        </div>
        <div>
          <span>Szacowana wartość dostępnego zapasu</span>
          <strong>
            {productMoney(known.length ? known.reduce((sum, row) => sum + row.capital!, 0) : null)}
          </strong>
          <small>
            Koszt jednostkowy znany dla {known.length} z {analysis.inventoryRows.length} SKU.
          </small>
        </div>
      </div>
      <div className="pd-product-analysis__risk-list">
        {risks.slice(0, 3).map((row) => (
          <article key={row.id}>
            <div>
              <h3>{row.name}</h3>
              <p>
                Dostępne: {productNumber(row.available)} szt. · pokrycie{' '}
                <strong data-tone="danger">{productNumber(row.coverage, 1)} dni</strong> · dostawa{' '}
                {row.leadTime} dni
              </p>
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={() => onDetail({ kind: 'sku', id: row.id })}
            >
              Sprawdź {row.id}
            </Button>
          </article>
        ))}
      </div>
      {!risks.length && (
        <p>
          Brak rozpoznanego ryzyka w tym zakresie kategorii. SKU bez pełnych danych pozostają bez
          oceny.
        </p>
      )}
    </section>
  );
}

export function ProductPortfolio({
  analysis,
  selected,
  onSelect,
}: {
  readonly analysis: ProductAnalysis;
  readonly selected: string | null;
  readonly onSelect: (code: string | null) => void;
}) {
  return (
    <section className="pd-product-analysis__portfolio">
      <h2>Asortyment ABC/XYZ</h2>
      <p>
        ABC: udział w dodatniej marży w wybranym okresie i kategorii (progi 80% i 95%). XYZ:
        zmienność dziennej sprzedaży; wymagane co najmniej 14 pełnych dni. Brak kosztu wyklucza
        klasyfikację ABC.
      </p>
      <div className="pd-product-analysis__matrix" role="group" aria-label="Segmenty ABC i XYZ">
        {analysis.matrix.map((cell) => (
          <button
            key={cell.code}
            type="button"
            aria-pressed={selected === cell.code}
            onClick={() => onSelect(selected === cell.code ? null : cell.code)}
          >
            <strong>{cell.code}</strong>
            <span>{cell.count} SKU</span>
            <small>{productMoney(cell.margin)} marży</small>
          </button>
        ))}
      </div>
      <div className="pd-product-analysis__filters">
        <Button
          size="small"
          variant="secondary"
          aria-pressed={selected === 'unclassified'}
          onClick={() => onSelect(selected === 'unclassified' ? null : 'unclassified')}
        >
          Bez klasyfikacji · {analysis.unclassified}
        </Button>
        {selected && (
          <Button variant="ghost" size="small" onClick={() => onSelect(null)}>
            Wyczyść segment
          </Button>
        )}
      </div>
      <details>
        <summary>Pokaż wartości i zasady klasyfikacji</summary>
        <div
          className="pd-product-analysis__values"
          role="region"
          aria-label="Wartości segmentów ABC/XYZ"
          tabIndex={0}
        >
          <table>
            <caption>Segmenty z tej samej tabeli produktów</caption>
            <thead>
              <tr>
                <th>Segment</th>
                <th>SKU</th>
                <th>Marża</th>
              </tr>
            </thead>
            <tbody>
              {analysis.matrix.map((cell) => (
                <tr key={cell.code}>
                  <th scope="row">{cell.code}</th>
                  <td>{cell.count}</td>
                  <td>{productMoney(cell.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          ABC sortuje dodatnią marżę malejąco; produkt przekraczający próg należy do klasy, w której
          zaczyna swój udział. XYZ: X ≤ 0,5; Y ≤ 1; Z &gt; 1 współczynnika zmienności. Brak
          sprzedaży, kosztu lub historii oznacza brak klasyfikacji.
        </p>
      </details>
    </section>
  );
}

export function ProductBundleSimulator({ rows }: { readonly rows: readonly ProductResult[] }) {
  const id = useId();
  const [first, setFirst] = useState(rows[0]?.id ?? '');
  const [second, setSecond] = useState(rows[1]?.id ?? '');
  const [discount, setDiscount] = useState(10);
  const selected = rows.filter((row) => row.id === first || row.id === second);
  const result = calculateProductBundle(selected, discount);
  return (
    <section className="pd-product-analysis__bundle">
      <h2>Symulator zestawów</h2>
      <p>
        Po jednej sztuce dwóch produktów. Bazą są średnie ceny sprzedaży netto i koszty jednostkowe
        z wybranego okresu.
      </p>
      <div className="pd-product-analysis__bundle-pickers">
        {[first, second].map((value, index) => (
          <label key={index} htmlFor={`${id}-product-${index}`}>
            Produkt {index + 1}
            <select
              id={`${id}-product-${index}`}
              value={value}
              onChange={(event) =>
                index === 0 ? setFirst(event.target.value) : setSecond(event.target.value)
              }
            >
              <option value="">Wybierz produkt</option>
              {rows.map((row) => (
                <option value={row.id} key={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="pd-product-analysis__slider-label" htmlFor={`${id}-discount`}>
        Rabat na zestaw: <strong>{discount}%</strong>
      </label>
      <input
        id={`${id}-discount`}
        aria-label="Rabat na zestaw"
        type="range"
        min={0}
        max={40}
        step={1}
        value={discount}
        onChange={(event) => setDiscount(Number(event.target.value))}
      />
      {result ? (
        <dl className="pd-product-analysis__scenario" aria-live="polite">
          <div>
            <dt>Cena bazowa netto</dt>
            <dd>{productMoney(result.basePrice, 2)}</dd>
          </div>
          <div>
            <dt>Cena po rabacie netto</dt>
            <dd>{productMoney(result.price, 2)}</dd>
          </div>
          <div>
            <dt>Koszt produktów</dt>
            <dd>{productMoney(result.cost, 2)}</dd>
          </div>
          <div>
            <dt>Marża na zestawie</dt>
            <dd data-tone={result.margin < 0 ? 'danger' : undefined}>
              {productMoney(result.margin, 2)} · {productNumber(result.marginPct, 1)}%
            </dd>
          </div>
        </dl>
      ) : (
        <p role="status">
          Wybierz dwa różne produkty z pełną historią sprzedaży i kosztów w tym okresie.
        </p>
      )}
      <p className="pd-product-analysis__note">
        Wariant nie uwzględnia kosztów marketingu, płatności i dostawy. Nie przewiduje popytu ani
        nie zmienia cen w sklepie.
      </p>
    </section>
  );
}

export function ProductLifecycle({
  analysis,
  onDetail,
}: {
  readonly analysis: ProductAnalysis;
  readonly onDetail: (detail: ProductDetail) => void;
}) {
  return (
    <section>
      <h2>Cykl życia produktów</h2>
      <p>
        Etapy zapisane w przykładowym katalogu. Liczebności i sprzedaż dotyczą produktów z wybranego
        zakresu; same etapy nie są wyliczoną dynamiką tego okresu.
      </p>
      <div className="pd-product-analysis__lifecycle">
        {(Object.keys(productLifecycleLabels) as (keyof typeof productLifecycleLabels)[]).map(
          (stage) => {
            const rows = analysis.rows.filter((row) => row.lifecycle === stage);
            return (
              <article key={stage}>
                <h3>{productLifecycleLabels[stage]}</h3>
                <strong>{rows.length} SKU</strong>
                <p>
                  {productMoney(rows.reduce((sum, row) => sum + row.revenue, 0))} sprzedaży netto
                </p>
                {rows.map((row) => (
                  <button
                    type="button"
                    className="pd-product-analysis__product-link"
                    key={row.id}
                    onClick={() => onDetail({ kind: 'sku', id: row.id })}
                  >
                    {row.name}
                  </button>
                ))}
              </article>
            );
          },
        )}
      </div>
    </section>
  );
}

export function ProductPromotions({
  merchandising,
  products,
  onDetail,
}: {
  readonly merchandising: ReturnType<
    typeof import('./ProductAnalysis.data').deriveProductMerchandising
  >;
  readonly products: readonly ProductResult[];
  readonly onDetail: (detail: ProductDetail) => void;
}) {
  const columns: readonly ExplorerTableColumn<(typeof merchandising.promotions)[number]>[] = [
    {
      id: 'name',
      label: 'Promowany produkt',
      required: true,
      csvValue: (row) => row.name,
      render: (row) => (
        <button
          type="button"
          className="pd-product-analysis__product-link"
          onClick={() => onDetail({ kind: 'sku', id: row.id })}
        >
          {row.name}
          <small>{row.id}</small>
        </button>
      ),
    },
    {
      id: 'regular',
      label: 'Cena regularna netto',
      align: 'right',
      csvValue: (row) => productNumber(row.regularPrice, 2),
      render: (row) => productMoney(row.regularPrice, 2),
    },
    {
      id: 'price',
      label: 'Cena promocyjna netto',
      align: 'right',
      csvValue: (row) => productNumber(row.promoPrice, 2),
      render: (row) => productMoney(row.promoPrice, 2),
    },
    {
      id: 'units',
      label: 'Sprzedane szt.',
      align: 'right',
      sortAccessor: (row) => row.units,
      csvValue: (row) => row.units,
      render: (row) => productNumber(row.units),
    },
    {
      id: 'sales',
      label: 'Sprzedaż netto',
      align: 'right',
      sortAccessor: (row) => row.revenue,
      csvValue: (row) => row.revenue,
      render: (row) => productMoney(row.revenue),
    },
    {
      id: 'margin',
      label: 'Marża na produktach',
      align: 'right',
      csvValue: (row) => row.margin ?? 'Brak kosztu',
      render: (row) => (
        <span data-tone={row.margin !== null && row.margin < 0 ? 'danger' : undefined}>
          {productMoney(row.margin)}
          <small>
            {row.marginPct === null ? 'Brak kosztu' : `${productNumber(row.marginPct, 1)}%`}
          </small>
        </span>
      ),
    },
  ];
  return (
    <section className="pd-product-analysis__promotions">
      <h2>Promocje i analiza koszyka</h2>
      <p>
        Przykładowe dzienne zestawienie promocji w wybranym okresie. Marża uwzględnia zapisany koszt
        jednostkowy produktu, bez kosztów marketingu i realizacji.
      </p>
      <ExplorerTable
        ariaLabel="Wyniki promocji"
        columns={columns}
        rows={merchandising.promotions}
        searchFields={['name', 'id']}
        searchLabel="Szukaj promocji"
        exportFilenameBase="promocje-produktow"
        emptyMessage="Brak obserwacji promocji w tym okresie i kategorii."
      />
      <div className="pd-product-analysis__basket">
        <h3>Wspólne zakupy</h3>
        {merchandising.baskets.length ? (
          merchandising.baskets.map((pair) => (
            <article key={`${pair.firstSku}-${pair.secondSku}`}>
              <h3>
                {products.find((p) => p.id === pair.firstSku)?.name ?? pair.firstSku} +{' '}
                {products.find((p) => p.id === pair.secondSku)?.name ?? pair.secondSku}
              </h3>
              <dl className="pd-product-analysis__scenario">
                <div>
                  <dt>Wspólne zamówienia</dt>
                  <dd>{productNumber(pair.both)}</dd>
                </div>
                <div>
                  <dt>Udział we wszystkich koszykach</dt>
                  <dd>{productNumber(pair.support, 1)}%</dd>
                </div>
                <div>
                  <dt>Drugi produkt w koszykach z pierwszym</dt>
                  <dd>{productNumber(pair.confidence, 1)}%</dd>
                </div>
                <div>
                  <dt>Lift współzakupu</dt>
                  <dd>{productNumber(pair.lift, 2)}×</dd>
                </div>
              </dl>
              <details>
                <summary>Pokaż podstawę obliczeń koszyka</summary>
                <p>
                  Zamówienia w próbce: {productNumber(pair.orders)}. Z pierwszym produktem:{' '}
                  {productNumber(pair.first)}. Z drugim: {productNumber(pair.second)}. Z oboma:{' '}
                  {productNumber(pair.both)}.
                </p>
                <p>
                  Udział = oba / wszystkie. Warunkowy udział = oba / pierwszy. Lift = (oba /
                  pierwszy) / (drugi / wszystkie). To odrębna próbka koszyków; jej liczebność nie
                  jest sumą zamówień całego sklepu.
                </p>
              </details>
            </article>
          ))
        ) : (
          <p>Brak obserwacji wspólnego koszyka dla tej kategorii i okresu.</p>
        )}
        <p>
          Współzakup opisuje zależność. Nie dowodzi wpływu rabatu na sprzedaż ani nie prognozuje
          efektu zestawu.
        </p>
      </div>
    </section>
  );
}
