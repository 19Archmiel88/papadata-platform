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
  OverlayRoot,
} from './OverlayRoot';
import {
  Button,
} from '../Button';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/OverlayRoot',
  component: OverlayRoot,
  parameters: {
    layout: 'padded',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'OverlayRoot to prymityw, na którym zbudowane są Dialog, AlertDialog i Drawer — portal do #pd-overlay-root-host w document.body, opcjonalny backdrop (none / subtle) i blokada scrolla. Nie używaj OverlayRoot bezpośrednio w ekranach — użyj gotowego Dialog/Drawer/AlertDialog.',
      },
    },
  },
} satisfies Meta<typeof OverlayRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

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
            pointerEvents: 'auto',
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
    <div data-testid="overlay-root-demo">
      <OverlayRootDemo />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTestId('overlay-root-trigger'));

    const panel = await body.findByTestId('overlay-root-panel');
    await expect(panel).toBeInTheDocument();
    await expect(document.getElementById('pd-overlay-root-host')).toBeInTheDocument();

    await userEvent.click(body.getByRole('button', { name: copy({ pl: 'Zamknij', en: 'Close' }) }));
    await expect(body.queryByTestId('overlay-root-panel')).not.toBeInTheDocument();

    // Story ma pozostać w reprezentatywnym, otwartym stanie po zakończeniu
    // testu zamknięcia powyżej, więc otwieramy ponownie.
    await userEvent.click(canvas.getByTestId('overlay-root-trigger'));
    await expect(await body.findByTestId('overlay-root-panel')).toBeInTheDocument();
  },
};
