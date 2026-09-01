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
        summary={<Localized pl="Przełącznik Gęstość w toolbarze steruje wysokością kontrolek i wierszy w całym produkcie." en="The Density toggle in the toolbar drives control and row height across the whole product." />}
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
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('spacing-scale').children).toHaveLength(spaceEntries.length);
    await expect(canvas.getByTestId('spacing-semantic')).toBeInTheDocument();
    await expect(canvas.getByTestId('spacing-grid').children).toHaveLength(spacingContract.responsiveColumns.desktop);
    await expect(canvas.getByTestId('spacing-breakpoints').children).toHaveLength(breakpointEntries.length);
    await expect(canvas.getByTestId('spacing-density').children).toHaveLength(spacingTokens.density.modes.length);
  },
};
