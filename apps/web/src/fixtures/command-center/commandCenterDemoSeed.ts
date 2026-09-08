import type {
  CommandCenterScreenData,
  OverviewDay,
} from '../../screens/command-center/CommandCenterScreen.model';
import { shiftOverviewDate } from '../../screens/command-center/CommandCenterScreen.data';

/** Deterministic daily demo observations. Every KPI and comparison is aggregated from these rows. */
const days: OverviewDay[] = Array.from({ length: 432 }, (_, index) => {
  const date = shiftOverviewDate('2025-07-01', index);
  const isAugust = date >= '2026-08-01';
  const wave = Math.sin(index * 0.63) * 2400 + Math.cos(index * 0.19) * 1400;
  const revenue = Math.round((isAugust ? 46200 : 41500) + wave);
  return {
    date,
    revenue,
    costOfGoods: Math.round(revenue * (isAugust ? 0.575 : 0.55)),
    fulfillmentCost: Math.round(revenue * 0.075),
    marketingSpend: Math.round((isAugust ? 8200 : 6300) + Math.sin(index * 0.41) * 700),
    newCustomers: Math.round(revenue / (isAugust ? 570 : 590)),
    orders: Math.round(revenue / 240),
  };
});

export const commandCenterDemoRange = {
  from: '2026-08-01',
  to: '2026-08-31',
  preset: 'custom' as const,
  timezone: 'Europe/Warsaw',
};
export const commandCenterDemoSeed: CommandCenterScreenData = {
  mode: 'demo',
  currency: 'PLN',
  timezone: 'Europe/Warsaw',
  days,
  lastUpdated: '2026-09-05T12:23:00Z',
  sources: [
    {
      id: 'shop',
      name: 'Sklep internetowy',
      status: 'ready',
      detail: 'Sprzedaż i zwroty: pełny zakres do 4 września.',
    },
    {
      id: 'google',
      name: 'Google Ads',
      status: 'ready',
      detail: 'Koszty reklam: pełny zakres do 4 września.',
    },
    {
      id: 'meta',
      name: 'Meta Ads',
      status: 'stale',
      detail: 'Bieżąca synchronizacja kosztów opóźniona o 3 godziny. Sierpień jest kompletny.',
    },
    {
      id: 'erp',
      name: 'Koszty produktów',
      status: 'ready',
      detail: 'Koszty własne produktów i realizacji uzupełnione dla badanego okresu.',
    },
  ],
  decisions: [
    {
      id: 'retargeting',
      title: 'Sprawdź rentowność retargetingu Meta',
      reason:
        'Koszt pozyskania przekracza ustalony cel. Przed zmianą budżetu porównaj marżę i atrybucję kampanii.',
      owner: 'Marketing',
      due: 'Dzisiaj',
      effect: 'Do oszacowania po analizie kampanii',
      path: '/app/campaigns',
      evidence: [
        { label: 'Koszt pozyskania w kampanii', value: '128 zł' },
        { label: 'Cel kosztu pozyskania', value: '100 zł' },
        { label: 'Okres sygnału', value: '1–31 sierpnia 2026' },
        { label: 'Status', value: 'Propozycja do sprawdzenia — budżet nie został zmieniony' },
      ],
    },
    {
      id: 'inventory',
      title: 'Uzupełnij zapas produktu Alpha',
      reason:
        'Zapas wystarczy na cztery dni sprzedaży. Sprawdź termin dostawy i dostępne zamienniki.',
      owner: 'Operacje',
      due: 'Dzisiaj',
      effect: 'Utrzymanie dostępności produktu',
      path: '/app/products',
      evidence: [
        { label: 'Pokrycie zapasem', value: '4 dni' },
        { label: 'Czas dostawy', value: '7 dni' },
        {
          label: 'Charakter informacji',
          value: 'Bieżący sygnał operacyjny, niezależny od zakresu wykresu',
        },
      ],
    },
    {
      id: 'orders',
      title: 'Sprawdź zamówienia zagrożone opóźnieniem',
      reason:
        'Zamówienia oczekują na przekazanie do przewoźnika. Otwórz kolejkę i sprawdź przyczyny.',
      owner: 'Obsługa zamówień',
      due: 'Jutro',
      effect: 'Ograniczenie ryzyka opóźnień',
      path: '/app/orders',
      evidence: [
        { label: 'Zamówienia wymagające uwagi', value: '12' },
        {
          label: 'Charakter informacji',
          value: 'Bieżący sygnał operacyjny, niezależny od zakresu wykresu',
        },
      ],
    },
  ],
};
