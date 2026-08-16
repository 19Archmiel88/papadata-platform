import type {
  AttributionView,
  CampaignsRecord,
  CampaignsSummary,
  CohortView,
  CustomersRecord,
  CustomersSummary,
  DiagnosticFinding,
  FunnelStepView,
  OrdersRecord,
  OrdersSummary,
  PageInfo,
  ProductsRecord,
  ProductsSummary,
  RecommendationView,
  TrafficRecord,
  TrafficSummary,
} from '../../../../../contracts/api-schemas';

export type AnalyticsModuleGroup =
  | 'campaigns'
  | 'orders'
  | 'products'
  | 'customers'
  | 'traffic';

export type AnalyticsScreenId =
  | '31.01'
  | '31.02'
  | '31.03'
  | '31.04'
  | '31.05'
  | '31.06'
  | '31.07'
  | '31.08'
  | '32.01'
  | '32.02'
  | '32.03'
  | '32.04'
  | '32.05'
  | '32.06'
  | '32.07'
  | '32.08'
  | '33.01'
  | '33.02'
  | '33.03'
  | '33.04'
  | '33.05'
  | '33.06'
  | '33.07'
  | '33.08'
  | '33.09'
  | '34.01'
  | '34.02'
  | '34.03'
  | '34.04'
  | '34.05'
  | '34.06'
  | '34.07'
  | '34.08'
  | '35.01'
  | '35.02'
  | '35.03'
  | '35.04'
  | '35.05'
  | '35.06'
  | '35.07'
  | '35.08'
  | '35.09';

export type AnalyticsScreenVariant =
  | 'attribution'
  | 'budget'
  | 'catalog'
  | 'channels'
  | 'cohorts'
  | 'detail'
  | 'diagnostics'
  | 'event-quality'
  | 'export'
  | 'funnel'
  | 'funnel-definitions'
  | 'funnel-step'
  | 'ga4-orders'
  | 'gaps'
  | 'identity-conflicts'
  | 'impact'
  | 'landing-pages'
  | 'list'
  | 'mapping'
  | 'offers'
  | 'overview'
  | 'performance'
  | 'privacy'
  | 'recommendations'
  | 'reconciliation'
  | 'segments'
  | 'source-comparison'
  | 'timeline'
  | 'variants';

export type AnalyticsScreenDefinition = {
  readonly apiPath: `/api/v1/${string}`;
  readonly displayTitle: string;
  readonly documentPath: string;
  readonly group: AnalyticsModuleGroup;
  readonly id: AnalyticsScreenId;
  readonly navigation: boolean;
  readonly operationId: string;
  readonly requiresResourceId: boolean;
  readonly route: `/app/${string}`;
  readonly routeBase: `/app/${string}`;
  readonly summary: string;
  readonly variant: AnalyticsScreenVariant;
};

export type CampaignsApiData = {
  readonly attribution?: readonly AttributionView[];
  readonly diagnostics?: readonly DiagnosticFinding[];
  readonly pageInfo?: PageInfo;
  readonly record?: CampaignsRecord;
  readonly records?: readonly CampaignsRecord[];
  readonly recommendations?: readonly RecommendationView[];
  readonly summary?: CampaignsSummary;
};

export type OrdersApiData = {
  readonly pageInfo?: PageInfo;
  readonly record?: OrdersRecord;
  readonly records?: readonly OrdersRecord[];
  readonly summary?: OrdersSummary;
};

export type ProductsApiData = {
  readonly pageInfo?: PageInfo;
  readonly record?: ProductsRecord;
  readonly records?: readonly ProductsRecord[];
  readonly summary?: ProductsSummary;
};

export type CustomersApiData = {
  readonly cohorts?: readonly CohortView[];
  readonly pageInfo?: PageInfo;
  readonly record?: CustomersRecord;
  readonly records?: readonly CustomersRecord[];
  readonly summary?: CustomersSummary;
};

export type TrafficApiData = {
  readonly diagnostics?: readonly DiagnosticFinding[];
  readonly pageInfo?: PageInfo;
  readonly records?: readonly TrafficRecord[];
  readonly steps?: readonly FunnelStepView[];
  readonly summary?: TrafficSummary;
};

export type CampaignsModuleData = {
  readonly attribution: readonly AttributionView[];
  readonly diagnostics: readonly DiagnosticFinding[];
  readonly generatedAt: string;
  readonly group: 'campaigns';
  readonly operationId: string;
  readonly pageInfo: PageInfo;
  readonly record: CampaignsRecord | null;
  readonly records: readonly CampaignsRecord[];
  readonly recommendations: readonly RecommendationView[];
  readonly summary: CampaignsSummary;
};

export type OrdersModuleData = {
  readonly generatedAt: string;
  readonly group: 'orders';
  readonly operationId: string;
  readonly pageInfo: PageInfo;
  readonly record: OrdersRecord | null;
  readonly records: readonly OrdersRecord[];
  readonly summary: OrdersSummary;
};

export type ProductsModuleData = {
  readonly generatedAt: string;
  readonly group: 'products';
  readonly operationId: string;
  readonly pageInfo: PageInfo;
  readonly record: ProductsRecord | null;
  readonly records: readonly ProductsRecord[];
  readonly summary: ProductsSummary;
};

export type CustomersModuleData = {
  readonly cohorts: readonly CohortView[];
  readonly generatedAt: string;
  readonly group: 'customers';
  readonly operationId: string;
  readonly pageInfo: PageInfo;
  readonly record: CustomersRecord | null;
  readonly records: readonly CustomersRecord[];
  readonly summary: CustomersSummary;
};

export type TrafficModuleData = {
  readonly diagnostics: readonly DiagnosticFinding[];
  readonly generatedAt: string;
  readonly group: 'traffic';
  readonly operationId: string;
  readonly pageInfo: PageInfo;
  readonly records: readonly TrafficRecord[];
  readonly steps: readonly FunnelStepView[];
  readonly summary: TrafficSummary;
};

export type AnalyticsModuleData =
  | CampaignsModuleData
  | OrdersModuleData
  | ProductsModuleData
  | CustomersModuleData
  | TrafficModuleData;

