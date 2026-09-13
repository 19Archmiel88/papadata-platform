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
  Tooltip,
} from './Tooltip';
import {
  IconButton,
} from '../Button';

import {
  copy,
} from '../../../storybook-next/presentation/storyLocalization';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'padded',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Tooltip to krótka, tekstowa podpowiedź na hover/focus — dla ikon bez widocznej etykiety albo skróconego tekstu (interactive pozwala najechać na samą podpowiedź). To osobny wzorzec od ChartTooltip, który pokazuje dane punktu na wykresie, nie opis UI.',
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TooltipStory: Story = {
  name: 'Tooltip',
  render: () => (
    <div data-testid="tooltip-demo" style={{ paddingTop: 'var(--pd-space-20)' }}>
      <Tooltip
        content={copy({ pl: 'Synchronizuj teraz', en: 'Sync now' })}
        delayMs={200}
        interactive={false}
        placement="top"
        trigger={<IconButton data-testid="tooltip-trigger" icon="trend" label={copy({ pl: 'Synchronizuj teraz', en: 'Sync now' })} variant="ghost" />}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('tooltip-trigger');
    await userEvent.hover(trigger);

    const tooltip = await canvas.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent(copy({ pl: 'Synchronizuj teraz', en: 'Sync now' }));
  },
};
