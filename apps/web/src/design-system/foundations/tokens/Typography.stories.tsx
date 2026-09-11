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
  { rule: 'buttonsUseDataFont', label: { pl: 'Przyciski nigdy nie używają fontu danych.', en: 'Buttons never use the data font.' } },
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
            { label: <Localized pl="Kroki skali" en="Scale steps" />, value: String(Object.keys(typographyTokens.sizes).length) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="typography"
      summary={
        <Localized
          pl="Inter obsługuje cały interfejs, JetBrains Mono niesie liczby i identyfikatory. Realny kod dziś nie używa żadnego trzeciego fontu akcentowego — poprzednia wersja tej strony wspominała o edytorskim akcencie Newsreader, ale ten nigdy nie trafił do obecnych ekranów (--pd-font-serif aliasuje wprost na Inter)."
          en="Inter carries the whole interface, JetBrains Mono carries numbers and identifiers. Real code today does not use any third accent font — an earlier version of this page mentioned an editorial Newsreader accent, but it never made it into the current screens (--pd-font-serif aliases straight to Inter)."
        />
      }
      title={<Localized pl="Dwa fonty, jedna hierarchia." en="Two fonts, one hierarchy." />}
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

      <StorySection
        index="04"
        title={<Localized pl="W praktyce" en="In practice" />}
      >
        <div className="pd-f0-note" data-testid="typography-practice">
          <Localized
            pl="Do 2026-09-10 realny kod ustawiał font-size ręczną liczbą w 385 miejscach (26 plików) zamiast tokenem ze skali — niemal 3,5× więcej niż analogiczny problem przy promieniach. Doprowadzone do zgodności: wszystkie miejsca (poza jednym celowym wyjątkiem — inline code w wątku wiadomości Papy używa font-size:0.85em, żeby skalować się razem z otaczającym tekstem, a nie sztywno) odwołują się dziś do tokenu, wartości pozaskalowe zaokrąglono do najbliższego kroku."
            en="Until 2026-09-10, real code set font-size with a raw number in 385 places (26 files) instead of a scale token — almost 3.5× the equivalent radius problem. Brought into alignment: every place (except one deliberate exception — inline code in the Papa message thread uses font-size:0.85em to scale with its surrounding text rather than a fixed size) now references a token, with off-scale values rounded to the nearest step."
          />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('typography-scale').children).toHaveLength(sizeSamples.length);
    await expect(canvas.getByTestId('typography-numerics')).toBeInTheDocument();
    await expect(canvas.getByTestId('typography-rules').children).toHaveLength(fontRules.length);
    await expect(canvas.getByTestId('typography-practice')).toBeInTheDocument();
  },
};
