import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  HelpCircle,
  Home,
  LineChart,
  Megaphone,
  PackageSearch,
  PlugZap,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react';

import { PapaDataBrand } from '../shared/PapaDataBrand';
import '../foundations/papadata-brand-surface.css';
import './dashboard-shell.css';

type DashboardModule =
  | 'shell'
  | 'command'
  | 'orders'
  | 'products'
  | 'customers'
  | 'traffic'
  | 'campaigns'
  | 'integrations'
  | 'settings'
  | 'subscription'
  | 'support'
  | 'assistant';

type DashboardDefinition = {
  headline: string;
  metricA: string;
  metricB: string;
  metricC: string;
  module: string;
  status: 'ready' | 'partial' | 'blocked';
  summary: string;
};

const dashboardDefinitions: Record<DashboardModule, DashboardDefinition> = {
  shell: {
    headline: 'Dashboard',
    metricA: '98%',
    metricB: '24 h',
    metricC: '7 modułów',
    module: 'Shell',
    status: 'ready',
    summary:
      'Powłoka pokazuje workspace, zakres dat, świeżość danych, wyszukiwanie i wejście do Asystenta.',
  },
  command: {
    headline: 'Centrum Dowodzenia',
    metricA: '12,4%',
    metricB: '3 ryzyka',
    metricC: '5 akcji',
    module: 'Command Center',
    status: 'partial',
    summary:
      'Pierwsza powierzchnia decyzyjna dla priorytetów sprzedaży, marży i operacji.',
  },
  orders: {
    headline: 'Zamówienia',
    metricA: '128 tys.',
    metricB: '4,8%',
    metricC: '312',
    module: 'Orders',
    status: 'ready',
    summary:
      'Zdrowie zamówień, przychód, anulowania, zwroty i ryzyka realizacji.',
  },
  products: {
    headline: 'Produkty',
    metricA: '48',
    metricB: '17%',
    metricC: '9',
    module: 'Products',
    status: 'partial',
    summary:
      'Produkty wymagające akcji handlowej, stock/range i wpływ na wynik.',
  },
  customers: {
    headline: 'Klienci',
    metricA: '8,2 tys.',
    metricB: '31%',
    metricC: '4 segmenty',
    module: 'Customers',
    status: 'ready',
    summary:
      'Retencja, wartość segmentów i sygnały jakości bazy klientów.',
  },
  traffic: {
    headline: 'Ruch na stronie',
    metricA: '42 tys.',
    metricB: '2,9%',
    metricC: '48 h',
    module: 'Traffic',
    status: 'partial',
    summary:
      'Źródła popytu i jakość ruchu z jawnym oznaczeniem świeżości danych.',
  },
  campaigns: {
    headline: 'Kampanie płatne',
    metricA: '4,1 ROAS',
    metricB: '18 tys.',
    metricC: '2 alerty',
    module: 'Paid Campaigns',
    status: 'ready',
    summary:
      'Wydatki, zwrot, budżet i ryzyka kampanii bez ukrywania braków danych.',
  },
  integrations: {
    headline: 'Integracje',
    metricA: '2 aktywne',
    metricB: '1 stale',
    metricC: 'OAuth',
    module: 'Integrations',
    status: 'partial',
    summary:
      'Połączenia, diagnostyka, retry, rotacja i bezpieczne odłączenie źródeł.',
  },
  settings: {
    headline: 'Ustawienia',
    metricA: '6 domen',
    metricB: 'MFA',
    metricC: 'audit',
    module: 'Settings',
    status: 'ready',
    summary:
      'Rozdzielone domeny konta, workspace, security, capabilities i integracji.',
  },
  subscription: {
    headline: 'Subskrypcja',
    metricA: 'Pro',
    metricB: '82%',
    metricC: '3 limity',
    module: 'Subscription',
    status: 'ready',
    summary:
      'Plan, faktury, limity użycia i gated states bez automatycznej płatności.',
  },
  support: {
    headline: 'Pomoc',
    metricA: '24/7',
    metricB: '6 tematów',
    metricC: 'SLA',
    module: 'Support',
    status: 'ready',
    summary:
      'Samoobsługa, kontakt z człowiekiem i bezpieczna eskalacja problemu.',
  },
  assistant: {
    headline: 'Papa Asystent',
    metricA: '3 źródła',
    metricB: 'partial',
    metricC: '5 cyt.',
    module: 'Assistant',
    status: 'partial',
    summary:
      'Kontekstowe wsparcie decyzyjne ograniczone uprawnieniami i jakością danych.',
  },
};

const navItems = [
  { key: 'command', label: 'Centrum Dowodzenia', icon: Home },
  { key: 'orders', label: 'Zamówienia', icon: ShoppingCart },
  { key: 'products', label: 'Produkty', icon: PackageSearch },
  { key: 'customers', label: 'Klienci', icon: Users },
  { key: 'traffic', label: 'Ruch', icon: LineChart },
  { key: 'campaigns', label: 'Kampanie', icon: Megaphone },
  { key: 'integrations', label: 'Integracje', icon: PlugZap },
  { key: 'settings', label: 'Ustawienia', icon: Settings },
] as const;

type DashboardStoryProps = {
  module: DashboardModule;
  theme: 'light' | 'dark';
};

