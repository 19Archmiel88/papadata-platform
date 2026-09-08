import { useMemo, useState } from 'react';
import { Button, DateRangePicker, Drawer, Popover } from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { overviewRangeLabel, overviewShortDate } from '../command-center/CommandCenterScreen.data';
import {
  deriveProducts,
  deriveProductMerchandising,
  productFilterLabels,
  productMoney,
  productNumber,
} from './ProductAnalysis.data';
import type { ProductFilter, ProductResult } from './ProductAnalysis.data';
import { productCategories, productDemoData, productDemoRange } from './ProductsScreen.data';
import type { ProductCategory, ProductData } from './ProductsScreen.data';
import {
  ProductBundleSimulator,
  ProductContribution,
  ProductInventoryOverview,
  ProductLifecycle,
  ProductMetricStrip,
  ProductPortfolio,
  ProductPromotions,
  ProductTable,
  inventoryStatus,
} from './ProductAnalysis';
import type { ProductDetail } from './ProductAnalysis';
import './ProductsScreen.css';

export const productViews = [
  { id: 'profitability', label: 'Zyskowność' },
  { id: 'inventory', label: 'Zapasy' },
  { id: 'portfolio', label: 'Asortyment ABC/XYZ' },
  { id: 'offers', label: 'Promocje i zestawy' },
  { id: 'lifecycle', label: 'Cykl życia' },
  { id: 'insights', label: 'Wnioski' },
] as const;
export type ProductView = (typeof productViews)[number]['id'];
const readParam = (key: string) =>
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(key);
function writeParam(key: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  window.history.replaceState(null, '', url);
}

