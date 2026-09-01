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
  HelpAnalyticsCharts,
  HelpCenterScreen,
  HelpCenterTabNav,
  HelpContextAndEscalation,
  HelpContextSignal,
  HelpDomainRoadmap,
  HelpHeroSearch,
  HelpKnowledgeBase,
  HelpTruthEngine,
  HelpTruthMatrix,
} from '../../../screens/help-center/HelpCenterScreen';
import {
  defaultHelpRuntimeState,
} from '../../../fixtures/help-center/helpCenterDemoSeed';
import type {
  HelpCategoryId,
  HelpCenterTabId,
  HelpRole,
  HelpRuntimeState,
} from '../../../fixtures/help-center/helpCenterDemoSeed';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/WSPARCIE/Centrum Pomocy',
  component: HelpCenterScreen,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HelpCenterScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-hc">
      <div className="pd-hc__content">
        {children}
      </div>
    </main>
  );
}

function SearchHarness() {
  const [query, setQuery] = useState('');

  return (
    <StoryFrame>
      <HelpHeroSearch
        onClearSearch={() => setQuery('')}
        onOpenProcedure={(articleId) => setQuery(articleId)}
        onSearchChange={setQuery}
        searchQuery={query}
      />
    </StoryFrame>
  );
}

function KnowledgeHarness() {
  const [category, setCategory] = useState<HelpCategoryId>('ALL');
  const [roleFilter, setRoleFilter] = useState<HelpRole | 'ALL'>('ADMIN');
  const [answer, setAnswer] = useState<string | null>(null);

  return (
    <StoryFrame>
      <HelpKnowledgeBase
        onAskCopilot={setAnswer}
        onCategoryChange={setCategory}
        onRoleFilterChange={setRoleFilter}
        roleFilter={roleFilter}
        selectedCategory={category}
      />
      {answer ? <output aria-label="Odpowiedź Copilota">{answer}</output> : null}
    </StoryFrame>
  );
}

function TruthHarness() {
  const [runtimeState, setRuntimeState] = useState<HelpRuntimeState>(defaultHelpRuntimeState);

  return (
    <StoryFrame>
      <HelpTruthEngine
        onRuntimeStateChange={setRuntimeState}
        runtimeState={runtimeState}
      />
    </StoryFrame>
  );
}

function NavHarness() {
  const [activeTab, setActiveTab] = useState<HelpCenterTabId>('kb');

  return (
    <StoryFrame>
      <HelpCenterTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <HelpContextSignal />
    </StoryFrame>
  );
}

export const FullPage: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/help/strona-glowna-pomocy">
      <HelpCenterScreen />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { level: 1, name: 'W czym możemy Ci pomóc?' })).toBeInTheDocument();
    await expect(await canvas.findByRole('navigation', { name: 'Zakładki Centrum Pomocy' })).toBeInTheDocument();
    await expect(await canvas.findByText('Napraw brak danych i reautoryzuj Meta Ads')).toBeInTheDocument();

    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Opisz problem' }), 'PD-INT-401');
    const resultTitle = await canvas.findByText('Napraw brak danych i reautoryzuj Meta Ads');
    await userEvent.click(resultTitle.closest('button') as HTMLElement);
    await expect(await canvas.findByRole('dialog', { name: 'Napraw brak danych i reautoryzuj Meta Ads' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij procedurę' }));

    await userEvent.click(await canvas.findByRole('button', { name: /Product Truth Engine/u }));
    await expect(await canvas.findByRole('heading', { name: 'Product Truth Engine - Symulator Stanu Produktu' })).toBeInTheDocument();
  },
};

export const HeaderAndSearch: Story = {
  name: 'Sekcje — Wyszukiwarka i kontekst',
  render: () => (
    <StoryFrame>
      <HelpHeroSearch />
      <HelpContextSignal />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'W czym możemy Ci pomóc?' })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'Uruchom procedurę naprawczą' })).toBeInTheDocument();
  },
};

