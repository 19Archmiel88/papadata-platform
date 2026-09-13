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
  Dialog,
} from './Dialog';
import {
  Button,
} from '../Button';
import {
  TextField,
} from '../Field';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Dialog (role="dialog", warstwa modal, z-index 30) to okno modalne z dowolną treścią — formularz, lista, podsumowanie. Dla prostego tak/nie potwierdzenia bez treści formularza użyj AlertDialog — jest lżejszy i ma gotowy kontrakt destructive.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function FormDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button data-testid="dialog-trigger" variant="primary" onClick={() => setOpen(true)}>
        <Localized pl="Zaproś członka" en="Invite member" />
      </Button>
      <Dialog
        closeOnBackdrop
        closeOnEscape
        description={copy({ pl: 'Zaproszenie zostanie wysłane e-mailem z linkiem ważnym 7 dni.', en: 'The invitation is sent by email with a link valid for 7 days.' })}
        dismissible
        modal
        open={open}
        primaryActionLabel={copy({ pl: 'Wyślij zaproszenie', en: 'Send invitation' })}
        secondaryActionLabel={copy({ pl: 'Anuluj', en: 'Cancel' })}
        title={copy({ pl: 'Zaproś do workspace', en: 'Invite to workspace' })}
        onOpenChange={setOpen}
      >
        <TextField
          inputType="email"
          label={copy({ pl: 'Adres e-mail', en: 'Email address' })}
          required
          value=""
          onChange={() => {}}
        />
      </Dialog>
    </>
  );
}

export const DialogStory: Story = {
  name: 'Dialog',
  render: () => (
    <div data-testid="dialog-demo">
      <FormDialogDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTestId('dialog-trigger'));

    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(body.getByRole('button', { name: 'Wyślij zaproszenie' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    // Story ma pozostać w reprezentatywnym, otwartym stanie po zakończeniu
    // testu Escape/close powyżej, więc otwieramy ponownie.
    await userEvent.click(canvas.getByTestId('dialog-trigger'));
    await expect(await body.findByRole('dialog')).toBeInTheDocument();
  },
};
