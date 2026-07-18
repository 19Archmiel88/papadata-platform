import type { Meta, StoryObj } from '@storybook/react-vite';
import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { PapaDataBrand } from '../shared/PapaDataBrand';
import './papadata-brand-surface.css';

type PapaDataTheme = 'light' | 'dark';
type PapaDataLanguage = 'pl' | 'en';

type PapaDataBrandSurfaceProps = {
  initialLanguage: PapaDataLanguage;
  initialTheme: PapaDataTheme;
};

function PapaDataBrandSurface(
  props: PapaDataBrandSurfaceProps,
) {
  const resetKey = `${props.initialLanguage}-${props.initialTheme}`;

  return (
    <PapaDataBrandSurfaceState
      key={resetKey}
      {...props}
    />
  );
}

function PapaDataBrandSurfaceState({
  initialLanguage,
  initialTheme,
}: PapaDataBrandSurfaceProps) {
  const [language, setLanguage] =
    useState<PapaDataLanguage>(initialLanguage);
  const [theme, setTheme] =
    useState<PapaDataTheme>(initialTheme);

  const nextLanguage: PapaDataLanguage =
    language === 'pl' ? 'en' : 'pl';

  const nextTheme: PapaDataTheme =
    theme === 'dark' ? 'light' : 'dark';

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  const languageLabel =
    language === 'pl'
      ? 'Zmień język na angielski'
      : 'Zmień język na polski';

  const themeLabel =
    theme === 'dark'
      ? 'Przełącz na motyw jasny'
      : 'Przełącz na motyw ciemny';

  return (
    <div
      className="pds-brand-surface"
      data-language={language}
      data-theme={theme}
      lang={language}
    >
      <header className="pds-topbar" aria-label="PapaData">
        <div className="pds-topbar__inner">
          <PapaDataBrand />

          <div
            className="pds-preferences"
            aria-label="Ustawienia widoku"
          >
            <button
              aria-label={languageLabel}
              className="pds-preferences__button pds-preferences__button--language"
              onClick={() => setLanguage(nextLanguage)}
              title={languageLabel}
              type="button"
            >
              <span
                className="pds-language-switch"
                aria-hidden="true"
              >
                <span
                  className={
                    language === 'pl'
                      ? 'pds-language-switch__option is-active'
                      : 'pds-language-switch__option'
                  }
                >
                  PL
                </span>

                <span className="pds-language-switch__separator">
                  /
                </span>

                <span
                  className={
                    language === 'en'
                      ? 'pds-language-switch__option is-active'
                      : 'pds-language-switch__option'
                  }
                >
                  EN
                </span>
              </span>
            </button>

            <button
              aria-label={themeLabel}
              aria-pressed={theme === 'dark'}
              className="pds-preferences__button pds-preferences__button--theme"
              onClick={() => setTheme(nextTheme)}
              title={themeLabel}
              type="button"
            >
              <ThemeIcon
                aria-hidden="true"
                size={18}
                strokeWidth={1.75}
              />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

const meta = {
  title: 'PapaData/Podstawy marki/Tło i górny pasek',
  component: PapaDataBrandSurface,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialLanguage: {
      control: 'inline-radio',
      options: ['pl', 'en'],
    },
    initialTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof PapaDataBrandSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MotywCiemny: Story = {
  name: 'Motyw ciemny',
  args: {
    initialLanguage: 'pl',
    initialTheme: 'dark',
  },
};

export const MotywJasny: Story = {
  name: 'Motyw jasny',
  args: {
    initialLanguage: 'pl',
    initialTheme: 'light',
  },
};
