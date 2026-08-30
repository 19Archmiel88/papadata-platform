export type MarketingSupportTone =
  | 'amber'
  | 'emerald'
  | 'indigo'
  | 'rose'
  | 'slate';

export type MarketingSupportTabId =
  | 'architecture'
  | 'brief-builder'
  | 'outcomes'
  | 'overview'
  | 'workspace';

export const marketingSupportTabs = [
  {
    badge: null,
    id: 'overview',
    label: 'Centrum Dowodzenia',
  },
  {
    badge: '2',
    id: 'workspace',
    label: 'Aktywne Sprawy',
  },
  {
    badge: null,
    id: 'brief-builder',
    label: '+ Nowy Brief',
  },
  {
    badge: null,
    id: 'outcomes',
    label: 'Wyniki & Rekomendacje',
  },
  {
    badge: null,
    id: 'architecture',
    label: 'Specyfikacja & RBAC',
  },
] as const satisfies readonly {
  readonly badge: string | null;
  readonly id: MarketingSupportTabId;
  readonly label: string;
}[];

export type MarketingSupportRole =
  | 'admin'
  | 'client';

export const marketingSupportRoleLabels: Record<MarketingSupportRole, string> = {
  admin: 'Ekspert / Operator',
  client: 'Klient (Workspace)',
};

export const marketingEntitlement = {
  advisor: 'Anna K.',
  briefLimit: 4,
  briefUsed: 2,
  plan: 'Plan Professional',
  sla: 'do 1d roboczego',
  status: 'Pakiet Aktywny',
  summary: 'Dedykowane doradztwo marketingowe z analizą eksperta i zespołem Papa AI.',
} as const;

export type MarketingSuggestionArea =
  | 'checkout'
  | 'feed_products'
  | 'google_ads'
  | 'meta_ads'
  | 'retention'
  | 'strategy';

export const marketingSuggestions = [
  {
    area: 'meta_ads',
    detected: 'wykryto 3h temu',
    metric: 'Meta Ads · -21% ROAS',
    problem: 'ROAS spadł z 4.1 do 3.2 po wdrożeniu nowych filmów.',
    summary: 'CPC wzrósł o 13%, konwersja spadła o 8%. Ruch z kreacji wideo generuje wysoki bounce rate.',
    title: 'ROAS Meta spadł po zmianie kreacji',
    tone: 'rose',
  },
  {
    area: 'checkout',
    detected: 'wykryto wczoraj',
    metric: 'Checkout · -11 pp CR',
    problem: 'Wykryto spadek ukończenia koszyka na urządzeniach mobilnych.',
    summary: 'Klienci mobilni rezygnują na kroku płatności. Utrata szacunkowo 24 000 zł przychodu tygodniowo.',
    title: 'Spadek konwersji checkout',
    tone: 'amber',
  },
  {
    area: 'feed_products',
    detected: 'wykryto dzisiaj',
    metric: 'Produkty · Ujemna marża',
    problem: 'Marża 14 produktów nie pokrywa kosztu ich reklamy w Google Shopping.',
    summary: "Produkty z grupy 'Dom i Ogród' mają zbyt wysoki CAC w stosunku do realizowanej marży brutto.",
    title: 'Optymalizacja feedu produktowego',
    tone: 'indigo',
  },
] as const satisfies readonly {
  readonly area: MarketingSuggestionArea;
  readonly detected: string;
  readonly metric: string;
  readonly problem: string;
  readonly summary: string;
  readonly title: string;
  readonly tone: MarketingSupportTone;
}[];

export const caseTypeDistribution = [
  {
    label: 'Meta Ads (ROAS/Kreacje)',
    tone: 'indigo',
    value: 4,
  },
  {
    label: 'Google Ads & PMax',
    tone: 'amber',
    value: 3,
  },
  {
    label: 'Checkout & CR',
    tone: 'rose',
    value: 2,
  },
  {
    label: 'Feed SKU / Marża',
    tone: 'emerald',
    value: 2,
  },
  {
    label: 'Strategia & Budżet',
    tone: 'slate',
    value: 1,
  },
] as const satisfies readonly {
  readonly label: string;
  readonly tone: MarketingSupportTone;
  readonly value: number;
}[];

