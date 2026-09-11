import type { GrowthMeasures, GrowthMetric } from '@papadata/contracts/campaign-growth';
import { formatPapaDataCurrency } from '../../../design-system/foundations';

// Variable fraction-digit precision (0 or 2, chosen per metric below) has no equivalent
// in the shared formatPapaData* helpers, which fix maximumFractionDigits at 2 — kept local.
export function growthNumber(value: GrowthMetric, language: string, digits = 0): string {
    return value === null ? '—' : new Intl.NumberFormat(language, { maximumFractionDigits: digits }).format(value);
}
export function growthMoney(value: GrowthMetric, currency: string | null, language: string): string {
    return value === null || !currency || currency === 'XXX' ? '—' : formatPapaDataCurrency(value, language.startsWith('en') ? 'en' : 'pl', currency);
}
export function growthMetric(value: GrowthMetric, metric: keyof GrowthMeasures, currency: string | null, language: string): string {
    if (['spend', 'revenue', 'cpc', 'cpm', 'cpa'].includes(metric))
        return growthMoney(value, currency, language);
    if (metric === 'ctr')
        return value === null ? '—' : `${growthNumber(value * 100, language, 2)}%`;
    if (metric === 'roas')
        return value === null ? '—' : `${growthNumber(value, language, 2)}×`;
    return growthNumber(value, language, metric === 'conversions' ? 2 : 0);
}
export const growthLabels: Readonly<Record<keyof GrowthMeasures, readonly [
    string,
    string
]>> = {
    spend: ['Wydatki', 'Spend'], impressions: ['Wyświetlenia', 'Impressions'], clicks: ['Kliknięcia', 'Clicks'],
    conversions: ['Konwersje raportowane', 'Reported conversions'], revenue: ['Wartość raportowana', 'Reported value'],
    ctr: ['CTR', 'CTR'], cpc: ['CPC', 'CPC'], cpm: ['CPM', 'CPM'], cpa: ['CPA', 'CPA'], roas: ['ROAS', 'ROAS'],
} as const;
