import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';
import {
  useState,
} from 'react';

import '../Filters/filters-showcase.css';
import {
  searchExamples,
  searchPlaceholder,
} from '../Filters/storyData';
import {
  SearchField,
} from './SearchField';

const meta = {
  title: '10 Komponenty/SearchField',
  component: SearchField,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

function SearchFieldPreview({
  initialQuery,
  scopeLabel,
  theme,
  ...props
}: {
  readonly initialQuery: string;
  readonly scopeLabel?: string;
  readonly theme?: 'light' | 'dark';
} & Omit<
  React.ComponentProps<typeof SearchField>,
  'query' | 'onQueryChange'
>) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <div
      className="pd-tools-story__surface"
      data-theme={theme}
    >
      <SearchField
        {...props}
        query={query}
        onQueryChange={setQuery}
      />
    </div>
  );
}

function SearchFieldRuntimePreview() {
  const [query, setQuery] = useState('');
  const [clearCount, setClearCount] = useState(0);
  const [emissionCount, setEmissionCount] = useState(0);
  const [submitCount, setSubmitCount] = useState(0);

  return (
    <div className="pd-tools-story__surface">
      <form
        aria-label="Formularz wyszukiwania testowego"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitCount((current) => current + 1);
        }}
      >
        <SearchField
          clearLabel="Wyczyść wyszukiwanie testowe"
          debounceMs={200}
          helperText="Pole pokazuje rzeczywisty debounce, czyszczenie i brak submitu po Enter."
          label="Wyszukiwanie testowe"
          loading={false}
          placeholder="Wpisz zapytanie testowe"
          query={query}
          resultCount={query.length > 0 ? 1 : null}
          onClear={() => {
            setClearCount((current) => current + 1);
          }}
          onQueryChange={(value) => {
            setQuery(value);
            setEmissionCount((current) => current + 1);
          }}
        />
      </form>

      <div className="pd-tools-story__stack">
        <p aria-live="polite">
          Ostatnia zapisana wartość: {query.length > 0 ? query : '(puste)'}
        </p>
        <p>Liczba zapisanych zmian: {emissionCount}</p>
        <p>Liczba wyczyszczeń: {clearCount}</p>
        <p>Liczba submitów formularza: {submitCount}</p>
      </div>
    </div>
  );
}

