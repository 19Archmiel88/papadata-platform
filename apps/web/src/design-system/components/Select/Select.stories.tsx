import type {
  CSSProperties,
} from 'react';
import {
  useState,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import type {
  SelectProps,
} from './Select';
import {
  Select,
} from './Select';
import '../Field/form-showcase.css';

const meta = {
  title: '10 Komponenty/Lista wyboru',
  component: Select,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

const baseOptions = [
  {
    value: 'crm',
    label: 'CRM podstawowy',
  },
  {
    value: 'ga4',
    label: 'Google Analytics 4',
  },
  {
    value: 'meta',
    label: 'Meta Ads',
  },
] as const;

const optionsWithDisabled = [
  ...baseOptions,
  {
    value: 'legacy',
    label: 'System starszej generacji',
    disabled: true,
  },
] as const;

const longOptions = [
  {
    value: 'sales-eu-central',
    label: 'Sprzedaż Europa Centralna',
  },
  {
    value: 'sales-eu-west',
    label: 'Sprzedaż Europa Zachodnia',
  },
  {
    value: 'sales-us-east',
    label: 'Sprzedaż USA Wschód',
  },
  {
    value: 'sales-us-west',
    label: 'Sprzedaż USA Zachód',
  },
  {
    value: 'sales-apac',
    label: 'Sprzedaż APAC',
  },
  {
    value: 'orders-core',
    label: 'Zamówienia rdzeniowe',
  },
  {
    value: 'returns-hub',
    label: 'Zwroty i reklamacje',
  },
  {
    value: 'loyalty',
    label: 'Program lojalnościowy',
  },
  {
    value: 'ads-performance',
    label: 'Wydajność reklam',
  },
  {
    value: 'warehouse',
    label: 'Stany magazynowe',
  },
  {
    value: 'pricing',
    label: 'Polityka cenowa',
  },
  {
    value: 'billing',
    label: 'Rozliczenia partnerów',
  },
] as const;

const themePreviewStyle = {
  display: 'grid',
  gap: 'var(--pd-space-3)',
  padding: 'var(--pd-space-4)',
  border: 'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
  borderRadius: 'var(--pd-radius-panel)',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--pd-surface-raised) 82%, transparent), transparent)',
} satisfies CSSProperties;

type SelectPreviewProps = Omit<
  SelectProps,
  'value' | 'onChange'
> & {
  readonly initialValue: string | null;
  readonly theme?: 'light' | 'dark';
};

function SelectPreview({
  initialValue,
  theme,
  ...props
}: SelectPreviewProps) {
  const [value, setValue] = useState<string | null>(initialValue);

  return (
    <div
      data-theme={theme}
      style={theme ? themePreviewStyle : undefined}
    >
      <Select
        {...props}
        onChange={(event) => {
          setValue(event.currentTarget.value || null);
        }}
        value={value}
      />
    </div>
  );
}

