import { campaignGrowthFixture } from '../../fixtures/paid-campaigns/campaignGrowthFixture';
import { projectCampaignGrowthReport, projectCustomerPortfolioReport, projectTrafficPortfolioReport } from '@papadata/contracts/report-projections';
import { customerPortfolioFixture } from '../../fixtures/customers/customerPortfolioFixture';
import { trafficPortfolioFixture } from '../../fixtures/traffic/trafficPortfolioFixture';
import { commandCenterDemoSeed } from '../../fixtures/command-center/commandCenterDemoSeed';
import {
  deriveOverview,
  overviewDayCount,
  overviewRangeLabel,
  overviewShortDate,
  shiftOverviewDate,
} from '../command-center/CommandCenterScreen.data';
import { deriveProducts } from '../products/ProductAnalysis.data';
import { productDemoData, type ProductCategory } from '../products/ProductsScreen.data';
import {
  deriveCampaignAnalysis,
  type CampaignChannel,
} from '../paid-campaigns/CampaignAnalysis.data';
import {
  deriveOrdersAnalysis,
  fulfillmentLabel,
  type OrderSource,
} from '../orders/OrdersAnalysis.data';
import {
  reportMetricLabels,
  reportTemplate,
  type ReportConfig,
  type ReportSnapshot,
  type ReportUnit,
} from './SavedReports.model';

