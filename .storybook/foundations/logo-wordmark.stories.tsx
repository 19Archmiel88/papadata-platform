import type { Meta, StoryObj } from '@storybook/react-vite';

import { PapaDataBrand } from '../shared/PapaDataBrand';
import './papadata-brand-surface.css';

function LogoWordmarkReference() {
  return (
    <div
      className="pds-brand-surface pds-foundation-stage"
      data-theme="dark"
      lang="pl"
    >
      <main className="pds-foundation-main">
        <section className="pds-foundation-hero">
          <span className="pds-foundation-kicker">
            Podstawy marki
          </span>
          <h1>Logo i wordmark</h1>
          <p>
            Robocza referencja znaku PapaData dla topbaru,
            powierzchni Auth i przyszłego dashboardu.
          </p>
        </section>

        <section
          className="pds-foundation-showcase"
          aria-label="Warianty znaku PapaData"
        >
          <div className="pds-foundation-logo-row">
            <PapaDataBrand className="pds-brand pds-foundation-logo-lockup" />
          </div>

          <div className="pds-foundation-samples">
            <div>
              <span>Topbar</span>
              <strong>Pełny znak z animacją wordmarka</strong>
            </div>
            <div>
              <span>Mobile</span>
              <strong>Sygnał + skrócony kontekst tekstowy</strong>
            </div>
            <div>
              <span>Reduced motion</span>
              <strong>Statyczny znak bez animacji linii</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Podstawy marki/Logo i wordmark',
  component: LogoWordmarkReference,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LogoWordmarkReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReferencjaZnaku: Story = {
  name: 'Referencja znaku',
};
