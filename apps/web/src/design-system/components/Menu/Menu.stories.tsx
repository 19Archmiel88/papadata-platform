import {
  useState,
} from 'react';
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
  Menu,
} from './Menu';
import {
  IconButton,
} from '../Button';

import {
  copy,
} from '../../../storybook-next/presentation/storyLocalization';

const items = [
  { icon: 'trend' as const, id: 'sync', label: 'Synchronizuj teraz' },
  { icon: 'integration' as const, id: 'config', label: 'Konfiguracja' },
  { id: 'reconnect', label: 'Połącz ponownie' },
  { destructive: true, id: 'disconnect', label: 'Odłącz' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Menu to lista akcji do wykonania (••• w tabeli, przycisk „Więcej”), nie wybór wartości. Dla wyboru wartości z listy użyj Select — Menu i Select mają rozłączną semantykę mimo podobnego wyglądu.',
      },
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

function MenuDemo() {
  const [open, setOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  return (
    <Menu
      activeItemId={activeItemId}
      items={items}
      open={open}
      placement="bottom-end"
      trigger={(
        <IconButton
          data-testid="menu-trigger"
          icon="menu"
          label={copy({ pl: 'Więcej akcji', en: 'More actions' })}
          variant="ghost"
          onClick={() => setOpen((value) => !value)}
        />
      )}
      onAction={() => setOpen(false)}
      onActiveItemIdChange={setActiveItemId}
      onOpenChange={setOpen}
    />
  );
}

export const MenuStory: Story = {
  name: 'Menu',
  render: () => (
    <div data-testid="menu-demo">
      <MenuDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('menu-trigger'));

    const menuItems = await canvas.findAllByRole('menuitem');
    await expect(menuItems).toHaveLength(items.length);

    await userEvent.keyboard('{Escape}');
  },
};
