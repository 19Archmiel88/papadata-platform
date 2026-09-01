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
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Dialog',
  component: Dialog,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Dialog>;

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
      className="pd-dialog-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

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
    <StoryPresentationPage
      className="pd-dialog-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Dialog', en: 'Dialog parameters' })}
          items={[
            { label: <Localized pl="Rola ARIA" en="ARIA role" />, value: 'dialog' },
            { label: <Localized pl="Warstwa" en="Layer" />, value: 'modal (z-index 30)' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="dialog"
      summary={
        <Localized
          pl="Okno modalne z dowolną treścią (formularz, lista, podsumowanie). Dla prostego tak/nie potwierdzenia bez treści formularza użyj AlertDialog — jest lżejszy i ma gotowy kontrakt destructive."
          en="A modal window with arbitrary content (a form, a list, a summary). For a simple yes/no confirmation without form content, use AlertDialog — it is lighter and has a ready-made destructive contract."
        />
      }
      title={<Localized pl="Okno na dowolną treść." en="A window for arbitrary content." />}
    >
      <StorySection index="01" title={<Localized pl="Z formularzem" en="With a form" />}>
        <div data-testid="dialog-demo">
          <FormDialogDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTestId('dialog-trigger'));

    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(body.getByRole('button', { name: 'Wyślij zaproszenie' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
  },
};
