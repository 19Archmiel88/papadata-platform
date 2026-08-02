import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';

import '../Filters/filters-showcase.css';
import {
  viewSegments,
} from '../Filters/storyData';
import {
  type SegmentedControlItem,
  SegmentedControl,
} from './SegmentedControl';

const meta = {
  title: '10 Komponenty/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

const longCopySegments: readonly SegmentedControlItem[] = [
  {
    value: 'all',
    label: 'All reconciliation queues currently visible',
    count: 24,
  },
  {
    value: 'processing',
    label: 'Requires operational follow-up in progress',
    count: 7,
    icon: 'trend',
  },
  {
    value: 'attention',
    label: 'Needs manual validation before publication',
    count: 4,
    icon: 'warning',
  },
  {
    value: 'stable',
    label: 'Stable and ready for downstream reporting',
    count: 13,
    icon: 'success',
  },
  {
    value: 'archived',
    label: 'Archived configurations',
    disabled: true,
  },
] as const;

function SegmentedPreview({
  initialValue,
  items = viewSegments,
  scopeLabel,
  size,
  theme,
}: {
  readonly initialValue: string;
  readonly items?: readonly SegmentedControlItem[];
  readonly scopeLabel?: string;
  readonly size?: 'default' | 'compact';
  readonly theme?: 'light' | 'dark';
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div
      className="pd-tools-story__surface"
      data-theme={theme}
    >
      <SegmentedControl
        ariaLabel="Widok lokalny"
        items={items}
        size={size}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}

export const SegmentedControlStory: Story = {
  args: {
    ariaLabel: 'Widok lokalny',
    items: viewSegments,
    value: 'all',
  },
  name: 'Segmenty widoku',
  render: () => (
    <div className="pd-tools-story">
      <div className="pd-tools-story__inner">
        <header className="pd-tools-story__header">
          <p className="pd-tools-story__kicker">10 Komponenty/SegmentedControl</p>
          <h1>Segmenty przełączają lokalny widok bez udawania zakładek całej strony.</h1>
          <p className="pd-tools-story__lead">
            Zastosowana semantyka radiogroup jest spójna z jednym wyborem spośród kilku
            wariantów widoku i nie wymusza paneli treści jak w klasycznych Tabs.
          </p>
        </header>

        <section className="pd-tools-story__section">
          <h2>Warianty</h2>
          <div className="pd-tools-story__rows">
            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Segmenty z licznikami wspierają przełączanie zakresu danych w obrębie sekcji.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SegmentedPreview initialValue="all" />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Gęstszy rytm jest przydatny w toolbarach i nad tabelą pomocniczą.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SegmentedPreview initialValue="processing" size="compact" />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Długie etykiety i angielski</h3>
                <p>Wariant stresuje zawijanie dłuższych nazw segmentów w kontekście analitycznym.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SegmentedPreview
                  initialValue="processing"
                  items={longCopySegments}
                  scopeLabel="Segmenty z długim copy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-tools-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-tools-story__theme-grid">
            <div className="pd-tools-story__theme-column">
              <h3>Tryb jasny</h3>
              <p className="pd-tools-story__theme-copy">
                Aktywny segment lekko podnosi się ponad neutralne tło.
              </p>
              <SegmentedPreview
                initialValue="stable"
                theme="light"
              />
            </div>

            <div className="pd-tools-story__theme-column">
              <h3>Tryb ciemny</h3>
              <p className="pd-tools-story__theme-copy">
                Nawigacja pozostaje subtelna i nie przechodzi w jasny SaaS pill switch.
              </p>
              <SegmentedPreview
                initialValue="attention"
                theme="dark"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};
