import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  DataTable,
  InlineNotice,
  StatusBadge,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const columns: readonly DataColumn[] = [
  {
    id: 'family',
    label: 'Rodzina stanów',
    width: 190,
  },
  {
    id: 'states',
    label: 'Zakres',
    width: 280,
  },
  {
    id: 'surface',
    label: 'Powierzchnia',
    width: 230,
  },
  {
    id: 'owner',
    label: 'Właściciel',
    width: 180,
  },
  {
    id: 'readiness',
    label: 'Gotowość',
    width: 170,
  },
];

const rows: readonly DataRow[] = [
  {
    family: 'Uniwersalne',
    id: 'universal',
    owner: 'Design System',
    readiness: 'W przeglądzie',
    states: 'pusty, błąd, ładowanie, zablokowany',
    surface: 'Strona, sekcja, feedback',
  },
  {
    family: 'Dane analityczne',
    id: 'data',
    owner: '15.08 / ChartDataState',
    readiness: 'W przeglądzie',
    states: 'brak danych, częściowe, nieaktualne, opóźnione',
    surface: 'ChartFrame, wykres, tabela alternatywna',
  },
  {
    family: 'Dostęp',
    id: 'access',
    owner: 'IAM',
    readiness: 'W przeglądzie',
    states: 'brak dostępu, blokada, brak uprawnienia',
    surface: 'EmptyState, ErrorState, komunikat',
  },
  {
    family: 'Billing',
    id: 'billing',
    owner: 'Billing',
    readiness: 'Planowane',
    states: 'okres próbny, zaległość, limit, blokada',
    surface: 'Powierzchnie billingowe',
  },
  {
    family: 'AI',
    id: 'ai',
    owner: 'AI Runtime',
    readiness: 'Planowane',
    states: 'przegląd modelu, niska pewność, niedostępne',
    surface: 'Panele rekomendacji AI',
  },
  {
    family: 'Operacje',
    id: 'operations',
    owner: 'Operations',
    readiness: 'W przeglądzie',
    states: 'w kolejce, trwa, anulowane, ponów',
    surface: 'BackgroundOperationItem',
  },
  {
    family: 'Integracje',
    id: 'integrations',
    owner: 'Integrations',
    readiness: 'W przeglądzie',
    states: 'synchronizacja, ponowne połączenie, opóźnienie providera',
    surface: 'Powierzchnie statusu integracji',
  },
];

function AssignmentRules() {
  return (
    <div className="pd-x18-stack pd-x18-stack--tight">
      <div className="pd-x18-matrix-rule">
        <span className="pd-x18-term">Najpierw semantyka</span>
        <span className="pd-x18-description">
          Stan wybieramy według wpływu na decyzję użytkownika, nie według nazwy
          błędu technicznego.
        </span>
      </div>
      <div className="pd-x18-matrix-rule">
        <span className="pd-x18-term">Potem powierzchnia</span>
        <span className="pd-x18-description">
          DataTable, Drawer, EmptyState i InlineNotice zachowują swoje role.
          Wzorzec nie tworzy lokalnych kopii tych komponentów.
        </span>
      </div>
      <div className="pd-x18-matrix-rule">
        <span className="pd-x18-term">Na końcu ścieżka naprawy</span>
        <span className="pd-x18-description">
          Ponowienie, ponowne połączenie i wymagana akcja pojawiają się tylko wtedy, gdy
          użytkownik ma realny następny krok.
        </span>
      </div>
    </div>
  );
}

function ResponsiveMatrixList() {
  return (
    <ul
      aria-label="Lista rodzin stanów przekrojowych"
      className="pd-x18-separator-list pd-x18-matrix-list"
    >
      {rows.map((row) => (
        <li key={row.id}>
          <div className="pd-x18-status-row">
            <span className="pd-x18-term">{row.family}</span>
            <StatusBadge
              status="Gotowość"
              text={String(row.readiness)}
              tone="neutral"
            />
          </div>
          <span className="pd-x18-description">{row.states}</span>
          <span className="pd-x18-description">{row.surface}</span>
          <span className="pd-x18-description">
            Właściciel: {row.owner}
          </span>
        </li>
      ))}
    </ul>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Macierz stanów przekrojowych',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CrossStateMatrixStory: Story = {
  name: 'Macierz stanów przekrojowych',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry macierzy stanów"
          items={[
            { label: 'Kontrakt', value: '18.10' },
            { label: 'Powierzchnia', value: 'DataTable' },
            { label: 'Status', value: 'W przeglądzie' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.10"
      summary="Macierz stanów przekrojowych mapuje rodziny stanów na właścicieli i powierzchnie. DataTable jest kanoniczną powierzchnią danych, a zasady przypisania są listą z separatorami."
      title="Macierz stanów przekrojowych"
    >
      <StoryPresentationSection
        index="01"
        summary="Uniwersalne, dane, dostęp, billing, AI, operacje i integracje w jednej macierzy."
        title="Tabela rodzin stanów"
      >
        <div className="pd-x18-stack">
          <InlineNotice
            message="18.10 porządkuje wybór stanu przekrojowego. Gotowość procesu danych pozostaje przy domenach, a analityczne stany prezentacyjne pozostają przy 15.08 ChartDataState."
            title="Macierz jako decyzja przypisania"
            tone="info"
          />
          <div className="pd-x18-matrix-table">
            <DataTable
              ariaLabel="Macierz rodzin stanów przekrojowych"
              columns={columns}
              density="comfortable"
              emptyMessage="Brak rodzin stanów do pokazania."
              loading={false}
              pagination={null}
              rowCount={rows.length}
              rowHeaderColumnId="family"
              rows={rows}
              selectedRowIds={[]}
              sort={null}
              statusColumn={{
                columnId: 'readiness',
                label: 'Gotowość',
                mapTone: {
                  Planowane: 'neutral',
                  'W przeglądzie': 'neutral',
                },
              }}
              summary="Macierz rodzin stanów przekrojowych i przypisanych powierzchni."
            />
          </div>
          <ResponsiveMatrixList />
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        summary="Zasady wyboru stanu zapisane jako lekka lista, nie jako osobne kafle."
        title="Zasady przypisania"
      >
        <AssignmentRules />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'Macierz stanów przekrojowych',
      }),
    ).toBeInTheDocument();

    const matrixTable = canvas.queryByRole('table', {
      name: 'Macierz rodzin stanów przekrojowych',
    });
    const matrixList = canvas.queryByRole('list', {
      name: 'Lista rodzin stanów przekrojowych',
    });

    await expect(
      matrixTable ?? matrixList,
    ).toBeInTheDocument();

    if (matrixTable) {
      await expect(
        canvas.getByRole('rowheader', {
          name: 'Uniwersalne',
        }),
      ).toBeInTheDocument();

      await expect(
        canvas.queryByRole('button', {
          name: /Sortuj po kolumnie/,
        }),
      ).not.toBeInTheDocument();
    }

    await expect(
      canvas.getAllByText('Integracje')[0],
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Najpierw semantyka'),
    ).toBeInTheDocument();
  },
};
