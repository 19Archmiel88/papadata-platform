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
  fireEvent,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import {
  HelpAnalyticsCharts,
  HelpCenterScreen,
  HelpContextAndEscalation,
  HelpContextSignal,
  HelpDomainRoadmap,
  HelpHeroSearch,
  HelpKnowledgeBase,
  HelpTruthEngine,
  HelpTruthMatrix,
} from '../../../screens/help-center/HelpCenterScreen';
import {
  helpSections,
  helpSectionsById,
} from '../../../screens/help-center/HelpCenterScreen.data';
import {
  defaultHelpRuntimeState,
} from '../../../fixtures/help-center/helpCenterDemoSeed';
import type {
  HelpCategoryId,
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

    await expect(canvasElement.querySelectorAll('.pd-section-frame')).toHaveLength(helpSections.length);
    await expect(Array.from(canvasElement.querySelectorAll('.pd-section-frame')).map((section) => section.id)).toEqual(
      helpSections.map((section) => section.id),
    );

    for (const section of helpSections) {
      await expect(await canvas.findByRole('heading', { name: section.title })).toBeInTheDocument();
      await expect(canvasElement.ownerDocument.querySelector(`a[href="#${section.id}"]`)).toHaveTextContent(section.navLabel);
    }

    // 'Napraw brak danych...' also appears as a row in the Truth Engine's
    // matrix table (all 4 sections are always mounted now, unlike the old
    // tab-switch where only 'kb' was in the DOM by default) -- scope to the
    // 'kb' section to avoid findByText's "multiple elements" ambiguity.
    const kbSection = within(canvasElement.ownerDocument.getElementById('kb') as HTMLElement);
    await expect(await kbSection.findByText('Napraw brak danych i reautoryzuj Meta Ads')).toBeInTheDocument();

    await userEvent.type(await canvas.findByRole('searchbox', { name: 'Opisz problem' }), 'PD-INT-401');
    const results = within(await canvas.findByRole('listbox', { name: 'Wyniki wyszukiwania Centrum Pomocy' }));
    // 'Napraw brak danych...' also appears as the always-visible static hero
    // tip button, outside the results listbox -- scope to the listbox to
    // avoid findByText's "multiple elements" ambiguity (same pattern as the
    // SearchSuggestions story below).
    const resultTitle = await results.findByText('Napraw brak danych i reautoryzuj Meta Ads');
    await userEvent.click(resultTitle.closest('button') as HTMLElement);
    await expect(await canvas.findByRole('dialog', { name: 'Napraw brak danych i reautoryzuj Meta Ads' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij procedurę' }));

    // All 4 sections are always mounted now (no more tab-switch), so the
    // Truth Engine heading is already in the DOM without clicking anything.
    await expect(await canvas.findByRole('heading', { name: 'Product Truth Engine - Symulator Stanu Produktu' })).toBeInTheDocument();

    // Story musi kończyć interakcję w stanie startowym -- w przeciwnym razie
    // ktoś oglądający "Widok pełny" ręcznie w Storybooku widzi stronę
    // przewiniętą po automatycznym uruchomieniu play().
    const topNavItem = canvasElement.ownerDocument.querySelector<HTMLAnchorElement>(`a[href="#${helpSectionsById.kb.id}"]`);
    await expect(topNavItem).toBeInTheDocument();
    fireEvent.click(topNavItem!);
    await waitFor(() => expect(topNavItem).toHaveAttribute('aria-current', 'page'));
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
    const results = within(await canvas.findByRole('listbox', { name: 'Wyniki wyszukiwania Centrum Pomocy' }));
    // 'PD-INT-401' also appears as the always-visible static hero tip
    // button, outside the results listbox -- scoping to the listbox avoids
    // findByText's "multiple elements" ambiguity between the two.
    await expect(await results.findByText('PD-INT-401')).toBeInTheDocument();
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