export const analyticsScreenDefinitions: readonly AnalyticsScreenDefinition[] = [
{
  apiPath: "/api/v1/campaigns/przeglad",
  displayTitle: "Przegląd",
  documentPath: "08-kampanie-platne/31-01-przeglad.md",
  group: "campaigns",
  id: "31.01",
  navigation: true,
  operationId: "campaigns.overview.read",
  requiresResourceId: false,
  route: "/app/campaigns/przeglad",
  routeBase: "/app/campaigns/przeglad",
  summary: "Koszt, przychód, ROAS i kondycja płatnych kanałów w jednym miejscu.",
  variant: "overview",
},
{
  apiPath: "/api/v1/campaigns/lista-kampanii",
  displayTitle: "Lista kampanii",
  documentPath: "08-kampanie-platne/31-02-lista-kampanii.md",
  group: "campaigns",
  id: "31.02",
  navigation: true,
  operationId: "campaigns.list.read",
  requiresResourceId: false,
  route: "/app/campaigns/lista-kampanii",
  routeBase: "/app/campaigns/lista-kampanii",
  summary: "Lista kampanii z filtrowaniem, sortowaniem i przejściem do szczegółu.",
  variant: "list",
},
{
  apiPath: "/api/v1/campaigns/szczegoly-kampanii",
  displayTitle: "Szczegóły kampanii",
  documentPath: "08-kampanie-platne/31-03-szczegoly-kampanii.md",
  group: "campaigns",
  id: "31.03",
  navigation: false,
  operationId: "campaigns.detail.read",
  requiresResourceId: true,
  route: "/app/campaigns/szczegoly-kampanii/:resourceId",
  routeBase: "/app/campaigns/szczegoly-kampanii",
  summary: "Szczegół kampanii z wynikiem, budżetem i kontekstem kanału.",
  variant: "detail",
},
{
  apiPath: "/api/v1/campaigns/atrybucja-i-sprzedaz",
  displayTitle: "Atrybucja i sprzedaż",
  documentPath: "08-kampanie-platne/31-04-atrybucja-i-sprzedaz.md",
  group: "campaigns",
  id: "31.04",
  navigation: true,
  operationId: "campaigns.attribution-sales.read",
  requiresResourceId: false,
  route: "/app/campaigns/atrybucja-i-sprzedaz",
  routeBase: "/app/campaigns/atrybucja-i-sprzedaz",
  summary: "Porównanie atrybucji z rzeczywistym wkładem źródeł w sprzedaż.",
  variant: "attribution",
},
{
  apiPath: "/api/v1/campaigns/budzet",
  displayTitle: "Budżet",
  documentPath: "08-kampanie-platne/31-05-budzet.md",
  group: "campaigns",
  id: "31.05",
  navigation: true,
  operationId: "campaigns.budget.read",
  requiresResourceId: false,
  route: "/app/campaigns/budzet",
  routeBase: "/app/campaigns/budzet",
  summary: "Tempo wykorzystania budżetu bez ukrywania ograniczeń prognozy.",
  variant: "budget",
},
{
  apiPath: "/api/v1/campaigns/diagnostyka",
  displayTitle: "Diagnostyka",
  documentPath: "08-kampanie-platne/31-06-diagnostyka.md",
  group: "campaigns",
  id: "31.06",
  navigation: true,
  operationId: "campaigns.diagnostics.read",
  requiresResourceId: false,
  route: "/app/campaigns/diagnostyka",
  routeBase: "/app/campaigns/diagnostyka",
  summary: "Problemy danych i kampanii, które wpływają na możliwość podjęcia decyzji.",
  variant: "diagnostics",
},
{
  apiPath: "/api/v1/campaigns/rekomendacje-kontekst-domenowy",
  displayTitle: "Rekomendacje — kontekst domenowy",
  documentPath: "08-kampanie-platne/31-07-rekomendacje-kontekst-domenowy.md",
  group: "campaigns",
  id: "31.07",
  navigation: true,
  operationId: "campaigns.recommendations.read",
  requiresResourceId: false,
  route: "/app/campaigns/rekomendacje-kontekst-domenowy",
  routeBase: "/app/campaigns/rekomendacje-kontekst-domenowy",
  summary: "Rekomendacje kampanii w trybie odczytu, bez pozornych akcji zatwierdzania.",
  variant: "recommendations",
},
{
  apiPath: "/api/v1/campaigns/warianty-kampanii",
  displayTitle: "Warianty kampanii",
  documentPath: "08-kampanie-platne/31-08-warianty-kampanii.md",
  group: "campaigns",
  id: "31.08",
  navigation: true,
  operationId: "campaigns.variants.read",
  requiresResourceId: false,
  route: "/app/campaigns/warianty-kampanii",
  routeBase: "/app/campaigns/warianty-kampanii",
  summary: "Zbiorczy widok wariantów kampanii: ready, partial, empty, error, stale i ograniczenia dostępu.",
  variant: "variants",
},
{
  apiPath: "/api/v1/orders/przeglad",
  displayTitle: "Przegląd",
  documentPath: "09-zamowienia/32-01-przeglad.md",
  group: "orders",
  id: "32.01",
  navigation: true,
  operationId: "orders.overview.read",
  requiresResourceId: false,
  route: "/app/orders/przeglad",
  routeBase: "/app/orders/przeglad",
  summary: "Kondycja zamówień, wartość sprzedaży i rozkład źródeł.",
  variant: "overview",
},
{
  apiPath: "/api/v1/orders/lista",
  displayTitle: "Lista",
  documentPath: "09-zamowienia/32-02-lista.md",
  group: "orders",
  id: "32.02",
  navigation: true,
  operationId: "orders.list.read",
  requiresResourceId: false,
  route: "/app/orders/lista",
  routeBase: "/app/orders/lista",
  summary: "Rejestr zamówień z filtrowaniem i bezpiecznym przejściem do szczegółu.",
  variant: "list",
},
{
  apiPath: "/api/v1/orders/szczegoly",
  displayTitle: "Szczegóły",
  documentPath: "09-zamowienia/32-03-szczegoly.md",
  group: "orders",
  id: "32.03",
  navigation: false,
  operationId: "orders.detail.read",
  requiresResourceId: true,
  route: "/app/orders/szczegoly/:resourceId",
  routeBase: "/app/orders/szczegoly",
  summary: "Szczegół zamówienia z zachowaniem pseudonimizacji i ograniczeń prywatności.",
  variant: "detail",
},
{
  apiPath: "/api/v1/orders/os-zdarzen",
  displayTitle: "Oś zdarzeń",
  documentPath: "09-zamowienia/32-04-os-zdarzen.md",
  group: "orders",
  id: "32.04",
  navigation: true,
  operationId: "orders.os-zdarzen.read",
  requiresResourceId: false,
  route: "/app/orders/os-zdarzen",
  routeBase: "/app/orders/os-zdarzen",
  summary: "Chronologiczny przegląd zamówień dostępnych w bieżącym kontrakcie zdarzeń.",
  variant: "timeline",
},
{
  apiPath: "/api/v1/orders/porownanie-zrodel",
  displayTitle: "Porównanie źródeł",
  documentPath: "09-zamowienia/32-05-porownanie-zrodel.md",
  group: "orders",
  id: "32.05",
  navigation: true,
  operationId: "orders.porownanie-zrodel.read",
  requiresResourceId: false,
  route: "/app/orders/porownanie-zrodel",
  routeBase: "/app/orders/porownanie-zrodel",
  summary: "Porównanie wartości i wolumenu zamówień pomiędzy źródłami.",
  variant: "source-comparison",
},
{
  apiPath: "/api/v1/orders/rekoncyliacja-skrot",
  displayTitle: "Rekoncyliacja — skrót",
  documentPath: "09-zamowienia/32-06-rekoncyliacja-skrot.md",
  group: "orders",
  id: "32.06",
  navigation: true,
  operationId: "orders.rekoncyliacja-skrot.read",
  requiresResourceId: false,
  route: "/app/orders/rekoncyliacja-skrot",
  routeBase: "/app/orders/rekoncyliacja-skrot",
  summary: "Skrót jakości uzgodnienia danych bez oznaczania konfliktów, których nie ma w bieżącym zakresie.",
  variant: "reconciliation",
},
{
  apiPath: "/api/v1/orders/eksport",
  displayTitle: "Eksport",
  documentPath: "09-zamowienia/32-07-eksport.md",
  group: "orders",
  id: "32.07",
  navigation: true,
  operationId: "orders.eksport.read",
  requiresResourceId: false,
  route: "/app/orders/eksport",
  routeBase: "/app/orders/eksport",
  summary: "Stan danych przygotowanych do eksportu; pobranie wymaga osobnej operacji write/export.",
  variant: "export",
},
{
  apiPath: "/api/v1/orders/warianty-zamowien",
  displayTitle: "Warianty zamówień",
  documentPath: "09-zamowienia/32-08-warianty-zamowien.md",
  group: "orders",
  id: "32.08",
  navigation: true,
  operationId: "orders.variants.read",
  requiresResourceId: false,
  route: "/app/orders/warianty-zamowien",
  routeBase: "/app/orders/warianty-zamowien",
  summary: "Zbiorczy widok stanów zamówień, źródeł i ograniczeń danych w jednym kontrakcie odczytu.",
  variant: "variants",
},
{
  apiPath: "/api/v1/products/przeglad",
  displayTitle: "Przegląd",
  documentPath: "10-produkty/33-01-przeglad.md",
  group: "products",
  id: "33.01",
  navigation: true,
  operationId: "products.overview.read",
  requiresResourceId: false,
  route: "/app/products/przeglad",
  routeBase: "/app/products/przeglad",
  summary: "Kondycja katalogu, sprzedaż, jednostki i jakość mapowania produktów.",
  variant: "overview",
},
{
  apiPath: "/api/v1/products/katalog",
  displayTitle: "Katalog",
  documentPath: "10-produkty/33-02-katalog.md",
  group: "products",
  id: "33.02",
  navigation: true,
  operationId: "products.catalog.read",
  requiresResourceId: false,
  route: "/app/products/katalog",
  routeBase: "/app/products/katalog",
  summary: "Katalog produktów z filtrowaniem i przejściem do szczegółu.",
  variant: "catalog",
},
{
  apiPath: "/api/v1/products/szczegoly",
  displayTitle: "Szczegóły",
  documentPath: "10-produkty/33-03-szczegoly.md",
  group: "products",
  id: "33.03",
  navigation: false,
  operationId: "products.detail.read",
  requiresResourceId: true,
  route: "/app/products/szczegoly/:resourceId",
  routeBase: "/app/products/szczegoly",
  summary: "Szczegół produktu oparty na aktualnych danych katalogu.",
  variant: "detail",
},
{
  apiPath: "/api/v1/products/mapowanie",
  displayTitle: "Mapowanie",
  documentPath: "10-produkty/33-04-mapowanie.md",
  group: "products",
  id: "33.04",
  navigation: true,
  operationId: "products.mapping.read",
  requiresResourceId: false,
  route: "/app/products/mapowanie",
  routeBase: "/app/products/mapowanie",
  summary: "Widok jakości mapowania z listą pozycji wymagających pracy katalogowej.",
  variant: "mapping",
},
{
  apiPath: "/api/v1/products/oferty",
  displayTitle: "Oferty",
  documentPath: "10-produkty/33-05-oferty.md",
  group: "products",
  id: "33.05",
  navigation: true,
  operationId: "products.offers.read",
  requiresResourceId: false,
  route: "/app/products/oferty",
  routeBase: "/app/products/oferty",
  summary: "Przegląd ofert dostępnych w obecnym modelu produktu.",
  variant: "offers",
},
{
  apiPath: "/api/v1/products/wydajnosc",
  displayTitle: "Wydajność",
  documentPath: "10-produkty/33-06-wydajnosc.md",
  group: "products",
  id: "33.06",
  navigation: true,
  operationId: "products.performance.read",
  requiresResourceId: false,
  route: "/app/products/wydajnosc",
  routeBase: "/app/products/wydajnosc",
  summary: "Wydajność produktów oparta na przychodzie, jednostkach i marży.",
  variant: "performance",
},
{
  apiPath: "/api/v1/products/kolejka-brakow",
  displayTitle: "Kolejka braków",
  documentPath: "10-produkty/33-07-kolejka-brakow.md",
  group: "products",
  id: "33.07",
  navigation: true,
  operationId: "products.gaps.queue.read",
  requiresResourceId: false,
  route: "/app/products/kolejka-brakow",
  routeBase: "/app/products/kolejka-brakow",
  summary: "Kolejka produktów wymagających uzupełnienia lub poprawy mapowania.",
  variant: "gaps",
},
{
  apiPath: "/api/v1/products/analiza-wplywu",
  displayTitle: "Analiza wpływu",
  documentPath: "10-produkty/33-08-analiza-wplywu.md",
  group: "products",
  id: "33.08",
  navigation: true,
  operationId: "products.impact.read",
  requiresResourceId: false,
  route: "/app/products/analiza-wplywu",
  routeBase: "/app/products/analiza-wplywu",
  summary: "Analiza potencjalnego wpływu problemów produktowych na wynik.",
  variant: "impact",
},
{
  apiPath: "/api/v1/products/warianty-produktow",
  displayTitle: "Warianty produktów",
  documentPath: "10-produkty/33-09-warianty-produktow.md",
  group: "products",
  id: "33.09",
  navigation: true,
  operationId: "products.variants.read",
  requiresResourceId: false,
  route: "/app/products/warianty-produktow",
  routeBase: "/app/products/warianty-produktow",
  summary: "Zbiorczy widok stanów katalogu produktu: gotowe, braki, mapowanie, pusty zestaw i ograniczenia źródeł.",
  variant: "variants",
},
{
  apiPath: "/api/v1/customers/przeglad",
  displayTitle: "Przegląd",
  documentPath: "11-klienci/34-01-przeglad.md",
  group: "customers",
  id: "34.01",
  navigation: true,
  operationId: "customers.overview.read",
  requiresResourceId: false,
  route: "/app/customers/przeglad",
  routeBase: "/app/customers/przeglad",
  summary: "Pseudonimizowany obraz klientów, przychodu i jakości zgód.",
  variant: "overview",
},
{
  apiPath: "/api/v1/customers/segmenty",
  displayTitle: "Segmenty",
  documentPath: "11-klienci/34-02-segmenty.md",
  group: "customers",
  id: "34.02",
  navigation: true,
  operationId: "customers.segments.read",
  requiresResourceId: false,
  route: "/app/customers/segmenty",
  routeBase: "/app/customers/segmenty",
  summary: "Segmenty z liczbą klientów, przychodem i LTV bez danych osobowych.",
  variant: "segments",
},
{
  apiPath: "/api/v1/customers/kohorty",
  displayTitle: "Kohorty",
  documentPath: "11-klienci/34-03-kohorty.md",
  group: "customers",
  id: "34.03",
  navigation: true,
  operationId: "customers.cohorts.read",
  requiresResourceId: false,
  route: "/app/customers/kohorty",
  routeBase: "/app/customers/kohorty",
  summary: "Kohorty i retencja w układzie porównawczym.",
  variant: "cohorts",
},
{
  apiPath: "/api/v1/customers/szczegoly-pseudonimizowane",
  displayTitle: "Szczegóły pseudonimizowane",
  documentPath: "11-klienci/34-04-szczegoly-pseudonimizowane.md",
  group: "customers",
  id: "34.04",
  navigation: false,
  operationId: "customers.pseudonymized-detail.read",
  requiresResourceId: true,
  route: "/app/customers/szczegoly-pseudonimizowane/:resourceId",
  routeBase: "/app/customers/szczegoly-pseudonimizowane",
  summary: "Szczegół pseudonimizowany klienta w granicach aktualnego capability.",
  variant: "detail",
},
{
  apiPath: "/api/v1/customers/konflikty-tozsamosci",
  displayTitle: "Konflikty tożsamości",
  documentPath: "11-klienci/34-05-konflikty-tozsamosci.md",
  group: "customers",
  id: "34.05",
  navigation: true,
  operationId: "customers.identity-conflicts.read",
  requiresResourceId: false,
  route: "/app/customers/konflikty-tozsamosci",
  routeBase: "/app/customers/konflikty-tozsamosci",
  summary: "Rejestr rekordów wymagających uwagi przy rozwiązywaniu tożsamości.",
  variant: "identity-conflicts",
},
{
  apiPath: "/api/v1/customers/prywatnosc",
  displayTitle: "Prywatność",
  documentPath: "11-klienci/34-06-prywatnosc.md",
  group: "customers",
  id: "34.06",
  navigation: true,
  operationId: "customers.privacy.read",
  requiresResourceId: false,
  route: "/app/customers/prywatnosc",
  routeBase: "/app/customers/prywatnosc",
  summary: "Stan zgód i prywatności bez ujawniania danych identyfikujących.",
  variant: "privacy",
},
{
  apiPath: "/api/v1/customers/analiza-wplywu",
  displayTitle: "Analiza wpływu",
  documentPath: "11-klienci/34-07-analiza-wplywu.md",
  group: "customers",
  id: "34.07",
  navigation: true,
  operationId: "customers.impact.read",
  requiresResourceId: false,
  route: "/app/customers/analiza-wplywu",
  routeBase: "/app/customers/analiza-wplywu",
  summary: "Wpływ segmentów klientów na sprzedaż i LTV.",
  variant: "impact",
},
{
  apiPath: "/api/v1/customers/warianty-klientow",
  displayTitle: "Warianty klientów",
  documentPath: "11-klienci/34-08-warianty-klientow.md",
  group: "customers",
  id: "34.08",
  navigation: true,
  operationId: "customers.variants.read",
  requiresResourceId: false,
  route: "/app/customers/warianty-klientow",
  routeBase: "/app/customers/warianty-klientow",
  summary: "Zbiorczy widok stanów klientów, zgód, pseudonimizacji, segmentów, kohort i konfliktów tożsamości.",
  variant: "variants",
},
{
  apiPath: "/api/v1/traffic/przeglad-ruchu",
  displayTitle: "Przegląd ruchu",
  documentPath: "12-ruch-i-lejek/35-01-przeglad-ruchu.md",
  group: "traffic",
  id: "35.01",
  navigation: true,
  operationId: "traffic.overview.read",
  requiresResourceId: false,
  route: "/app/traffic/przeglad-ruchu",
  routeBase: "/app/traffic/przeglad-ruchu",
  summary: "Ruch, użytkownicy, konwersje i przychód w jednym przekrojowym widoku.",
  variant: "overview",
},
{
  apiPath: "/api/v1/traffic/kanaly",
  displayTitle: "Kanały",
  documentPath: "12-ruch-i-lejek/35-02-kanaly.md",
  group: "traffic",
  id: "35.02",
  navigation: true,
  operationId: "traffic.channels.read",
  requiresResourceId: false,
  route: "/app/traffic/kanaly",
  routeBase: "/app/traffic/kanaly",
  summary: "Porównanie kanałów według ruchu, konwersji i sprzedaży.",
  variant: "channels",
},
{
  apiPath: "/api/v1/traffic/lejek-widok",
  displayTitle: "Lejek — widok",
  documentPath: "12-ruch-i-lejek/35-03-lejek-widok.md",
  group: "traffic",
  id: "35.03",
  navigation: true,
  operationId: "traffic.funnel.read",
  requiresResourceId: false,
  route: "/app/traffic/lejek-widok",
  routeBase: "/app/traffic/lejek-widok",
  summary: "Lejek sprzedażowy oparty na krokach ścieżki i konwersjach.",
  variant: "funnel",
},
{
  apiPath: "/api/v1/traffic/lejek-szczegoly-kroku",
  displayTitle: "Lejek — szczegóły kroku",
  documentPath: "12-ruch-i-lejek/35-04-lejek-szczegoly-kroku.md",
  group: "traffic",
  id: "35.04",
  navigation: false,
  operationId: "traffic.funnel-step.read",
  requiresResourceId: true,
  route: "/app/traffic/lejek-szczegoly-kroku/:resourceId",
  routeBase: "/app/traffic/lejek-szczegoly-kroku",
  summary: "Szczegół wybranego kroku lejka z kontekstem wejść i konwersji.",
  variant: "funnel-step",
},
{
  apiPath: "/api/v1/traffic/definicje-lejka",
  displayTitle: "Definicje lejka",
  documentPath: "12-ruch-i-lejek/35-05-definicje-lejka.md",
  group: "traffic",
  id: "35.05",
  navigation: true,
  operationId: "traffic.funnel-definitions.read",
  requiresResourceId: false,
  route: "/app/traffic/definicje-lejka",
  routeBase: "/app/traffic/definicje-lejka",
  summary: "Definicje kroków lejka; edycja pozostaje niedostępna bez operacji mutującej.",
  variant: "funnel-definitions",
},
{
  apiPath: "/api/v1/traffic/ga4-vs-zamowienia",
  displayTitle: "GA4 vs zamówienia",
  documentPath: "12-ruch-i-lejek/35-06-ga4-vs-zamowienia.md",
  group: "traffic",
  id: "35.06",
  navigation: true,
  operationId: "traffic.ga4-orders.read",
  requiresResourceId: false,
  route: "/app/traffic/ga4-vs-zamowienia",
  routeBase: "/app/traffic/ga4-vs-zamowienia",
  summary: "Porównanie ruchu z warstwą zamówień w zakresie danych dostępnych w kontrakcie.",
  variant: "ga4-orders",
},
{
  apiPath: "/api/v1/traffic/jakosc-zdarzen",
  displayTitle: "Jakość zdarzeń",
  documentPath: "12-ruch-i-lejek/35-07-jakosc-zdarzen.md",
  group: "traffic",
  id: "35.07",
  navigation: true,
  operationId: "traffic.event-quality.read",
  requiresResourceId: false,
  route: "/app/traffic/jakosc-zdarzen",
  routeBase: "/app/traffic/jakosc-zdarzen",
  summary: "Diagnostyka kompletności i jakości zdarzeń.",
  variant: "event-quality",
},
{
  apiPath: "/api/v1/traffic/strony-wejscia",
  displayTitle: "Strony wejścia",
  documentPath: "12-ruch-i-lejek/35-08-strony-wejscia.md",
  group: "traffic",
  id: "35.08",
  navigation: true,
  operationId: "traffic.landing-pages.read",
  requiresResourceId: false,
  route: "/app/traffic/strony-wejscia",
  routeBase: "/app/traffic/strony-wejscia",
  summary: "Strony wejścia uszeregowane według ruchu, konwersji i przychodu.",
  variant: "landing-pages",
},
{
  apiPath: "/api/v1/traffic/warianty-ruchu",
  displayTitle: "Warianty ruchu",
  documentPath: "12-ruch-i-lejek/35-09-warianty-ruchu.md",
  group: "traffic",
  id: "35.09",
  navigation: true,
  operationId: "traffic.variants.read",
  requiresResourceId: false,
  route: "/app/traffic/warianty-ruchu",
  routeBase: "/app/traffic/warianty-ruchu",
  summary: "Zbiorczy widok stanów ruchu, lejka, jakości eventów, GA4 vs zamówienia i stron wejścia.",
  variant: "variants",
},
];

