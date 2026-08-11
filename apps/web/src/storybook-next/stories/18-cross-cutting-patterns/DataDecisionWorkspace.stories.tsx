import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  ChartFrame,
  DataTable,
  InlineNotice,
  StatusBadge,
  Toast,
  TrendChart,
} from '../../../design-system/components';
import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import '../00-foundations/foundation-geometry.css';
import './data-decision-workspace.css';

const meta = {
  title: '18 Wzorce interfejsu/DataDecisionWorkspace',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const decisionTrendData = [
  {
    actual: 3.8,
    label: 'T-6',
    plan: 4.1,
    previousPeriod: 4.4,
  },
  {
    actual: 3.7,
    label: 'T-5',
    plan: 4.1,
    previousPeriod: 4.2,
  },
  {
    actual: 3.5,
    label: 'T-4',
    plan: 4.0,
    previousPeriod: 4.0,
  },
  {
    actual: 3.2,
    label: 'T-3',
    plan: 4.0,
    previousPeriod: 3.9,
  },
  {
    actual: 3.1,
    label: 'T-2',
    plan: 3.9,
    previousPeriod: 3.7,
  },
  {
    actual: 2.9,
    label: 'T-1',
    plan: 3.9,
    previousPeriod: 3.5,
  },
] as const;

const decisionTableColumns: readonly DataColumn[] = [
  {
    id: 'channel',
    label: 'Kanał',
    width: 180,
  },
  {
    align: 'right',
    id: 'revenue',
    label: 'Przychód',
    width: 150,
  },
  {
    align: 'right',
    id: 'cost',
    label: 'Koszt',
    width: 130,
  },
  {
    align: 'right',
    id: 'roas',
    label: 'ROAS',
    width: 128,
  },
  {
    align: 'center',
    id: 'decision',
    label: 'Sygnał',
    width: 190,
  },
];

const decisionTableRows: readonly DataRow[] = [
  {
    channel: 'Meta Ads',
    cost: '386 420 zł',
    decision: 'Zmniejszyć budżet',
    id: 'meta-ads',
    revenue: '1 248 590 zł',
    roas: '3,2',
  },
  {
    channel: 'Google Ads',
    cost: '214 800 zł',
    decision: 'Utrzymać',
    id: 'google-ads',
    revenue: '982 100 zł',
    roas: '4,6',
  },
  {
    channel: 'Commerce',
    cost: '126 900 zł',
    decision: 'Sprawdzić marżę',
    id: 'commerce',
    revenue: '742 100 zł',
    roas: '5,8',
  },
];

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function Localized({
  pl,
  en,
}: LocalizedCopy) {
  return <>{copy({ pl, en })}</>;
}

function PatternPage({
  title,
  summary,
  children,
}: {
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <StoryPresentationPage
      headerAside={
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry wzorca', en: 'Pattern parameters' })}
          items={[
            { label: <Localized pl="Właściciel wzorca" en="Owner" />, value: '18' },
            { label: <Localized pl="Status" en="Status" />, value: <Localized pl="W przeglądzie" en="In review" /> },
            { label: <Localized pl="Źródło zasad" en="Rule source" />, value: '00' },
            { label: <Localized pl="Tryb" en="Mode" />, value: <Localized pl="Przestrzeń decyzji" en="Decision workspace" /> },
          ]}
        />
      }
      sectionCode="18"
      sectionLabel={<Localized pl="Wzorce interfejsu" en="Interface patterns" />}
      storyId="18.11"
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
  );
}

function DecisionWorkspaceCanvas() {
  return (
    <div
      aria-label={copy({
        pl: 'Wzorzec decyzji danych z ChartFrame, DataTable, rekomendacją, sidecarem asystenta i toastem',
        en: 'Data decision pattern with ChartFrame, DataTable, recommendation, assistant sidecar and toast',
      })}
      className="pd-x18-decision-workspace"
      role="region"
    >
      <InlineNotice
        message={copy({
          pl: '18.11 składa zaakceptowane właścicielstwa: 00 dla powierzchni i komunikatów, 15 dla wykresu oraz 18.04 dla workflow tabeli.',
          en: '18.11 composes accepted owners: 00 for surfaces and messages, 15 for the chart and 18.04 for the table workflow.',
        })}
        title={copy({
          pl: 'Granica odpowiedzialności',
          en: 'Ownership boundary',
        })}
        tone="info"
      />

      <div className="pd-x18-decision-workspace__stage">
        <ChartFrame
          alternativeTable={(
            <DataTable
              ariaLabel={copy({
                pl: 'Tabela kampanii w przestrzeni decyzji',
                en: 'Campaign table in the decision workspace',
              })}
              className="pd-x18-decision-workspace__data-table"
              columns={decisionTableColumns}
              emptyMessage={copy({
                pl: 'Brak kampanii w decyzji.',
                en: 'No campaigns in the decision.',
              })}
              loading={false}
              minWidth="46rem"
              rowCount={decisionTableRows.length}
              rowHeaderColumnId="channel"
              rows={decisionTableRows}
              selectedRowIds={[]}
              sort={null}
              statusColumn={{
                columnId: 'decision',
                label: copy({
                  pl: 'Sygnał decyzji',
                  en: 'Decision signal',
                }),
                mapTone: {
                  'Sprawdzić marżę': 'warning',
                  'Utrzymać': 'neutral',
                  'Zmniejszyć budżet': 'danger',
                },
              }}
              summary={copy({
                pl: 'Tabela kampanii konsumuje DataTable; pełny workflow tabeli należy do 18.04.',
                en: 'Campaign table consumes DataTable; the full table workflow belongs to 18.04.',
              })}
            />
          )}
          alternativeTableLabel={copy({
            pl: 'Tabela kampanii',
            en: 'Campaign table',
          })}
          annotation={(
            <div className="pd-x18-decision-workspace__recommendation">
              <StatusBadge
                status={copy({
                  pl: 'Ocena',
                  en: 'Assessment',
                })}
                text={copy({
                  pl: 'Do decyzji',
                  en: 'Decision needed',
                })}
                tone="warning"
              />
              <strong>
                <Localized
                  en="Shift budget from costly prospecting campaigns."
                  pl="Przenieś budżet z kosztownych kampanii prospectingowych."
                />
              </strong>
              <p>
                <Localized
                  en="The recommendation supports the decision without replacing the chart, table or source evidence."
                  pl="Rekomendacja wspiera decyzję, ale nie zastępuje wykresu, tabeli ani dowodów źródłowych."
                />
              </p>
            </div>
          )}
          businessQuestion={copy({
            pl: 'Który budżet wymaga decyzji po spadku efektywności?',
            en: 'Which budget needs a decision after the efficiency drop?',
          })}
          description={copy({
            pl: 'ChartFrame utrzymuje pytanie, status, źródła i wniosek. TrendChart odpowiada za wykres, a DataTable za alternatywę tabelaryczną.',
            en: 'ChartFrame keeps the question, status, sources and finding. TrendChart owns the chart and DataTable owns the table alternative.',
          })}
          freshnessLabel={copy({
            pl: 'Aktualizacja 2 min temu',
            en: 'Updated 2 min ago',
          })}
          rangeLabel={copy({
            pl: 'Ostatnie 30 dni',
            en: 'Last 30 days',
          })}
          sourceLabel="Meta Ads + GA4 + Commerce"
          status="ready"
          statusLabel={copy({
            pl: 'Dane aktualne',
            en: 'Data current',
          })}
          summary={(
            <p>
              <Localized
                en="ROAS is dropping faster than revenue in prospecting campaigns, so the next step is a budget decision with source evidence still visible."
                pl="ROAS spada szybciej niż przychód w kampaniach prospectingowych, więc następny krok to decyzja budżetowa z widocznymi dowodami źródłowymi."
              />
            </p>
          )}
          title={copy({
            pl: 'Efektywność kampanii i decyzja budżetowa',
            en: 'Campaign efficiency and budget decision',
          })}
          visualization={(
            <TrendChart
              ariaLabel={copy({
                pl: 'Trend decyzyjny ROAS z planem',
                en: 'Decision ROAS trend with plan',
              })}
              data={decisionTrendData}
              labels={{
                actual: copy({
                  pl: 'Wynik ROAS',
                  en: 'ROAS result',
                }),
                plan: copy({
                  pl: 'Plan operacyjny',
                  en: 'Operating plan',
                }),
                previousPeriod: copy({
                  pl: 'Poprzedni okres',
                  en: 'Previous period',
                }),
              }}
              unit="ROAS"
              valueFormatter={(value) =>
                new Intl.NumberFormat('pl-PL', {
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 1,
                }).format(value)}
            />
          )}
          visualizationLabel={copy({
            pl: 'Wykres trendu ROAS',
            en: 'ROAS trend chart',
          })}
        />

        <div className="pd-x18-decision-workspace__toast">
          <Toast
            message={copy({
              pl: 'Toast jest operacyjny i nie zmienia układu przestrzeni decyzji.',
              en: 'The toast is operational and does not change the decision workspace layout.',
            })}
            title={copy({
              pl: 'Widok zapisany',
              en: 'View saved',
            })}
            toastId="decision-workspace-saved"
            tone="success"
          />
        </div>
      </div>
    </div>
  );
}

export const DataDecisionWorkspaceStory: Story = {
  name: 'DataDecisionWorkspace',
  render: () => (
    <PatternPage
      title={<Localized pl="DataDecisionWorkspace" en="DataDecisionWorkspace" />}
      summary={<Localized pl="Wzorzec łączy dane, rekomendację, asystenta i komunikat operacyjny bez przechodzenia do osobnego ekranu decyzji." en="The pattern combines data, recommendation, assistant and operational message without moving to a separate decision screen." />}
    >
      <StoryPresentationSection
        index="01"
        title={<Localized pl="Przestrzeń decyzji" en="Decision workspace" />}
        summary={<Localized pl="00 definiuje powierzchnie i komunikaty; 18 pokazuje ich produktowe użycie." en="00 defines surfaces and messaging; 18 shows their product use." />}
      >
        <DecisionWorkspaceCanvas />
      </StoryPresentationSection>
    </PatternPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'DataDecisionWorkspace',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('W przeglądzie'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('region', {
        name: /Wzorzec decyzji danych/,
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('group', {
        name: 'Trend decyzyjny ROAS z planem',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Panel rekomendacji'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Papa Asystent'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('Widok zapisany'),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByText('Tabela kampanii'),
    );

    await expect(
      canvas.getByRole('table', {
        name: 'Tabela kampanii w przestrzeni decyzji',
      }),
    ).toBeInTheDocument();
  },
};
