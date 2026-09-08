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
  BottomSheet,
} from './BottomSheet';
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
  title: 'DESIGN SYSTEM/Komponenty/Overlay/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof BottomSheet>;

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
      className="pd-bottom-sheet-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function BottomSheetDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button data-testid="sheet-trigger" variant="secondary" onClick={() => setOpen(true)}>
        <Localized pl="Sortuj i filtruj" en="Sort and filter" />
      </Button>
      <BottomSheet
        description={copy({ pl: 'Dostępne na wąskich ekranach jako odpowiednik Drawer/Popover.', en: 'Available on narrow screens as the Drawer/Popover equivalent.' })}
        dismissible
        open={open}
        primaryActionLabel={copy({ pl: 'Zastosuj', en: 'Apply' })}
        snapPoint="half"
        title={copy({ pl: 'Filtry', en: 'Filters' })}
        onOpenChange={setOpen}
      >
        <p><Localized pl="Dowolna treść — lista opcji, formularz." en="Arbitrary content — an option list, a form." /></p>
      </BottomSheet>
    </>
  );
}

export const BottomSheetStory: Story = {
  name: 'BottomSheet',
  render: () => (
    <StoryPresentationPage
      className="pd-bottom-sheet-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry BottomSheet', en: 'BottomSheet parameters' })}
          items={[
            { label: <Localized pl="snapPoint" en="snapPoint" />, value: 'content / half / full' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="bottom-sheet"
      summary={
        <Localized
          pl="Overlay wysuwany z dołu ekranu — naturalny na mobile/wąskich viewportach dla treści, które na desktopie byłyby Drawer lub Popover."
          en="An overlay sliding up from the bottom of the screen — the natural mobile/narrow-viewport counterpart of content that would be a Drawer or Popover on desktop."
        />
      }
      title={<Localized pl="Overlay z dołu ekranu." en="An overlay from the bottom of the screen." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="bottom-sheet-demo">
          <BottomSheetDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByTestId('sheet-trigger'));

    const dialog = await body.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
  },
};
