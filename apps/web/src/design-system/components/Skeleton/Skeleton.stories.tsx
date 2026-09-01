import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Skeleton,
} from './Skeleton';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Stany i feedback/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Skeleton zastępuje treść, której kształt już znamy, zanim dane dotrą. Jest aria-hidden — nie zastępuje komunikatu o stanie ładowania dla czytników ekranu, tylko wypełnia miejsce wizualnie.',
      },
    },
  },
  args: {
    animated: true,
    height: 16,
    lines: 3,
    shape: 'text',
    width: '100%',
  },
  argTypes: {
    animated: { control: 'boolean' },
    height: { control: 'text' },
    lines: { control: 'number' },
    shape: { control: 'inline-radio', options: ['text', 'rect', 'circle'] },
    width: { control: 'text' },
  },
} satisfies Meta<typeof Skeleton>;

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
      className="pd-skeleton-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const SkeletonStory: Story = {
  name: 'Skeleton',
  render: (args) => (
    <StoryPresentationPage
      className="pd-skeleton-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Skeleton', en: 'Skeleton parameters' })}
          items={[
            { label: <Localized pl="Kształty" en="Shapes" />, value: 'text / rect / circle' },
            { label: <Localized pl="aria-hidden" en="aria-hidden" />, value: 'true' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="skeleton"
      summary={
        <Localized
          pl="Skeleton naśladuje docelowy kształt treści — nigdy nie jest generycznym paskiem. Nie niesie własnego komunikatu dostępności; towarzyszący kontener (np. lista, karta) informuje o stanie ładowania."
          en="Skeleton mimics the target content's real shape — never a generic bar. It carries no accessibility message of its own; the surrounding container (a list, a card) announces the loading state."
        />
      }
      title={<Localized pl="Kształt, którego jeszcze nie widać." en="A shape you cannot see yet." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Kontrolowany" en="Controlled" />}
        summary={<Localized pl="Steruj kontrolkami w panelu Storybooka." en="Drive it from the Storybook controls panel." />}
      >
        <div data-testid="skeleton-controlled">
          <Skeleton {...args} />
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Kształty" en="Shapes" />}
      >
        <div className="pd-f0-icon-groups" data-testid="skeleton-shapes">
          <article>
            <h3><Localized pl="text — wiele linii" en="text — multiple lines" /></h3>
            <div style={{ width: '260px' }}>
              <Skeleton height={14} lines={3} shape="text" width="100%" />
            </div>
          </article>
          <article>
            <h3><Localized pl="rect — karta/miniatura" en="rect — card/thumbnail" /></h3>
            <div>
              <Skeleton height={64} lines={1} shape="rect" width={160} />
            </div>
          </article>
          <article>
            <h3><Localized pl="circle — awatar" en="circle — avatar" /></h3>
            <div>
              <Skeleton height={40} lines={1} shape="circle" width={40} />
            </div>
          </article>
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Animacje" en="Motion" />}
        summary={<Localized pl="Przełącz Animacje w toolbarze — animated=true respektuje prefers-reduced-motion i tryb ograniczony." en="Toggle Motion in the toolbar — animated=true respects prefers-reduced-motion and the reduced mode." />}
      >
        <div className="pd-f0-icon-line" data-testid="skeleton-motion">
          <span>
            <Skeleton animated height={16} lines={1} shape="rect" width={120} />
            <Localized pl="animowany" en="animated" />
          </span>
          <span>
            <Skeleton animated={false} height={16} lines={1} shape="rect" width={120} />
            <Localized pl="statyczny" en="static" />
          </span>
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByTestId('skeleton-controlled').querySelector('.pd-skeleton');
    await expect(controlled).toHaveAttribute('aria-hidden', 'true');
    await expect(controlled).toHaveAttribute('data-shape', 'text');

    await expect(canvas.getByTestId('skeleton-shapes').children).toHaveLength(3);
    await expect(canvas.getByTestId('skeleton-motion')).toBeInTheDocument();
  },
};
