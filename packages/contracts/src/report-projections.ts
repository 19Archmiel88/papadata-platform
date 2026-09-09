import { cleanProductContextPath } from './product-context.js';
import { growthMeasures, filterGrowthCreatives, sortGrowthRows, growthDayCount, growthDateShift, type GrowthPortfolio } from './campaign-growth.js';
import type { CustomersPortfolio } from './customer-portfolio.js';
import { filterTrafficRows, type TrafficPortfolio } from './traffic-portfolio.js';
import { reportMetricLabels, type ReportConfig, type ReportMetric, type ReportSnapshot } from './saved-reports.js';
const params = (config: ReportConfig) => new URL(config.context?.sourcePath ?? '/app', 'https://context.invalid').searchParams;
function frame(config: ReportConfig, generatedAt: string, timezone: string, currency: string, sourcePath: string): ReportSnapshot {
    return { generatedAt, mode: 'live', currency, timezone, scopeLabel: `${config.from} - ${config.to} / ${config.filter}`, quality: 'partial', limitations: [], metrics: [], series: [], seriesMetric: '', columns: [], rows: [], sources: [{ id: 'analytic-source', label: 'Zakres analizy', detail: 'Ten sam model danych co ekran analityczny. Kontekst nie zmienia uprawnien.', path: cleanProductContextPath(sourcePath) }] };
}
function finish(snapshot: ReportSnapshot, config: ReportConfig, metrics: ReportMetric[]): ReportSnapshot {
    snapshot.metrics = config.metricIds.map(id => metrics.find(metric => metric.id === id) ?? { id, label: reportMetricLabels[id] ?? id, value: null, unit: 'szt.', definition: 'Brak zrodla tej metryki.' });
    if (snapshot.rows.length > 2000) {
        snapshot.limitations.push(`Tabela zawiera pierwsze 2000 z ${snapshot.rows.length} wierszy. Pelny zbior wyeksportuj z analizy.`);
        snapshot.rows = snapshot.rows.slice(0, 2000);
    }
    if (snapshot.series.length > 366) {
        snapshot.limitations.push('Serie ograniczono do 366 obserwacji.');
        snapshot.series = snapshot.series.slice(0, 366);
    }
    if (snapshot.metrics.every(metric => metric.value === null) && !snapshot.rows.length)
        snapshot.quality = 'empty';
    return snapshot;
}
export function projectCampaignGrowthReport(data: GrowthPortfolio, config: ReportConfig): ReportSnapshot {
    const q = params(config), requested = q.get('currency'), currency = requested ?? (data.choices.currencies.length === 1 ? data.choices.currencies[0] : null);
    if (!currency && data.observations.length)
        throw new Error('Wybierz jedna walute w Kampaniach przed utworzeniem raportu.');
    const money = currency ?? 'XXX', creative = q.get('campaignView') === 'kreacje';
    const rows = creative ? filterGrowthCreatives(data.creatives.filter(row => row.currency === money), { search: q.get('creativeSearch') ?? '', format: q.get('creativeFormat') ?? 'all', sample: q.get('creativeSample') ?? 'all', sort: q.get('creativeSort'), direction: q.get('creativeDirection') }) : sortGrowthRows(data.campaigns.filter(row => row.currency === money && (!(q.get('campaignSearch') ?? '') || `${row.name} ${row.campaignId}`.toLowerCase().includes(q.get('campaignSearch')!.toLowerCase()))), { sort: q.get('campaignSort'), direction: q.get('campaignDirection') });
    const totals = growthMeasures(creative ? rows : data.observations.filter(row => row.currency === money));
    const snapshot = frame(config, data.scope.calculatedAt, data.scope.timezone, money, config.context?.sourcePath ?? '/app/campaigns');
    snapshot.limitations = ['Wartosc i konwersje raportuja platformy reklamowe, nie sklep. Modeli i okien nie przeliczamy z agregatow.', 'Podglad nie wykonuje zmian budzetu u dostawcy.', ...data.limitations.map(item => item.pl)].slice(0, 28);
    snapshot.columns = [{ id: 'name', label: creative ? 'Kreacja' : 'Kampania' }, { id: 'provider', label: 'Dostawca' }, { id: 'spend', label: 'Wydatki', unit: money }, { id: 'revenue', label: 'Wartosc raportowana', unit: money }, { id: 'roas', label: 'ROAS', unit: '×' }];
    snapshot.rows = rows.map(row => ({ id: row.id, values: { name: row.name, provider: row.provider, spend: row.spend, revenue: row.revenue, roas: row.roas } }));
    if (!creative) {
        snapshot.limitations.push('Wyszukiwanie i sortowanie dotyczy tabeli; KPI zachowuja zakres dat, kanalu, kampanii i waluty, jak na ekranie.');
        const dates = Array.from({ length: Math.max(0, Math.min(366, growthDayCount(config.from, config.to))) }, (_, i) => growthDateShift(config.from, i));
        snapshot.series = dates.map(date => ({ date, value: growthMeasures(data.observations.filter(row => row.date === date && row.currency === money)).spend }));
        snapshot.seriesMetric = 'Wydatki / ' + money;
    }
    else
        snapshot.limitations.push('Raport kreacji zachowuje filtry galerii. Nie rekonstruuje dziennego trendu pojedynczej kreacji z sum okresowych.');
    return finish(snapshot, config, [{ id: 'spend', label: 'Wydatki reklamowe', value: totals.spend, unit: money, definition: 'Wydatki wybranego zbioru w jednej walucie.' }, { id: 'revenue', label: 'Wartosc przypisana przez platformy', value: totals.revenue, unit: money, definition: 'Raport platform; mozliwe nakladanie atrybucji.' }, { id: 'roas', label: 'ROAS', value: totals.roas, unit: '×', definition: 'Raportowana wartosc / wydatki; mianownik musi byc dodatni.' }, { id: 'ncac', label: 'Koszt nowego klienta', value: null, unit: money, definition: 'Brak zweryfikowanego polaczenia konwersji z pierwszym zakupem klienta.' }]);
}
export function projectCustomerPortfolioReport(data: CustomersPortfolio, config: ReportConfig): ReportSnapshot {
    const currency = data.currencyCoverage.reportingCurrency, snapshot = frame(config, data.scope.calculatedAt, data.scope.timezone, currency, config.context?.sourcePath ?? '/app/customers'), p = data.portfolioTotals, available = p.totalCustomers > 0;
    snapshot.limitations = ['Portfel na dzien, aktywnosc w wybranym okresie. Filtry eksploratora nie zmieniaja sum portfela.', 'LTV to przychod zaobserwowany, nie prognoza. Historia moze byc niepelna.', 'Nie eksportujemy identyfikatorow klientow ani zgod marketingowych. Raport zawiera agregaty.'];
    if (data.coverage)
        snapshot.limitations.push(`Wykluczone zamowienia: bez referencji ${data.coverage.missingReferenceOrders}, konflikty ${data.coverage.ambiguousOrders}.`);
    snapshot.columns = [{ id: 'segment', label: 'Segment RFM' }, { id: 'customers', label: 'Klienci', unit: 'szt.' }, { id: 'revenue', label: 'Wartosc historyczna', unit: currency }];
    snapshot.rows = data.segments.map(row => ({ id: row.segmentId, values: { segment: row.segmentLabel, customers: row.count, revenue: row.revenue.amount } }));
    snapshot.series = data.trend.map(row => ({ date: row.date, value: row.newCustomers }));
    snapshot.seriesMetric = 'Nowi zaobserwowani klienci';
    return finish(snapshot, config, [{ id: 'customerCount', label: 'Klienci w portfelu', value: available ? p.totalCustomers : null, unit: 'szt.', definition: 'Jednoznacznie rozpoznane referencje klientow w dostepnej historii.' }, { id: 'activeCustomers', label: 'Aktywni klienci', value: available ? p.activeCustomers : null, unit: 'szt.', definition: 'Klienci z kwalifikowanym zamowieniem w wybranym okresie.' }, { id: 'newCustomers', label: 'Nowi zaobserwowani klienci', value: available ? p.newCustomers : null, unit: 'szt.', definition: 'Pierwszy zaobserwowany zakup w tym okresie.' }, { id: 'observedLtv', label: 'Wartosc zaobserwowana', value: available ? p.totalLtv.amount : null, unit: currency, definition: 'Przychod kwalifikowany przed modelowaniem przyszlej wartosci.' }]);
}
export function projectTrafficPortfolioReport(data: TrafficPortfolio, config: ReportConfig): ReportSnapshot {
    const q = params(config), m = data.current.metrics, currencies = m.revenue.map(row => row.currency), currency = q.get('currency') ?? (currencies.length === 1 ? currencies[0] : 'XXX');
    const snapshot = frame(config, data.scope.calculatedAt, data.scope.timezone, currency ?? 'XXX', config.context?.sourcePath ?? '/app/traffic');
    const view = q.get('trafficView'), base = view === 'landingPages' ? data.current.landingPages : view === 'devices' ? data.current.devices : (view === 'geography' || view === 'countries') ? data.current.countries : data.current.channels;
    const rows = filterTrafficRows(base, q.get('trafficSearch') ?? '', q.get('trafficSort'), q.get('trafficDirection'));
    snapshot.limitations = ['Transakcje GA4 nie sa kanonicznymi zamowieniami sklepu. Liczniki zdarzen nie stanowia sekwencyjnego lejka.', 'Nie sumujemy totalUsers w unikalnych uzytkownikow okresu.', ...data.findings.map(item => item.messagePl)].slice(0, 30);
    snapshot.columns = [{ id: 'dimension', label: 'Wymiar' }, { id: 'sessions', label: 'Sesje', unit: 'szt.' }, { id: 'transactions', label: 'Transakcje', unit: 'szt.' }, { id: 'purchaseRate', label: 'Transakcje / sesje', unit: '%' }];
    snapshot.rows = rows.map(row => ({ id: row.id, values: { dimension: row.label, sessions: row.sessions, transactions: row.transactions, purchaseRate: row.purchasePerSession === null ? null : row.purchasePerSession * 100 } }));
    snapshot.series = data.current.trend.map(row => ({ date: row.label, value: row.sessions }));
    snapshot.seriesMetric = 'Sesje';
    return finish(snapshot, config, [{ id: 'sessions', label: 'Sesje', value: m.sessions, unit: 'szt.', definition: 'Sesje raportowane w wybranym przekroju.' }, { id: 'transactions', label: 'Transakcje GA4', value: m.transactions, unit: 'szt.', definition: 'Transakcje pomiarowe GA4; nie suma zdarzen kluczowych.' }, { id: 'purchaseRate', label: 'Transakcje / sesje', value: m.purchasePerSession === null ? null : m.purchasePerSession * 100, unit: '%', definition: 'Transakcje podzielone przez sesje.' }, { id: 'engagement', label: 'Zaangazowanie sesji', value: m.engagementRate === null ? null : m.engagementRate * 100, unit: '%', definition: 'Sesje zaangazowane / wszystkie sesje.' }]);
}
