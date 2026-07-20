import { describe, expect, it } from 'vitest';

import {
  chartFixtures,
  customerWorkspaceScreens,
  domainComponentNames,
  fullInterfaceComponents,
  fullInterfaceFixture,
  internalControlPlaneScreens,
  primitiveComponentNames,
  requiredSystemStates,
} from './fullInterfaceFixtures';
import {
  fullInterfaceFixtureSchema,
  uiSystemStateSchema,
} from './fullInterfaceContracts';

describe('Pełny interfejs PapaData w Storybooku', () => {
  it('waliduje fixture główny wspólnym schematem Zod', () => {
    expect(fullInterfaceFixtureSchema.safeParse(fullInterfaceFixture).success).toBe(true);
  });

  it('pokrywa wymagane komponenty primitive i domenowe', () => {
    const componentNames = new Set(fullInterfaceComponents.map((component) => component.name));

    expect(primitiveComponentNames.every((name) => componentNames.has(name))).toBe(true);
    expect(domainComponentNames.every((name) => componentNames.has(name))).toBe(true);
    expect(fullInterfaceComponents).toHaveLength(
      primitiveComponentNames.length + domainComponentNames.length,
    );
  });

  it('utrzymuje pełny katalog wymaganych stanów systemowych', () => {
    expect(requiredSystemStates.every((state) => uiSystemStateSchema.safeParse(state).success)).toBe(true);
    expect(requiredSystemStates).toHaveLength(20);
  });

  it('pokrywa Customer Workspace, wykresy i Internal Control Plane', () => {
    const customerScreenTitles = new Set(customerWorkspaceScreens.map((screen) => screen.title));
    const internalScreenTitles = new Set(internalControlPlaneScreens.map((screen) => screen.title));
    const chartTypes = new Set(chartFixtures.map((chart) => chart.chartType));

    expect(customerScreenTitles).toEqual(new Set([
      'Audyt dostępny klientowi',
      'Biblioteka Asystenta',
      'Briefingi',
      'Cele biznesowe',
      'Centrum Dowodzenia',
      'Centrum pomocy',
      'Decyzje',
      'Dokumenty prawne i prywatność',
      'Działania',
      'Integracje',
      'Jakość danych',
      'Kampanie',
      'Klienci',
      'Konfiguracja profilu biznesowego',
      'Konflikty i duplikaty',
      'Logowanie i odzyskiwanie dostępu',
      'MFA i recovery',
      'Onboarding firmy',
      'Papa Asystent',
      'Powiadomienia',
      'Produkty',
      'Raporty i eksporty',
      'Readiness',
      'Rekomendacje',
      'Rezultaty',
      'Ruch i lejek',
      'Subskrypcja i użycie',
      'Synchronizacja i historia synchronizacji',
      'Szczegóły integracji',
      'Ustawienia',
      'Użytkownicy i role',
      'Wybór tenant/workspace',
      'Zamówienia',
      'Zaproszenie i aktywacja konta',
    ]));

    expect(chartTypes).toEqual(new Set([
      'AreaChart',
      'BarChart',
      'ComparisonChart',
      'ComposedChart',
      'DonutChart',
      'FunnelChart',
      'LineChart',
      'PieChart',
      'Sparkline',
      'StackedBarChart',
      'TrendChart',
    ]));

    expect(internalScreenTitles).toEqual(new Set([
      'AI evaluation runs',
      'AI incident register',
      'AI use case register',
      'Access review',
      'Backup tests',
      'Control register',
      'Cost Observability',
      'Gate dashboard',
      'Globalna kolejka alertów',
      'Incident register',
      'Koszt AI',
      'Koszt klienta',
      'Koszt providera',
      'Manual work',
      'Model registry',
      'Portfolio klientów',
      'Recovery cases',
      'Risk register',
      'Support cases',
      'Temporary access approvals',
      'Workload queue',
    ]));
  });
});
