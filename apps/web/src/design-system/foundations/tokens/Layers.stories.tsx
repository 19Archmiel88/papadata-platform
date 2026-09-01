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
  layerContract,
  layerTokens,
} from './layers';

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
  title: 'DESIGN SYSTEM/Fundamenty/Warstwy (z-index)',
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
      className="pd-layers-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const layerDescriptions: Record<
  keyof typeof layerTokens,
  LocalizedCopy
> = {
  underlay: { pl: 'Dekoracyjne tło pod treścią (np. blask, gradient ambientowy).', en: 'Decorative background beneath content (e.g. ambient glow, gradient).' },
  base: { pl: 'Zwykła treść strony.', en: 'Ordinary page content.' },
  sticky: { pl: 'Elementy przyklejone podczas przewijania (nagłówek tabeli, pasek filtrów).', en: 'Elements pinned during scroll (table header, filter bar).' },
  popover: { pl: 'Menu, tooltip, popover — zakotwiczone przy elemencie wyzwalającym.', en: 'Menu, tooltip, popover — anchored to their trigger.' },
  modal: { pl: 'Modal, drawer, alert dialog — blokują interakcję z resztą strony.', en: 'Modal, drawer, alert dialog — block interaction with the rest of the page.' },
  toast: { pl: 'Powiadomienia toast — zawsze nad wszystkim innym.', en: 'Toast notifications — always above everything else.' },
};

const layerOrder = Object.keys(layerTokens) as ReadonlyArray<
  keyof typeof layerTokens
>;

export const WarstwyZIndex: Story = {
  name: 'Warstwy (z-index)',
  render: () => (
    <StoryPresentationPage
      className="pd-layers-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry warstw', en: 'Layer parameters' })}
          items={[
            { label: <Localized pl="Warstwy" en="Layers" />, value: String(layerOrder.length) },
            { label: <Localized pl="Zakres" en="Range" />, value: `${layerContract.underlay} → ${layerContract.toast}` },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="layers"
      summary={
        <Localized
          pl="Sześć nazwanych warstw z-index. Żaden komponent nie ustawia własnej, dowolnej wartości z-index — zawsze odwołuje się do jednej z tych ról."
          en="Six named z-index layers. No component sets its own arbitrary z-index value — it always refers to one of these roles."
        />
      }
      title={<Localized pl="Kolejność nakładania jest nazwana, nie zgadywana." en="Stacking order is named, not guessed." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Stos warstw" en="Layer stack" />}
      >
        <div className="pd-f0-ledger" data-testid="layers-ledger">
          {layerOrder.map((key) => (
            <div className="pd-f0-ledger__row" key={key}>
              <span className="pd-f0-ledger__label">{key}</span>
              <span className="pd-f0-ledger__preview">
                <code>{layerContract[key]}</code>
              </span>
              <span className="pd-f0-ledger__value">{layerTokens[key]}</span>
              <span className="pd-f0-ledger__detail">{copy(layerDescriptions[key])}</span>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Wizualizacja" en="Visualization" />}
        summary={<Localized pl="Każda kolejna warstwa przesłania poprzednią." en="Each subsequent layer covers the previous one." />}
      >
        <div
          data-testid="layers-stack"
          style={{
            position: 'relative',
            height: '220px',
            border: 'var(--pd-border-width-subtle) solid var(--pd-separator)',
            borderRadius: 'var(--pd-radius-surface)',
            overflow: 'hidden',
          }}
        >
          {layerOrder.map((key, index) => (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: `${16 + index * 26}px`,
                left: `${24 + index * 90}px`,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--pd-space-2)',
                minWidth: '120px',
                padding: 'var(--pd-space-2) var(--pd-space-3)',
                border: 'var(--pd-border-width-subtle) solid var(--pd-separator)',
                borderRadius: 'var(--pd-radius-control)',
                background: 'var(--pd-surface)',
                boxShadow: index >= layerOrder.length - 3 ? 'var(--pd-shadow-overlay)' : 'var(--pd-shadow-none)',
                fontSize: 'var(--pd-type-size-caption)',
                fontFamily: 'var(--pd-font-mono)',
                color: 'var(--pd-text-secondary)',
                zIndex: layerContract[key] + 1,
              }}
            >
              {key}
            </div>
          ))}
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('layers-ledger').children).toHaveLength(layerOrder.length);
    await expect(canvas.getByTestId('layers-stack').children).toHaveLength(layerOrder.length);
  },
};