export const analyticsModuleTitles = {
  campaigns: 'Kampanie płatne',
  customers: 'Klienci',
  orders: 'Zamówienia',
  products: 'Produkty',
  traffic: 'Ruch na stronie / lejek',
} satisfies Record<AnalyticsModuleGroup, string>;

export const analyticsModuleRootRoutes = {
  campaigns: '/app/campaigns/przeglad',
  customers: '/app/customers/przeglad',
  orders: '/app/orders/przeglad',
  products: '/app/products/przeglad',
  traffic: '/app/traffic/przeglad-ruchu',
} satisfies Record<AnalyticsModuleGroup, `/app/${string}`>;

export function findAnalyticsScreenDefinition(
  idOrRoute: string,
): AnalyticsScreenDefinition | null {
  const normalizedPath = idOrRoute.split('?')[0] ?? idOrRoute;

  return analyticsScreenDefinitions.find((definition) => (
    definition.id === idOrRoute
    || definition.routeBase === normalizedPath
    || (
      definition.requiresResourceId
      && normalizedPath.startsWith(`${definition.routeBase}/`)
    )
  )) ?? null;
}

export function getAnalyticsModuleNavigation(
  group: AnalyticsModuleGroup,
) {
  return analyticsScreenDefinitions
    .filter((definition) => definition.group === group && definition.navigation)
    .map((definition) => ({
      href: definition.routeBase,
      id: definition.id,
      label: definition.displayTitle,
    }));
}

