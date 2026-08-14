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
  Button,
  StatusBadge,
} from '../../../design-system/components';
import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../presentation/StoryPresentation';

import '../../presentation/story-presentation.css';
import '../00-foundations/component-readiness.css';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Analityczne i domenowe',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Katalog gotowości komponentów analitycznych i domenowych: status, owner, fixture, play checks oraz wymagane warianty PL/EN, light/dark i responsive.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type ReadinessRow = {
  readonly name: string;
  readonly owner: string;
  readonly fixture: string;
  readonly status: 'accepted' | 'implemented';
};

const domainComponents = [
  ['ChartFrame', '15.01', 'fixtures/storybook/094-15-01-chartframe.json', 'accepted'],
  ['MetricCard', '15.02', 'fixtures/storybook/096-15-02-metriccard.json', 'accepted'],
  ['TrendChart', '15.03', 'fixtures/storybook/102-15-03-trendy.json', 'accepted'],
  ['ComparisonChart', '15.04', 'fixtures/storybook/097-15-04-porownania.json', 'accepted'],
  ['CorrelationChart', '15.06', 'fixtures/storybook/103-15-06-zaleznosci-i-korelacje.json', 'accepted'],
  ['ForecastChart', '15.07', 'fixtures/storybook/098-15-07-prognoza-i-ai.json', 'accepted'],
  ['ShareChart', '15.05', 'fixtures/storybook/101-15-05-struktura-i-udzial.json', 'accepted'],
  ['ChartDataState', '15.08', 'fixtures/storybook/100-15-08-stany-danych.json', 'accepted'],
  ['ChartInteractionLayer', '15.09', 'fixtures/storybook/095-15-09-interakcje-i-filtry.json', 'accepted'],
  ['DataStatusBanner', '18.08', 'fixtures/storybook/110-18-08-status-danych-i-readiness.json', 'accepted'],
  ['EvidencePanel', '18.07', 'fixtures/storybook/108-18-07-panele-szczegolow-dowodow-i-rekomendacji.json', 'accepted'],
  ['RecommendationCard', '18.07', 'fixtures/storybook/108-18-07-panele-szczegolow-dowodow-i-rekomendacji.json', 'accepted'],
  ['DecisionQueue', '18.11', 'fixtures/storybook/230-18-11-data-decision-workspace.json', 'accepted'],
  ['BudgetPacing', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['AttributionComparison', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['ReconciliationPanel', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['SyncTimeline', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['LineageGraph', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['CohortMatrix', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['CustomerSegments', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['SalesFunnel', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
  ['FunnelStep', '35.04', 'fixtures/storybook/206-35-03-lejek-widok.json', 'accepted'],
  ['MorningBrief', '30.01', 'fixtures/storybook/166-30-01-widok-glowny.json', 'accepted'],
  ['AssistantComposer', '50.02', 'fixtures/storybook/232-50-02-assistantshell.json', 'accepted'],
  ['PairingFlow', '15.11', 'fixtures/storybook/288-component-readiness-domain.json', 'implemented'],
] satisfies readonly (readonly [string, string, string, ReadinessRow['status']])[];

const checks = [
  'PL/EN',
  'light/dark',
  'desktop/tablet/mobile',
  'keyboard/focus',
  'Contrast',
  'Semantics/ARIA',
  'Alt text policy',
  'Error states',
  'fixture',
  'play test',
] as const;

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

function text(pl: string, en: string) {
  return readLocale() === 'en' ? en : pl;
}

function DomainReadiness() {
  const rows = domainComponents.map(([name, owner, fixture, status]) => ({
    fixture,
    name,
    owner,
    status,
  }));

  return (
    <StoryPresentationPage
      className="pd-component-readiness"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={text('Metadane katalogu domenowego', 'Domain catalog metadata')}
          items={[
            { label: 'Story', value: '15.11' },
            { label: 'Status', value: 'implemented' },
            { label: 'Theme', value: readTheme() },
            { label: 'Locale', value: readLocale().toUpperCase() },
          ]}
        />
      )}
      sectionCode="15"
      sectionLabel={text('Wykresy i dane', 'Charts and data')}
      storyId="15.11"
      summary={text(
        'Katalog zamyka wspólne wymagania dla komponentów analitycznych i domenowych bez przejmowania ownerów wykresów 15.01-15.10 ani wzorców 18.',
        'The catalog closes shared requirements for analytical and domain components without taking over chart owners 15.01-15.10 or patterns 18.',
      )}
      title={text('Gotowość komponentów analityczno-domenowych.', 'Analytical and domain component readiness.')}
    >
      <StoryPresentationSection
        index="01"
        layout="wide"
        summary={text(
          'Statusy wskazują bieżący owner lub aktywny handoff, fixture oraz wymagany zestaw testów.',
          'Statuses show current owner or active handoff, fixture and required checks.',
        )}
        title={text('Zakres', 'Scope')}
      >
        <dl className="pd-component-readiness__summary">
          <div>
            <dt>{text('Komponenty', 'Components')}</dt>
            <dd>{rows.length}</dd>
          </div>
          <div>
            <dt>{text('Fixtures', 'Fixtures')}</dt>
            <dd>{new Set(rows.map((row) => row.fixture)).size}</dd>
          </div>
          <div>
            <dt>{text('Kryteria', 'Criteria')}</dt>
            <dd>{checks.length}</dd>
          </div>
        </dl>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        layout="full"
        summary={text(
          'Każdy komponent ma jawny status, coverage i kontrolkę używaną przez play test.',
          'Each component has explicit status, coverage and a control used by the play test.',
        )}
        title={text('Macierz gotowości', 'Readiness matrix')}
      >
        <div className="pd-component-readiness__table">
          <table>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Owner</th>
                <th scope="col">Status</th>
                <th scope="col">Fixture</th>
                <th scope="col">Checks</th>
                <th scope="col">Play</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row"><code>{row.name}</code></th>
                  <td>{row.owner}</td>
                  <td>
                    <StatusBadge
                      status="Storybook"
                      text={row.status}
                      tone={row.status === 'accepted' ? 'success' : 'info'}
                    />
                  </td>
                  <td><code>{row.fixture}</code></td>
                  <td>
                    <ul className="pd-component-readiness__criteria">
                      {checks.map((check) => (
                        <li key={check}>{check}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <Button size="small" variant="secondary">
                      {text('Sprawdź', 'Verify')} {row.name}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StoryPresentationSection>
    </StoryPresentationPage>
  );
}

export const DomainComponentReadinessStory: Story = {
  name: 'Analityczne i domenowe',
  render: () => <DomainReadiness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('ChartFrame')).toBeInTheDocument();
    await expect(canvas.getByText('PairingFlow')).toBeInTheDocument();
    await expect(canvas.getAllByRole('row')).toHaveLength(domainComponents.length + 1);

    const button = canvas.getByRole('button', {
      name: /Sprawdź ChartFrame|Verify ChartFrame/,
    });
    await userEvent.click(button);
    await userEvent.tab();
    await expect(document.activeElement).toBeInstanceOf(HTMLElement);
  },
};