export const SearchSuggestions: Story = {
  name: 'Interakcje — Sugestie wyszukiwania',
  render: () => <SearchHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Opisz problem' }), 'reautoryzacja');
    await expect(await canvas.findByRole('listbox', { name: 'Wyniki wyszukiwania Centrum Pomocy' })).toBeInTheDocument();
    await expect(await canvas.findByText('PD-INT-401')).toBeInTheDocument();
  },
};

export const KnowledgeBaseAndCopilot: Story = {
  name: 'Sekcje — Baza wiedzy i Asystent',
  render: () => <KnowledgeHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Konto, plan i płatności' }));
    await expect(await canvas.findByText('Ustaw limity i alerty zużycia Papa Asystenta AI')).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('textbox', { name: 'Pytanie do Papa Help Copilota' }), 'Co się stanie po rozłączeniu GA4?');
    await userEvent.click(await canvas.findByRole('button', { name: 'Zapytaj AI' }));
    await expect(await canvas.findByLabelText('Odpowiedź Copilota')).toHaveTextContent(/Po ponownym rozłączeniu konta historia danych/u);
  },
};

export const TruthEngineRuntime: Story = {
  name: 'Sekcje — Wiarygodność odpowiedzi',
  render: () => <TruthHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('disabled')).toBeInTheDocument();
    await expect(await canvas.findByText('Dostawca niedostępny w tej wersji')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Wyłączony (Disabled)' }));
    await expect(await canvas.findByText('production_ready')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Oczekuje (Pending)' }));
    await expect(await canvas.findByText('available')).toBeInTheDocument();
    await userEvent.selectOptions(await canvas.findByLabelText('Aktywna Rola:'), 'VIEWER');
    await expect(await canvas.findByText('Prawdziwy (RBAC)')).toBeInTheDocument();
  },
};

export const ContextPackAndEscalation: Story = {
  name: 'Sekcje — Kontekst i prywatność',
  render: () => (
    <StoryFrame>
      <HelpContextAndEscalation />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('GET /help/context')).toBeInTheDocument();
    await expect(await canvas.findByText(/PD-INT-401/u)).toBeInTheDocument();
    await expect(await canvas.findByText('Klucze API, tokeny dostępu, hasła')).toBeInTheDocument();
  },
};

export const DomainRoadmapAndCharts: Story = {
  name: 'Sekcje — Obszary pomocy i statystyki',
  render: () => (
    <StoryFrame>
      <HelpDomainRoadmap />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Route: /help-center')).toBeInTheDocument();
    await expect(await canvas.findByRole('img', { name: 'Skuteczność self-service Centrum Pomocy' })).toBeInTheDocument();
    await expect(await canvas.findByRole('img', { name: 'Najczęstsze luki wiedzy Centrum Pomocy' })).toBeInTheDocument();
    await expect(await canvas.findByText('FAZA P0 (Krytyczne / Natychmiastowe)')).toBeInTheDocument();
  },
};

export const ProcedureEscalationAndIncidents: Story = {
  name: 'Interakcje — Procedura i eskalacja',
  render: () => (
    <StorybookProductShellFrame activePath="/app/help/strona-glowna-pomocy">
      <HelpCenterScreen />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Uruchom procedurę naprawczą' }));
    await expect(await canvas.findByRole('dialog', { name: 'Napraw brak danych i reautoryzuj Meta Ads' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Następny krok →' }));
    await expect(await canvas.findByText('Czy widzisz komunikat "Token autoryzacyjny wygasł"?')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Nadal nie działa? Zgłoś' }));
    await expect(await canvas.findByRole('dialog', { name: 'Zgłoszenie do Wsparcia Technicznego' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij zgłoszenie' }));
  },
};

export const NavigationStrip: Story = {
  name: 'Sekcje — Nawigacja kontekstowa',
  render: () => <NavHarness />,
};

export const TruthMatrixStandalone: Story = {
  name: 'Sekcje — Źródła informacji',
  render: () => (
    <StoryFrame>
      <HelpTruthMatrix />
    </StoryFrame>
  ),
};

export const AnalyticsChartsStandalone: Story = {
  name: 'Sekcje — Statystyki pomocy',
  render: () => (
    <StoryFrame>
      <HelpAnalyticsCharts />
    </StoryFrame>
  ),
};