function SelectShowcase() {
  return (
    <main className="pd-form-story">
      <div className="pd-form-story__inner">
        <header className="pd-form-story__header">
          <p className="pd-form-story__kicker">10 Komponenty/Lista wyboru</p>
          <h1>Lista wyboru z własną listą rozwijaną.</h1>
          <p className="pd-form-story__lead">
            Komponent nie korzysta z natywnej listy przeglądarki. Przycisk
            otwierający zachowuje wygląd pola PapaData, a lista opcji pozostaje
            zgodna z motywem jasnym i ciemnym bez nowych zależności.
          </p>
        </header>

        <section className="pd-form-story__section">
          <div className="pd-form-story__grid">
            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">wariant podstawowy</span>
              <h3>Podstawowy wariant</h3>
              <SelectPreview
                helperText="Własna lista rozwijana zachowuje styl pola i tokeny PapaData."
                initialValue="crm"
                label="Główne źródło danych"
                options={baseOptions}
                placeholder="Wybierz źródło"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">z wyszukiwaniem</span>
              <h3>Wyszukiwanie wewnątrz komponentu</h3>
              <SelectPreview
                helperText="Filtrowanie działa wewnątrz listy rozwijanej, bez dodatkowej biblioteki."
                initialValue={null}
                label="Dostawca integracji"
                options={baseOptions}
                placeholder="Wybierz dostawcę"
                searchable
              />
            </article>

            <article className="pd-form-story__card" data-tone="error">
              <span className="pd-form-story__eyebrow">błąd</span>
              <h3>Stan błędu</h3>
              <SelectPreview
                helperText="Pole jest wymagane."
                initialValue={null}
                invalid
                label="Tryb rozliczenia"
                message="Wybierz jedną z dostępnych opcji."
                options={baseOptions}
                placeholder="Wybierz wariant"
                required
              />
            </article>

            <article className="pd-form-story__card" data-tone="muted">
              <span className="pd-form-story__eyebrow">wyłączony</span>
              <h3>Stan wyłączony</h3>
              <SelectPreview
                disabled
                helperText="Pole zablokowane do czasu odświeżenia konfiguracji."
                initialValue="ga4"
                label="Region rozliczeniowy"
                options={baseOptions}
                placeholder="Wybierz region"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">wymagane</span>
              <h3>Pole wymagane</h3>
              <SelectPreview
                helperText="Etykieta i gwiazdka pozostają zgodne z resztą pól."
                initialValue={null}
                label="Typ źródła"
                options={baseOptions}
                placeholder="Wybierz typ"
                required
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">opcja wyłączona</span>
              <h3>Opcja wyłączona</h3>
              <SelectPreview
                helperText="Opcja starszego systemu pozostaje widoczna, ale nieaktywna."
                initialValue="crm"
                label="Źródło operacyjne"
                options={optionsWithDisabled}
                placeholder="Wybierz źródło"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">długa lista</span>
              <h3>Dłuższa lista</h3>
              <SelectPreview
                helperText="Lista zachowuje własne przewijanie i aktywną opcję klawiaturową."
                initialValue="warehouse"
                label="Zestaw danych"
                options={longOptions}
                placeholder="Wybierz zestaw"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">długa lista z wyszukiwaniem</span>
              <h3>Wyszukiwanie w długiej liście</h3>
              <SelectPreview
                helperText="Filtrowanie zachowuje lokalny scroll i pusty stan bez systemowego paska przewijania."
                initialValue={null}
                label="Zestaw danych z wyszukiwaniem"
                options={longOptions}
                placeholder="Wybierz zestaw"
                searchable
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">pusty stan</span>
              <h3>Pusty stan po filtrowaniu</h3>
              <SelectPreview
                helperText="Wpisz frazę bez dopasowań, na przykład zzz."
                initialValue={null}
                label="Wyszukaj dostawcę"
                options={baseOptions}
                placeholder="Wybierz dostawcę"
                searchable
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">tryb jasny</span>
              <h3>Podgląd jasny</h3>
              <SelectPreview
                helperText="Ten sam komponent w motywie jasnym."
                initialValue="meta"
                label="Wariant motywu"
                options={baseOptions}
                placeholder="Wybierz motyw"
                theme="light"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">tryb ciemny</span>
              <h3>Podgląd ciemny</h3>
              <SelectPreview
                helperText="Lista rozwijana nie używa białej systemowej listy opcji."
                initialValue="ga4"
                label="Wariant motywu"
                options={baseOptions}
                placeholder="Wybierz motyw"
                theme="dark"
              />
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

function EmptyStateAfterSearchDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <main className="pd-form-story">
      <div className="pd-form-story__inner">
        <header className="pd-form-story__header">
          <p className="pd-form-story__kicker">10 Komponenty/Lista wyboru</p>
          <h1>Pusty stan po wyszukiwaniu.</h1>
          <p className="pd-form-story__lead">
            Wariant do sprawdzenia zachowania, gdy wpisana fraza nie pasuje
            do żadnej opcji.
          </p>
        </header>

        <section className="pd-form-story__section">
          <Select
            helperText="Wpisz frazę bez wyników, aby zobaczyć pusty stan."
            label="Dostawca integracji"
            onChange={(event) => {
              setValue(event.currentTarget.value || null);
            }}
            options={baseOptions}
            placeholder="Wybierz dostawcę"
            searchable
            value={value}
          />
        </section>
      </div>
    </main>
  );
}

export const SelectStory: Story = {
  args: {
    label: 'Główne źródło danych',
    options: baseOptions,
    placeholder: 'Wybierz źródło',
    value: 'crm',
  },
  name: 'Lista wyboru',
  render: () => <SelectShowcase />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const basicSelect = canvas.getByRole('combobox', {
      name: 'Główne źródło danych',
    });

    await expect(basicSelect).toHaveTextContent('CRM podstawowy');
    await userEvent.click(basicSelect);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(basicSelect).toHaveTextContent('Google Analytics 4');

    const searchableSelect = canvas.getByRole('combobox', {
      name: 'Dostawca integracji',
    });
    await userEvent.click(searchableSelect);

    const search = canvas.getByRole('textbox', {
      name: 'Dostawca integracji wyszukiwanie',
    });
    await userEvent.type(search, 'Meta');
    await expect(search).toHaveValue('Meta');
    await expect(
      canvas.getByRole('option', {
        name: 'Meta Ads',
      }),
    ).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    await expect(
      canvas.getByText('Brak wyników dla podanej frazy.'),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(searchableSelect).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

export const SelectEmptyStateStory: Story = {
  args: {
    label: 'Dostawca integracji',
    options: baseOptions,
    placeholder: 'Wybierz dostawcę',
    searchable: true,
    value: null,
  },
  name: 'Pusty stan po wyszukiwaniu',
  render: () => <EmptyStateAfterSearchDemo />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', {
      name: 'Dostawca integracji',
    });

    await userEvent.click(select);
    const search = canvas.getByRole('textbox', {
      name: 'Dostawca integracji wyszukiwanie',
    });
    await userEvent.type(search, 'bez-wyniku');
    await expect(
      canvas.getByText('Brak wyników dla podanej frazy.'),
    ).toBeInTheDocument();
  },
};
