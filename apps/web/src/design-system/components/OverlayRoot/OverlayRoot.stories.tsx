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
  OverlayRoot,
} from './OverlayRoot';
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
  title: 'DESIGN SYSTEM/Komponenty/Overlay/OverlayRoot',
  component: OverlayRoot,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof OverlayRoot>;

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
      className="pd-overlay-root-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function OverlayRootDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button data-testid="overlay-root-trigger" variant="secondary" onClick={() => setOpen(true)}>
        <Localized pl="Otwórz surowy overlay" en="Open raw overlay" />
      </Button>
      <OverlayRoot backdrop="subtle" open={open} onBackdropClick={() => setOpen(false)}>
        <div
          data-testid="overlay-root-panel"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: 'var(--pd-space-6)',
            border: 'var(--pd-border-width-subtle) solid var(--pd-separator)',
            borderRadius: 'var(--pd-radius-surface)',
            background: 'var(--pd-surface)',
            boxShadow: 'var(--pd-shadow-overlay)',
          }}
        >
          <p><Localized pl="Ten panel jest portalowany do #pd-overlay-root-host w document.body." en="This panel is portaled to #pd-overlay-root-host in document.body." /></p>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            <Localized pl="Zamknij" en="Close" />
          </Button>
        </div>
      </OverlayRoot>
    </>
  );
}

export const OverlayRootStory: Story = {
  name: 'OverlayRoot',
  render: () => (
    <StoryPresentationPage
      className="pd-overlay-root-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry OverlayRoot', en: 'OverlayRoot parameters' })}
          items={[
            { label: <Localized pl="Cel portalu" en="Portal target" />, value: '#pd-overlay-root-host' },
            { label: <Localized pl="backdrop" en="backdrop" />, value: 'none / subtle' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="overlay-root"
      summary={
        <Localized
          pl="Prymityw, na którym zbudowane są Dialog, AlertDialog, Drawer i BottomSheet — portal do document.body, opcjonalny backdrop i blokada scrolla. Nie używaj OverlayRoot bezpośrednio w ekranach — użyj gotowego Dialog/Drawer/AlertDialog/BottomSheet."
          en="The primitive Dialog, AlertDialog, Drawer and BottomSheet are built on — a portal to document.body, an optional backdrop and scroll lock. Do not use OverlayRoot directly in screens — use the ready-made Dialog/Drawer/AlertDialog/BottomSheet."
        />
      }
      title={<Localized pl="Portal, backdrop i blokada scrolla — jeden raz." en="Portal, backdrop and scroll lock — built once." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="overlay-root-demo">
          <OverlayRootDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTestId('overlay-root-trigger'));

    const panel = await body.findByTestId('overlay-root-panel');
    await expect(panel).toBeInTheDocument();
    await expect(document.getElementById('pd-overlay-root-host')).toBeInTheDocument();

    await userEvent.click(body.getByRole('button', { name: copy({ pl: 'Zamknij', en: 'Close' }) }));
  },
};
