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
    sortable: true,
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
    label: 'Owner',
    width: 180,
  },
  {
    id: 'readiness',
    label: 'Readiness',
    sortable: true,
    width: 170,
  },
];

const rows: readonly DataRow[] = [
  {
    family: 'Uniwersalne',
    id: 'universal',
    owner: 'Design System',
    readiness: 'Review',
    states: 'empty, error, loading, blocked',
    surface: 'Page, section, feedback',
  },
  {
    family: 'Dane',
    id: 'data',
    owner: 'Data Platform',
    readiness: 'Review',
    states: 'no data, partial, stale, delayed',
    surface: 'DataTable, list, chart handoff',
  },
  {
    family: 'Dostęp',
    id: 'access',
    owner: 'IAM',
    readiness: 'Review',
    states: 'forbidden, no-access, missing entitlement',
    surface: 'EmptyState, ErrorState, notice',
  },
  {
    family: 'Billing',
    id: 'billing',
    owner: 'Billing',
    readiness: 'Planned',
    states: 'trial, overdue, limited, locked',
    surface: 'Billing surfaces',
  },
  {
    family: 'AI',
    id: 'ai',
    owner: 'AI Runtime',
    readiness: 'Planned',
    states: 'model review, low confidence, unavailable',
    surface: 'AI recommendation panels',
  },
  {
    family: 'Operacje',
    id: 'operations',
    owner: 'Operations',
    readiness: 'Review',
    states: 'queued, running, cancelled, retry',
    surface: 'BackgroundOperationItem',
  },
  {
    family: 'Integracje',
    id: 'integrations',
    owner: 'Integrations',
    readiness: 'Review',
    states: 'syncing, reconnect, provider delayed',
    surface: 'Integration status surfaces',
  },
];

function readinessTone(
  readiness: DataRow['readiness'],
) {
  return readiness === 'Review'
    ? 'success'
    : 'neutral';
}

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
        <span className="pd-x18-term">Na końcu recovery</span>
        <span className="pd-x18-description">
          Retry, reconnect i action required pojawiają się tylko wtedy, gdy
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
              status="Readiness"
              text={String(row.readiness)}
              tone={readinessTone(row.readiness)}
            />
          </div>
          <span className="pd-x18-description">{row.states}</span>
          <span className="pd-x18-description">{row.surface}</span>
          <span className="pd-x18-description">
            Owner: {row.owner}
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
            { label: 'Status', value: 'review' },
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
            message="18.10 porządkuje wybór stanu przekrojowego. Nie zastępuje ownerów komponentów ani domenowych kontraktów 15.*."
            title="Macierz jako decyzja przypisania"
            tone="info"
          />
          <div className="pd-x18-data-scroll pd-x18-matrix-table">
            <DataTable
              ariaLabel="Macierz rodzin stanów przekrojowych"
              columns={columns}
              density="comfortable"
              emptyMessage="Brak rodzin stanów do pokazania."
              loading={false}
              pagination={null}
              rowCount={rows.length}
              rows={rows}
              selectedRowIds={[]}
              sort={{
                columnId: 'family',
                direction: 'asc',
              }}
              statusColumn={{
                columnId: 'readiness',
                label: 'Readiness',
                mapTone: {
                  Planned: 'neutral',
                  Review: 'success',
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

    await expect(
      canvas.getAllByText('Integracje')[0],
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Najpierw semantyka'),
    ).toBeInTheDocument();
  },
};
