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
  papaDataThemes,
} from './theme-contract';

import type {
  LocalizedCopy,
} from '../../../storybook-next/presentation/storyLocalization';
import {
  Localized,
  copy,
  readTheme,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: 'DESIGN SYSTEM/Fundamenty/Motyw',
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
      className="pd-theme-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const themeMetrics: ReadonlyArray<{
  readonly label: LocalizedCopy;
  readonly value: string;
}> = [
  { label: { pl: 'Przychód', en: 'Revenue' }, value: '284 120 zł' },
  { label: { pl: 'Zamówienia', en: 'Orders' }, value: '1 842' },
  { label: { pl: 'ROAS', en: 'ROAS' }, value: '3,4x' },
];

export const Motyw: Story = {
  name: 'Motyw',
  render: () => (
    <StoryPresentationPage
      className="pd-theme-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry motywu', en: 'Theme parameters' })}
          items={[
            { label: <Localized pl="Aktywny motyw" en="Active theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
            { label: <Localized pl="Dostępne motywy" en="Available themes" />, value: papaDataThemes.join(' / ') },
            { label: <Localized pl="Plik canonical" en="Canonical file" />, value: 'refractive-prism.css' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="themes"
      summary={
        <Localized
          pl="Jasny i ciemny motyw dzielą jeden zestaw ról semantycznych — zmienia się tylko wartość zmiennej CSS, nigdy struktura komponentu. Przełącz motyw w toolbarze, aby zobaczyć różnicę na żywo."
          en="Light and dark share one set of semantic roles — only the CSS variable value changes, never the component structure. Switch the theme in the toolbar to see the difference live."
        />
      }
      title={<Localized pl="Jeden kontrakt, dwa motywy." en="One contract, two themes." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Aktywny motyw na żywo" en="Active theme, live" />}
        summary={<Localized pl="Ta karta korzysta z tych samych zmiennych --pd-*, których używa produkt — motyw zmienia się razem z przełącznikiem w toolbarze." en="This card uses the same --pd-* variables the product uses — it follows the toolbar's theme toggle." />}
      >
        <div className="pd-f0-theme-sample" data-testid="theme-live-sample">
          <div>
            <span><Localized pl="Motyw" en="Theme" /></span>
            <strong>{readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" />}</strong>
          </div>
          <div className="pd-f0-metric-strip" style={{ flex: 1 }}>
            {themeMetrics.map((metric) => (
              <div key={metric.value}>
                <span>{copy(metric.label)}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="pd-f0-mini-chart">
          {[38, 62, 44, 80, 56, 70].map((value, index) => (
            <span
              key={index}
              style={{
                height: `${Math.round((value / 100) * 96)}px`,
                background: 'var(--pd-data-accent)',
              }}
            />
          ))}
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Historia motywów" en="Theme history" />}
      >
        <div className="pd-f0-note" data-testid="theme-note">
          <Localized
            pl="Wcześniejszy motyw carbon-pearl.css został usunięty jako martwy kod — nie był importowany przez żaden plik i został zastąpiony przez refractive-prism.css."
            en="The earlier carbon-pearl.css theme was removed as dead code — it was not imported anywhere and has been replaced by refractive-prism.css."
          />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('theme-live-sample')).toBeInTheDocument();
    await expect(canvas.getByTestId('theme-note')).toBeInTheDocument();
  },
};
