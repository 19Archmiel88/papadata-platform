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
  Drawer,
} from './Drawer';
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
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Drawer>;

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
      className="pd-drawer-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

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
    <StoryPresentationPage
      className="pd-drawer-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Drawer', en: 'Drawer parameters' })}
          items={[
            { label: <Localized pl="Strony" en="Sides" />, value: 'left / right' },
            { label: <Localized pl="Warstwa" en="Layer" />, value: 'modal (z-index 30)' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="drawer"
      summary={
        <Localized
          pl="Przejściowy panel boczny na szczegóły rekordu, konfigurację albo dłuższy formularz — nie jest to synonim „dowolnego prawego regionu”. Zbudowany na kanonicznym OverlayRoot, tak jak Dialog."
          en="A transient side panel for record details, configuration, or a longer form — not a synonym for “any right-hand region”. Built on the canonical OverlayRoot, same as Dialog."
        />
      }
      title={<Localized pl="Panel boczny, który przychodzi i odchodzi." en="A side panel that comes and goes." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="drawer-demo">
          <DrawerDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTestId('drawer-trigger'));

    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
  },
};