export function getAnalyticsDetailDefinition(
  group: AnalyticsModuleGroup,
): AnalyticsScreenDefinition | null {
  return analyticsScreenDefinitions.find((definition) => (
    definition.group === group
    && definition.variant === 'detail'
  )) ?? null;
}

export function createCampaignsRuntimeData(
  definition: AnalyticsScreenDefinition,
  data: CampaignsApiData,
): CampaignsModuleData {
  const records = data.record ? [data.record] : [...(data.records ?? [])];
  const summary = normalizeSummary(data.summary, records.length);

  return {
    attribution: [...(data.attribution ?? [])],
    diagnostics: [...(data.diagnostics ?? [])],
    generatedAt: summary.updatedAt,
    group: 'campaigns',
    operationId: definition.operationId,
    pageInfo: normalizePageInfo(data.pageInfo, records.length),
    record: data.record ?? records[0] ?? null,
    records,
    recommendations: [...(data.recommendations ?? [])],
    summary,
  };
}

export function createOrdersRuntimeData(
  definition: AnalyticsScreenDefinition,
  data: OrdersApiData,
): OrdersModuleData {
  const records = data.record ? [data.record] : [...(data.records ?? [])];
  const summary = normalizeSummary(data.summary, records.length);

  return {
    generatedAt: summary.updatedAt,
    group: 'orders',
    operationId: definition.operationId,
    pageInfo: normalizePageInfo(data.pageInfo, records.length),
    record: data.record ?? records[0] ?? null,
    records,
    summary,
  };
}

