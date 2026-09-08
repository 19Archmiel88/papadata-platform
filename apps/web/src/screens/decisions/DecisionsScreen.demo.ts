import { deriveProducts, productMoney, productNumber } from '../products/ProductAnalysis.data';
import { productDemoData, productDemoRange } from '../products/ProductsScreen.data';
import { deriveOrdersAnalysis } from '../orders/OrdersAnalysis.data';
import { deriveCampaignAnalysis } from '../paid-campaigns/CampaignAnalysis.data';
import type { Decision, DecisionMeasurement, DecisionsData } from './DecisionsScreen.model';

const products = deriveProducts(productDemoData, productDemoRange, 'all');
const serum = products.inventoryRows.find((p) => p.id === 'SER-C-30')!;
const retinol = products.rows.find((p) => p.id === 'OLK-RET-30')!;
const orders = deriveOrdersAnalysis(productDemoRange);
const retargeting = deriveCampaignAnalysis(productDemoRange).rows.find(
  (c) => c.id === 'm_camp_104922',
)!;
const measurement = (patch: Partial<DecisionMeasurement> = {}): DecisionMeasurement => ({
  metric: 'Pokrycie dostępnego zapasu',
  unit: 'dni',
  direction: 'up',
  baseline: serum.coverage,
  baselineLabel: 'Stan na 31 sierpnia 2026; popyt z poprzednich 30 dni.',
  days: 7,
  startsOn: null,
  endsOn: null,
  result: null,
  source: null,
  ...patch,
});
const base: Omit<
  Decision,
  'id' | 'title' | 'domain' | 'observation' | 'impact' | 'evidence' | 'options'