export type MarketingCaseStatus =
  | 'Analiza w toku'
  | 'Czeka na decyzję'
  | 'Odrzucona'
  | 'Pomiar efektu';

export type MarketingActionStatus =
  | 'completed'
  | 'pending';

export type MarketingSupportCase = {
  readonly aiPreAnalysis: string;
  readonly area: string;
  readonly dataSnapshot: {
    readonly dateRange: string;
    readonly metrics: {
      readonly cpc: string;
      readonly cr: string;
      readonly roas: string;
      readonly spend: string;
    };
    readonly provenance: string;
  };
  readonly deadline: string;
  readonly decisionNeeded: string;
  readonly expert: string;
  readonly id: string;
  readonly problem: string;
  readonly recommendation: {
    readonly actionPlan?: readonly {
      readonly owner: string;
      readonly status: MarketingActionStatus;
      readonly task: string;
    }[];
    readonly confidence?: string;
    readonly expectedImpact?: string;
    readonly ready: boolean;
    readonly summary?: string;
  };
  readonly slaStatus: string;
  readonly status: MarketingCaseStatus;
  readonly subject: string;
  readonly timeline: readonly {
    readonly text: string;
    readonly time: string;
  }[];
  readonly urgency: string;
};

export const marketingCases = [
  {
    id: 'MS-2026-0182',
    subject: 'ROAS Meta spadł po zmianie kreacji',
    area: 'Meta Ads',
    status: 'Czeka na decyzję',
    expert: 'Anna Kowalska',
    urgency: 'Wysoka',
    deadline: '31.08.2026',
    slaStatus: 'Dotrzymane (pierwsza odp. w 4h)',
    problem: 'Po zmianie zestawu wideo na 5 nowych wariantów ROAS w prospecting spadł z 4.1 do 3.2. Rosnący koszt CPC (+13%).',
    decisionNeeded: 'Czy cofnąć nowe wideo, zmniejszyć budżet prospectingowy czy zmienić docelową grupę odbiorców?',
    dataSnapshot: {
      dateRange: '01.08.2026 - 28.08.2026',
      metrics: { spend: '18 400 zł (+18%)', roas: '3.21 (-21%)', cpc: '1.84 zł (+13%)', cr: '1.42% (-8%)' },
      provenance: 'Meta Ads API + GA4 Commerce',
    },
    aiPreAnalysis: 'Wykryto, że 3 z 5 nowych kreacji wideo charakteryzują się 68% wskaźnikiem porzucenia w pierwszych 3 sekundach. Problem dotyczy etapu przyciągnięcia uwagi, a nie samego sklepu.',
    recommendation: {
      ready: true,
      summary: 'Wyłączyć 3 najsłabsze wideo, przywrócić wariant statyczny v2 i przenieść 20% budżetu do retargetingu.',
      expectedImpact: 'Wzrost ROAS o +0.4 do +0.6 w ciągu 7 dni.',
      confidence: 'Wysoka',
      actionPlan: [
        { task: 'Wyłącz nowe wideo #14, #15 i #17', owner: 'Klient / Michał', status: 'pending' },
        { task: 'Przywróć statyczną kreację z lipca (Wariant v2)', owner: 'Klient / Michał', status: 'pending' },
        { task: 'Zmniejsz budżet Prospecting o 15%', owner: 'Ekspert PapaData', status: 'pending' },
      ],
    },
    timeline: [
      { time: '28.08 09:14', text: 'Brief wysłany przez Klienta (z dołączonym Context Pack)' },
      { time: '28.08 09:15', text: 'Papa AI przygotował wstępną diagnozę dowodową' },
      { time: '28.08 10:04', text: 'Ekspert Anna Kowalska przejęła analizę sprawy' },
      { time: '28.08 13:20', text: 'Rekomendacja ekspertka została opublikowana i czeka na decyzję' },
    ],
  },
  {
    id: 'MS-2026-0180',
    subject: 'Spadek ukończenia checkoutu w PMax',
    area: 'Checkout',
    status: 'Analiza w toku',
    expert: 'Michał Piotrowski',
    urgency: 'Normalna',
    deadline: '02.09.2026',
    slaStatus: 'W normie',
    problem: 'Wykryto spadek konwersji koszyka mobilnego z kampanii Google Performance Max.',
    decisionNeeded: 'Identyfikacja czy błąd leży w bramce płatności czy w kierowaniu ruchu.',
    dataSnapshot: {
      dateRange: '15.08.2026 - 28.08.2026',
      metrics: { spend: '12 000 zł', roas: '4.80', cpc: '0.92 zł', cr: '0.88% (-11 pp)' },
      provenance: 'GA4 + WooCommerce Checkout Log',
    },
    aiPreAnalysis: 'Skaner wskazuje opóźnienie ładowania widgetu InPost Pay na urządzeniach z systemem iOS.',
    recommendation: { ready: false },
    timeline: [
      { time: '27.08 14:30', text: 'Brief zarejestrowany w systemie' },
      { time: '27.08 15:00', text: 'Przydzielono eksperta: Michał Piotrowski' },
    ],
  },
  {
    id: 'MS-2026-0175',
    subject: 'Segment marżowy dla feedu Google Ads',
    area: 'Feed / SKU',
    status: 'Pomiar efektu',
    expert: 'Anna Kowalska',
    urgency: 'Normalna',
    deadline: '20.08.2026',
    slaStatus: 'Zakończono sukcesem',
    problem: 'Promowanie produktów o marży poniżej 12% generowało straty na koszcie kliknięcia.',
    decisionNeeded: 'Wykluczenie N niskomarżowych SKU.',
    dataSnapshot: {
      dateRange: '01.07.2026 - 01.08.2026',
      metrics: { spend: '24 500 zł', roas: '3.10 -> 3.80', cpc: '1.10 zł', cr: '2.1%' },
      provenance: 'PapaData Feed Margin Engine',
    },
    aiPreAnalysis: 'Poprawnie zidentyfikowano 14 SKU, które po wykluczeniu podniosły całkowity ROAS.',
    recommendation: {
      ready: true,
      summary: 'Wykluczenie 14 SKU i utworzenie niestandardowej etykiety Custom Label 0 dla produktów High-Margin.',
      expectedImpact: 'Wzrost skorygowanego ROAS o +0.7.',
      confidence: 'Wysoka',
      actionPlan: [
        { task: 'Aktualizacja pliku produkcyjnego XML', owner: 'PapaData System', status: 'completed' },
        { task: 'Podział kampanii PMax na 2 tier-y marżowe', owner: 'Ekspert Anna K.', status: 'completed' },
      ],
    },
    timeline: [
      { time: '10.08 11:00', text: 'Brief złożony' },
      { time: '12.08 09:00', text: 'Rekomendacja zaakceptowana przez Klienta' },
      { time: '13.08 10:00', text: 'Wdrożenie zmian w Google Ads' },
      { time: '20.08 12:00', text: 'Rozpoczęto automatyczny pomiar efektu (14 dni)' },
    ],
  },
] as const satisfies readonly MarketingSupportCase[];

