import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  createSettingsStorybookData,
  settingsScreenDefinitions,
} from '../../../screens/settings';
import {
  settingsScreenStorybookMeta,
} from '../../data/settingsScreenStorybookMeta';
import {
  SettingsAdminWorkspace,
} from '../../production/OperationalDomainWorkspaces';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';

const meta = {
  title: '60 Ustawienia, zespół i bezpieczeństwo/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId =
  | '60.01'
  | '60.02'
  | '60.03'
  | '60.04'
  | '60.05'
  | '60.06'
  | '60.07'
  | '60.08'
  | '60.09'
  | '60.10';

const definitions = settingsScreenDefinitions;
const variantHeading = {
  'account-security': 'Bezpieczeństwo kont i brakujące MFA',
  audit: 'Ślad audytu i ryzyko zdarzeń',
  memberships: 'Członkowie, zaproszenia i MFA',
  organization: 'Organizacja i odpowiedzialność administracyjna',
  privacy: 'Prywatność, retencja i ograniczenia eksportu',
  roles: 'Role i dostęp wrażliwy',
  sessions: 'Sesje i urządzenia',
  'settings-variants': 'Stany produkcyjne ustawień',
  'support-access': 'Dostęp wsparcia i okno czasowe',
  workspace: 'Polityka przestrzeni pracy i retencji',
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
        documentPath: settingsScreenStorybookMeta[id].documentPath,
        owner: 'Ustawienia i bezpieczeństwo',
        sectionId: '60',
        sectionLabel: 'Ustawienia, zespół i bezpieczeństwo',
      }}
    >
      <SettingsAdminWorkspace
        data={createSettingsStorybookData()}
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
      await expect(screen.getByRole('navigation', { name: 'Widoki ustawień' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Co trzeba sprawdzić w ustawieniach teraz' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: 'Kolejka decyzji administracyjnych' })).toBeInTheDocument();
      await expect(screen.getByRole('heading', { name: variantHeading[definition.variant] })).toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);

      if (definition.variant === 'roles' || definition.variant === 'workspace') {
        await expect(screen.getByRole('table', { name: /Role i uprawnienia/u })).toBeInTheDocument();
      } else if (definition.variant === 'sessions') {
        await expect(screen.getByRole('table', { name: /Sesje użytkownika/u })).toBeInTheDocument();
      } else if (definition.variant === 'audit' || definition.variant === 'privacy') {
        await expect(screen.getByRole('table', { name: /Zdarzenia audytu/u })).toBeInTheDocument();
      } else if (definition.variant === 'support-access') {
        await expect(screen.getByRole('table', { name: /Dostęp wsparcia/u })).toBeInTheDocument();
      } else if (definition.variant === 'memberships' || definition.variant === 'account-security') {
        await expect(screen.getByRole('table', { name: /Członkostwa przestrzeni pracy/u })).toBeInTheDocument();
      }
    },
  };
}

export const Screen60_01Story = {
  ...createStory('60.01'),
  name: '60.01 Organizacja',
} satisfies Story;

export const Screen60_02Story = {
  ...createStory('60.02'),
  name: '60.02 Przestrzeń pracy',
} satisfies Story;

export const Screen60_03Story = {
  ...createStory('60.03'),
  name: '60.03 Członkostwa',
} satisfies Story;

export const Screen60_04Story = {
  ...createStory('60.04'),
  name: '60.04 Role i uprawnienia',
} satisfies Story;

export const Screen60_05Story = {
  ...createStory('60.05'),
  name: '60.05 Bezpieczeństwo konta',
} satisfies Story;

export const Screen60_06Story = {
  ...createStory('60.06'),
  name: '60.06 Sesje',
} satisfies Story;

export const Screen60_07Story = {
  ...createStory('60.07'),
  name: '60.07 Audyt',
} satisfies Story;

export const Screen60_08Story = {
  ...createStory('60.08'),
  name: '60.08 Prywatność',
} satisfies Story;

export const Screen60_09Story = {
  ...createStory('60.09'),
  name: '60.09 Dostęp wsparcia',
} satisfies Story;

export const Screen60_10Story = {
  ...createStory('60.10'),
  name: '60.10 Warianty ustawień',
} satisfies Story;
