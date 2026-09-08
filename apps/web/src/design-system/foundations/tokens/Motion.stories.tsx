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
  motionTokens,
} from './motion';
import {
  cardHoverTransition,
  overlayTransition,
  tabPanelTransition,
} from '../motion/motionPresets';

import type {
  LocalizedCopy,
} from '../../../storybook-next/presentation/storyLocalization';
import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Fundamenty/Motion',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

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
      className="pd-motion-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const durationEntries = Object.entries(motionTokens.duration);

const presetRows: ReadonlyArray<{
  readonly key: string;
  readonly transition: { readonly duration: number };
  readonly label: LocalizedCopy;
}> = [
  { key: 'overlay', transition: overlayTransition, label: { pl: 'Wejście overlayu (modal, drawer, popover)', en: 'Overlay entrance (modal, drawer, popover)' } },
  { key: 'tabPanel', transition: tabPanelTransition, label: { pl: 'Zmiana panelu zakładek', en: 'Tab panel switch' } },
  { key: 'cardHover', transition: cardHoverTransition, label: { pl: 'Hover karty/wiersza', en: 'Card/row hover' } },
];

function MotionTrack({
  testId,
}: {
  readonly testId: string;
}) {
  const [run, setRun] = useState(false);

  return (
    <div className="pd-f0-motion-demo__track">
      <span
        data-run={run}
        data-testid={testId}
        onAnimationEnd={() => setRun(false)}
      />
      <button
        type="button"
        onClick={() => setRun(true)}
        style={{
          position: 'absolute',
          inset: 0,
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
        }}
        aria-label={copy({ pl: 'Odtwórz animację', en: 'Play animation' })}
      />
    </div>
  );
}

export const Motion: Story = {
  name: 'Motion',
  render: () => (
    <StoryPresentationPage
      className="pd-motion-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry kontraktu motion', en: 'Motion contract parameters' })}
          items={[
            { label: <Localized pl="Tryby" en="Modes" />, value: motionTokens.modes.join(' / ') },
            { label: <Localized pl="Kroki czasu trwania" en="Duration steps" />, value: String(durationEntries.length) },
            { label: <Localized pl="Presety Framer Motion" en="Framer Motion presets" />, value: String(presetRows.length) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="motion"
      summary={
        <Localized
          pl="Czas trwania i easing są tokenami CSS, a Framer Motion je restatuje numerycznie dla komponentów, które tego wymagają. `prefers-reduced-motion` i przełącznik Animacje w toolbarze zawsze wygrywają."
          en="Duration and easing are CSS tokens; Framer Motion restates them numerically for components that need it. `prefers-reduced-motion` and the toolbar's Motion toggle always win."
        />
      }
      title={<Localized pl="Ruch potwierdza, nie ozdabia." en="Motion confirms, it does not decorate." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Czas trwania i easing" en="Duration and easing" />}
      >
        <div className="pd-f0-ledger" data-testid="motion-durations">
          {durationEntries.map(([key, value]) => (
            <div className="pd-f0-ledger__row" key={key}>
              <span className="pd-f0-ledger__label">{key}</span>
              <span className="pd-f0-ledger__preview" />
              <span className="pd-f0-ledger__value">{value}</span>
              <span className="pd-f0-ledger__detail" />
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Pełne vs ograniczone animacje" en="Full vs reduced motion" />}
        summary={<Localized pl="Przełącz Animacje w toolbarze — ten sam token biegnie natychmiast w trybie ograniczonym." en="Toggle Motion in the toolbar — the same token resolves instantly in reduced mode." />}
      >
        <div className="pd-f0-motion-comparison" data-testid="motion-comparison">
          <div className="pd-f0-motion-mode">
            <header>
              <span>full</span>
              <div>
                <h3><Localized pl="Pełne" en="Full" /></h3>
                <p><Localized pl="Deliberate duration + emphasized easing." en="Deliberate duration + emphasized easing." /></p>
              </div>
            </header>
            <div className="pd-f0-motion-demo" data-motion="full">
              <MotionTrack testId="motion-track-full" />
              <p><Localized pl="Kliknij, aby odtworzyć." en="Click to play." /></p>
            </div>
          </div>
          <div className="pd-f0-motion-mode">
            <header>
              <span>reduced</span>
              <div>
                <h3><Localized pl="Ograniczone" en="Reduced" /></h3>
                <p><Localized pl="Stan końcowy pojawia się natychmiast, bez ruchu." en="The end state appears instantly, without motion." /></p>
              </div>
            </header>
            <div className="pd-f0-motion-demo" data-motion="reduced">
              <MotionTrack testId="motion-track-reduced" />
              <p><Localized pl="Kliknij, aby zobaczyć stan końcowy." en="Click to see the end state." /></p>
            </div>
          </div>
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Presety Framer Motion" en="Framer Motion presets" />}
        summary={<Localized pl="Jedyna świadoma restatuja tokenów CSS jako liczb — nie druga niezależna skala czasu." en="The one deliberate restatement of CSS tokens as numbers — not a second, independent timing scale." />}
      >
        <div className="pd-f0-icon-groups" data-testid="motion-presets">
          {presetRows.map((row) => (
            <article key={row.key}>
              <h3><code>{row.key}</code></h3>
              <div>
                <span>{copy(row.label)} — {row.transition.duration}s</span>
              </div>
            </article>
          ))}
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('motion-durations').children).toHaveLength(durationEntries.length);
    await expect(canvas.getByTestId('motion-comparison')).toBeInTheDocument();

    const fullTrack = canvas.getByTestId('motion-track-full');
    await expect(fullTrack).toHaveAttribute('data-run', 'false');
    await userEvent.click(fullTrack.parentElement!.querySelector('button')!);
    await expect(fullTrack).toHaveAttribute('data-run', 'true');

    await expect(canvas.getByTestId('motion-presets').children).toHaveLength(presetRows.length);
  },
};