export function createProductsRuntimeData(
  definition: AnalyticsScreenDefinition,
  data: ProductsApiData,
): ProductsModuleData {
  const records = data.record ? [data.record] : [...(data.records ?? [])];
  const summary = normalizeSummary(data.summary, records.length);

  return {
    generatedAt: summary.updatedAt,
    group: 'products',
    operationId: definition.operationId,
    pageInfo: normalizePageInfo(data.pageInfo, records.length),
    record: data.record ?? records[0] ?? null,
    records,
    summary,
  };
}

export function createCustomersRuntimeData(
  definition: AnalyticsScreenDefinition,
  data: CustomersApiData,
): CustomersModuleData {
  const records = data.record ? [data.record] : [...(data.records ?? [])];
  const summary = normalizeSummary(data.summary, records.length);

  return {
    cohorts: [...(data.cohorts ?? [])],
    generatedAt: summary.updatedAt,
    group: 'customers',
    operationId: definition.operationId,
    pageInfo: normalizePageInfo(data.pageInfo, records.length),
    record: data.record ?? records[0] ?? null,
    records,
    summary,
  };
}

export function createTrafficRuntimeData(
  definition: AnalyticsScreenDefinition,
  data: TrafficApiData,
): TrafficModuleData {
  const records = [...(data.records ?? [])];
  const summary = normalizeSummary(data.summary, records.length);

  return {
    diagnostics: [...(data.diagnostics ?? [])],
    generatedAt: summary.updatedAt,
    group: 'traffic',
    operationId: definition.operationId,
    pageInfo: normalizePageInfo(data.pageInfo, records.length),
    records,
    steps: [...(data.steps ?? [])],
    summary,
  };
}

