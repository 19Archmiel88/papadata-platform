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
  spacingContract,
  spacingTokens,
} from './spacing';

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
  title: 'DESIGN SYSTEM/Fundamenty/Spacing i siatka',
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
  layout,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly layout?: 'standard' | 'narrow' | 'wide' | 'showcase' | 'full';
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-spacing-section"
      index={index}
      layout={layout}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const spaceEntries = Object.entries(spacingTokens.space) as ReadonlyArray<
  [string, string]
>;

const breakpointEntries = Object.entries(spacingTokens.layout.breakpoints) as ReadonlyArray<
  [keyof typeof spacingTokens.layout.breakpoints, string]
>;

const breakpointLabels: Record<
  keyof typeof spacingTokens.layout.breakpoints,
  LocalizedCopy
> = {
  mobile: { pl: 'Telefon', en: 'Mobile' },
  tablet: { pl: 'Tablet', en: 'Tablet' },
  desktop: { pl: 'Desktop', en: 'Desktop' },
  wide: { pl: 'Duży ekran', en: 'Wide screen' },
};

export const SpacingISiatka: Story = {
  name: 'Spacing i siatka',
  render: () => (
    <StoryPresentationPage
      className="pd-spacing-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry kontraktu spacingu', en: 'Spacing contract parameters' })}
          items={[
            { label: <Localized pl="Jednostka bazowa" en="Base unit" />, value: `${spacingContract.baseUnit}px` },
            { label: <Localized pl="Kolumny — desktop" en="Columns — desktop" />, value: String(spacingContract.responsiveColumns.desktop) },
            { label: <Localized pl="Kolumny — mobile" en="Columns — mobile" />, value: String(spacingContract.responsiveColumns.mobile) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="spacing"
      summary={
        <Localized
          pl="Skala 4px, semantyczne odstępy (inline, control, group, block, section) i siatka odpowiedzialna za breakpointy oraz tryby gęstości."
          en="A 4px scale, semantic spacing (inline, control, group, block, section) and the grid that drives breakpoints and density modes."
        />
      }
      title={<Localized pl="Odstęp jest zamierzony, nigdy przypadkowy." en="Spacing is intentional, never accidental." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Skala" en="Scale" />}
        summary={<Localized pl="Dowolne wartości spoza skali są zabronione." en="Arbitrary off-scale values are forbidden." />}
      >
        <div className="pd-f0-spacing-scale" data-testid="spacing-scale">
          {spaceEntries.map(([key, value]) => (
            <div key={key}>
              <span>--pd-space-{key}</span>
              <span>{key}</span>
              <i style={{ width: value, background: 'var(--pd-brand)' }} />
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Odstępy semantyczne" en="Semantic spacing" />}
        summary={<Localized pl="Nazwa opisuje relację (inline, control, group, block, section), nie wartość w pikselach." en="The name describes the relationship (inline, control, group, block, section), not the pixel value." />}
      >
        <div className="pd-f0-ledger" data-testid="spacing-semantic">
          {Object.entries(spacingTokens.semantic).map(([key, value]) => (
            <div className="pd-f0-ledger__row" key={key}>
              <span className="pd-f0-ledger__label">{key}</span>
              <span className="pd-f0-ledger__preview">
                <i style={{ display: 'block', width: '24px', height: '24px', background: 'var(--pd-data-accent-subtle)' }} />
              </span>
              <span className="pd-f0-ledger__value">{value}</span>
              <span className="pd-f0-ledger__detail" />
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Siatka odpowiedzialna (12 kolumn)" en="Responsive grid (12 columns)" />}
        layout="wide"
        summary={<Localized pl="Desktop: 12 kolumn, tablet: 8, mobile: 4." en="Desktop: 12 columns, tablet: 8, mobile: 4." />}
      >
        <div className="pd-f0-grid-demo" data-testid="spacing-grid">
          {Array.from({ length: spacingContract.responsiveColumns.desktop }).map((_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="04"
        title={<Localized pl="Breakpointy" en="Breakpoints" />}
      >
        <div className="pd-f0-density-demo" data-testid="spacing-breakpoints">
          {breakpointEntries.map(([key, value]) => (
            <div key={key}>
              <span>{copy(breakpointLabels[key])}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="05"
        title={<Localized pl="Gęstość interfejsu" en="Interface density" />}
        summary={<Localized pl="Przełącznik Gęstość w toolbarze steruje tym demo. W produkcie nie ma dziś panelu dla tego globalnego ustawienia — realne komponenty (Table, Pagination i inne) mają własny, niezależny prop compact/comfortable ustawiany punktowo." en="The Density toggle in the toolbar drives this demo. In the product, there is no panel for this global setting today — real components (Table, Pagination and others) have their own independent compact/comfortable prop set per instance." />}
      >
        <div className="pd-f0-density-demo" data-testid="spacing-density">
          {spacingTokens.density.modes.map((mode) => (
            <div key={mode}>
              <span>{mode}</span>
              <strong>
                <Localized
                  pl={mode === 'compact' ? 'Więcej danych na ekranie' : 'Więcej przestrzeni na wiersz'}
                  en={mode === 'compact' ? 'More data on screen' : 'More room per row'}
                />
              </strong>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="06"
        title={<Localized pl="W praktyce" en="In practice" />}
      >
        <div className="pd-f0-note" data-testid="spacing-practice-scale">
          <Localized
            pl="Do 2026-09-10 realny kod ustawiał padding/margin/gap ręczną liczbą w 1156 miejscach (26 plików) zamiast tokenem ze skali — to był największy tego typu rozjazd w całym audycie (ponad 3× więcej niż 385 przy typografii). Doprowadzone do zgodności: wartości pozaskalowe zaokrąglono do najbliższego kroku skali (0/4/8/12/16/20/24/32/40/48/64/80/96). Pozostawiono celowo: 6 ujemnych marginesów (wzorzec sr-only i zakładka nachodząca na obramowanie — nie są rytmem odstępów, tylko dopasowaniem co do piksela) oraz 2 wartości padding-right (480px/720px) odpowiadające szerokości przypiętego panelu Papy Asystenta, a nie skali odstępów."
            en="Until 2026-09-10, real code set padding/margin/gap with a raw number in 1156 places (26 files) instead of a scale token — the largest such gap in this entire audit (over 3× typography's 385). Brought into alignment: off-scale values were rounded to the nearest scale step (0/4/8/12/16/20/24/32/40/48/64/80/96). Deliberately left alone: 6 negative margins (the sr-only visually-hidden pattern and a tab/border-overlap hack — pixel-exact alignment, not spacing rhythm) and 2 padding-right values (480px/720px) that match the pinned Papa Assistant panel's width, not the spacing scale."
          />
        </div>
        <div className="pd-f0-note" data-testid="spacing-practice-grid">
          <Localized
            pl="Tokeny --pd-grid-columns-wide/tablet/mobile (12/8/4) mają dziś zero użyć w realnym kodzie. Realne ekrany nie używają jednolitej siatki kolumnowej — każdy komponent ma własny, celowy grid-template-columns (np. repeat(2, minmax(0,1fr)) dla kafelków KPI, repeat(4, ...) dla pasków metryk, auto-fit dla siatek kart)."
            en="The --pd-grid-columns-wide/tablet/mobile tokens (12/8/4) have zero real usage today. Real screens do not use a uniform column grid — every component has its own purpose-built grid-template-columns (e.g. repeat(2, minmax(0,1fr)) for KPI tiles, repeat(4, ...) for metric strips, auto-fit for card grids)."
          />
        </div>
        <div className="pd-f0-note" data-testid="spacing-practice-breakpoints">
          <Localized
            pl="Udokumentowane breakpointy (390/768/1440/1920px) praktycznie nie występują w realnym kodzie — realnie jest 26 różnych wartości @media, od 360px do 1500px, dobieranych punktowo przez każdy komponent. Zmiana breakpointu, w przeciwieństwie do promienia czy rozmiaru fontu, zmienia moment przełączenia layoutu, nie tylko jego wygląd — to inna kategoria ryzyka."
            en="The documented breakpoints (390/768/1440/1920px) barely appear in real code — there are actually 26 distinct @media values in use, from 360px to 1500px, chosen per component. Unlike radius or font-size, changing a breakpoint shifts when a layout switches, not just how it looks — a different risk category."
          />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('spacing-scale').children).toHaveLength(spaceEntries.length);
    await expect(canvas.getByTestId('spacing-semantic')).toBeInTheDocument();
    await expect(canvas.getByTestId('spacing-grid').children).toHaveLength(spacingContract.responsiveColumns.desktop);
    await expect(canvas.getByTestId('spacing-breakpoints').children).toHaveLength(breakpointEntries.length);
    await expect(canvas.getByTestId('spacing-density').children).toHaveLength(spacingTokens.density.modes.length);
    await expect(canvas.getByTestId('spacing-practice-scale')).toBeInTheDocument();
    await expect(canvas.getByTestId('spacing-practice-grid')).toBeInTheDocument();
    await expect(canvas.getByTestId('spacing-practice-breakpoints')).toBeInTheDocument();
  },
};
