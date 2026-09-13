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
  Drawer,
} from './Drawer';
import {
  Button,
} from '../Button';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Drawer',
  component: Drawer,
  parameters: {
    layout: 'padded',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Drawer (strony: left / right, warstwa modal, z-index 30) to przejściowy panel boczny na szczegóły rekordu, konfigurację albo dłuższy formularz — nie jest to synonim „dowolnego prawego regionu”. Zbudowany na kanonicznym OverlayRoot, tak jak Dialog.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

function DrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button data-testid="drawer-trigger" variant="secondary" onClick={() => setOpen(true)}>
        <Localized pl="Zobacz szczegóły zamówienia" en="View order details" />
      </Button>
      <Drawer
        description={copy({ pl: 'Zamówienie #1042', en: 'Order #1042' })}
        dismissible
        open={open}
        primaryActionLabel={copy({ pl: 'Zapisz', en: 'Save' })}
        secondaryActionLabel={copy({ pl: 'Zamknij', en: 'Close' })}
        side="right"
        title={copy({ pl: 'Szczegóły zamówienia', en: 'Order details' })}
        width={420}
        onOpenChange={setOpen}
      >
        <p><Localized pl="Dowolna treść panelu — historia statusu, pozycje zamówienia, notatki." en="Arbitrary panel content — status history, order lines, notes." /></p>
      </Drawer>
    </>
  );
}

export const DrawerStory: Story = {
  name: 'Drawer',
  render: () => (
    <div data-testid="drawer-demo">
      <DrawerDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTestId('drawer-trigger'));

    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    // Story ma pozostać w reprezentatywnym, otwartym stanie po zakończeniu
    // testu Escape/close powyżej, więc otwieramy ponownie.
    await userEvent.click(canvas.getByTestId('drawer-trigger'));
    await expect(await body.findByRole('dialog')).toBeInTheDocument();
  },
};