const storyGeneratedAt = '2026-08-12T09:30:00+02:00';

const campaignStoryRecords: readonly CampaignsRecord[] = [
  {
    budget: { amount: 120000, currency: 'PLN' },
    campaignId: '31111111-1111-4111-8111-111111111101',
    channel: 'googleAds',
    name: 'Search · Brand + High Intent',
    revenue: { amount: 421000, currency: 'PLN' },
    roas: 4.82,
    spend: { amount: 87300, currency: 'PLN' },
    status: 'active',
  },
  {
    budget: { amount: 90000, currency: 'PLN' },
    campaignId: '31111111-1111-4111-8111-111111111102',
    channel: 'metaAds',
    name: 'Meta · Prospecting',
    revenue: { amount: 256000, currency: 'PLN' },
    roas: 3.12,
    spend: { amount: 82100, currency: 'PLN' },
    status: 'active',
  },
  {
    budget: { amount: 46000, currency: 'PLN' },
    campaignId: '31111111-1111-4111-8111-111111111103',
    channel: 'googleAds',
    name: 'Performance Max · Bestsellery',
    revenue: { amount: 147000, currency: 'PLN' },
    roas: 3.74,
    spend: { amount: 39300, currency: 'PLN' },
    status: 'paused',
  },
  {
    budget: { amount: 18000, currency: 'PLN' },
    campaignId: '31111111-1111-4111-8111-111111111104',
    channel: 'tiktokAds',
    name: 'TikTok · Test kreacji',
    revenue: { amount: 28400, currency: 'PLN' },
    roas: 1.82,
    spend: { amount: 15600, currency: 'PLN' },
    status: 'draft',
  },
];

