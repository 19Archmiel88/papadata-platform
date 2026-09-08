import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { DecisionsScreen } from '../../../screens/decisions/DecisionsScreen';
import { decisionsDemoData } from '../../../screens/decisions/DecisionsScreen.demo';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = {
  title: 'INTERNAL STORY SUPPORT/Decyzje',
  component: DecisionsScreen,
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta<typeof DecisionsScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
const render = (props: Parameters<typeof DecisionsScreen>[0] = {}) => (
  <StorybookProductShellFrame activePath="/app/decisions/centrum-decyzji">
    <DecisionsScreen persistenceKey={null} {...props} />
  </StorybookProductShellFrame>
);
export const Overview: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(await c.findByRole('heading', { name: 'Decyzje', level: 1 })).toBeInTheDocument();
    await expect(await c.findByRole('list', { name: 'Decyzje w kolejce' })).toBeInTheDocument();
  },
};
export const Evidence: Story = {
  render: () => render({ initialDecisionId: 'DEC-101' }),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = within(await body.findByRole('dialog'));
    await expect(await dialog.findByText('Dostępny zapas')).toBeInTheDocument();
    await expect(
      await dialog.findByRole('button', { name: 'Otwórz analizę źródłową ↗' }),
    ).toBeInTheDocument();
  },
};
export const Plan: Story = {
  render: () => render({ initialDecisionId: 'DEC-104' }),
  play: async ({ canvasElement }) => {
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await expect(await d.findByRole('button', { name: 'Odnotuj wykonanie' })).toBeDisabled();
    await expect(d.getAllByRole('checkbox')).toHaveLength(3);
  },
};
export const Measurement: Story = {
  render: () => render({ initialView: 'measurement' }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      await c.findByRole('heading', { name: 'Co zmieniło się po działaniu' }),
    ).toBeInTheDocument();
    await expect(await c.findByText('+2 p.p.')).toBeInTheDocument();
  },
};
export const Registry: Story = {
  render: () => render({ initialView: 'history' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Pobierz rejestr JSON' }),
    ).toBeInTheDocument();
  },
};
export const Approve: Story = {
  render: () => render({ initialDecisionId: 'DEC-101' }),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body),
      d = within(await body.findByRole('dialog'));
    await userEvent.click(await d.findByRole('button', { name: 'Przejdź do planu' }));
    await userEvent.type(
      d.getByLabelText('Uzasadnienie decyzji'),
      'Potwierdzimy aktualną dostępność i koszt dostawy przed zamówieniem.',
    );
    await userEvent.click(d.getByRole('button', { name: 'Zatwierdź plan' }));
    await expect(await d.findByRole('heading', { name: 'Zatwierdzony plan' })).toBeInTheDocument();
    await expect(d.getByRole('button', { name: 'Odnotuj wykonanie' })).toBeDisabled();
  },
};
export const Execute: Story = {
  render: () => render({ initialDecisionId: 'DEC-104' }),
  play: async ({ canvasElement }) => {
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    for (const input of await d.findAllByRole('checkbox')) await userEvent.click(input);
    await userEvent.type(
      d.getByLabelText('Potwierdzenie wykonania'),
      'Zweryfikowano status zamówień i zapisano ustalenia z magazynem.',
    );
    await userEvent.click(d.getByRole('button', { name: 'Odnotuj wykonanie' }));
    await expect(await d.findByText('W pomiarze')).toBeInTheDocument();
    await expect(
      await d.findByText('Okno pomiaru jeszcze trwa. Wynik można zapisać po jego zakończeniu.'),
    ).toBeInTheDocument();
  },
};
export const RejectAndReopen: Story = {
  render: () => render({ initialDecisionId: 'DEC-102' }),
  play: async ({ canvasElement }) => {
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await userEvent.click(d.getByRole('button', { name: 'Przejdź do planu' }));
    await userEvent.click(d.getByRole('button', { name: 'Odrzuć propozycję' }));
    await userEvent.type(
      d.getByLabelText('Powód odrzucenia'),
      'Analiza jest już prowadzona w innym zadaniu.',
    );
    await userEvent.click(d.getByRole('button', { name: 'Zapisz uzasadnienie' }));
    await userEvent.click(await d.findByRole('button', { name: 'Przejdź do planu' }));
    await userEvent.click(d.getByRole('button', { name: 'Przywróć do oceny' }));
    await userEvent.type(
      d.getByLabelText('Powód ponownej oceny'),
      'Dostępny jest nowy raport kosztów do sprawdzenia.',
    );
    await userEvent.click(d.getByRole('button', { name: 'Zapisz uzasadnienie' }));
    await expect(await d.findByText('Do decyzji')).toBeInTheDocument();
  },
};
export const Search: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(await c.findByRole('searchbox', { name: 'Szukaj decyzji' }), 'retinol');
    await expect(
      within(c.getByRole('list', { name: 'Decyzje w kolejce' })).getAllByRole('listitem'),
    ).toHaveLength(1);
    await expect(c.getByRole('button', { name: /Zweryfikuj marżę Olejku/ })).toBeInTheDocument();
  },
};
export const Create: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await c.findByRole('button', { name: '+ Nowa decyzja' }));
    const d = within(await body.findByRole('dialog'));
    for (const [name, value] of [
      ['Tytuł decyzji', 'Sprawdź koszt nowego produktu'],
      ['Obserwacja z danych', 'Nowy produkt nie ma uzupełnionego kosztu.'],
      ['Źródło obserwacji', 'Kartoteka SKU ABC'],
      ['Okres lub data danych', 'Sierpień 2026'],
      ['Proponowane działanie', 'Potwierdź koszt jednostkowy z księgowością.'],
      ['Osoba odpowiedzialna', 'Anna Kowalska'],
      ['Metryka wyniku', 'SKU z kosztem'],
    ])
      await userEvent.type(d.getByLabelText(name), value);
    await userEvent.click(d.getByRole('button', { name: 'Dodaj do kolejki' }));
    await expect(
      await body.findByRole('dialog', { name: 'Sprawdź koszt nowego produktu' }),
    ).toBeInTheDocument();
  },
};
export const Loading: Story = {
  render: () => render({ state: 'loading' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Wczytywanie decyzji…'),
    ).toBeInTheDocument();
  },
};
export const Empty: Story = {
  render: () =>
    render({ data: { ...decisionsDemoData, id: 'empty', decisions: [], activity: [] } }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', { name: 'Kolejka jest pusta' }),
    ).toBeInTheDocument();
  },
};
export const MissingEvidence: Story = {
  render: () => render({ initialDecisionId: 'DEC-103' }),
  play: async ({ canvasElement }) => {
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await expect(await d.findByText('Brak danych potrzebnych do akceptacji')).toBeInTheDocument();
    await expect(d.queryByRole('button', { name: 'Zatwierdź plan' })).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  render: () => render({ canManage: false, initialDecisionId: 'DEC-101' }),
  play: async ({ canvasElement }) => {
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await userEvent.click(await d.findByRole('button', { name: 'Przejdź do planu' }));
    await expect(d.getByRole('button', { name: 'Zatwierdź plan' })).toBeDisabled();
  },
};
function RetryExample() {
  const [failed, setFailed] = useState(true);
  return render({ state: failed ? 'error' : 'ready', onRetry: () => setFailed(false) });
}
export const Error: Story = {
  render: () => <RetryExample />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Spróbuj ponownie' }));
    await expect(await c.findByRole('list', { name: 'Decyzje w kolejce' })).toBeInTheDocument();
  },
};
export const RecordMeasurement: Story = {
  name: 'Zapis wyniku po pełnym okresie',
  render: () =>
    render({
      initialDecisionId: 'DEC-105',
      data: {
        ...decisionsDemoData,
        id: 'measurement-ready',
        decisions: decisionsDemoData.decisions.map((d) =>
          d.id === 'DEC-105'
            ? {
                ...d,
                observation:
                  'Start przykładowego testu odnotowano 18 sierpnia. Pełne okno obserwacji zakończono 31 sierpnia.',
                evidencePeriod: 'Baza: 4–17 sierpnia · obserwacja: 18–31 sierpnia 2026',
                evidence: [
                  {
                    label: 'Bazowa konwersja',
                    value: '3,2%',
                    source: 'Oddzielna próbka · 320 / 10 000 sesji · 4–17 sierpnia',
                  },
                ],
                measurement: {
                  ...d.measurement,
                  startsOn: '2026-08-18',
                  endsOn: '2026-08-31',
                  baselineLabel: '4–17 sierpnia · oddzielna próbka pomiarowa',
                },
              }
            : d,
        ),
      },
    }),
  play: async ({ canvasElement }) => {
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await userEvent.type(await d.findByLabelText('Wynik (%)'), '0');
    await userEvent.type(
      d.getByLabelText('Źródło wyniku'),
      'Raport z pełnego okresu: 0 zamówień / 1000 sesji.',
    );
    await userEvent.type(
      d.getByLabelText('Komentarz do pomiaru'),
      'Ten sam sposób obliczenia; zaobserwowano spadek.',
    );
    await userEvent.click(d.getByRole('button', { name: 'Zapisz wynik obserwacji' }));
    await expect(await d.findByText('Zmierzone')).toBeInTheDocument();
    await expect(await d.findByText('-3,2 p.p.')).toBeInTheDocument();
  },
};
