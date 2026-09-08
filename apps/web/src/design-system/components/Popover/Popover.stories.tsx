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
  Popover,
} from './Popover';
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
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Popover',
  component: Popover,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Popover>;

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
      className="pd-popover-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

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
    <StoryPresentationPage
      className="pd-popover-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Popover', en: 'Popover parameters' })}
          items={[
            { label: <Localized pl="Umiejscowienie" en="Placement" />, value: 'top / right / bottom / left' },
            { label: <Localized pl="Warstwa" en="Layer" />, value: 'popover (z-index 20)' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="popover"
      summary={
        <Localized
          pl="Krótka treść zakotwiczona przy wyzwalającym elemencie — status, szybki podgląd, mikro-akcja. Dla listy akcji do wyboru użyj Menu; dla tylko-tekstowej podpowiedzi na hover użyj Tooltip."
          en="Short content anchored to its trigger — a status, a quick preview, a micro-action. For a list of actions to choose from, use Menu; for a text-only hover hint, use Tooltip."
        />
      }
      title={<Localized pl="Treść zakotwiczona przy elemencie." en="Content anchored to an element." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="popover-demo">
          <PopoverDemo />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByTestId('popover-trigger'));

    await expect(canvas.getByText(copy({ pl: 'Wymaga ponownej autoryzacji', en: 'Needs reauthorization' }))).toBeInTheDocument();
  },
};
