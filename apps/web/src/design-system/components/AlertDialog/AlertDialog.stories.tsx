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
  AlertDialog,
} from './AlertDialog';
import {
  Button,
} from '../Button';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof AlertDialog>;

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
      className="pd-alert-dialog-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

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
    <StoryPresentationPage
      className="pd-alert-dialog-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry AlertDialog', en: 'AlertDialog parameters' })}
          items={[
            { label: <Localized pl="Rola ARIA" en="ARIA role" />, value: 'alertdialog' },
            { label: <Localized pl="Warstwa" en="Layer" />, value: 'modal (z-index 30)' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="alert-dialog"
      summary={
        <Localized
          pl="Potwierdzenie jednego, nieodwracalnego lub ryzykownego działania — bez dowolnej treści w środku. Gdy potrzebujesz treści złożonej (formularz, lista), użyj Dialog zamiast AlertDialog."
          en="Confirmation of a single, irreversible or risky action — no arbitrary content inside. When you need complex content (a form, a list), use Dialog instead of AlertDialog."
        />
      }
      title={<Localized pl="Pytanie, na które trzeba odpowiedzieć, zanim coś się stanie." en="A question you must answer before something happens." />}
    >
      <StorySection index="01" title={<Localized pl="Destrukcyjne potwierdzenie" en="Destructive confirmation" />}>
        <div data-testid="alert-dialog-demo">
          <DestructiveDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
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
  },
};