export const SearchFieldStory: Story = {
  args: {
    debounceMs: 150,
    label: 'Wyszukiwanie lokalne',
    loading: false,
    placeholder: searchPlaceholder,
    query: '',
    resultCount: null,
  },
  name: 'Pole wyszukiwania',
  render: () => (
    <div className="pd-tools-story">
      <div className="pd-tools-story__inner">
        <header className="pd-tools-story__header">
          <p className="pd-tools-story__kicker">10 Komponenty/SearchField</p>
          <h1>Pole wyszukiwania ma przyspieszać lokalną pracę z danymi.</h1>
          <p className="pd-tools-story__lead">
            Komponent pozostaje mały, czytelny i lokalny. Obsługuje czyszczenie,
            liczbę wyników, stan błędu i oczekiwania bez budowania globalnego mechanizmu wyszukiwania.
          </p>
        </header>

        <section className="pd-tools-story__section">
          <h2>Warianty</h2>
          <div className="pd-tools-story__rows">
            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Neutralne pole z ikoną wyszukiwania i polskim placeholderem.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SearchFieldPreview
                  debounceMs={150}
                  helperText="Szukaj po nazwie źródła, właścicielu albo identyfikatorze procesu."
                  initialQuery={searchExamples.empty}
                  label="Wyszukiwanie lokalne"
                  loading={false}
                  placeholder={searchPlaceholder}
                  resultCount={24}
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Stan z wartością</h3>
                <p>Przycisk czyszczenia pojawia się dopiero po wpisaniu wartości.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SearchFieldPreview
                  debounceMs={150}
                  helperText="Escape czyści wpisaną wartość bez opuszczania pola."
                  initialQuery={searchExamples.populated}
                  label="Wyszukiwanie synchronizacji"
                  loading={false}
                  placeholder={searchPlaceholder}
                  resultCount={6}
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Ładowanie i błąd</h3>
                <p>Spinner i komunikat walidacyjny korzystają z istniejących tokenów systemu.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SearchFieldPreview
                  debounceMs={250}
                  helperText="Wyniki są aktualizowane lokalnie po krótkim opóźnieniu."
                  initialQuery="meta"
                  label="Wyszukiwanie źródła reklamowego"
                  loading
                  placeholder={searchPlaceholder}
                  resultCount={null}
                />
                <SearchFieldPreview
                  debounceMs={150}
                  helperText="Znak specjalny nie jest dozwolony w tym przykładzie."
                  initialQuery="sync@"
                  invalid
                  label="Wyszukiwanie identyfikatora"
                  loading={false}
                  message="Usuń znak specjalny i spróbuj ponownie."
                  placeholder="Wyszukaj identyfikator procesu"
                  resultCount={0}
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Stan wyłączony</h3>
                <p>Pole zachowuje czytelność, ale nie sugeruje interakcji.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SearchFieldPreview
                  debounceMs={150}
                  disabled
                  helperText="Wyszukiwanie zostanie odblokowane po zakończeniu pełnej synchronizacji."
                  initialQuery=""
                  label="Wyszukiwanie lokalne"
                  loading={false}
                  placeholder={searchPlaceholder}
                  resultCount={null}
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Długie copy i angielski</h3>
                <p>Wariant stresuje placeholder, helper i wpisaną wartość przy dłuższym, technicznym copy.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SearchFieldPreview
                  debounceMs={180}
                  helperText="Search across reconciliation checkpoints, escalation owners and workspace-specific integration identifiers without leaving the current section."
                  initialQuery="north-europe-revenue-recovery"
                  label="Cross-workspace search input"
                  loading={false}
                  placeholder="Search by partner system alias, escalation owner or reconciliation checkpoint identifier"
                  resultCount={2}
                  scopeLabel="Search field z długim copy"
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Debounce i klawiatura</h3>
                <p>Wariant testowy potwierdza brak submitu po Enter, czyszczenie po Escape i focus po usunięciu.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SearchFieldRuntimePreview />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-tools-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-tools-story__theme-grid">
            <div className="pd-tools-story__theme-column">
              <h3>Tryb jasny</h3>
              <p className="pd-tools-story__theme-copy">
                Delikatna powierzchnia i precyzyjna obwódka utrzymują narzędzie w tle danych.
              </p>
              <SearchFieldPreview
                debounceMs={150}
                helperText="Wyszukiwanie lokalne dla listy integracji."
                initialQuery="commerce"
                label="Wyszukiwanie lokalne"
                loading={false}
                placeholder={searchPlaceholder}
                resultCount={3}
                theme="light"
              />
            </div>

            <div className="pd-tools-story__theme-column">
              <h3>Tryb ciemny</h3>
              <p className="pd-tools-story__theme-copy">
                Kontrast pozostaje spokojny i nie przechodzi w jasny, systemowy input.
              </p>
              <SearchFieldPreview
                debounceMs={150}
                helperText="Wyszukiwanie lokalne dla historii synchronizacji."
                initialQuery="sync"
                label="Wyszukiwanie lokalne"
                loading={false}
                placeholder={searchPlaceholder}
                resultCount={8}
                theme="dark"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const runtimeInput = canvas.getByLabelText(
      'Wyszukiwanie testowe',
    );

    await userEvent.type(runtimeInput, 'sy');
    await new Promise((resolve) => {
      window.setTimeout(resolve, 80);
    });
    await userEvent.type(runtimeInput, 'nc');

    await expect(
      canvas.getByText('Liczba zapisanych zmian: 0'),
    ).toBeInTheDocument();

    await new Promise((resolve) => {
      window.setTimeout(resolve, 260);
    });

    await expect(
      canvas.getByText('Ostatnia zapisana wartość: sync'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Liczba zapisanych zmian: 1'),
    ).toBeInTheDocument();

    const clearButton = canvas.getByRole('button', {
      name: 'Wyczyść wyszukiwanie testowe',
    });

    await userEvent.click(clearButton);
    await expect(runtimeInput).toHaveFocus();
    await expect(runtimeInput).toHaveValue('');

    await new Promise((resolve) => {
      window.setTimeout(resolve, 260);
    });

    await expect(
      canvas.getByText('Ostatnia zapisana wartość: (puste)'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Liczba wyczyszczeń: 1'),
    ).toBeInTheDocument();

    await userEvent.type(runtimeInput, 'crm');
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByText('Liczba submitów formularza: 0'),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(runtimeInput).toHaveFocus();
    await expect(runtimeInput).toHaveValue('');
  },
};
