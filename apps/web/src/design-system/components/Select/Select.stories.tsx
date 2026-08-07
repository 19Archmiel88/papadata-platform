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
  waitFor,
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

const englishOptions = [
  {
    value: 'crm',
    label: 'Core CRM',
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
    <div data-theme={theme}>
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
          <p className="pd-form-story__kicker">
            10 Komponenty/Lista wyboru
          </p>
          <h1>Lista wyboru z własną listą rozwijaną.</h1>
          <p className="pd-form-story__lead">
            Komponent wykorzystuje własną warstwę listy zamiast natywnego
            popupu przeglądarki. Zachowuje semantykę formularza, obsługę
            klawiatury oraz spójny wygląd w motywie jasnym i ciemnym.
          </p>
        </header>

        <section className="pd-form-story__section">
          <h2>Warianty</h2>

          <div className="pd-form-story__grid">
            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                wariant podstawowy
              </span>
              <h3>Podstawowy wariant</h3>
              <SelectPreview
                helperText="Lista rozwijana korzysta z tokenów i semantyki PapaData."
                initialValue="crm"
                label="Główne źródło danych"
                options={baseOptions}
                placeholder="Wybierz źródło"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                z wyszukiwaniem
              </span>
              <h3>Wyszukiwanie wewnątrz komponentu</h3>
              <SelectPreview
                helperText="Po otwarciu wyszukiwanie przejmuje rolę combobox i wskazuje aktywną opcję."
                initialValue={null}
                label="Dostawca integracji"
                options={baseOptions}
                placeholder="Wybierz dostawcę"
                searchable
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                locale en
              </span>
              <h3>English runtime copy</h3>
              <SelectPreview
                helperText="Search labels, placeholder and empty state follow the component locale."
                initialValue={null}
                label="Integration provider"
                locale="en"
                options={englishOptions}
                placeholder="Select provider"
                searchable
              />
            </article>

            <article
              className="pd-form-story__card"
              data-tone="error"
            >
              <span className="pd-form-story__eyebrow">
                błąd
              </span>
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

            <article
              className="pd-form-story__card"
              data-tone="muted"
            >
              <span className="pd-form-story__eyebrow">
                wyłączony
              </span>
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
              <span className="pd-form-story__eyebrow">
                wymagane
              </span>
              <h3>Pole wymagane</h3>
              <SelectPreview
                helperText="Etykieta i oznaczenie wymagania pozostają zgodne z pozostałymi polami."
                initialValue={null}
                label="Typ źródła"
                options={baseOptions}
                placeholder="Wybierz typ"
                required
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                opcja wyłączona
              </span>
              <h3>Opcja wyłączona</h3>
              <SelectPreview
                helperText="Opcja starszego systemu pozostaje widoczna, ale nie może zostać wybrana."
                initialValue="crm"
                label="Źródło operacyjne"
                options={optionsWithDisabled}
                placeholder="Wybierz źródło"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                długa lista
              </span>
              <h3>Dłuższa lista</h3>
              <SelectPreview
                helperText="Lista zachowuje lokalne przewijanie i aktywną opcję klawiaturową."
                initialValue="warehouse"
                label="Zestaw danych"
                options={longOptions}
                placeholder="Wybierz zestaw"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                długa lista z wyszukiwaniem
              </span>
              <h3>Wyszukiwanie w długiej liście</h3>
              <SelectPreview
                helperText="Filtrowanie zachowuje lokalne przewijanie oraz pusty stan."
                initialValue={null}
                label="Zestaw danych z wyszukiwaniem"
                options={longOptions}
                placeholder="Wybierz zestaw"
                searchable
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                pusty stan
              </span>
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
              <span className="pd-form-story__eyebrow">
                tryb jasny
              </span>
              <h3>Podgląd jasny</h3>
              <SelectPreview
                helperText="Ten sam komponent korzysta z tokenów aktywnego motywu jasnego."
                initialValue="meta"
                label="Wariant motywu"
                options={baseOptions}
                placeholder="Wybierz motyw"
                theme="light"
              />
            </article>

            <article className="pd-form-story__card">
              <span className="pd-form-story__eyebrow">
                tryb ciemny
              </span>
              <h3>Podgląd ciemny</h3>
              <SelectPreview
                helperText="Ten sam komponent korzysta z tokenów aktywnego motywu ciemnego."
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
          <p className="pd-form-story__kicker">
            10 Komponenty/Lista wyboru
          </p>
          <h1>Pusty stan po wyszukiwaniu.</h1>
          <p className="pd-form-story__lead">
            Wariant sprawdza zachowanie komponentu, gdy wpisana fraza
            nie pasuje do żadnej opcji.
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

    await expect(
      basicSelect,
    ).toHaveTextContent('CRM podstawowy');

    await userEvent.click(basicSelect);
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await expect(
      basicSelect,
    ).toHaveTextContent('Google Analytics 4');

    const searchableTrigger = canvas.getByRole('button', {
      name: 'Dostawca integracji',
    });

    await userEvent.click(searchableTrigger);

    const search = canvas.getByRole('combobox', {
      name: 'Dostawca integracji wyszukiwanie',
    });

    await waitFor(() => {
      expect(search).toHaveFocus();
    });

    await userEvent.type(search, 'Meta');

    const metaOption = canvas.getByRole('option', {
      name: 'Meta Ads',
    });

    await waitFor(() => {
      expect(search).toHaveAttribute(
        'aria-activedescendant',
        metaOption.id,
      );
    });

    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');

    await expect(
      canvas.getByText(
        'Brak wyników dla podanej frazy.',
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(search).not.toHaveAttribute(
        'aria-activedescendant',
      );
    });

    await userEvent.keyboard('{Escape}');

    await expect(
      searchableTrigger,
    ).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    await waitFor(() => {
      expect(searchableTrigger).toHaveFocus();
    });

    const englishTrigger = canvas.getByRole('button', {
      name: 'Integration provider',
    });

    const englishLabel = canvas.getByText(
      'Integration provider',
      {
        selector: '.pd-form-field__label',
      },
    );

    await expect(
      englishLabel.closest('label'),
    ).toHaveAttribute(
      'for',
      englishTrigger.id,
    );

    await userEvent.click(englishLabel);

    const englishSearch = canvas.getByRole('combobox', {
      name: 'Integration provider search',
    });

    await waitFor(() => {
      expect(englishSearch).toHaveFocus();
    });

    await expect(
      englishSearch,
    ).toHaveAttribute(
      'placeholder',
      'Search options',
    );

    await userEvent.type(englishSearch, 'zzz');

    await expect(
      canvas.getByText('No results for this query.'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(englishSearch).not.toHaveAttribute(
        'aria-activedescendant',
      );
    });

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(englishTrigger).toHaveFocus();
    });
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

    const trigger = canvas.getByRole('button', {
      name: 'Dostawca integracji',
    });

    await userEvent.click(trigger);

    const search = canvas.getByRole('combobox', {
      name: 'Dostawca integracji wyszukiwanie',
    });

    await waitFor(() => {
      expect(search).toHaveFocus();
    });

    await userEvent.type(search, 'bez-wyniku');

    await expect(
      canvas.getByText(
        'Brak wyników dla podanej frazy.',
      ),
    ).toBeInTheDocument();
  },
};
