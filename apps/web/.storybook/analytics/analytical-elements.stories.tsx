import type { Meta, StoryObj } from '@storybook/react-vite';

import '../foundations/papadata-brand-surface.css';
import './analytical-elements.css';

function AnalyticalKpi() {
  return (
    <div
      className="pds-brand-surface pdx-shell"
      data-theme="dark"
      lang="pl"
    >
      <main className="pdx-main">
        <header className="pdx-header">
          <span>Elementy analityczne</span>
          <h1>KPI</h1>
          <p>
            Karty KPI pokazują wartość, zakres, świeżość i ograniczenia
            interpretacji.
          </p>
        </header>

        <section className="pdx-grid">
          <article className="pdx-card">
            <span>Przychód</span>
            <strong>128 400 PLN</strong>
            <p>Ostatnie 30 dni, orders ready, timezone Europe/Warsaw.</p>
          </article>
          <article className="pdx-card">
            <span>Marża</span>
            <strong>31,2%</strong>
            <p>Partial: brak kosztów reklam dla jednego źródła.</p>
          </article>
          <article className="pdx-card">
            <span>Konwersja</span>
            <strong>3,4%</strong>
            <p>Traffic stale: ostatnia synchronizacja 48 godzin temu.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Elementy analityczne/KPI',
  component: AnalyticalKpi,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AnalyticalKpi>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KartyKpi: Story = {
  name: 'Karty KPI',
};
