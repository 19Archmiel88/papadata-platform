import type { Meta, StoryObj } from '@storybook/react-vite';
import { Moon, Sun } from 'lucide-react';

import './papadata-brand-surface.css';

function ThemePreferencesReference() {
  return (
    <div
      className="pds-brand-surface pds-foundation-stage"
      data-theme="light"
      lang="pl"
    >
      <main className="pds-foundation-main pds-foundation-main--split">
        <section className="pds-foundation-hero">
          <span className="pds-foundation-kicker">
            Preferencje
          </span>
          <h1>Motywy i preferencje</h1>
          <p>
            Widok projektowy dla przełączania języka i motywu przed
            docelową decyzją produktową o dostępności tych kontrolek.
          </p>
        </section>

        <section
          className="pds-foundation-preference-grid"
          aria-label="Preferencje widoku"
        >
          <div className="pds-foundation-preference-card">
            <span>Język</span>
            <div className="pds-preferences" aria-label="Język">
              <button
                className="pds-preferences__button pds-preferences__button--language"
                type="button"
              >
                <span className="pds-language-switch" aria-hidden="true">
                  <span className="pds-language-switch__option is-active">
                    PL
                  </span>
                  <span className="pds-language-switch__separator">
                    /
                  </span>
                  <span className="pds-language-switch__option">
                    EN
                  </span>
                </span>
              </button>
            </div>
          </div>

          <div className="pds-foundation-preference-card">
            <span>Motyw jasny</span>
            <button
              className="pds-preferences__button pds-preferences__button--theme"
              type="button"
            >
              <Moon aria-hidden="true" size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div
            className="pds-foundation-preference-card"
            data-theme="dark"
          >
            <span>Motyw ciemny</span>
            <button
              className="pds-preferences__button pds-preferences__button--theme"
              type="button"
            >
              <Sun aria-hidden="true" size={18} strokeWidth={1.75} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const meta = {
  title: 'PapaData/Podstawy marki/Motywy i preferencje',
  component: ThemePreferencesReference,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ThemePreferencesReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReferencjaPreferencji: Story = {
  name: 'Referencja preferencji',
};