const orderStoryRecords: readonly OrdersRecord[] = [
  { amount: { amount: 349.9, currency: 'PLN' }, customerPseudonym: 'cust_a81f', externalOrderId: 'SHOP-10492', orderId: '32222222-2222-4222-8222-222222222201', orderedAt: '2026-08-12T08:42:00+02:00', source: 'Shopify', status: 'paid' },
  { amount: { amount: 189.0, currency: 'PLN' }, customerPseudonym: 'cust_c103', externalOrderId: 'SHOP-10491', orderId: '32222222-2222-4222-8222-222222222202', orderedAt: '2026-08-12T08:11:00+02:00', source: 'Shopify', status: 'fulfilled' },
  { amount: { amount: 529.0, currency: 'PLN' }, customerPseudonym: 'cust_77bd', externalOrderId: 'ALL-88341', orderId: '32222222-2222-4222-8222-222222222203', orderedAt: '2026-08-12T07:56:00+02:00', source: 'Allegro', status: 'paid' },
  { amount: { amount: 129.5, currency: 'PLN' }, customerPseudonym: 'cust_1f20', externalOrderId: 'SHOP-10489', orderId: '32222222-2222-4222-8222-222222222204', orderedAt: '2026-08-12T07:21:00+02:00', source: 'Shopify', status: 'refunded' },
  { amount: { amount: 799.0, currency: 'PLN' }, customerPseudonym: null, externalOrderId: 'MAN-0281', orderId: '32222222-2222-4222-8222-222222222205', orderedAt: '2026-08-11T18:40:00+02:00', source: 'Manual', status: 'new' },
  { amount: { amount: 259.9, currency: 'PLN' }, customerPseudonym: 'cust_51aa', externalOrderId: 'ALL-88337', orderId: '32222222-2222-4222-8222-222222222206', orderedAt: '2026-08-11T17:32:00+02:00', source: 'Allegro', status: 'cancelled' },
];

const productStoryRecords: readonly ProductsRecord[] = [
  { category: 'Bestsellery', margin: 0.41, name: 'Papa Lamp One', productId: '33333333-3333-4333-8333-333333333301', revenue: { amount: 184000, currency: 'PLN' }, sku: 'LAMP-001', status: 'active', units: 820 },
  { category: 'Akcesoria', margin: 0.36, name: 'Papa Shade Linen', productId: '33333333-3333-4333-8333-333333333302', revenue: { amount: 96200, currency: 'PLN' }, sku: 'SHADE-014', status: 'active', units: 1330 },
  { category: 'Bestsellery', margin: 0.44, name: 'Papa Desk Mini', productId: '33333333-3333-4333-8333-333333333303', revenue: { amount: 141500, currency: 'PLN' }, sku: 'DESK-004', status: 'active', units: 370 },
  { category: null, margin: null, name: 'Import SKU 8812', productId: '33333333-3333-4333-8333-333333333304', revenue: { amount: 11800, currency: 'PLN' }, sku: 'EXT-8812', status: 'missingMapping', units: 82 },
  { category: 'Archiwum', margin: 0.28, name: 'Papa Lamp Classic', productId: '33333333-3333-4333-8333-333333333305', revenue: { amount: 7400, currency: 'PLN' }, sku: 'LAMP-OLD', status: 'archived', units: 19 },
];

const customerStoryRecords: readonly CustomersRecord[] = [
  { cohortKey: '2026-05', consentStatus: 'granted', customerPseudonym: 'cust_a81f', ltv: { amount: 1180, currency: 'PLN' }, ordersCount: 7, revenue: { amount: 1030, currency: 'PLN' }, segmentId: '34444444-4444-4444-8444-444444444401' },
  { cohortKey: '2026-05', consentStatus: 'granted', customerPseudonym: 'cust_c103', ltv: { amount: 740, currency: 'PLN' }, ordersCount: 4, revenue: { amount: 612, currency: 'PLN' }, segmentId: '34444444-4444-4444-8444-444444444401' },
  { cohortKey: '2026-06', consentStatus: 'unknown', customerPseudonym: 'cust_77bd', ltv: { amount: 530, currency: 'PLN' }, ordersCount: 3, revenue: { amount: 529, currency: 'PLN' }, segmentId: '34444444-4444-4444-8444-444444444402' },
  { cohortKey: '2026-07', consentStatus: 'withdrawn', customerPseudonym: 'cust_1f20', ltv: { amount: 240, currency: 'PLN' }, ordersCount: 2, revenue: { amount: 219, currency: 'PLN' }, segmentId: '34444444-4444-4444-8444-444444444403' },
  { cohortKey: '2026-07', consentStatus: 'granted', customerPseudonym: 'cust_51aa', ltv: { amount: 410, currency: 'PLN' }, ordersCount: 2, revenue: { amount: 389, currency: 'PLN' }, segmentId: '34444444-4444-4444-8444-444444444402' },
  { cohortKey: null, consentStatus: 'unknown', customerPseudonym: 'cust_90fe', ltv: null, ordersCount: 1, revenue: { amount: 149, currency: 'PLN' }, segmentId: null },
];

const trafficStoryRecords: readonly TrafficRecord[] = [
  { channel: 'Organic Search', conversionRate: 0.041, conversions: 1820, dimensionKey: 'organic-search', eventQuality: 0.98, landingPage: '/collections/bestsellery', revenue: { amount: 284000, currency: 'PLN' }, sessions: 44200, users: 38100 },
  { channel: 'Google Ads', conversionRate: 0.036, conversions: 1490, dimensionKey: 'google-ads', eventQuality: 0.97, landingPage: '/products/papa-lamp-one', revenue: { amount: 241000, currency: 'PLN' }, sessions: 41600, users: 35900 },
  { channel: 'Meta Ads', conversionRate: 0.024, conversions: 840, dimensionKey: 'meta-ads', eventQuality: 0.91, landingPage: '/collections/nowosci', revenue: { amount: 132000, currency: 'PLN' }, sessions: 35200, users: 31700 },
  { channel: 'Direct', conversionRate: 0.052, conversions: 610, dimensionKey: 'direct', eventQuality: 0.99, landingPage: '/', revenue: { amount: 108000, currency: 'PLN' }, sessions: 11800, users: 10400 },
  { channel: 'Email', conversionRate: 0.061, conversions: 420, dimensionKey: 'email', eventQuality: 0.96, landingPage: '/collections/loyalty', revenue: { amount: 88400, currency: 'PLN' }, sessions: 6900, users: 6200 },
  { channel: 'Referral', conversionRate: 0.029, conversions: 170, dimensionKey: 'referral', eventQuality: 0.88, landingPage: '/pages/inspiracje', revenue: { amount: 29400, currency: 'PLN' }, sessions: 5900, users: 5300 },
];

