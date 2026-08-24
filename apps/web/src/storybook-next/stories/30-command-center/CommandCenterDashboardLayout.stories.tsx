import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';

import {
  CommandCenterDashboardLayout,
} from '../../../screens/business/command-center/CommandCenterDashboardLayout';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './command-center-dashboard-layout.stories.css';

const meta = {
  title: '30 Centrum Dowodzenia/Dashboard layout',
  component: CommandCenterDashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Komponentowy layout Centrum Dowodzenia. Aplikacja sklada w te sloty realne KPI, plan, priorytety, wykresy i panel decyzji.',
      },
    },
  },
} satisfies Meta<typeof CommandCenterDashboardLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryPanel({
  children,
  label,
  title,
  variant = 'default',
}: {
  readonly children?: ReactNode;
  readonly label: string;
  readonly title: string;
  readonly variant?: 'chart' | 'default' | 'kpi' | 'queue';
}) {
  return (
    <section
      className="pd-command-dashboard-story-panel"
      data-variant={variant}
    >
      <header>
        <span>{label}</span>
        <h3>{title}</h3>
      </header>
      {children}
    </section>
  );
}

function KpiDeck() {
  return (
    <StoryPanel
      label="KPI"
      title="Talia 2 x 4"
      variant="kpi"
    >
      <div className="pd-command-dashboard-story__kpis">
        {['Przychod', 'Zakupy', 'Marza', 'Konwersja', 'AOV', 'Koszt reklam', 'ROAS', 'CPA'].map((item, index) => (
          <article key={item}>
            <span>{item}</span>
            <strong>{index < 2 ? ['209 zl', '3'][index] : '-'}</strong>
            <small>{index < 2 ? 'Dane gotowe' : 'Zrodlo niedostepne'}</small>
          </article>
        ))}
      </div>
    </StoryPanel>
  );
}

function ChartPanel({
  label,
  title,
  variant = 'chart',
}: {
  readonly label: string;
  readonly title: string;
  readonly variant?: 'chart' | 'queue';
}) {
  return (
    <StoryPanel
      label={label}
      title={title}
      variant={variant}
    >
      <div className="pd-command-dashboard-story__chart" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </StoryPanel>
  );
}

function PriorityQueue() {
  return (
    <StoryPanel
      label="Priorytety"
      title="Co wymaga decyzji teraz"
      variant="queue"
    >
      <ol className="pd-command-dashboard-story__queue">
        {['Konwersja koszyka', 'ROAS blended', 'Koszt reklamy', 'CPA'].map((item, index) => (
          <li key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{item}</strong>
              <small>Dowod, wplyw, wlasciciel i termin w jednym wierszu.</small>
            </div>
          </li>
        ))}
      </ol>
    </StoryPanel>
  );
}

function LayoutContractDemo() {
  return (
    <div className="pd-command-dashboard-layout-story__stage">
      <CommandCenterDashboardLayout
        actions={(
          <StoryPanel label="Dzialania" title="Dzialania i pomiar">
            <p>Zamkniecie petli: decyzja, wlasciciel, status, efekt, termin.</p>
          </StoryPanel>
        )}
        customers={<ChartPanel label="Klienci" title="Nowi i powracajacy" />}
        decisionWorkspace={<ChartPanel label="Decyzja" title="Dowody i rekomendacja" />}
        drivers={<ChartPanel label="Drivery" title="Co napedza wynik" />}
        funnel={<ChartPanel label="Lejek" title="Lejek sprzedazy" />}
        kpis={<KpiDeck />}
        plan={<ChartPanel label="Plan" title="Plan vs Benchmark" />}
        priorities={<PriorityQueue />}
        products={<ChartPanel label="Produkty" title="Najlepiej sprzedajace sie produkty" />}
        traffic={<ChartPanel label="Zrodla" title="Kanaly ruchu" />}
      />
    </div>
  );
}

export const LayoutContract: Story = {
  name: 'Kontrakt ukladu dashboardu',
  render: () => (
    <StoryPresentationPage
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry layoutu Command Center"
          items={[
            {
              label: 'Warstwa',
              value: 'Component first',
            },
            {
              label: 'Sloty',
              value: '10',
            },
            {
              label: 'Tryb',
              value: 'Runtime dashboard',
            },
          ]}
        />
      )}
      sectionCode="30"
      sectionLabel="Centrum Dowodzenia"
      storyId="30.command-dashboard-layout"
      summary="Layout definiuje pierwszy ekran operacyjny, siatke analiz i dolna petle decyzji. Dopiero aplikacja webowa wklada tu realne sekcje i dane API."
      title="Centrum Dowodzenia ma komponentowy dashboard layout."
    >
      <StoryPresentationSection
        index="01"
        layout="full"
        summary="Historia pokazuje kontrakt slotow bez zaleznosci od konkretnego zakresu danych."
        title="Szkielet kompozycji"
      >
        <LayoutContractDemo />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
};
