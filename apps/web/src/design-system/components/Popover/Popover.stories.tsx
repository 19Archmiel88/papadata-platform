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
  Popover,
} from './Popover';
import {
  Button,
} from '../Button';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Popover (umiejscowienie: top / right / bottom / left, warstwa popover, z-index 20) to krótka treść zakotwiczona przy wyzwalającym elemencie — status, szybki podgląd, mikro-akcja. Dla listy akcji do wyboru użyj Menu; dla tylko-tekstowej podpowiedzi na hover użyj Tooltip.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

function PopoverDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      actionLabel={copy({ pl: 'Otwórz konfigurację', en: 'Open configuration' })}
      anchorId="popover-demo-trigger"
      description={copy({ pl: 'Dane historyczne pozostają dostępne.', en: 'Historical data stays available.' })}
      modal={false}
      open={open}
      placement="bottom"
      title={copy({ pl: 'Wymaga ponownej autoryzacji', en: 'Needs reauthorization' })}
      trigger={(
        <Button data-testid="popover-trigger" variant="secondary" onClick={() => setOpen((value) => !value)}>
          <Localized pl="Google Ads" en="Google Ads" />
        </Button>
      )}
      onOpenChange={setOpen}
    />
  );
}

export const PopoverStory: Story = {
  name: 'Popover',
  render: () => (
    <div data-testid="popover-demo">
      <PopoverDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByTestId('popover-trigger'));

    await expect(await page.findByText(copy({ pl: 'Wymaga ponownej autoryzacji', en: 'Needs reauthorization' }))).toBeInTheDocument();
  },
};
