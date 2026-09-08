import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  SegmentedControl,
} from './SegmentedControl';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const items = [
  { count: 12, label: 'Wszystkie', value: 'all' },
  { count: 5, label: 'Gotowe', value: 'ready' },
  { count: 3, label: 'Wymagają uwagi', value: 'attention' },
  { disabled: true, label: 'Archiwum', value: 'archive' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Nawigacja/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    ariaLabel: 'Filtr statusu',
    items,
    onValueChange: fn(),
    value: 'all',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof SegmentedControl>;

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
      className="pd-segmented-control-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const SegmentedControlStory: Story = {
  name: 'SegmentedControl',
  render: (args) => (
    <StoryPresentationPage
      className="pd-segmented-control-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry SegmentedControl', en: 'SegmentedControl parameters' })}
          items={[
            { label: <Localized pl="Semantyka" en="Semantics" />, value: copy({ pl: 'przełącznik trybu/wartości', en: 'mode/value switch' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="segmented-control"
      summary={
        <Localized
          pl="Przełącznik jednej wartości bez osobnych paneli treści — np. filtr widoku listy. Dla przełączania widocznych paneli treści użyj Tabs."
          en="A single-value switch without separate content panels — e.g. a list-view filter. For switching between visible content panels, use Tabs."
        />
      }
      title={<Localized pl="Jedna wartość, bez osobnych paneli." en="One value, no separate panels." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="segmented-controlled">
          <SegmentedControl {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Kompaktowy" en="Compact" />}>
        <div data-testid="segmented-compact">
          <SegmentedControl ariaLabel={copy({ pl: 'Widok', en: 'View' })} items={[{ label: copy({ pl: 'Tabela', en: 'Table' }), value: 'table' }, { label: copy({ pl: 'Wykres', en: 'Chart' }), value: 'chart' }]} size="compact" value="table" onValueChange={fn()} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const buttons = canvas.getByTestId('segmented-controlled').querySelectorAll('[role="radio"]');
    await expect(buttons).toHaveLength(items.length);
    await expect(buttons[0]).toHaveAttribute('aria-checked', 'true');

    await expect(canvas.getByTestId('segmented-compact')).toBeInTheDocument();
  },
};
