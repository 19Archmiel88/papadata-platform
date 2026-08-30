import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  useState,
} from 'react';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  MarketingArchitecture,
  MarketingBriefBuilder,
  MarketingCaseTypeChart,
  MarketingCaseWorkspace,
  MarketingOutcomes,
  MarketingSupportBiPage,
  MarketingSupportOverview,
} from './MarketingSupportBiPage';
import {
  marketingBriefDefault,
  marketingCases,
} from './MarketingSupportBiPage.data';
import type {
  ImpactWindow,
  MarketingBriefDraft,
  MarketingCaseFilter,
  MarketingSupportCase,
} from './MarketingSupportBiPage.data';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '36 Wsparcie w marketingu/Strona z dostarczonego HTML',
  component: MarketingSupportBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof MarketingSupportBiPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-msbi">
      <div className="pd-msbi__content">
        {children}
      </div>
    </main>
  );
}

function WorkspaceHarness() {
  const [caseFilter, setCaseFilter] = useState<MarketingCaseFilter>('all');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(marketingCases[0].id);
  const [cases, setCases] = useState<readonly MarketingSupportCase[]>(marketingCases);
  const selectedCase = cases.find((supportCase) => supportCase.id === selectedCaseId) ?? cases[0];

  return (
    <StoryFrame>
      <MarketingCaseWorkspace
        caseFilter={caseFilter}
        cases={cases}
        onCaseFilterChange={setCaseFilter}
        onDecision={(caseId, decision) => {
          if (decision !== 'accept') return;
          setCases((currentCases) => currentCases.map((supportCase) => (
            supportCase.id === caseId ? { ...supportCase, status: 'Pomiar efektu' } : supportCase
          )));
        }}
        onSelectCase={(caseId) => setSelectedCaseId(caseId)}
        selectedCase={selectedCase}
      />
    </StoryFrame>
  );
}

function BriefHarness() {
  const [draft, setDraft] = useState<MarketingBriefDraft>(marketingBriefDefault);
  const [step, setStep] = useState(1);
  const [scanStamp, setScanStamp] = useState('GA4 + Meta Ads zsynchronizowane');

  return (
    <StoryFrame>
      <MarketingBriefBuilder
        draft={draft}
        onDraftChange={setDraft}
        onScan={() => setScanStamp('Skaner Papa AI zaktualizował próbkę danych z ostatnich 28 dni')}
        onStepChange={setStep}
        onSubmit={() => setStep(1)}
        scanStamp={scanStamp}
        step={step}
      />
    </StoryFrame>
  );
}

function OutcomesHarness() {
  const [impactWindow, setImpactWindow] = useState<ImpactWindow>(7);

  return (
    <StoryFrame>
      <MarketingOutcomes
        impactWindow={impactWindow}
        onImpactWindowChange={setImpactWindow}
      />
    </StoryFrame>
  );
}

export const FullPage: Story = {
  name: 'Pełna kompozycja strony',
  render: () => (
    <StorybookProductShellFrame activePath="/app/decisions/centrum-decyzji">
      <MarketingSupportBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { level: 1, name: 'Wsparcie w marketingu' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: /Sugerowane tematy konsultacji/u })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: /Aktywne Sprawy/u }));
    await expect(await canvas.findByRole('heading', { level: 1, name: 'Workspace Wsparcia Marketingowego' })).toBeInTheDocument();
    await expect((await canvas.findAllByText('MS-2026-0182')).length).toBeGreaterThan(0);
  },
};

export const OverviewAndDistribution: Story = {
  name: '1. Centrum dowodzenia i rozkład spraw',
  render: () => (
    <StoryFrame>
      <MarketingSupportOverview />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Papa · Wymaga Decyzji')).toBeInTheDocument();
    await expect(await canvas.findByText('Plan Professional')).toBeInTheDocument();
    await expect(await canvas.findByRole('img', { name: 'Rozkład tematyczny zgłaszanych spraw' })).toBeInTheDocument();
  },
};

export const WorkspaceMasterDetail: Story = {
  name: '2. Workspace spraw i rekomendacja',
  render: () => <WorkspaceHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.selectOptions(await canvas.findByLabelText('Filtr obszaru spraw'), 'Checkout');
    await expect(await canvas.findByText('MS-2026-0180')).toBeInTheDocument();
    await userEvent.click(await canvas.findByText('Spadek ukończenia checkoutu w PMax'));
    await expect(await canvas.findByText('Analiza ekspercka w toku')).toBeInTheDocument();
  },
};

export const BriefWizard: Story = {
  name: '3. Kreator nowego briefu',
  render: () => <BriefHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByPlaceholderText('np. Spadek ROAS w Meta Ads po zmianie kreacji wideo'), 'Spadek ROAS po zmianie kreacji');
    await userEvent.type(await canvas.findByPlaceholderText('Opisz zauważone zmiany, spadek wskaźników lub wątpliwości...'), 'ROAS spadł po uruchomieniu nowych materiałów wideo.');
    await userEvent.click(await canvas.findByRole('button', { name: 'Przejdź dalej →' }));
    await userEvent.type(await canvas.findByPlaceholderText(/Czy wyłączyć nowe kreacje/u), 'Czy przenieść budżet do retargetingu?');
    await userEvent.click(await canvas.findByRole('button', { name: 'Przejdź dalej →' }));
    await expect(await canvas.findByRole('heading', { name: 'Automatyczny Context Pack' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Ponów skanowanie' }));
    await expect(await canvas.findByText(/Skaner Papa AI zaktualizował próbkę danych/u)).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Przejdź dalej →' }));
    await expect(await canvas.findByRole('heading', { name: 'Podsumowanie zgłoszenia przed wysłaniem' })).toBeInTheDocument();
  },
};

export const OutcomesMeasurement: Story = {
  name: '4. Wyniki i historia rekomendacji',
  render: () => <OutcomesHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: '14 Dni po' }));
    await expect(await canvas.findByRole('img', { name: 'Ewolucja ROAS 14 dni po wdrożeniu' })).toBeInTheDocument();
    await expect(await canvas.findByText('Meta prospecting budget shift')).toBeInTheDocument();
    await expect(await canvas.findByText('Wykluczenie 14 SKU z feedu Google')).toBeInTheDocument();
  },
};

export const ArchitectureAndRbac: Story = {
  name: '5. Specyfikacja i RBAC',
  render: () => (
    <StoryFrame>
      <MarketingArchitecture />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Specyfikacja Architektoniczna & Model Danych' })).toBeInTheDocument();
    await expect(await canvas.findByText('DOMENA: Wsparcie w marketingu')).toBeInTheDocument();
    await expect(await canvas.findByText('marketing_support.quote.accept')).toBeInTheDocument();
  },
};

export const QuoteWorkflow: Story = {
  name: '6. Modal wyceny i role',
  render: () => (
    <StorybookProductShellFrame activePath="/app/decisions/centrum-decyzji">
      <MarketingSupportBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Poproś o wycenę →' }));
    await expect(await canvas.findByRole('dialog', { name: 'Zapytanie o wycenę usłu niestandardowej' })).toBeInTheDocument();
    await expect(await canvas.findByText(/marketing_support\.quote\.accept/u)).toBeInTheDocument();
    await expect(await canvas.findByText('1 476,00 PLN')).toBeInTheDocument();
  },
};

export const CaseTypeChart: Story = {
  name: '7. Samodzielny wykres typów spraw',
  render: () => (
    <StoryFrame>
      <MarketingCaseTypeChart />
    </StoryFrame>
  ),
};
