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
  AlertDialog,
} from './AlertDialog';
import {
  Button,
} from '../Button';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'AlertDialog (role="alertdialog", warstwa modal, z-index 30) potwierdza jedno, nieodwracalne lub ryzykowne działanie — bez dowolnej treści w środku. Gdy potrzebujesz treści złożonej (formularz, lista), użyj Dialog zamiast AlertDialog.',
      },
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function DestructiveDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button data-testid="alert-trigger" variant="danger" onClick={() => setOpen(true)}>
        <Localized pl="Odłącz integrację" en="Disconnect integration" />
      </Button>
      <AlertDialog
        cancelLabel={copy({ pl: 'Anuluj', en: 'Cancel' })}
        closeOnEscape
        confirmLabel={copy({ pl: 'Odłącz', en: 'Disconnect' })}
        destructive
        message={copy({ pl: 'Dane historyczne pozostaną dostępne, ale nowe synchronizacje zostaną zatrzymane.', en: 'Historical data stays available, but new syncs will stop.' })}
        open={open}
        title={copy({ pl: 'Odłączyć WooCommerce?', en: 'Disconnect WooCommerce?' })}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        onOpenChange={setOpen}
      />
    </>
  );
}

export const AlertDialogStory: Story = {
  name: 'AlertDialog',
  render: () => (
    <div data-testid="alert-dialog-demo">
      <DestructiveDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    const trigger = canvas.getByTestId('alert-trigger');
    await userEvent.click(trigger);

    const dialog = await body.findByRole('alertdialog');
    await expect(dialog).toHaveAttribute('data-tone', 'danger');
    await expect(body.getByRole('button', { name: 'Odłącz' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(body.queryByRole('alertdialog')).not.toBeInTheDocument();

    // Story ma pozostać w reprezentatywnym, otwartym stanie po zakończeniu
    // testu Escape/close powyżej, więc otwieramy ponownie.
    await userEvent.click(trigger);
    await expect(await body.findByRole('alertdialog')).toBeInTheDocument();
  },
};
