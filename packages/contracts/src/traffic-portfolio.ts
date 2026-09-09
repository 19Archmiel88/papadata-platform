/** Source-backed traffic contract. Null is unavailable, never an inferred zero. */
export type TrafficAmount = { readonly currency: string; readonly amount: number | null };
export type TrafficMeasures = {
  readonly sessions: number | null;
  readonly engagedSessions: number | null;
  readonly transactions: number | null;
  readonly keyEvents: number | null;
  readonly purchasePerSession: number | null;
  readonly engagementRate: number | null;
  /** Daily/dimensional totalUsers are not additive into a period-unique count. */
  readonly uniqueUsers: null;
  readonly revenue: readonly TrafficAmount[];
};
export type TrafficDimensionRow = TrafficMeasures & { readonly id: string; readonly label: string; readonly sourceRows: number };
export type TrafficEventStep = {
  readonly id: string; readonly event: string; readonly nextEvent: string;
  readonly count: number | null; readonly nextCount: number | null;
  readonly eventRatio: number | null; readonly difference: number | null;
  readonly sequential: false; readonly unit: 'events';
};
export type TrafficFinding = {
  readonly id: string; readonly severity: 'info' | 'warning' | 'error';
  readonly messagePl: string; readonly messageEn: string;
  readonly target: 'integrations' | 'help' | 'decisions';
};
export type TrafficFrame = {
  readonly from: string; readonly to: string; readonly sourceRows: number;
  readonly metrics: TrafficMeasures; readonly channels: readonly TrafficDimensionRow[];
  readonly landingPages: readonly TrafficDimensionRow[]; readonly devices: readonly TrafficDimensionRow[];
  readonly countries: readonly TrafficDimensionRow[]; readonly trend: readonly TrafficDimensionRow[];
  readonly events: readonly TrafficEventStep[];
  readonly orderSources: readonly { readonly provider: string; readonly connectionId: string; readonly orders: number; readonly revenue: readonly TrafficAmount[] }[];
};
export type TrafficPortfolio = {
  readonly version: 'traffic.portfolio.v1'; readonly current: TrafficFrame; readonly previous: TrafficFrame | null;
  readonly scope: {
    readonly timezone: string; readonly propertyTimezones: readonly string[]; readonly calculatedAt: string;
    readonly synchronizedAt: string | null; readonly connectedSources: number;
    readonly grain: 'traffic' | 'traffic_breakdown' | 'mixed'; readonly sourceId?: string | null; readonly breakdownAvailable: boolean;
    readonly eventBreakdownAvailable: boolean; readonly filtersSupported: boolean;
    readonly channel: string | null; readonly device: string | null; readonly country: string | null;
  };
  readonly choices: { readonly sources?: readonly {readonly id:string;readonly label:string}[]; readonly channels: readonly string[]; readonly devices: readonly string[]; readonly countries: readonly string[] };
  readonly findings: readonly TrafficFinding[];
};


/** Shared UI/export ordering, with unavailable values last in either direction. */
export function filterTrafficRows(rows: readonly TrafficDimensionRow[], search: string, sort: string | null, direction: string | null): TrafficDimensionRow[] {
  const filtered=rows.filter(row=>row.label.toLowerCase().includes(search.trim().toLowerCase()));
  const key=(['label','sessions','transactions','purchasePerSession','engagementRate'].includes(sort??'')?sort:'sessions') as 'label'|'sessions'|'transactions'|'purchasePerSession'|'engagementRate';
  const sign=direction==='asc'?1:-1;
  return [...filtered].sort((a,b)=>{
    const left=a[key],right=b[key];
    if(left===null||right===null)return left===right?a.id.localeCompare(b.id):left===null?1:-1;
    return (left<right?-1:left>right?1:0)*sign||a.id.localeCompare(b.id);
  });
}