const storyAttribution: readonly AttributionView[] = [
  { contribution: 0.52, model: 'data-driven', orders: 2180, revenue: { amount: 421000, currency: 'PLN' }, source: 'Google Ads' },
  { contribution: 0.31, model: 'data-driven', orders: 1390, revenue: { amount: 256000, currency: 'PLN' }, source: 'Meta Ads' },
  { contribution: 0.17, model: 'data-driven', orders: 740, revenue: { amount: 147000, currency: 'PLN' }, source: 'Organic assist' },
];

const storyDiagnostics: readonly DiagnosticFinding[] = [
  { code: 'GA4_EVENT_FRESHNESS', findingId: '35555555-5555-4555-8555-555555555501', message: 'Świeżość części eventów spadła poniżej docelowego progu.', severity: 'warning', sourceRef: 'Eventy GA4' },
  { code: 'MAPPING_GAP', findingId: '35555555-5555-4555-8555-555555555502', message: 'Część rekordów wymaga uzupełnienia mapowania przed pełnym porównaniem.', severity: 'info', sourceRef: 'Mapowanie produktów' },
];

const storyRecommendations: readonly RecommendationView[] = [
  { confidence: 0.88, impact: 'high', rationale: 'Search utrzymuje ROAS powyżej celu przy stabilnej jakości danych.', recommendationId: '31666666-6666-4666-8666-666666666601', title: 'Utrzymaj budżet Search i ogranicz prospecting Meta o 8%' },
  { confidence: 0.81, impact: 'medium', rationale: 'Wynik PMax rośnie, ale część produktów nie ma kompletnego mapowania.', recommendationId: '31666666-6666-4666-8666-666666666602', title: 'Napraw mapowanie bestsellerów przed kolejną zmianą budżetu' },
];

const storyCohorts: readonly CohortView[] = [
  { cohortKey: '2026-05', retentionRate: 0.42, revenue: { amount: 164200, currency: 'PLN' }, users: 1840 },
  { cohortKey: '2026-06', retentionRate: 0.36, revenue: { amount: 138500, currency: 'PLN' }, users: 2010 },
  { cohortKey: '2026-07', retentionRate: 0.29, revenue: { amount: 116900, currency: 'PLN' }, users: 2280 },
];

const storyFunnelSteps: readonly FunnelStepView[] = [
  { completions: 14320, conversionRate: 0.118, entrants: 121400, label: 'Sesja → koszyk', stepId: 'session-cart' },
  { completions: 6730, conversionRate: 0.47, entrants: 14320, label: 'Koszyk → checkout', stepId: 'cart-checkout' },
  { completions: 4595, conversionRate: 0.683, entrants: 6730, label: 'Checkout → zakup', stepId: 'checkout-purchase' },
];

export function createAnalyticsStorybookData(
  definition: AnalyticsScreenDefinition,
): AnalyticsModuleData {
  switch (definition.group) {
    case 'campaigns':
      return createCampaignsRuntimeData(definition, {
        attribution: storyAttribution,
        diagnostics: storyDiagnostics,
        pageInfo: { nextCursor: null, total: campaignStoryRecords.length },
        record: definition.variant === 'detail' ? campaignStoryRecords[0] : undefined,
        records: campaignStoryRecords,
        recommendations: storyRecommendations,
        summary: storySummary(campaignStoryRecords.length, 2, 1),
      });
    case 'orders':
      return createOrdersRuntimeData(definition, {
        pageInfo: { nextCursor: null, total: orderStoryRecords.length },
        record: definition.variant === 'detail' ? orderStoryRecords[0] : undefined,
        records: orderStoryRecords,
        summary: storySummary(orderStoryRecords.length, 4, 1),
      });
    case 'products':
      return createProductsRuntimeData(definition, {
        pageInfo: { nextCursor: null, total: productStoryRecords.length },
        record: definition.variant === 'detail' ? productStoryRecords[0] : undefined,
        records: productStoryRecords,
        summary: storySummary(productStoryRecords.length, 3, 2),
      });
    case 'customers':
      return createCustomersRuntimeData(definition, {
        cohorts: storyCohorts,
        pageInfo: { nextCursor: null, total: customerStoryRecords.length },
        record: definition.variant === 'detail' ? customerStoryRecords[0] : undefined,
        records: customerStoryRecords,
        summary: storySummary(customerStoryRecords.length, 4, 2),
      });
    case 'traffic':
      return createTrafficRuntimeData(definition, {
        diagnostics: storyDiagnostics,
        pageInfo: { nextCursor: null, total: trafficStoryRecords.length },
        records: trafficStoryRecords,
        steps: storyFunnelSteps,
        summary: storySummary(trafficStoryRecords.length, 4, 2),
      });
  }
}

function normalizePageInfo(
  pageInfo: PageInfo | undefined,
  fallbackTotal: number,
): PageInfo {
  return {
    nextCursor: pageInfo?.nextCursor ?? null,
    total: pageInfo?.total ?? fallbackTotal,
  };
}

function normalizeSummary<TSummary extends {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: string;
  readonly warning: number;
}>(
  summary: TSummary | undefined,
  fallbackTotal: number,
): TSummary {
  return (summary ?? {
    critical: 0,
    ready: fallbackTotal,
    total: fallbackTotal,
    updatedAt: storyGeneratedAt,
    warning: 0,
  }) as TSummary;
}

function storySummary(
  total: number,
  ready: number,
  warning: number,
) {
  return {
    critical: Math.max(0, total - ready - warning),
    ready,
    total,
    updatedAt: storyGeneratedAt,
    warning,
  };
}
