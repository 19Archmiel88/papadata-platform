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
  formatPapaDataCurrency,
  formatPapaDataDate,
  formatPapaDataDateRange,
  formatPapaDataNumber,
  formatPapaDataPercent,
  formatPapaDataRelativeTime,
  papaDataRuntimeDensities,
  papaDataRuntimeLocales,
  papaDataRuntimeMotionModes,
  papaDataRuntimeThemes,
} from '.';

import type {
  LocalizedCopy,
} from '../../../storybook-next/presentation/storyLocalization';
import {
  Localized,
  copy,
  readLocale,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Fundamenty/Runtime i formatowanie',
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
      className="pd-runtime-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const globalsRows: ReadonlyArray<{
  readonly label: LocalizedCopy;
  readonly values: readonly string[];
  readonly attribute: string;
}> = [
  { label: { pl: 'Motyw', en: 'Theme' }, values: papaDataRuntimeThemes, attribute: 'data-theme' },
  { label: { pl: 'Język', en: 'Locale' }, values: papaDataRuntimeLocales, attribute: 'data-locale' },
  { label: { pl: 'Gęstość', en: 'Density' }, values: papaDataRuntimeDensities, attribute: 'data-density' },
  { label: { pl: 'Animacje', en: 'Motion' }, values: papaDataRuntimeMotionModes, attribute: 'data-motion' },
];

const sampleDate = new Date('2026-08-29T13:42:00Z');
const sampleRangeStart = new Date('2026-08-01T00:00:00Z');
const sampleRangeEnd = new Date('2026-08-29T00:00:00Z');

export const RuntimeIFormatowanie: Story = {
  name: 'Runtime i formatowanie',
  render: () => {
    const locale = readLocale();

    return (
      <StoryPresentationPage
        className="pd-runtime-system"
        headerAside={(
          <StoryPresentationMeta
            ariaLabel={copy({ pl: 'Parametry runtime', en: 'Runtime parameters' })}
            items={[
              { label: <Localized pl="Aktywny język" en="Active locale" />, value: locale.toUpperCase() },
              { label: <Localized pl="Globalne atrybuty" en="Global attributes" />, value: String(globalsRows.length) },
              { label: <Localized pl="Trwałość" en="Persistence" />, value: 'localStorage' },
            ]}
          />
        )}
        sectionCode="DS"
        sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
        storyId="runtime"
        summary={
          <Localized
            pl="Cztery globalne ustawienia — motyw, język, gęstość, animacje — sterują atrybutami data-* na elemencie html i propagują się do formatowania liczb, walut i dat przez Intl."
            en="Four global settings — theme, locale, density, motion — drive data-* attributes on the html element and propagate into number, currency and date formatting via Intl."
          />
        }
        title={<Localized pl="Cztery przełączniki, jeden runtime." en="Four toggles, one runtime." />}
      >
        <StorySection
          index="01"
          title={<Localized pl="Globalne ustawienia" en="Global settings" />}
          summary={<Localized pl="Sterowane z toolbara Storybooka; w produkcie — z panelu konta i preferencji systemowych. Zapisywane w localStorage pod kluczem papadata.runtime-preferences.v1." en="Driven from the Storybook toolbar; in the product — from the account panel and system preferences. Persisted in localStorage under the papadata.runtime-preferences.v1 key." />}
        >
          <div className="pd-f0-ledger" data-testid="runtime-globals">
            {globalsRows.map((row) => (
              <div className="pd-f0-ledger__row" key={row.attribute}>
                <span className="pd-f0-ledger__label">{copy(row.label)}</span>
                <span className="pd-f0-ledger__preview">
                  <code>{row.attribute}</code>
                </span>
                <span className="pd-f0-ledger__value">{row.values.join(' / ')}</span>
                <span className="pd-f0-ledger__detail" />
              </div>
            ))}
          </div>
        </StorySection>

        <StorySection
          index="02"
          title={<Localized pl="Formatowanie liczb i walut" en="Number and currency formatting" />}
          summary={<Localized pl="Ta sama wartość liczbowa, sformatowana zgodnie z aktywnym językiem." en="The same numeric value, formatted for the active locale." />}
        >
          <div className="pd-f0-number-alignment" data-testid="runtime-numbers">
            <div>
              <span><Localized pl="Liczba" en="Number" /></span>
              <strong>{formatPapaDataNumber(12840.5, locale)}</strong>
            </div>
            <div>
              <span><Localized pl="Waluta (PLN)" en="Currency (PLN)" /></span>
              <strong>{formatPapaDataCurrency(284120, locale)}</strong>
            </div>
            <div>
              <span><Localized pl="Procent" en="Percent" /></span>
              <strong>{formatPapaDataPercent(0.092, locale)}</strong>
            </div>
          </div>
        </StorySection>

        <StorySection
          index="03"
          title={<Localized pl="Formatowanie dat" en="Date formatting" />}
        >
          <div className="pd-f0-date-format" data-testid="runtime-dates">
            <div className="pd-f0-inline-value">
              <span><Localized pl="Data" en="Date" /></span>
              <strong>{formatPapaDataDate(sampleDate, locale)}</strong>
            </div>
            <div className="pd-f0-inline-value">
              <span><Localized pl="Zakres dat" en="Date range" /></span>
              <strong>{formatPapaDataDateRange(sampleRangeStart, sampleRangeEnd, locale)}</strong>
            </div>
            <div className="pd-f0-inline-value">
              <span><Localized pl="Czas względny" en="Relative time" /></span>
              <strong>{formatPapaDataRelativeTime(-18, 'minute', locale)}</strong>
            </div>
          </div>
        </StorySection>
      </StoryPresentationPage>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('runtime-globals').children).toHaveLength(globalsRows.length);
    await expect(canvas.getByTestId('runtime-numbers')).toBeInTheDocument();
    await expect(canvas.getByTestId('runtime-dates')).toBeInTheDocument();
  },
};