export const marketingCaseFilterOptions = [
  {
    label: 'Wszystkie obszary',
    value: 'all',
  },
  {
    label: 'Meta Ads',
    value: 'Meta Ads',
  },
  {
    label: 'Google Ads',
    value: 'Google Ads',
  },
  {
    label: 'Checkout & CR',
    value: 'Checkout',
  },
  {
    label: 'Feed & Produkty',
    value: 'Feed / SKU',
  },
] as const;

export type MarketingCaseFilter = typeof marketingCaseFilterOptions[number]['value'];

export const briefAreaOptions = [
  {
    label: 'Meta Ads (Facebook / Instagram)',
    value: 'meta_ads',
  },
  {
    label: 'Google Ads & PMax',
    value: 'google_ads',
  },
  {
    label: 'Checkout & Wskaźnik Konwersji',
    value: 'checkout',
  },
  {
    label: 'Feed produktowy & Marża SKU',
    value: 'feed_products',
  },
  {
    label: 'Retencja & LTV Klientów',
    value: 'retention',
  },
  {
    label: 'Strategia & Alokacja Budżetu',
    value: 'strategy',
  },
] as const satisfies readonly {
  readonly label: string;
  readonly value: MarketingSuggestionArea;
}[];

export const briefUrgencyOptions = [
  {
    label: 'Standardowa (decyzja w tym tygodniu)',
    value: 'normal',
  },
  {
    label: 'Wysoka (wymagana decyzja w 24-48h)',
    value: 'high',
  },
  {
    label: 'Krytyczna (blokada kampanii / uciekający budżet)',
    value: 'critical',
  },
] as const;

