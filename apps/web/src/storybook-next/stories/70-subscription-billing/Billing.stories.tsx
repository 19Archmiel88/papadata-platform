import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  BillingWorkspace,
  billingScreenDefinitions,
  createBillingStorybookData,
} from '../../../screens/billing';
import type {
  BillingScreenDefinition,
} from '../../../screens/billing';

const meta = {
  title: '70 Subskrypcja i płatności/Ekrany produkcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ScreenId = BillingScreenDefinition['id'];

function getDefinition(id: ScreenId) {
  const definition = billingScreenDefinitions.find((item) => item.id === id);
  if (!definition) throw new Error(`Missing definition for ${id}`);
  return definition;
}

function ModuleStoryPage({ id }: { readonly id: ScreenId }) {
  const definition = getDefinition(id);

  return (
    <BillingWorkspace
      data={createBillingStorybookData()}
      definition={definition}
      mode="storybook"
    />
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
      await expect(screen.getByRole('heading', { level: 1, name: 'Subskrypcja i płatności' })).toBeInTheDocument();
      await expect(screen.getByRole('navigation', { name: 'Zakładki billingowe' })).toBeInTheDocument();
      await expect(screen.getByText('ID-10 / administration')).toBeInTheDocument();
      await expect(screen.getByText('Papa Asystent Billing')).toBeInTheDocument();
      await expect(element).toHaveAttribute('data-screen-variant', definition.variant);
    },
  };
}

export const Screen70_01Story = { ...createStory('70.01'), name: '70.01 Subskrypcja' } satisfies Story;
export const Screen70_02Story = { ...createStory('70.02'), name: '70.02 Użycie i limity' } satisfies Story;
export const Screen70_03Story = { ...createStory('70.03'), name: '70.03 Plany' } satisfies Story;
export const Screen70_04Story = { ...createStory('70.04'), name: '70.04 Faktury' } satisfies Story;
export const Screen70_05Story = { ...createStory('70.05'), name: '70.05 Płatności' } satisfies Story;
export const Screen70_06Story = { ...createStory('70.06'), name: '70.06 Zaległa płatność' } satisfies Story;
export const Screen70_07Story = { ...createStory('70.07'), name: '70.07 Korekty' } satisfies Story;
export const Screen70_08Story = { ...createStory('70.08'), name: '70.08 Zmiana i anulowanie' } satisfies Story;
export const Screen70_09Story = { ...createStory('70.09'), name: '70.09 Pilot do abonamentu' } satisfies Story;
export const Screen70_10Story = { ...createStory('70.10'), name: '70.10 Warianty billingowe' } satisfies Story;
