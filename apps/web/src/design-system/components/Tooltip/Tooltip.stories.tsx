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
  Tooltip,
} from './Tooltip';
import {
  IconButton,
} from '../Button';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Overlay/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Tooltip>;

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
      className="pd-tooltip-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const TooltipStory: Story = {
  name: 'Tooltip',
  render: () => (
    <StoryPresentationPage
      className="pd-tooltip-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Tooltip', en: 'Tooltip parameters' })}
          items={[
            { label: <Localized pl="interactive" en="interactive" />, value: copy({ pl: 'pozwala najechać na samą podpowiedź', en: 'allows hovering the tooltip itself' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="tooltip"
      summary={
        <Localized
          pl="Krótka, tekstowa podpowiedź na hover/focus — dla ikon bez widocznej etykiety albo skróconego tekstu. To osobny wzorzec od ChartTooltip, który pokazuje dane punktu na wykresie, nie opis UI."
          en="A short, text-only hover/focus hint — for icons without a visible label, or truncated text. This is a separate pattern from ChartTooltip, which shows a chart point's data, not a UI description."
        />
      }
      title={<Localized pl="Krótkie wyjaśnienie na hover." en="A short hover explanation." />}
    >
      <StorySection index="01" title={<Localized pl="Nad przyciskiem ikonowym" en="Over an icon button" />}>
        <div data-testid="tooltip-demo" style={{ display: 'flex', gap: 'var(--pd-space-4)' }}>
          <Tooltip
            content={copy({ pl: 'Synchronizuj teraz', en: 'Sync now' })}
            delayMs={200}
            interactive={false}
            placement="top"
            trigger={<IconButton data-testid="tooltip-trigger" icon="trend" label={copy({ pl: 'Synchronizuj teraz', en: 'Sync now' })} variant="ghost" />}
          />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByTestId('tooltip-trigger');
    await userEvent.hover(trigger);

    const tooltip = await canvas.findByRole('tooltip');
    await expect(tooltip).toHaveTextContent(copy({ pl: 'Synchronizuj teraz', en: 'Sync now' }));
  },
};