export type MarketingBriefDraft = {
  readonly area: MarketingSuggestionArea;
  readonly deadline: string;
  readonly decisionMaker: string;
  readonly decisionNeeded: string;
  readonly problem: string;
  readonly subject: string;
  readonly urgency: typeof briefUrgencyOptions[number]['value'];
};

export const marketingBriefDefault: MarketingBriefDraft = {
  area: 'meta_ads',
  deadline: '',
  decisionMaker: '',
  decisionNeeded: '',
  problem: '',
  subject: '',
  urgency: 'normal',
};

export const contextPackMetrics = [
  {
    label: 'ROAS Średni',
    tone: 'rose',
    value: '3.21 (-21%)',
  },
  {
    label: 'CPC Średni',
    tone: 'amber',
    value: '1.84 zł (+13%)',
  },
  {
    label: 'Konwersja CR',
    tone: 'rose',
    value: '1.42% (-8%)',
  },
] as const;

export type ImpactWindow =
  | 7
  | 14
  | 30;

export const impactWindowOptions = [
  {
    label: '7 Dni po',
    value: 7,
  },
  {
    label: '14 Dni po',
    value: 14,
  },
  {
    label: '30 Dni po',
    value: 30,
  },
] as const satisfies readonly {
  readonly label: string;
  readonly value: ImpactWindow;
}[];

export const impactSeriesByWindow: Record<ImpactWindow, readonly {
  readonly baseline: number;
  readonly label: string;
  readonly roas: number;
}[]> = {
  7: [
    { label: '-7d', roas: 3.2, baseline: 3.1 },
    { label: '-3d', roas: 3.1, baseline: 3.1 },
    { label: 'Start', roas: 3.1, baseline: 3.1 },
    { label: '+3d', roas: 3.4, baseline: 3.1 },
    { label: '+7d', roas: 3.6, baseline: 3.1 },
  ],
  14: [
    { label: '-14d', roas: 3.1, baseline: 3.1 },
    { label: '-10d', roas: 3.0, baseline: 3.1 },
    { label: '-7d', roas: 3.2, baseline: 3.1 },
    { label: '-3d', roas: 3.1, baseline: 3.1 },
    { label: 'Start', roas: 3.1, baseline: 3.1 },
    { label: '+3d', roas: 3.4, baseline: 3.1 },
    { label: '+7d', roas: 3.6, baseline: 3.1 },
    { label: '+10d', roas: 3.7, baseline: 3.1 },
    { label: '+14d', roas: 3.8, baseline: 3.1 },
  ],
  30: [
    { label: '-30d', roas: 3.0, baseline: 3.1 },
    { label: '-20d', roas: 3.1, baseline: 3.1 },
    { label: '-10d', roas: 3.1, baseline: 3.1 },
    { label: 'Start', roas: 3.1, baseline: 3.1 },
    { label: '+10d', roas: 3.7, baseline: 3.1 },
    { label: '+20d', roas: 3.9, baseline: 3.1 },
    { label: '+30d', roas: 4.1, baseline: 3.1 },
  ],
};

export const recommendationHistory = [
  {
    area: 'Meta Ads',
    date: '18.08.2026',
    decision: 'Wdrożono',
    decisionTone: 'emerald',
    outcome: '+14.2% ROAS (zgodne)',
    recommendation: 'Przeniesienie 20% budżetu do retargetingu',
    subject: 'Meta prospecting budget shift',
  },
  {
    area: 'Feed SKU',
    date: '02.08.2026',
    decision: 'Wdrożono',
    decisionTone: 'emerald',
    outcome: 'Pomiar w toku (14d)',
    recommendation: 'Wykluczenie ujemnomarżowych produktów',
    subject: 'Wykluczenie 14 SKU z feedu Google',
  },
  {
    area: 'Retencja',
    date: '17.07.2026',
    decision: 'Odrzucono',
    decisionTone: 'rose',
    outcome: '— (brak wdrożenia)',
    recommendation: 'Kupon 15% dla nieaktywnych >90 dni',
    subject: 'Kampania reaktywacji e-mail SMS',
  },
] as const satisfies readonly {
  readonly area: string;
  readonly date: string;
  readonly decision: string;
  readonly decisionTone: MarketingSupportTone;
  readonly outcome: string;
  readonly recommendation: string;
  readonly subject: string;
}[];

