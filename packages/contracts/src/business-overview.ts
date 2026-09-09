import type { CommerceMeta, CommerceRange } from './commerce-portfolio.js';

export type BusinessMetricId = 'gross' | 'orders' | 'refunds' | 'afterRefunds' | 'adSpend' | 'margin';
export type BusinessMetric = {
  readonly id: BusinessMetricId; readonly value: number | null; readonly previous: number | null;
  readonly unit: 'money' | 'count'; readonly definition: string; readonly limitation: string | null;
  readonly observedRecords: number; readonly synchronizedAt: string | null;
};
export type BusinessOverview = {
  readonly version: 'business.overview.v1'; readonly meta: CommerceMeta;
  readonly comparisonAllowed: boolean; readonly comparison: CommerceRange; readonly comparisonMode: 'previous' | 'year';
  readonly metrics: readonly BusinessMetric[];
  readonly points: readonly { readonly date: string; readonly previousDate: string; readonly values: Readonly<Record<BusinessMetricId, number | null>>; readonly previous: Readonly<Record<BusinessMetricId, number | null>> }[];
  readonly advertising: { readonly status: 'ready' | 'unavailable'; readonly limitation: string | null; readonly sources: readonly { readonly id: string; readonly label: string; readonly synchronizedAt: string | null }[] };
  readonly decisions: { readonly status: 'ready' | 'forbidden' | 'unavailable'; readonly total: number | null; readonly records: readonly { readonly id: string; readonly title: string; readonly priority: 'high' | 'medium' | 'low'; readonly status: string; readonly owner: string | null; readonly due: string | null }[] };
};
export function businessDateShift(value: string, days: number): string {
  return new Date(Date.parse(value+'T00:00:00.000Z') + days*86400000).toISOString().slice(0,10);
}
export function businessComparison(range: CommerceRange, mode: 'previous' | 'year'): CommerceRange {
  const length=Math.round((Date.parse(range.to)-Date.parse(range.from))/86400000)+1;
  // Year means the same starting calendar day, clamped for leap day, and equal duration.
  if(mode==='year') {
    const date=new Date(range.from+'T00:00:00Z'),month=date.getUTCMonth(),day=date.getUTCDate();
    const from=new Date(Date.UTC(date.getUTCFullYear()-1,month,Math.min(day,new Date(Date.UTC(date.getUTCFullYear()-1,month+1,0)).getUTCDate()))).toISOString().slice(0,10);
    return {...range,from,to:businessDateShift(from,length-1)};
  }
  return {...range,from:businessDateShift(range.from,-length),to:businessDateShift(range.from,-1)};
}
export function businessChange(current: number | null, previous: number | null): number | null {
  return current===null||previous===null||previous===0?null:(current-previous)/Math.abs(previous)*100;
}