> = {
  priority: 'medium',
  status: 'review',
  evidencePeriod: '1–31 sierpnia 2026',
  evidencePath: null,
  evidenceReady: true,
  limitation: 'Dane przykładowe. Przed wykonaniem sprawdź aktualny stan w źródle.',
  selectedOption: null,
  owner: null,
  due: '2026-09-08',
  rationale: '',
  measurement: measurement(),
  createdAt: '2026-09-05T08:00:00Z',
};
const decisions: Decision[] = [
  {
    ...base,
    id: 'DEC-101',
    title: 'Zabezpiecz dostępność Serum Glow C',
    domain: 'products',
    priority: 'high',
    due: '2026-09-07',
    owner: 'Anna Kowalska',
    observation: `${productNumber(serum.available)} szt. dostępnych przy średniej sprzedaży ${productNumber(serum.dailyDemand, 1)} szt. dziennie. Czas dostawy jest dłuższy niż pokrycie zapasem.`,
    impact: 'Ryzyko utraty dostępności',
    evidence: [
      {
        label: 'Dostępny zapas',
        value: `${productNumber(serum.available)} szt.`,
        source: 'Katalog produktów · SER-C-30',
      },
      {
        label: 'Pokrycie zapasem',
        value: `${productNumber(serum.coverage, 1)} dni`,
        source: 'Dostępny zapas ÷ średni popyt z 30 dni',
      },
      {
        label: 'Czas dostawy',
        value: `${productNumber(serum.leadTime)} dni`,
        source: 'Kartoteka magazynowa · SER-C-30',
      },
    ],
    evidencePeriod: 'Magazyn: 31 sierpnia 2026 · popyt: 2–31 sierpnia',
    evidencePath:
      '/app/products?productView=inventory&productFilter=stock_risk&from=2026-08-01&to=2026-08-31',
    limitation:
      'Stan magazynu pochodzi z 31 sierpnia. Nie uwzględnia późniejszych dostaw ani dostaw w drodze. Plan zaczyna się od weryfikacji stanu, a wielkość zamówienia wymaga potwierdzenia.',
    options: [
      {
        id: 'supplier',
        title: 'Potwierdź zapas i przyspieszoną dostawę',
        description:
          'Sprawdź bieżącą dostępność i możliwości dostawcy, zanim zdecydujesz o zamówieniu.',
        tradeoff:
          'Transport przyspieszony może zwiększyć koszt. Brakuje wyceny i potwierdzonego terminu.',
        steps: [
          'Sprawdź aktualny zapas i dostawy w drodze',
          'Potwierdź termin, ilość i koszt z dostawcą',
          'Zapisz wynik weryfikacji i dalsze ustalenia',
        ],
      },
      {
        id: 'exposure',
        title: 'Sprawdź możliwość ograniczenia promocji SKU',
        description: 'Oceń ekspozycję produktu do czasu potwierdzenia dostawy.',
        tradeoff:
          'Mniejsza ekspozycja może obniżyć sprzedaż. Ten wariant wymaga uzgodnienia z marketingiem.',
        steps: [
          'Sprawdź aktualną dostępność',
          'Uzgodnij zakres promocji z marketingiem',
          'Zapisz uzgodniony plan',
        ],
      },
    ],
  },
  {
    ...base,
    id: 'DEC-102',
    title: 'Wyjaśnij rentowność retargetingu Meta',
    domain: 'campaigns',
    priority: 'high',
    owner: 'Piotr Nowak',
    observation: `Koszt pozyskania wynosi ${productMoney(retargeting.ncac)} przy celu ${productMoney(retargeting.cacGoal)}. Kompletność kosztu dla kampanii wynosi ${retargeting.costCoverage}%.`,
    impact: 'Koszt pozyskania ponad celem',
    evidence: [
      { label: 'Kampania', value: retargeting.name, source: retargeting.id },
      {
        label: 'Koszt pozyskania',
        value: productMoney(retargeting.ncac),
        source: 'Koszt reklam ÷ nowi klienci · last click',
      },
      {
        label: 'Cel kosztu pozyskania',
        value: productMoney(retargeting.cacGoal),
        source: 'Cel przykładowy kampanii',
      },
      {
        label: 'Kompletność kosztu',
        value: `${retargeting.costCoverage}%`,
        source: 'Kartoteka kampanii',
      },
    ],
    evidencePath:
      '/app/campaigns?channel=meta_ads&campaignView=campaigns&from=2026-08-01&to=2026-08-31',
    limitation:
      'Niepełny koszt nie pozwala wiarygodnie ocenić rentowności. Proponowane działanie to weryfikacja pomiaru; obniżka budżetu nie ma jeszcze uzasadnienia.',
    options: [
      {
        id: 'audit',
        title: 'Zweryfikuj koszt i przypisanie konwersji',
        description: 'Porównaj raport kosztów platformy z przypisanymi zamówieniami.',
        tradeoff: 'Przegląd wymaga pracy analityka; do tego czasu wynik pozostaje niepełny.',
        steps: [
          'Porównaj koszty z raportem Meta Ads',
          'Sprawdź okno i model atrybucji',
          'Zapisz luki i potwierdzone koszty',
        ],
      },
    ],
    measurement: measurement({
      metric: 'Kompletność kosztu kampanii',
      unit: '%',
      baseline: retargeting.costCoverage,
      baselineLabel: 'Stan kartoteki kampanii z sierpnia; pełna kompletność wynosi 100%.',
      days: 7,
    }),
  },
  {
    ...base,
    id: 'DEC-103',
    title: 'Zweryfikuj marżę Olejku Retinol przed promocją',
    domain: 'products',
    status: 'blocked',
    owner: null,
    observation: `${productMoney(retinol.revenue)} sprzedaży bez uzupełnionego kosztu produktu. Nie można obliczyć marży ani bezpiecznego rabatu.`,
    impact: 'Brak podstaw do wyliczenia rabatu',
    evidenceReady: false,
    evidence: [
      { label: 'Produkt', value: retinol.name, source: 'OLK-RET-30' },
      {
        label: 'Sprzedaż netto',
        value: productMoney(retinol.revenue),
        source: 'Suma obserwacji SKU z sierpnia',
      },
      { label: 'Koszt produktu', value: 'Brak danych', source: 'Kartoteka produktów' },
    ],
    limitation:
      'Zatwierdzenie planu promocji jest zablokowane do uzupełnienia kosztu i ponownej analizy. Przywrócenie do oceny nie usuwa tej luki.',
    evidencePath:
      '/app/products?productView=profitability&productFilter=missing_cost&from=2026-08-01&to=2026-08-31',
    options: [
      {
        id: 'price',
        title: 'Ustal rabat na podstawie marży',
        description: 'Wylicz próg rentowności po uzupełnieniu kosztu.',
        tradeoff: 'Bez kosztu nie można określić bezpiecznego rabatu.',
        steps: [
          'Uzupełnij koszt jednostkowy',
          'Przelicz marżę w wybranym okresie',
          'Określ dopuszczalny rabat',
        ],
      },
    ],
    measurement: measurement({
      metric: 'Marża na produkcie',
      unit: 'PLN',
      baseline: null,
      baselineLabel: 'Koszt nie jest dostępny.',
    }),
  },
  {
    ...base,
    id: 'DEC-104',
    title: 'Wyjaśnij zamówienia po terminie wysyłki',
    domain: 'orders',
    priority: 'high',
    status: 'approved',
    owner: 'Anna Kowalska',
    due: '2026-09-06',
    selectedOption: 'resolve',
    rationale: 'Sprawdzenie statusu i przyczyn opóźnień uzgodniono w zespole operacji.',
    observation: `${orders.late.length} z ${orders.rows.length} przykładowych zamówień przekroczyły termin wysyłki. Statusy wymagają potwierdzenia w systemie sklepu.`,
    impact: 'Obsługa opóźnionych zamówień',
    evidence: [
      {
        label: 'Zamówienia po terminie',
        value: String(orders.late.length),
        source: 'Status SLA breached i brak wysyłki',
      },
      {
        label: 'Identyfikatory',
        value: orders.late.map((o) => o.id).join(', '),
        source: 'Przykładowa kolejka zamówień',
      },
    ],
    evidencePath: '/app/orders?orderQueue=attention&from=2026-08-01&to=2026-08-31',
    options: [
      {
        id: 'resolve',
        title: 'Sprawdź przyczyny i ustal termin wysyłki',
        description: 'Przegląd pojedynczych zamówień z zespołem realizacji.',
        tradeoff: 'Brak czasów zdarzeń i danych przewoźnika ogranicza rozpoznanie przyczyny.',
        steps: [
          'Sprawdź wskazane zamówienia w sklepie',
          'Ustal przyczynę i termin z zespołem realizacji',
          'Zapisz potwierdzenie ustaleń',
        ],
      },
    ],
    measurement: measurement({
      metric: 'Zamówienia nadal po terminie',
      unit: 'szt.',
      direction: 'down',
      baseline: orders.late.length,
      baselineLabel: 'Wskazane zamówienia z próbki sierpniowej; ta sama lista przy pomiarze.',
      days: 7,
    }),
  },
  {
    ...base,
    id: 'DEC-105',
    title: 'Sprawdź wynik testu progu dostawy',
    domain: 'orders',
    status: 'measuring',
    owner: 'Artur Wiśniewski',
    due: '2026-09-14',
    selectedOption: 'test',
    observation: 'Zespół odnotował start testu 1 września. Okno obserwacji obejmuje 14 dni.',
    impact: 'Wynik oczekuje na pełne okno',
    evidence: [
      {
        label: 'Bazowa konwersja',
        value: '3,2%',
        source: 'Oddzielna próbka testowa · 320 zamówień / 10 000 sesji',
      },
      { label: 'Okno bazowe', value: '18–31 sierpnia 2026', source: 'Rejestr przykładowego testu' },
    ],
    limitation:
      'Przykład pomiaru przed/po, bez grupy kontrolnej. Zmiana nie dowodzi wpływu progu dostawy; mogą działać sezonowość i zmiana źródeł ruchu.',
    options: [
      {
        id: 'test',
        title: 'Test progu dostawy',
        description: 'Obserwacja konwersji po zmianie progu.',
        tradeoff: 'Koszt dostaw i marża wymagają osobnej kontroli.',
        steps: ['Odnotuj datę rozpoczęcia testu', 'Po 14 dniach porównaj pełne okresy'],
      },
    ],
    measurement: measurement({
      metric: 'Konwersja zamówień z sesji',
      unit: '%',
      baseline: 3.2,
      baselineLabel: '18–31 sierpnia · 320 zamówień / 10 000 sesji · oddzielna próbka',
      days: 14,
      startsOn: '2026-09-01',
      endsOn: '2026-09-14',
    }),
  },
  {
    ...base,
    id: 'DEC-106',
    title: 'Oceń wynik pilotażu przypomnienia o koszyku',
    domain: 'customers',
    status: 'completed',
    priority: 'low',
    owner: 'Piotr Nowak',
    due: '2026-08-31',
    selectedOption: 'pilot',
    observation:
      'W próbce pomiarowej udział odzyskanych koszyków wzrósł z 8% do 10%. Wynik zapisano po zakończeniu obserwacji.',
    impact: 'Zaobserwowana zmiana +2 p.p.',
    evidence: [
      {
        label: 'Przed zmianą',
        value: '80 / 1 000 koszyków = 8%',
        source: 'Oddzielna próbka pilotażu · 4–17 sierpnia',
      },
      {
        label: 'Po zmianie',
        value: '100 / 1 000 koszyków = 10%',
        source: 'Oddzielna próbka pilotażu · 18–31 sierpnia',
      },
    ],
    limitation:
      'Brak grupy kontrolnej. Wynik jest obserwacją przed/po, bez potwierdzenia przyczynowości i istotności statystycznej.',
    options: [
      {
        id: 'pilot',
        title: 'Pilotaż przypomnienia',
        description: 'Przypomnienie w wydzielonej próbce koszyków.',
        tradeoff: 'Wynik nie musi przenosić się na całą bazę klientów.',
        steps: ['Przeprowadź pilotaż', 'Zapisz wynik z obu okresów'],
      },
    ],
    measurement: measurement({
      metric: 'Udział odzyskanych koszyków',
      unit: '%',
      baseline: 8,
      baselineLabel: '4–17 sierpnia · 80 / 1 000 koszyków',
      days: 14,
      startsOn: '2026-08-18',
      endsOn: '2026-08-31',
      result: 10,
      source: 'Próbka pilotażu · 100 / 1 000 koszyków · 18–31 sierpnia',
    }),
  },
];
export const decisionsDemoData: DecisionsData = {
  id: 'commerce-decisions-2026-09-v1',
  sourceDate: '2026-08-31',
  decisions,
  activity: [
    {
      id: 'seed-created-101',
      decisionId: 'DEC-101',
      at: '2026-09-05T08:00:00Z',
      actor: 'Analityk · przykład',
      label: 'Dodano propozycję',
      note: 'Sygnał z kartoteki produktu SER-C-30. Stan magazynu wymaga aktualnego potwierdzenia.',
    },
    {
      id: 'seed-approved-104',
      decisionId: 'DEC-104',
      at: '2026-09-05T10:00:00Z',
      actor: 'Anna Kowalska · przykład',
      label: 'Zatwierdzono plan',
      note: 'Przegląd opóźnionych zamówień. Wykonanie pozostaje do odnotowania.',
    },
    {
      id: 'seed-executed-105',
      decisionId: 'DEC-105',
      at: '2026-09-01T08:00:00Z',
      actor: 'Artur Wiśniewski · przykład',
      label: 'Odnotowano wykonanie',
      note: 'Rozpoczęto przykładową obserwację. Pomiar po zamknięciu 14 dni.',
    },
    {
      id: 'seed-measured-106',
      decisionId: 'DEC-106',
      at: '2026-09-01T09:00:00Z',
      actor: 'Piotr Nowak · przykład',
      label: 'Zapisano wynik obserwacji',
      note: '10% przy bazie 8%; bez grupy kontrolnej i wniosków o przyczynowości.',
    },
  ],
};
