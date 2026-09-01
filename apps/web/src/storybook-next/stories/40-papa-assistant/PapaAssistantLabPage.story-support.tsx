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
  PapaAssistantLabScreen,
} from '../../../screens/papa-assistant/lab/PapaAssistantLabScreen';
import type {
  PapaAssistantLabScreenProps,
} from '../../../screens/papa-assistant/lab/PapaAssistantLabScreen';
import {
  AssistantShellSimulator,
  CausalScenarioSimulator,
  ChartStudioBuilder,
  ContextBasketPanel,
  DecisionQueueSimulator,
  EvidenceAndRefusalsPanel,
  PapaLabOverview,
  PapaLabReports,
} from '../../../screens/papa-assistant/lab/PapaAssistantLabShowcases';
import {
  papaAssistantLabScreenFixture,
} from '../../../fixtures/papa-assistant/lab/papaAssistantLabDemoSeed';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/AI/Laboratorium Papa Asystenta',
  component: PapaAssistantLabScreen,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PapaAssistantLabScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function WorkbenchFrame(props: Omit<PapaAssistantLabScreenProps, 'data'>) {
  return (
    <StorybookProductShellFrame activePath="/app/papa">
      <PapaAssistantLabScreen data={papaAssistantLabScreenFixture} {...props} />
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
  name: 'Całość',
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
  name: 'Interakcje — Nowa analiza',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="project"
      initialCanvasTool="brief"
      initialRunState="draft"
    />
  ),
};

export const AnalizaWToku: Story = {
  name: 'Stany — Analiza w toku',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="result"
      initialRunState="running"
    />
  ),
};

export const WynikAnalizy: Story = {
  name: 'Sekcje — Wynik analizy',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="result"
      initialInspectorTab="evidence"
      initialRunState="completed"
    />
  ),
};

export const PorownanieWariantow: Story = {
  name: 'Sekcje — Porównanie wariantów',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="comparison"
      initialMode="decision"
      initialRunState="completed"
    />
  ),
};

export const StudioWykresow: Story = {
  name: 'Sekcje — Studio wykresów',
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
  name: 'Interakcje — Symulacja wariantów',
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
  name: 'Sekcje — Biblioteka',
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
  name: 'Stany — Dane częściowe',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="partial"
    />
  ),
};

export const BrakDanych: Story = {
  name: 'Stany — Brak danych',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="noData"
    />
  ),
};

export const OdmowaAi: Story = {
  name: 'Stany — Odmowa Asystenta',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="aiRefusal"
    />
  ),
};

export const BladAnalizy: Story = {
  name: 'Stany — Błąd analizy',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="failed"
    />
  ),
};

export const BrakDostepu: Story = {
  name: 'Stany — Brak dostępu',
  render: () => (
    <WorkbenchFrame
      initialInspectorTab="quality"
      initialRunState="permissionDenied"
    />
  ),
};

export const TrybSkupienia: Story = {
  name: 'Interakcje — Tryb skupienia',
  render: () => (
    <WorkbenchFrame
      initialCanvasTab="comparison"
      initialFocusMode
      initialMode="decision"
    />
  ),
};

export const DokumentacjaArchitektura: Story = {
  name: 'Sekcje — Informacje o działaniu',
  render: () => (
    <ComponentFrame>
      <PapaLabOverview />
    </ComponentFrame>
  ),
};

export const AssistantShell: Story = {
  name: 'Sekcje — Powłoka Asystenta',
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
  name: 'Sekcje — Koszyk kontekstu',
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
  name: 'Sekcje — Kolejka decyzji',
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
  name: 'Sekcje — Dowody i odmowy',
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
  name: 'Sekcje — Kreator wykresów',
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
  name: 'Sekcje — Symulator wariantów',
  render: () => (
    <ComponentFrame>
      <CausalScenarioSimulator />
    </ComponentFrame>
  ),
};

export const ReportsAndAiAct: Story = {
  name: 'Sekcje — Biblioteka i zgodność',
  render: () => (
    <ComponentFrame>
      <PapaLabReports />
    </ComponentFrame>
  ),
};