export const architectureDomains = [
  {
    body: 'Kwestie biznesowe, ROAS, budżety, kreacje, strategie i konwersja.',
    examples: [
      'Dlaczego ROAS Meta spada po zmianie wideo?',
      'Gdzie efektywnie ulokować dodatkowe 20 tys. zł?',
      'Które SKU wykluczyć z feedu produktowego?',
      'Jak przygotować strukturę na Black Friday?',
    ],
    title: 'DOMENA: Wsparcie w marketingu',
    tone: 'indigo',
  },
  {
    body: 'Oddzielne Centrum Pomocy / Błędy integracji i rozliczeń.',
    examples: [
      'Integracja WooCommerce nie synchronizuje zamówień.',
      'Błąd podczas logowania lub brak uprawnień.',
      'Pobranie faktury VAT za subskrypcję PapaData.',
      'Problem z kluczem API / Webhookiem.',
    ],
    title: 'DOMENA: Pomoc Techniczna / Support',
    tone: 'slate',
  },
] as const satisfies readonly {
  readonly body: string;
  readonly examples: readonly string[];
  readonly title: string;
  readonly tone: MarketingSupportTone;
}[];

export const rbacColumns = [
  {
    capabilities: [
      { name: 'marketing_support.read', value: '✓ Tak', tone: 'emerald' },
      { name: 'marketing_support.request', value: '✓ Tak', tone: 'emerald' },
      { name: 'marketing_support.comment', value: '✓ Tak', tone: 'emerald' },
      { name: 'marketing_support.decision', value: '✓ Tak', tone: 'emerald' },
      { name: 'marketing_support.quote.accept', value: 'Tylko Admin/Owner', tone: 'amber' },
    ],
    title: 'Capabilities Klienta (Workspace)',
  },
  {
    capabilities: [
      { name: 'marketing_support.manage', value: '✓ Ekspert', tone: 'emerald' },
      { name: 'marketing_support.assign', value: '✓ Ekspert', tone: 'emerald' },
      { name: 'marketing_support.recommend', value: '✓ Ekspert', tone: 'emerald' },
      { name: 'marketing_support.quote.create', value: '✓ Ekspert', tone: 'emerald' },
      { name: 'marketing_support.close', value: '✓ Ekspert', tone: 'emerald' },
    ],
    title: 'Capabilities Eksperta (Operator Console)',
  },
] as const satisfies readonly {
  readonly capabilities: readonly {
    readonly name: string;
    readonly tone: MarketingSupportTone;
    readonly value: string;
  }[];
  readonly title: string;
}[];

export const roadmapItems = [
  {
    items: [
      'Połączenie trasy z API `/threads`',
      'Usunięcie lokalnych mocków z DashboardHelp',
      'Wpis `marketing-support` w Registry (ID-11)',
      'Rozdzielenie capabilities w RBAC',
    ],
    label: 'P0 · NATYCHMIAST',
    title: 'Dług techniczny & IA',
    tone: 'rose',
  },
  {
    items: [
      'Formularz Nowego Briefu z AI Pre-flight',
      'Layout Master-Detail & Timeline',
      'Struktura Rekomendacji Eksperta',
      'Dedykowany obiekt MarketingSupportQuote',
    ],
    label: 'P1 · KRÓTKOTERMINOWE',
    title: 'Core Advisory Workflow',
    tone: 'indigo',
  },
  {
    items: [
      'Moduł Pomiaru Efektów (7/14/30d)',
      'Konsola Wewnętrzna Eksperta',
      'Integracje Slack / MS Teams',
      'Biblioteka Artefaktów Papa Asystenta',
    ],
    label: 'P2 · DOCELOWE',
    title: 'Automatyzacja & Pomiar',
    tone: 'emerald',
  },
] as const satisfies readonly {
  readonly items: readonly string[];
  readonly label: string;
  readonly title: string;
  readonly tone: MarketingSupportTone;
}[];
