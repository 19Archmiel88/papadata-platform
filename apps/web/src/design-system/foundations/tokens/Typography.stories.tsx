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
  typographyContract,
  typographyTokens,
} from './typography';

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
  title: 'DESIGN SYSTEM/Fundamenty/Typografia',
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
      className="pd-typography-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const sizeSamples: ReadonlyArray<{
  readonly key: keyof typeof typographyTokens.sizes;
  readonly kind: 'page' | 'section' | 'lead' | 'body' | 'small' | 'caption';
  readonly label: LocalizedCopy;
  readonly sample: LocalizedCopy;
}> = [
  { key: 'display', kind: 'page', label: { pl: 'Display — 34px+', en: 'Display — 34px+' }, sample: { pl: 'Budżet i atrybucja', en: 'Budget and attribution' } },
  { key: 'heading1', kind: 'page', label: { pl: 'Nagłówek 1 — 34px', en: 'Heading 1 — 34px' }, sample: { pl: 'Centrum Dowodzenia', en: 'Command Center' } },
  { key: 'heading2', kind: 'section', label: { pl: 'Nagłówek 2 — 28px', en: 'Heading 2 — 28px' }, sample: { pl: 'Wydajność kampanii', en: 'Campaign performance' } },
  { key: 'section', kind: 'section', label: { pl: 'Sekcja — 18px', en: 'Section — 18px' }, sample: { pl: 'Ostatnie synchronizacje', en: 'Recent syncs' } },
  { key: 'bodyLarge', kind: 'lead', label: { pl: 'Body large — 16px', en: 'Body large — 16px' }, sample: { pl: 'Krótkie wprowadzenie do panelu.', en: 'A short panel introduction.' } },
  { key: 'body', kind: 'body', label: { pl: 'Body — 14px', en: 'Body — 14px' }, sample: { pl: 'Podstawowy tekst interfejsu i opisy.', en: 'Default interface text and descriptions.' } },
  { key: 'bodySmall', kind: 'small', label: { pl: 'Body small — 13px', en: 'Body small — 13px' }, sample: { pl: 'Pomocniczy tekst i metadane.', en: 'Helper text and metadata.' } },
  { key: 'caption', kind: 'caption', label: { pl: 'Caption — 12px, mono', en: 'Caption — 12px, mono' }, sample: { pl: 'ID-8271 · 18 min temu', en: 'ID-8271 · 18 min ago' } },
];

const fontRules: ReadonlyArray<{
  readonly rule: keyof typeof typographyContract.rules;
  readonly label: LocalizedCopy;
}> = [
  { rule: 'metricsMayUseDataFont', label: { pl: 'Metryki i wartości liczbowe mogą używać fontu danych (JetBrains Mono, tabular-nums).', en: 'Metrics and numeric values may use the data font (JetBrains Mono, tabular-nums).' } },
  { rule: 'ordinaryDescriptionsUseDataFont', label: { pl: 'Zwykłe opisy nigdy nie używają fontu danych.', en: 'Ordinary descriptions never use the data font.' } },
  { rule: 'heroMetricsMayUseDisplayAccentFont', label: { pl: 'Duże liczby hero i nagłówki sekcji mogą użyć akcentu edytorskiego (Newsreader) — wąsko, nie jako drugi font interfejsu.', en: 'Hero numerals and section headings may use the editorial accent (Newsreader) — narrowly, not as a second interface font.' } },
  { rule: 'buttonsUseDataFont', label: { pl: 'Przyciski nigdy nie używają fontu danych ani akcentu edytorskiego.', en: 'Buttons never use the data font or the editorial accent.' } },
];

export const Typografia: Story = {
  name: 'Typografia',
  render: () => (
    <StoryPresentationPage
      className="pd-typography-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry kontraktu typografii', en: 'Typography contract parameters' })}
          items={[
            { label: <Localized pl="Font interfejsu" en="Interface font" />, value: typographyContract.interfaceFont },
            { label: <Localized pl="Font danych" en="Data font" />, value: typographyContract.dataFont },
            { label: <Localized pl="Akcent display" en="Display accent" />, value: typographyContract.displayAccentFont },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="typography"
      summary={
        <Localized
          pl="Inter obsługuje cały interfejs, JetBrains Mono niesie liczby i identyfikatory, Newsreader jest wąskim akcentem edytorskim dla wybranych nagłówków i metryk hero."
          en="Inter carries the whole interface, JetBrains Mono carries numbers and identifiers, Newsreader is a narrow editorial accent for select headings and hero metrics."
        />
      }
      title={<Localized pl="Trzy fonty, jedna hierarchia." en="Three fonts, one hierarchy." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Skala rozmiarów" en="Size scale" />}
        summary={<Localized pl="Od display po caption — każdy rozmiar ma jedno przeznaczenie w interfejsie." en="From display to caption — every size has one job in the interface." />}
      >
        <div data-testid="typography-scale">
          {sizeSamples.map((entry) => (
            <div key={entry.key} className="pd-f0-variant" data-layout="split">
              <header className="pd-f0-variant__header">
                <h3>{copy(entry.label)}</h3>
                <code>--pd-type-size-{entry.key.replace(/([A-Z])/g, '-$1').toLowerCase()}</code>
              </header>
              <div className="pd-f0-variant__body">
                <span
                  className="pd-f0-type-sample"
                  data-kind={entry.kind}
                  style={{ fontSize: typographyTokens.sizes[entry.key] }}
                >
                  {copy(entry.sample)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Wagi i dane liczbowe" en="Weights and numerics" />}
        summary={<Localized pl="Regular dla treści, medium dla nagłówków i etykiet, semibold dla mocnych akcentów. Wartości liczbowe wyrównują się tabelarycznie." en="Regular for content, medium for headings and labels, semibold for strong accents. Numeric values align on a tabular grid." />}
      >
        <div className="pd-f0-number-alignment" data-testid="typography-numerics">
          <div>
            <span style={{ fontWeight: typographyTokens.weights.regular }}>
              <Localized pl="Regular" en="Regular" />
            </span>
            <strong style={{ fontWeight: typographyTokens.weights.regular }}>1 234,50 zł</strong>
          </div>
          <div>
            <span style={{ fontWeight: typographyTokens.weights.medium }}>
              <Localized pl="Medium" en="Medium" />
            </span>
            <strong style={{ fontWeight: typographyTokens.weights.medium }}>12 840</strong>
          </div>
          <div>
            <span style={{ fontWeight: typographyTokens.weights.semibold }}>
              <Localized pl="Semibold" en="Semibold" />
            </span>
            <strong style={{ fontWeight: typographyTokens.weights.semibold }}>+9,2%</strong>
          </div>
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Reguły kontraktu" en="Contract rules" />}
      >
        <div className="pd-f0-decision-list" data-testid="typography-rules">
          {fontRules.map((entry) => (
            <div key={entry.rule}>
              <strong>{entry.rule}</strong>
              <p>{copy(entry.label)}</p>
            </div>
          ))}
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('typography-scale').children).toHaveLength(sizeSamples.length);
    await expect(canvas.getByTestId('typography-numerics')).toBeInTheDocument();
    await expect(canvas.getByTestId('typography-rules').children).toHaveLength(fontRules.length);
  },
};
