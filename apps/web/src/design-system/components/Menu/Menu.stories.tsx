import {
  useState,
} from 'react';
import type {
  ReactNode,
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
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

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
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-menu-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

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
    <StoryPresentationPage
      className="pd-menu-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Menu', en: 'Menu parameters' })}
          items={[
            { label: <Localized pl="Semantyka" en="Semantics" />, value: copy({ pl: 'wybór akcji, nie wartości', en: 'choose an action, not a value' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="menu"
      summary={
        <Localized
          pl="Lista akcji do wykonania (••• w tabeli, przycisk Więcej). Dla wyboru wartości z listy użyj Select — Menu i Select mają rozłączną semantykę mimo podobnego wyglądu."
          en="A list of actions to perform (the ••• in a table, a More button). For choosing a value from a list, use Select — Menu and Select have distinct semantics despite looking similar."
        />
      }
      title={<Localized pl="Wybór akcji, nie wartości." en="Choosing an action, not a value." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="menu-demo">
          <MenuDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('menu-trigger'));

    const menuItems = await canvas.findAllByRole('menuitem');
    await expect(menuItems).toHaveLength(items.length);

    await userEvent.keyboard('{Escape}');
  },
};