function DashboardStory({ module, theme }: DashboardStoryProps) {
  const definition = dashboardDefinitions[module];

  return (
    <div
      className="pds-brand-surface pdd-shell"
      data-theme={theme}
      lang="pl"
    >
      <div className="pdd-app">
        <aside className="pdd-sidebar" aria-label="Nawigacja dashboardu">
          <PapaDataBrand className="pdd-brand" />

          <nav className="pdd-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={item.key === module ? 'is-active' : undefined}
                  key={item.key}
                  type="button"
                >
                  <Icon aria-hidden="true" size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="pdd-sidebar-footer">
            <strong>Northstar Commerce</strong>
            <span>Europe/Warsaw · dane sprzedażowe</span>
          </div>
        </aside>

        <section className="pdd-content">
          <header className="pdd-topbar">
            <div>
              <h1>{definition.headline}</h1>
              <p>{definition.summary}</p>
            </div>

            <div className="pdd-controls">
              <span className="pdd-control">
                <CalendarDays aria-hidden="true" size={15} />
                Ostatnie 30 dni
              </span>
              <span className="pdd-control">
                <Search aria-hidden="true" size={15} />
                Szukaj
              </span>
              <span className="pdd-control">
                <Bell aria-hidden="true" size={15} />
                4
              </span>
            </div>
          </header>

          <main className="pdd-main">
            <section className="pdd-summary">
              <article className="pdd-panel">
                <div className="pdd-panel-header">
                  <div>
                    <h2>{definition.module}</h2>
                    <span>Zakres, świeżość i dostępność danych</span>
                  </div>
                  <span className={`pdd-chip pdd-chip--${definition.status}`}>
                    {definition.status}
                  </span>
                </div>

                <div className="pdd-kpi-grid">
                  <div className="pdd-card">
                    <span>Wynik</span>
                    <strong>{definition.metricA}</strong>
                    <p>Porównanie do poprzedniego okresu.</p>
                  </div>
                  <div className="pdd-card">
                    <span>Świeżość</span>
                    <strong>{definition.metricB}</strong>
                    <p>Jawny wpływ na decyzje i KPI.</p>
                  </div>
                  <div className="pdd-card">
                    <span>Zakres</span>
                    <strong>{definition.metricC}</strong>
                    <p>Moduły, źródła albo alerty wymagające uwagi.</p>
                  </div>
                </div>

                <div className="pdd-chart" aria-hidden="true">
                  {[42, 58, 47, 76, 61, 88, 69, 81].map((value) => (
                    <span
                      className="pdd-bar"
                      key={value}
                      style={{ height: `${value}%` }}
                    />
                  ))}
                </div>
              </article>

              <aside className="pdd-panel">
                <div className="pdd-panel-header">
                  <h2>Najbliższe decyzje</h2>
                  <Sparkles aria-hidden="true" size={17} />
                </div>

                <ul className="pdd-insight-list">
                  <li>
                    <CheckCircle2 aria-hidden="true" size={16} />
                    <span>
                      Priorytet pokazuje źródło danych, zakres i wpływ.
                    </span>
                  </li>
                  <li>
                    <CircleDollarSign aria-hidden="true" size={16} />
                    <span>
                      Rekomendacje nie udają pewności przy danych partial.
                    </span>
                  </li>
                  <li>
                    <HelpCircle aria-hidden="true" size={16} />
                    <span>
                      Recovery pozostaje dostępne bez opuszczania kontekstu.
                    </span>
                  </li>
                </ul>
              </aside>
            </section>

            <table className="pdd-table">
              <thead>
                <tr>
                  <th>Sygnał</th>
                  <th>Źródło</th>
                  <th>Stan</th>
                  <th>Wpływ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tempo sprzedaży</td>
                  <td>Zamówienia</td>
                  <td>ready</td>
                  <td>Wysoki</td>
                </tr>
                <tr>
                  <td>Ruch płatny</td>
                  <td>Kampanie</td>
                  <td>partial</td>
                  <td>Średni</td>
                </tr>
                <tr>
                  <td>Stan integracji</td>
                  <td>Shopify</td>
                  <td>stale</td>
                  <td>Wymaga retry</td>
                </tr>
              </tbody>
            </table>
          </main>
        </section>
      </div>
    </div>
  );
}

const meta = {
  title: 'PapaData/Dashboard',
  component: DashboardStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    module: {
      control: 'select',
      options: Object.keys(dashboardDefinitions),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof DashboardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shell: Story = {
  args: { module: 'shell', theme: 'dark' },
};

export const CentrumDowodzenia: Story = {
  args: { module: 'command', theme: 'dark' },
};

export const Zamowienia: Story = {
  name: 'Zamówienia',
  args: { module: 'orders', theme: 'dark' },
};

export const Produkty: Story = {
  args: { module: 'products', theme: 'dark' },
};

export const Klienci: Story = {
  args: { module: 'customers', theme: 'dark' },
};

export const Ruch: Story = {
  args: { module: 'traffic', theme: 'dark' },
};

export const KampaniePlatne: Story = {
  name: 'Kampanie płatne',
  args: { module: 'campaigns', theme: 'dark' },
};

export const Integracje: Story = {
  args: { module: 'integrations', theme: 'dark' },
};

export const Ustawienia: Story = {
  args: { module: 'settings', theme: 'dark' },
};

export const Subskrypcja: Story = {
  args: { module: 'subscription', theme: 'dark' },
};

export const Pomoc: Story = {
  args: { module: 'support', theme: 'dark' },
};

export const PapaAsystent: Story = {
  args: { module: 'assistant', theme: 'dark' },
};