export function ProductsScreen({
  data = productDemoData,
  state = 'ready',
  onRetry,
  initialView,
  section,
}: {
  readonly data?: ProductData | null;
  readonly state?: 'ready' | 'loading' | 'error';
  readonly onRetry?: () => void;
  readonly initialView?: ProductView;
  readonly section?: 'result' | 'explorer';
} = {}) {
  const { dateRange, setDateRange } = useShellDateRange();
  const [dateOpen, setDateOpen] = useState(false);
  const [view, setView] = useState<ProductView>(
    () =>
      initialView ??
      productViews.find((item) => item.id === readParam('productView'))?.id ??
      'profitability',
  );
  const [category, setCategory] = useState<ProductCategory | 'all'>(() =>
    Object.keys(productCategories).includes(readParam('productCategory') ?? '')
      ? (readParam('productCategory') as ProductCategory)
      : 'all',
  );
  const [filter, setFilter] = useState<ProductFilter>(() =>
    Object.keys(productFilterLabels).includes(readParam('productFilter') ?? '')
      ? (readParam('productFilter') as ProductFilter)
      : 'all',
  );
  const [segment, setSegment] = useState<string | null>(() =>
    /^(?:[ABC][XYZ]|unclassified)$/.test(readParam('productSegment') ?? '')
      ? readParam('productSegment')
      : null,
  );
  const [detail, setDetail] = useState<ProductDetail>(null);
  const analysis = useMemo(
    () =>
      deriveProducts(
        data ?? { products: [], days: [], inventory: [], inventoryDate: '2026-08-31' },
        dateRange,
        category,
      ),
    [data, dateRange, category],
  );
  const merchandising = useMemo(
    () =>
      deriveProductMerchandising(
        data ?? { products: [], days: [], inventory: [], inventoryDate: '2026-08-31' },
        dateRange,
        category,
      ),
    [data, dateRange, category],
  );
  const selectedProduct =
    detail?.kind === 'sku' ? analysis.inventoryRows.find((row) => row.id === detail.id) : null;
  const setProductFilter = (next: ProductFilter) => {
    setFilter(next);
    writeParam('productFilter', next);
  };
  const setProductSegment = (next: string | null) => {
    setSegment(next);
    writeParam('productSegment', next);
  };
  const go = (next: ProductView) => {
    setView(next);
    writeParam('productView', next);
    setDetail(null);
    setProductFilter('all');
  };
  const selectRisk = () => {
    go('inventory');
    setProductFilter('stock_risk');
  };
  const stockDate = overviewShortDate(analysis.inventoryDate);
  const missingCosts = analysis.rows.filter((row) => row.cogs === null).length;
  const riskCount = analysis.inventoryRows.filter((row) => row.status === 'risk').length;
  const portfolioRows = segment
    ? analysis.rows.filter((row) =>
        segment === 'unclassified' ? !row.abc || !row.xyz : `${row.abc}${row.xyz}` === segment,
      )
    : analysis.rows;
  const inventoryFilter = ['all', 'stock_risk', 'excess_stock'].includes(filter) ? filter : 'all';
  const renderTable = (rows: readonly ProductResult[] = analysis.rows, inventory = false) => (
    <ProductTable
      rows={rows}
      filter={inventory ? inventoryFilter : filter}
      onFilter={setProductFilter}
      onDetail={setDetail}
      rangeLabel={overviewRangeLabel(dateRange)}
      inventory={inventory}
      inventoryDate={analysis.inventoryDate}
    />
  );

  return (
    <div className="pd-product-analysis" data-testid="products-bi-page">
      <header className="pd-product-analysis__header">
        <div>
          <h1>Produkty</h1>
          <p>Marża, dostępność i rola każdego SKU w sprzedaży.</p>
        </div>
        {view === 'inventory' ? (
          <p>
            Magazyn · stan na {stockDate} {analysis.inventoryDate.slice(0, 4)}
          </p>
        ) : (
          <Popover
            anchorId="products-date-trigger"
            title="Okres sprzedaży produktów"
            modal={false}
            placement="bottom-end"
            open={dateOpen}
            onOpenChange={setDateOpen}
            trigger={
              <Button variant="secondary" size="small">
                {overviewRangeLabel(dateRange)} <span aria-hidden="true">⌄</span>
              </Button>
            }
          >
            <DateRangePicker
              label="Okres sprzedaży produktów"
              value={dateRange}
              timezone={dateRange.timezone}
              onChange={setDateRange}
              presets={[
                { label: 'Ostatnie 7 dni', value: 'last7d' },
                { label: 'Ostatnie 30 dni', value: 'last30d' },
                { label: 'Własny okres', value: 'custom' },
              ]}
            />
            {!analysis.valid && <p role="alert">Wybierz od 1 do 366 dni.</p>}
            <Button size="small" disabled={!analysis.valid} onClick={() => setDateOpen(false)}>
              Gotowe
            </Button>
          </Popover>
        )}
      </header>
      <nav className="pd-product-analysis__tabs" aria-label="Widoki produktów">
        {productViews.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="pd-product-analysis__context">
        <p>
          Dane przykładowe · katalog 10 SKU · PLN ·{' '}
          {view === 'inventory'
            ? 'popyt z 30 dni do daty stanu'
            : `sprzedaż w wybranym okresie, magazyn na ${stockDate}`}
        </p>
        <label>
          Kategoria
          <select
            aria-label="Kategoria produktów"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as ProductCategory | 'all');
              writeParam('productCategory', event.target.value);
              setProductSegment(null);
              setDetail(null);
            }}
          >
            <option value="all">Wszystkie kategorie</option>
            {Object.entries(productCategories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {state === 'loading' ? (
        <section className="pd-product-analysis__state" role="status">
          <h2>Wczytywanie produktów…</h2>
          <p>Przygotowujemy sprzedaż, koszty i dostępność.</p>
        </section>
      ) : state === 'error' || data === null ? (
        <section className="pd-product-analysis__state" role="alert">
          <h2>Nie udało się wczytać produktów</h2>
          <p>Wynik jest niedostępny.</p>
          {onRetry && <Button onClick={onRetry}>Spróbuj ponownie</Button>}
        </section>
      ) : view !== 'inventory' && !analysis.valid ? (
        <section className="pd-product-analysis__state" role="alert">
          <h2>Wybierz poprawny okres</h2>
          <p>Zakres może obejmować od 1 do 366 dni.</p>
        </section>
      ) : (
          view === 'inventory' ? analysis.inventoryRows.length === 0 : analysis.rows.length === 0
        ) ? (
        <section className="pd-product-analysis__state">
          <h2>Brak produktów w tym zakresie</h2>
          <p>Przykład obejmuje lipiec i sierpień 2026. Zmień okres lub kategorię.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setDateRange(productDemoRange);
              setCategory('all');
              writeParam('productCategory', 'all');
              setProductFilter('all');
            }}
          >
            Pokaż przykładowy sierpień
          </Button>
        </section>
      ) : (
        <>
          {!analysis.complete && view !== 'inventory' && (
            <p className="pd-product-analysis__notice" role="status">
              Niepełne obserwacje sprzedaży. Sumy dotyczą dostępnych dni; marża i klasyfikacja
              niepełnych SKU pozostają niedostępne.
            </p>
          )}
          {view === 'profitability' && (
            <>
              {section !== 'explorer' && (
                <>
                  <section className="pd-product-analysis__diagnosis">
                    <span>Wynik produktowy</span>
                    <h2>
                      {missingCosts
                        ? 'Najpierw uzupełnij koszty, potem oceniaj marżę'
                        : 'Oceń marżę razem z dostępnością towaru'}
                    </h2>
                    <p>
                      Brak pełnego kosztu: <strong>{missingCosts} SKU</strong>. Ryzyko braku przed
                      dostawą: <strong>{riskCount} SKU</strong>, według stanu na {stockDate}.
                    </p>
                    <div>
                      <Button size="small" variant="secondary" onClick={selectRisk}>
                        Sprawdź zagrożone SKU · {riskCount}
                      </Button>
                      {missingCosts > 0 && (
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => setDetail({ kind: 'definitions' })}
                        >
                          Co obejmuje marża
                        </Button>
                      )}
                    </div>
                  </section>
                  <ProductMetricStrip analysis={analysis} onDetail={setDetail} />
                  <ProductContribution analysis={analysis} onDetail={setDetail} />
                </>
              )}
              {section !== 'result' && renderTable()}
            </>
          )}
          {view === 'inventory' && (
            <>
              <ProductInventoryOverview analysis={analysis} onDetail={setDetail} />
              {renderTable(analysis.inventoryRows, true)}
            </>
          )}
          {view === 'portfolio' && (
            <>
              <ProductPortfolio
                analysis={analysis}
                selected={segment}
                onSelect={setProductSegment}
              />
              {renderTable(portfolioRows)}
            </>
          )}
          {view === 'offers' && (
            <>
              <ProductBundleSimulator
                key={`${category}-${dateRange.from}-${dateRange.to}`}
                rows={analysis.rows}
              />
              <ProductPromotions
                merchandising={merchandising}
                products={analysis.rows}
                onDetail={setDetail}
              />
            </>
          )}
          {view === 'lifecycle' && <ProductLifecycle analysis={analysis} onDetail={setDetail} />}
          {view === 'insights' && (
            <section className="pd-product-analysis__insights">
              <h2>Wnioski i dowody</h2>
              <p>
                Reguły oparte na tej samej próbce produktów. Każdy sygnał prowadzi do danych SKU.
              </p>
              {analysis.inventoryRows
                .filter((row) => row.status === 'risk')
                .slice(0, 3)
                .map((row) => (
                  <article key={row.id}>
                    <h3>{row.name}</h3>
                    <dl>
                      <div>
                        <dt>Obserwacja</dt>
                        <dd>Dostępny zapas {productNumber(row.available)} szt.</dd>
                      </div>
                      <div>
                        <dt>Wyliczenie</dt>
                        <dd>
                          {productNumber(row.dailyDemand, 1)} szt./dzień →{' '}
                          {productNumber(row.coverage, 1)} dni pokrycia
                        </dd>
                      </div>
                      <div>
                        <dt>Porównanie</dt>
                        <dd>Czas dostawy {row.leadTime} dni</dd>
                      </div>
                      <div>
                        <dt>Następny krok</dt>
                        <dd>Sprawdź termin i ilość otwartych dostaw u dostawcy.</dd>
                      </div>
                    </dl>
                    <p>
                      Brak informacji o dostawach w drodze i sezonowości ogranicza ocenę ryzyka.
                    </p>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setDetail({ kind: 'sku', id: row.id })}
                    >
                      Sprawdź {row.id}
                    </Button>
                  </article>
                ))}
              {!riskCount && (
                <p>
                  Nie wykryto przekroczenia progu ryzyka w tej kategorii. Brak danych nie oznacza
                  braku ryzyka.
                </p>
              )}
            </section>
          )}
        </>
      )}
      <Drawer
        open={detail !== null}
        title={selectedProduct?.name ?? 'Definicje i źródła produktów'}
        description={`Dane przykładowe · ${overviewRangeLabel(dateRange)} · magazyn na ${stockDate}`}
        side="right"
        width={560}
        dismissible
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <div className="pd-product-analysis__evidence">
          {selectedProduct ? (
            <>
              <p>
                {selectedProduct.id} · {productCategories[selectedProduct.category]} ·{' '}
                {selectedProduct.brand}
              </p>
              <section>
                <h3>Sprzedaż i koszt</h3>
                <dl>
                  <div>
                    <dt>Sprzedaż netto</dt>
                    <dd>
                      {selectedProduct.observedDays
                        ? productMoney(selectedProduct.revenue)
                        : 'Brak obserwacji'}
                    </dd>
                  </div>
                  <div>
                    <dt>Koszt produktów</dt>
                    <dd>{productMoney(selectedProduct.cogs)}</dd>
                  </div>
                  <div>
                    <dt>Marża na produktach</dt>
                    <dd>
                      {productMoney(selectedProduct.margin)}
                      {selectedProduct.marginPct !== null &&
                        ` · ${productNumber(selectedProduct.marginPct, 1)}%`}
                    </dd>
                  </div>
                  <div>
                    <dt>Sprzedane sztuki</dt>
                    <dd>
                      {selectedProduct.observedDays
                        ? productNumber(selectedProduct.units)
                        : 'Brak obserwacji'}
                    </dd>
                  </div>
                  <div>
                    <dt>Obserwacje dzienne</dt>
                    <dd>
                      {selectedProduct.observedDays} ·{' '}
                      {selectedProduct.complete ? 'kompletne' : 'niepełne w zakresie'}
                    </dd>
                  </div>
                </dl>
                <p>
                  {selectedProduct.cogs === null
                    ? 'Brak pełnego kosztu lub obserwacji uniemożliwia wyliczenie marży. Nie przyjmujemy kosztu równego zero.'
                    : 'Marża obejmuje tylko koszt produktów. Koszty marketingu, płatności i realizacji pozostają poza tą miarą.'}
                </p>
              </section>
              <section>
                <h3>Dostępność na {stockDate}</h3>
                <dl>
                  <div>
                    <dt>Stan / rezerwacje</dt>
                    <dd>
                      {productNumber(selectedProduct.stock?.stock ?? null)} /{' '}
                      {productNumber(selectedProduct.stock?.reserved ?? null)} szt.
                    </dd>
                  </div>
                  <div>
                    <dt>Dostępne do sprzedaży</dt>
                    <dd>{productNumber(selectedProduct.available)} szt.</dd>
                  </div>
                  <div>
                    <dt>Średni popyt z 30 dni</dt>
                    <dd>{productNumber(selectedProduct.dailyDemand, 1)} szt./dzień</dd>
                  </div>
                  <div>
                    <dt>Pokrycie / czas dostawy</dt>
                    <dd>
                      {productNumber(selectedProduct.coverage, 1)} /{' '}
                      {productNumber(selectedProduct.leadTime)} dni
                    </dd>
                  </div>
                </dl>
                <p data-tone={selectedProduct.status === 'risk' ? 'danger' : undefined}>
                  {inventoryStatus(selectedProduct)}
                </p>
                <p>
                  Ocena wymaga minimum 14 dni historii i pełnych obserwacji od startu produktu.
                  Dostawy w drodze, zmiany popytu i zapas bezpieczeństwa nie są uwzględnione.
                </p>
              </section>
              <section>
                <h3>Klasyfikacja i następny krok</h3>
                <p>
                  {selectedProduct.abc && selectedProduct.xyz
                    ? `Klasa ${selectedProduct.abc}${selectedProduct.xyz} w wybranym okresie i kategorii.`
                    : 'Brak pełnej klasyfikacji ABC/XYZ w wybranym zakresie.'}
                </p>
                <p>
                  {selectedProduct.cogs === null
                    ? 'Uzupełnij koszt i historię produktu, zanim podejmiesz decyzję cenową.'
                    : selectedProduct.status === 'risk'
                      ? 'Zweryfikuj otwarte zamówienia dostaw i termin uzupełnienia zapasu przed rozszerzeniem promocji.'
                      : 'Porównaj ekonomikę produktu z dostępnością i rzeczywistymi kosztami realizacji.'}
                </p>
                <p>Podgląd nie zmienia cen ani zamówień u dostawcy.</p>
              </section>
            </>
          ) : (
            <>
              <h3>Sprzedaż i marża</h3>
              <p>
                Sprzedaż netto i sztuki są sumą dziennych rekordów w wybranym okresie i kategorii.
                Marża produktu = sprzedaż netto minus koszt sprzedanych produktów. Brak kosztu lub
                niepełny okres oznacza brak marży.
              </p>
              <p>
                Łączna marża obejmuje wyłącznie SKU z kompletnym kosztem i obserwacjami. Pokrycie
                kosztów to udział ich sprzedaży w sprzedaży wszystkich SKU z zakresu. Ta wartość nie
                jest pełnym zyskiem sklepu.
              </p>
              <h3>Zapasy</h3>
              <p>
                Stan na {stockDate}: dostępność = stan minus rezerwacje. Pokrycie zapasu wynika ze
                średniego popytu za 30 dni do daty stanu, niezależnie od filtra sprzedaży. Ryzyko
                braku występuje, gdy pokrycie jest krótsze od czasu dostawy. Wartość zapasu to
                dostępne sztuki razy przykładowy koszt jednostkowy.
              </p>
              <h3>Zakres przykładu</h3>
              <p>
                Dziesięć SKU oraz syntetyczne obserwacje z lipca i sierpnia 2026. Olejek Retinol ma
                historię od 24 sierpnia i brak kosztu. Promocje i koszyki są osobnymi dziennymi
                zestawieniami. Brakuje danych zwrotów i otwartych dostaw. Suma tego katalogu nie
                jest pełną sprzedażą sklepu z przeglądu biznesu.
              </p>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}