import { reportConfigError } from '@papadata/contracts/saved-reports';
export { reportConfigError, reportConfigKey } from '@papadata/contracts/saved-reports';
export function buildReportSnapshot(
  config: ReportConfig,
  generatedAt = new Date().toISOString(),
): ReportSnapshot {
  const error = reportConfigError(config);
  if (error) throw new Error(error);
  if(config.template==='campaigns'&&config.context?.sourcePath){
    const origin=new URL(config.context.sourcePath,'https://context.invalid');
    if(origin.pathname==='/app/campaigns'||origin.searchParams.has('campaignView')||/\/(growth|kreacje|budzet|atrybucja-i-sprzedaz)$/.test(origin.pathname)){
      const data=campaignGrowthFixture({from:config.from,to:config.to,timezone:config.timezone??'Europe/Warsaw'});
      const channel=config.filter==='google_ads'||config.filter==='meta_ads'?config.filter:origin.searchParams.get('channel');
      const campaign=origin.searchParams.get('campaignId'),currency=origin.searchParams.get('currency');
      const matches=(row:{provider:string;currency:string})=>(!channel||channel==='all'||row.provider===channel)&&(!currency||row.currency===currency);
      const campaigns=data.campaigns.filter(row=>matches(row)&&(!campaign||row.id===campaign));
      const observations=data.observations.filter(row=>matches(row)&&(!campaign||campaigns.some(c=>c.sourceId===row.sourceId&&c.campaignId===row.campaignId)));
      const creatives=data.creatives.filter(row=>matches(row)&&(!campaign||row.campaignKey===campaign));
      const snapshot=projectCampaignGrowthReport({...data,campaigns,observations,creatives},config);
      return {...snapshot,mode:'demo',limitations:['Scenariusz demonstracyjny, ten sam model co Analytics Growth. Brak danych dostawcy.',...snapshot.limitations]};
    }
  }
  if(config.template==='customers'||config.template==='traffic'){
    const snapshot=config.template==='customers'?projectCustomerPortfolioReport(customerPortfolioFixture,config):projectTrafficPortfolioReport(trafficPortfolioFixture,config);
    return {...snapshot,mode:'demo',limitations:['Staly, jawny scenariusz demonstracyjny. Daty nie pobieraja danych serwera.',...snapshot.limitations]};
  }
  const range = {
    from: config.from,
    to: config.to,
    preset: 'custom' as const,
    timezone: 'Europe/Warsaw',
  };
  const template = reportTemplate(config.template),
    scope = template.filters.find((f) => f.id === config.filter)!.label;
  const snapshot: ReportSnapshot = {
    generatedAt,
    mode: 'demo',
    scopeLabel: `${overviewRangeLabel(range)} · ${scope}`,
    currency: 'PLN',
    timezone: 'Europe/Warsaw',
    quality: 'complete',
    limitations: [],
    metrics: [],
    series: [],
    seriesMetric: '',
    columns: [],
    rows: [],
    sources: [],
  };
  const add = (
    id: string,
    value: number | null,
    unit: ReportUnit,
    definition: string,
    label = reportMetricLabels[id],
  ) => snapshot.metrics.push({ id, label, value, unit, definition });
  const path = (route: string, query: Record<string, string> = {}) =>
    route + '?' + new URLSearchParams({ from: range.from, to: range.to, ...query });
  const days = Array.from({ length: overviewDayCount(range) }, (_, i) =>
    shiftOverviewDate(range.from, i),
  );
  if (config.template === 'overview') {
    const result = deriveOverview(commandCenterDemoSeed, range, 'previous_period');
    const complete = result.currentDays === result.expectedDays,
      any = result.currentDays > 0;
    add('revenue', any ? result.current.revenue : null, 'PLN', 'Suma dziennej sprzedaży netto.');
    add(
      'margin',
      any ? result.current.margin : null,
      'PLN',
      'Sprzedaż netto − koszt produktów − realizacja − marketing.',
    );
    add(
      'marketingSpend',
      any ? result.current.marketingSpend : null,
      'PLN',
      'Suma wydatków na marketing z dziennych obserwacji.',
    );
    add(
      'orders',
      any ? result.current.orders : null,
      'szt.',
      'Liczba zamówień z dziennych obserwacji.',
    );
    snapshot.columns = [
      { id: 'date', label: 'Dzień' },
      { id: 'revenue', label: 'Sprzedaż netto', unit: 'PLN' },
      { id: 'margin', label: 'Marża po marketingu', unit: 'PLN' },
      { id: 'orders', label: 'Zamówienia', unit: 'szt.' },
    ];
    snapshot.rows = commandCenterDemoSeed.days
      .filter((d) => d.date >= range.from && d.date <= range.to)
      .map((d) => ({
        id: d.date,
        values: {
          date: d.date,
          revenue: d.revenue,
          margin: d.revenue - d.costOfGoods - d.fulfillmentCost - d.marketingSpend,
          orders: d.orders,
        },
      }));
    snapshot.series = days.map((date) => {
      const d = commandCenterDemoSeed.days.find((d) => d.date === date);
      return { date, value: d ? d.revenue : null };
    });
    snapshot.seriesMetric = 'Sprzedaż netto · PLN';
    snapshot.quality = any ? (complete ? 'complete' : 'partial') : 'empty';
    if (!complete)
      snapshot.limitations.push(
        `Dostępne ${result.currentDays} z ${result.expectedDays} dni. Sumy obejmują wyłącznie dostępne obserwacje.`,
      );
    snapshot.sources = [
      {
        id: 'overview',
        label: 'Dzienny wynik sklepu',
        detail: 'Ta sama demonstracyjna seria co w Przeglądzie. Bez estymacji brakujących dni.',
        path: path('/app/command-center'),
      },
    ];
  } else if (config.template === 'products' || config.template === 'inventory') {
    const a = deriveProducts(productDemoData, range, config.filter as ProductCategory | 'all');
    if (config.template === 'products') {
      const any = a.rows.length > 0;
      add(
        'revenue',
        any ? a.revenue : null,
        'PLN',
        'Sprzedaż z katalogu produktów w wybranym okresie.',
      );
      add(
        'knownMargin',
        any ? a.knownMargin : null,
        'PLN',
        'Marża wyłącznie SKU z pełnym kosztem i obserwacjami.',
      );
      add(
        'costCoverage',
        any ? a.costCoverage : null,
        '%',
        'Udział przychodu SKU o rozliczonym koszcie.',
      );
      add(
        'units',
        any ? a.rows.reduce((sum, r) => sum + r.units, 0) : null,
        'szt.',
        'Suma sprzedanych sztuk w wybranej kategorii.',
      );
      snapshot.columns = [
        { id: 'sku', label: 'SKU' },
        { id: 'name', label: 'Produkt' },
        { id: 'revenue', label: 'Sprzedaż netto', unit: 'PLN' },
        { id: 'margin', label: 'Marża', unit: 'PLN' },
      ];
      snapshot.rows = a.rows.map((r) => ({
        id: r.id,
        values: { sku: r.id, name: r.name, revenue: r.revenue, margin: r.margin },
      }));
      snapshot.series = days.map((date) => {
        const skuIds = new Set(a.rows.map((r) => r.id));
        const rows = productDemoData.days.filter((d) => d.date === date && skuIds.has(d.skuId));
        return { date, value: rows.length ? rows.reduce((s, d) => s + d.revenue, 0) : null };
      });
      snapshot.seriesMetric = 'Sprzedaż netto katalogu · PLN';
      snapshot.quality = !any
        ? 'empty'
        : (a.costCoverage ?? 0) < 100 || a.rows.some((r) => !r.complete)
          ? 'partial'
          : 'complete';
      snapshot.limitations = [
        'Próbka katalogu nie reprezentuje całej sprzedaży sklepu. Brak danych o zwrotach.',
        ...(a.rows.some((r) => r.cogs === null)
          ? ['Brak kosztu lub obserwacji wyłącza marżę danego SKU. Nie jest to koszt równy zero.']
          : []),
      ];
      snapshot.sources = [
        {
          id: 'products',
          label: 'Katalog i sprzedaż SKU',
          detail: 'Dzienne obserwacje, te same co w analizie Produktów.',
          path: path('/app/products', {
            productView: 'profitability',
            productCategory: config.filter,
            productFilter: 'all',
          }),
        },
      ];
    } else {
      const rows = a.inventoryRows;
      add(
        'available',
        rows.some((r) => r.available !== null)
          ? rows.reduce((s, r) => s + (r.available ?? 0), 0)
          : null,
        'szt.',
        'Stan minus rezerwacje; suma dostępnych stanów.',
      );
      add(
        'capital',
        rows.some((r) => r.capital !== null)
          ? rows.reduce((s, r) => s + (r.capital ?? 0), 0)
          : null,
        'PLN',
        'Dostępne sztuki × znany koszt jednostkowy.',
      );
      add(
        'atRisk',
        rows.filter((r) => r.status === 'risk').length,
        'szt.',
        'Liczba SKU, dla których pokrycie jest krótsze niż termin dostawy.',
      );
      add(
        'unknown',
        rows.filter((r) => r.status === 'unknown').length,
        'szt.',
        'SKU bez danych wymaganych do oceny pokrycia.',
      );
      snapshot.scopeLabel = `Stan na ${overviewShortDate(productDemoData.inventoryDate)} 2026 · ${scope}`;
      snapshot.columns = [
        { id: 'name', label: 'Produkt' },
        { id: 'available', label: 'Dostępne', unit: 'szt.' },
        { id: 'coverage', label: 'Pokrycie', unit: 'dni' },
        { id: 'leadTime', label: 'Czas dostawy', unit: 'dni' },
        { id: 'capital', label: 'Kapitał', unit: 'PLN' },
      ];
      snapshot.rows = rows.map((r) => ({
        id: r.id,
        values: {
          name: r.name,
          available: r.available,
          coverage: r.coverage,
          leadTime: r.leadTime,
          capital: r.capital,
        },
      }));
      snapshot.quality = rows.some((r) => r.capital === null || r.coverage === null)
        ? 'partial'
        : 'complete';
      snapshot.limitations = [
        'Stan magazynu z 31 sierpnia 2026; średni popyt z 2–31 sierpnia. Zmiana dat sprzedaży nie zmienia tego stanu.',
        'Brak dostaw w drodze. Kapitał obejmuje tylko pozycje o znanym koszcie.',
      ];
      snapshot.sources = [
        {
          id: 'inventory',
          label: 'Stan magazynu i popyt SKU',
          detail: 'Migawka magazynu z 31 sierpnia, rezerwacje i popyt z poprzednich 30 dni.',
          path: path('/app/products', {
            productView: 'inventory',
            productCategory: config.filter,
            productFilter: 'all',
          }),
        },
      ];
    }
  } else if (config.template === 'campaigns') {
    const a = deriveCampaignAnalysis(range, config.filter as CampaignChannel),
      any = a.rows.length > 0;
    add('spend', any ? a.current.spend : null, 'PLN', 'Wydatki reklamowe w wybranych kanałach.');
    add(
      'revenue',
      any ? a.current.revenue : null,
      'PLN',
      'Przychód przypisany, model last click. Oddzielny od sprzedaży całego sklepu.',
      'Przychód przypisany',
    );
    add('roas', any ? a.current.roas : null, '×', 'Przychód przypisany ÷ koszt reklam.');
    add('ncac', any ? a.current.ncac : null, 'PLN', 'Koszt reklam ÷ nowi klienci.');
    snapshot.columns = [
      { id: 'name', label: 'Kampania' },
      { id: 'spend', label: 'Koszt', unit: 'PLN' },
      { id: 'revenue', label: 'Przychód przypisany', unit: 'PLN' },
      { id: 'roas', label: 'ROAS', unit: '×' },
      { id: 'coverage', label: 'Pokrycie kosztem', unit: '%' },
    ];
    snapshot.rows = a.rows.map((r) => ({
      id: r.id,
      values: {
        name: r.name,
        spend: r.spend,
        revenue: r.revenue,
        roas: r.roas,
        coverage: r.costCoverage,
      },
    }));
    snapshot.series = a.points.map((p) => ({ date: p.date, value: p.spend }));
    snapshot.seriesMetric = 'Koszt reklam · PLN';
    snapshot.quality = !any
      ? 'empty'
      : !a.complete || a.rows.some((r) => r.costCoverage < 100)
        ? 'partial'
        : 'complete';
    snapshot.limitations = [
      'Model atrybucji last click. ROAS nie jest marżą.',
      ...(a.rows.some((r) => r.costCoverage < 100)
        ? [
            'Kartoteka jednej z kampanii ma niepełne koszty; porównanie rentowności wymaga weryfikacji.',
          ]
        : []),
    ];
    snapshot.sources = [
      {
        id: 'campaigns',
        label: 'Koszty i atrybucja kampanii',
        detail: 'Te same obserwacje dzienne co w Kampaniach. Bez prognozy wyniku budżetu.',
        path: path('/app/campaigns', { channel: config.filter, campaignView: 'campaigns' }),
      },
    ];
  } else {
    const a = deriveOrdersAnalysis(range, config.filter as OrderSource),
      any = a.rows.length > 0;
    add('count', any ? a.rows.length : null, 'szt.', 'Liczba zamówień w dostępnej próbce.');
    add('gross', any ? a.gross : null, 'PLN', 'Wartość brutto zamówień, przed odjęciem zwrotów.');
    add('late', any ? a.late.length : null, 'szt.', 'Status SLA po terminie i brak wysyłki.');
    add('refunded', any ? a.refunded : null, 'PLN', 'Kwoty zwrotów zapisane w tych zamówieniach.');
    snapshot.columns = [
      { id: 'number', label: 'Zamówienie' },
      { id: 'date', label: 'Data złożenia' },
      { id: 'gross', label: 'Brutto', unit: 'PLN' },
      { id: 'status', label: 'Realizacja' },
      { id: 'refund', label: 'Zwrot', unit: 'PLN' },
    ];
    snapshot.rows = a.rows.map((r) => ({
      id: r.id,
      values: {
        number: r.id,
        date: r.date.slice(0, 10),
        gross: r.grossValue,
        status: fulfillmentLabel(r),
        refund: r.refund,
      },
    }));
    snapshot.series = [];
    snapshot.quality = any ? 'partial' : 'empty';
    snapshot.limitations = [
      'Jawna próbka sześciu zamówień, a nie pełna sprzedaż sklepu. Dni bez rekordu nie oznaczają zerowej sprzedaży.',
      'Brak kosztu i pełnych czasów zdarzeń — marża i czas wysyłki pozostają nieznane.',
    ];
    snapshot.sources = [
      {
        id: 'orders',
        label: 'Przykładowa kolejka zamówień',
        detail: 'Status płatności, realizacji i SLA dla wybranej daty złożenia i źródła.',
        path: path('/app/orders', { orderSource: config.filter, orderQueue: 'all' }),
      },
    ];
  }
  snapshot.metrics = snapshot.metrics.filter((m) => config.metricIds.includes(m.id));
  return snapshot;
}
export { reportNumber, reportDate, compareReportVersions } from './SavedReports.presentation';
