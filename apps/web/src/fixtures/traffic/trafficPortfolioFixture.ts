import type { TrafficPortfolio, TrafficDimensionRow } from '@papadata/contracts';
const row = (id: string, sessions: number, transactions: number): TrafficDimensionRow => ({ id, label: id, sessions, transactions, engagedSessions: Math.round(sessions * .6), keyEvents: transactions,
  purchasePerSession: transactions / sessions, engagementRate: .6, uniqueUsers: null, revenue: [{currency:'PLN',amount:transactions * 100}], sourceRows: 1 });
const {id: _id,label: _label,sourceRows: _rows,...metrics} = row('all',400,12);
export const trafficPortfolioFixture: TrafficPortfolio = {
  version:'traffic.portfolio.v1', current:{ from:'2026-09-01',to:'2026-09-08',sourceRows:2,metrics,
    channels:[row('Organic Search',200,8),row('Paid Social',200,4)], landingPages:[row('/kolekcja',300,10),row('/nowosci',100,2)],
    devices:[row('desktop',200,8),row('mobile',200,4)],countries:[row('Poland',400,12)],trend:[row('2026-09-01',200,6),row('2026-09-02',200,6)],
    events:[{id:'view_item',event:'view_item',nextEvent:'add_to_cart',count:300,nextCount:50,eventRatio:50/300,difference:250,sequential:false,unit:'events'}],orderSources:[{provider:'woocommerce',connectionId:'demo-connection',orders:14,revenue:[{currency:'PLN',amount:1400}]}]},
  previous:null,scope:{timezone:'Europe/Warsaw',propertyTimezones:['Europe/Warsaw'],calculatedAt:'2026-09-08T10:00:00Z',synchronizedAt:'2026-09-08T09:45:00Z',connectedSources:1,grain:'traffic',breakdownAvailable:true,eventBreakdownAvailable:true,filtersSupported:true,channel:null,device:null,country:null},
  choices:{channels:['Organic Search','Paid Social'],devices:['desktop','mobile'],countries:['Poland']},findings:[{id:'DEMONSTRATION',severity:'info',messagePl:'Jawny scenariusz demonstracyjny, nie wynik produkcyjny.',messageEn:'An explicit demonstration scenario, not a production result.',target:'help'}],
};
