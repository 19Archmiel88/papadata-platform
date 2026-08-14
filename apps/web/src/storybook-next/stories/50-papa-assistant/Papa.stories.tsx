import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  createPapaStorybookData,
  papaScreenDefinitions,
} from '../../../screens/papa';
import {
  PapaDecisionWorkspace,
} from '../../production/OperationalDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '50 Papa Asystent i Laboratorium AI/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '50.01'
  | '50.02'
  | '50.03'
  | '50.04'
  | '50.05'
  | '50.06'
  | '50.07'
  | '50.08'
  | '50.09'
  | '50.10'
  | '50.11'
  | '50.12'
  | '50.13'
  | '50.14'
  | '50.15'
  | '50.16'
  | '50.17';

const definitions = papaScreenDefinitions;
const variantHeading = {
  actions: 'Działania AI według ryzyka',
  'action-approval': 'Akceptacja działania AI',
  answer: 'Odpowiedź Papa z dowodami i limitem pewności',
  'assistant-shell': 'Powłoka asystenta z bezpiecznym kompozytorem',
  'blocked-actions': 'Zablokowane działania AI',
  confidence: 'Poziom pewności odpowiedzi',
  'context-basket': 'Koszyk kontekstu',
  'context-panel': 'Koszyk kontekstu i ograniczenia odpowiedzi',
  evidence: 'Dowody wykorzystane w odpowiedzi',
  governance: 'Nadzór AI i reguły użycia',
  'history-memory': 'Historia i pamięć kontekstu',
  lab: 'Laboratorium AI bez wykonywania akcji',
  observations: 'Obserwacje powiązane z decyzjami',
  proposals: 'Propozycje AI do decyzji człowieka',
  'recommendation-variants': 'Rekomendacje i warianty odpowiedzi',
  variants: 'Stany produkcyjne Papa',
  'work-modes': 'Tryby pracy Papa i granice użycia',
} satisfies Record<(typeof definitions)[number]['variant'], string>;

function getDefinition(id: ScreenId) {
  const definition = definitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Missing definition for ${id}`);
  return definition;
}

function ModuleStoryPage({ id }: { readonly id: ScreenId }) {
  const definition = getDefinition(id);

  return (
    <ProductionStoryShell
      contract={{
        ...definition,
        owner: 'Papa Asystent',
        sectionId: '50',
        sectionLabel: 'Papa Asystent i Laboratorium AI',
      }}
    >
      <PapaDecisionWorkspace
        data={createPapaStorybookData()}
        definition={definition}
      />
    </ProductionStoryShell>
  );
}

function createStory(id: ScreenId): Story {
  const definition = getDefinition(id);

  return {
    render: () => <ModuleStoryPage id={id} />,
    play: async ({ canvasElement }) => {
      const element = canvasElement.querySelector(`[data-screen-id="${id}"]`);
      if (!(element instanceof HTMLElement)) throw new Error(`Screen ${id} is not rendered.`);
      const screen = within(element);
      await expect(screen.getByRole('heading', { level: 1, name: definition.displayTitle })).toBeInTheDocument();
      await expect(screen.getByRole('navigation', { name: 'Widoki Papa' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co Papa może bezpiecznie zasugerować teraz' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka decyzji Papa' })).toBeInTheDocument();
      await expect(screen.getAllByRole('heading', { level: 2, name: variantHeading[definition.variant] })[0]).toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);

      if (definition.variant === 'evidence') {
        await expect(screen.getByRole('table', { name: /Dowody odpowiedzi Papa/u })).toBeInTheDocument();
      } else if (definition.variant === 'proposals' || definition.variant === 'actions') {
        await expect(screen.getByRole('table', { name: /Działania AI Papa/u })).toBeInTheDocument();
      } else if (definition.variant === 'history-memory') {
        await expect(screen.getByRole('table', { name: /Historia i pamięć Papa/u })).toBeInTheDocument();
      } else if (definition.variant === 'context-basket') {
        await expect(screen.getByRole('table', { name: /Kontekst Papa/u })).toBeInTheDocument();
      }
    },
  };
}

export const Screen50_01Story = {
  ...createStory('50.01'),
  name: '50.01 Panel kontekstowy Papa',
} satisfies Story;

export const Screen50_02Story = {
  ...createStory('50.02'),
  name: '50.02 Powłoka asystenta',
} satisfies Story;

export const Screen50_03Story = {
  ...createStory('50.03'),
  name: '50.03 Tryby pracy',
} satisfies Story;

export const Screen50_04Story = {
  ...createStory('50.04'),
  name: '50.04 Koszyk kontekstu',
} satisfies Story;

export const Screen50_05Story = {
  ...createStory('50.05'),
  name: '50.05 Odpowiedź Papa',
} satisfies Story;

export const Screen50_06Story = {
  ...createStory('50.06'),
  name: '50.06 Dowody',
} satisfies Story;

export const Screen50_07Story = {
  ...createStory('50.07'),
  name: '50.07 Poziom pewności',
} satisfies Story;

export const Screen50_08Story = {
  ...createStory('50.08'),
  name: '50.08 Laboratorium AI',
} satisfies Story;

export const Screen50_09Story = {
  ...createStory('50.09'),
  name: '50.09 Obserwacje',
} satisfies Story;

export const Screen50_10Story = {
  ...createStory('50.10'),
  name: '50.10 Rekomendacje i warianty',
} satisfies Story;

export const Screen50_11Story = {
  ...createStory('50.11'),
  name: '50.11 Propozycje AI',
} satisfies Story;

export const Screen50_12Story = {
  ...createStory('50.12'),
  name: '50.12 Zatwierdzanie działań AI',
} satisfies Story;

export const Screen50_13Story = {
  ...createStory('50.13'),
  name: '50.13 Działania AI',
} satisfies Story;

export const Screen50_14Story = {
  ...createStory('50.14'),
  name: '50.14 Zablokowane działania AI',
} satisfies Story;

export const Screen50_15Story = {
  ...createStory('50.15'),
  name: '50.15 Historia i pamięć Papa',
} satisfies Story;

export const Screen50_16Story = {
  ...createStory('50.16'),
  name: '50.16 Ustawienia AI i nadzór',
} satisfies Story;

export const Screen50_17Story = {
  ...createStory('50.17'),
  name: '50.17 Warianty Papa',
} satisfies Story;
