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
  HelpCenterBiPage,
  HelpCenterTabNav,
  HelpContextAndEscalation,
  HelpContextSignal,
  HelpDomainRoadmap,
  HelpHeroSearch,
  HelpKnowledgeBase,
  HelpTruthEngine,
  HelpTruthMatrix,
} from './HelpCenterBiPage';
import {
  defaultHelpRuntimeState,
} from './HelpCenterBiPage.data';
import type {
  HelpCategoryId,
  HelpCenterTabId,
  HelpRole,
  HelpRuntimeState,
} from './HelpCenterBiPage.data';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '37 Centrum pomocy/Strona z dostarczonego HTML',
  component: HelpCenterBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HelpCenterBiPage>;

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
  name: 'Pełna kompozycja strony',
  render: () => (
    <StorybookProductShellFrame activePath="/app/help/strona-glowna-pomocy">
      <HelpCenterBiPage />
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
  name: '1. Wyszukiwarka i sygnał kontekstu',
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
  name: '2. Instant search i routing kodu błędu',
  render: () => <SearchHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Opisz problem' }), 'reautoryzacja');
    await expect(await canvas.findByRole('listbox', { name: 'Wyniki wyszukiwania Centrum Pomocy' })).toBeInTheDocument();
    await expect(await canvas.findByText('PD-INT-401')).toBeInTheDocument();
  },
};

export const KnowledgeBaseAndCopilot: Story = {
  name: '3. Baza wiedzy, filtry i Copilot',
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
  name: '4. Product Truth Engine Runtime',
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
  name: '5. Context Pack i prywatność',
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
  name: '6. Podział domenowy, roadmapa i wykresy',
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
  name: '7. Procedura i eskalacja',
  render: () => (
    <StorybookProductShellFrame activePath="/app/help/strona-glowna-pomocy">
      <HelpCenterBiPage />
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
  name: '8. Nawigacja i kontekst widoku',
  render: () => <NavHarness />,
};

export const TruthMatrixStandalone: Story = {
  name: '9. Tabela prawdy semantycznej',
  render: () => (
    <StoryFrame>
      <HelpTruthMatrix />
    </StoryFrame>
  ),
};

export const AnalyticsChartsStandalone: Story = {
  name: '10. Samodzielne wykresy pomocy',
  render: () => (
    <StoryFrame>
      <HelpAnalyticsCharts />
    </StoryFrame>
  ),
};
