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

import {
  AssistantShellSimulator,
  CausalScenarioSimulator,
  ChartStudioBuilder,
  ContextBasketPanel,
  DecisionQueueSimulator,
  EvidenceAndRefusalsPanel,
  PapaAssistantLabPage,
  PapaLabOverview,
  PapaLabReports,
} from './PapaAssistantLabPage';
import type {
  PapaAssistantLabPageProps,
} from './PapaAssistantLabPage';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '40 Laboratorium Papa Asystenta',
  component: PapaAssistantLabPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PapaAssistantLabPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function WorkbenchFrame(props: PapaAssistantLabPageProps) {
  return (
    <StorybookProductShellFrame activePath="/app/papa">
      <PapaAssistantLabPage {...props} />
    </StorybookProductShellFrame>
  );
}

function ComponentFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-pal">
      <div className="pd-pal__content">
        {children}
      </div>
    </main>
  );
}

export const Workbench: Story = {
  name: 'Workbench',
  render: () => <WorkbenchFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Laboratorium Papa Asystenta' })).toBeInTheDocument();
    await expect(await canvas.findByRole('navigation', { name: 'Tryby Laboratorium' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'AI Workbench' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('tab', { name: 'Dowody' }));
    await expect(await canvas.findByText('orders.checkout_events')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('tab', { name: 'Kontekst' }));
    await userEvent.selectOptions(await canvas.findByLabelText('Typ'), 'Plik');
    await userEvent.type(await canvas.findByPlaceholderText('np. Bounce checkout mobile'), 'Nowy plik reklamacji');
    await userEvent.click(await canvas.findByRole('button', { name: 'Dodaj do Context Basket' }));
    await expect(await canvas.findByText('Nowy plik reklamacji')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Usuń Nowy plik reklamacji' }));
    await expect(canvas.queryByText('Nowy plik reklamacji')).not.toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('tab', { name: 'Akcje' }));
    await expect(await canvas.findByText('needsReview')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zatwierdź akcję' }));
    await expect(await canvas.findByText('approved')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('tab', { name: 'Projekt' }));
    await userEvent.click(await canvas.findByRole('tab', { name: 'Wykres' }));
    await userEvent.click(await canvas.findByRole('button', { name: /Radarowy/u }));
    await expect(await canvas.findByRole('img', { name: /Wykres radarowy/u })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('tab', { name: 'What-If' }));
    await userEvent.type(await canvas.findByPlaceholderText('np. pokaż wpływ cache na checkout mobile'), 'pokaż wariant cache');
    await userEvent.click(await canvas.findByRole('button', { name: 'Wygeneruj wykres AI' }));
    await expect(await canvas.findByText(/Wykres AI: pokaż wariant cache/u)).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Tryb skupienia' }));
    await expect(canvas.queryByRole('complementary', { name: 'Inspektor analizy' })).not.toBeInTheDocument();
  },
};

export const NowaAnaliza: Story = {
  name: 'Nowa analiza',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="project"
      initialCanvasTool="brief"
      initialRunState="draft"
    />
  ),
};

export const AnalizaWToku: Story = {
  name: 'Analiza w toku',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="result"
      initialRunState="running"
    />
  ),
};

export const WynikAnalizy: Story = {
  name: 'Wynik analizy',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="result"
      initialInspectorTab="evidence"
      initialRunState="completed"
    />
  ),
};

export const PorownanieWariantow: Story = {
  name: 'Porównanie wariantów',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="comparison"
      initialMode="decision"
      initialRunState="completed"
    />
  ),
};

export const StudioWykresow: Story = {
  name: 'Studio wykresów',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="project"
      initialCanvasTool="chart"
      initialMode="report"
      initialRunState="draft"
    />
  ),
};

export const SymulacjaWhatIf: Story = {
  name: 'Symulacja What-If',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="project"
      initialCanvasTool="whatIf"
      initialMode="decision"
      initialRunState="running"
    />
  ),
};

export const Biblioteka: Story = {
  name: 'Biblioteka',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="project"
      initialCanvasTool="reports"
      initialMode="report"
      initialRunState="completed"
    />
  ),
};

export const DaneCzesciowe: Story = {
  name: 'Dane częściowe',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="partial"
    />
  ),
};

export const BrakDanych: Story = {
  name: 'Brak danych',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="noData"
    />
  ),
};

export const OdmowaAi: Story = {
  name: 'Odmowa AI',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="aiRefusal"
    />
  ),
};

export const BladAnalizy: Story = {
  name: 'Błąd analizy',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="failed"
    />
  ),
};

export const BrakDostepu: Story = {
  name: 'Brak dostępu',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="permissionDenied"
    />
  ),
};

export const TrybSkupienia: Story = {
  name: 'Tryb skupienia',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="comparison"
      initialFocusMode
      initialMode="decision"
    />
  ),
};

export const DokumentacjaArchitektura: Story = {
  name: 'Dokumentacja / Architektura',
  render: () => (
    <ComponentFrame>
      <PapaLabOverview />
    </ComponentFrame>
  ),
};

export const AssistantShell: Story = {
  name: 'AssistantShell',
  render: () => (
    <ComponentFrame>
      <AssistantShellSimulator />
    </ComponentFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: /Diagnoza/u }));
    await expect(await canvas.findByText('Błąd API ERP: 504 Timeout.')).toBeInTheDocument();
  },
};

export const ContextBasket: Story = {
  name: 'ContextBasket',
  render: () => (
    <ComponentFrame>
      <ContextBasketPanel />
    </ComponentFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Współczynnik Konwersji (CR)')).toBeInTheDocument();
    await userEvent.type(await canvas.findByPlaceholderText('np. Współczynnik Odrzuceń Koszyka'), 'Bounce checkout mobile');
    await userEvent.click(await canvas.findByRole('button', { name: 'Dodaj do Context Basket' }));
    await expect((await canvas.findAllByText('Bounce checkout mobile')).length).toBeGreaterThan(0);
  },
};

export const DecisionQueue: Story = {
  name: 'DecisionQueue',
  render: () => (
    <ComponentFrame>
      <DecisionQueueSimulator />
    </ComponentFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('proposed')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Wsiądz do przeglądu' }));
    await expect(await canvas.findByText('needsReview')).toBeInTheDocument();
  },
};

export const EvidenceAndRefusals: Story = {
  name: 'EvidencePanel / odmowy',
  render: () => (
    <ComponentFrame>
      <EvidenceAndRefusalsPanel />
    </ComponentFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'prompt_injection_detected' }));
    await expect(await canvas.findByText(/Wykryto próbę manipulacji/u)).toBeInTheDocument();
  },
};

export const ReportBuilder: Story = {
  name: 'Studio Wykresów komponent',
  render: () => (
    <ComponentFrame>
      <ChartStudioBuilder />
    </ComponentFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: /Radarowy/u }));
    await expect(await canvas.findByText('RADAR')).toBeInTheDocument();
  },
};

export const CausalSimulator: Story = {
  name: 'What-If komponent',
  render: () => (
    <ComponentFrame>
      <CausalScenarioSimulator />
    </ComponentFrame>
  ),
};

export const ReportsAndAiAct: Story = {
  name: 'Biblioteka / AI Act komponent',
  render: () => (
    <ComponentFrame>
      <PapaLabReports />
    </ComponentFrame>
  ),
};
