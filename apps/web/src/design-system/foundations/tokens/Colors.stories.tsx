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
  colorContract,
  colorTokens,
} from './colors';
import {
  dataSeriesTokens,
} from './seriesColor';

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
  title: 'DESIGN SYSTEM/Fundamenty/Kolory i statusy',
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
      className="pd-color-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const brandRoles: ReadonlyArray<{
  readonly key: keyof typeof colorTokens.brand;
  readonly swatch: 'brand' | 'interactive' | 'data' | 'status';
  readonly label: LocalizedCopy;
}> = [
  { key: 'main', swatch: 'brand', label: { pl: 'Marka — podstawowy', en: 'Brand — main' } },
  { key: 'deep', swatch: 'brand', label: { pl: 'Marka — głęboki', en: 'Brand — deep' } },
  { key: 'strong', swatch: 'brand', label: { pl: 'Marka — mocny', en: 'Brand — strong' } },
  { key: 'action', swatch: 'brand', label: { pl: 'Akcja podstawowa', en: 'Primary action' } },
  { key: 'actionHover', swatch: 'brand', label: { pl: 'Akcja — hover', en: 'Action — hover' } },
  { key: 'accent', swatch: 'brand', label: { pl: 'Akcent marki', en: 'Brand accent' } },
];

const surfaceRoles: ReadonlyArray<{
  readonly key: keyof typeof colorTokens.semantic;
  readonly label: LocalizedCopy;
}> = [
  { key: 'canvas', label: { pl: 'Tło aplikacji', en: 'App canvas' } },
  { key: 'surface', label: { pl: 'Powierzchnia', en: 'Surface' } },
  { key: 'surfaceRaised', label: { pl: 'Powierzchnia uniesiona', en: 'Raised surface' } },
  { key: 'surfaceOverlay', label: { pl: 'Powierzchnia overlay', en: 'Overlay surface' } },
  { key: 'text', label: { pl: 'Tekst podstawowy', en: 'Primary text' } },
  { key: 'textSecondary', label: { pl: 'Tekst drugorzędny', en: 'Secondary text' } },
  { key: 'textMuted', label: { pl: 'Tekst wyciszony', en: 'Muted text' } },
  { key: 'separator', label: { pl: 'Separator', en: 'Separator' } },
  { key: 'interactive', label: { pl: 'Interaktywny', en: 'Interactive' } },
  { key: 'focusVisible', label: { pl: 'Pierścień fokusu', en: 'Focus ring' } },
];

const statusRoles: ReadonlyArray<{
  readonly key: keyof typeof colorTokens.semantic;
  readonly subtleKey: keyof typeof colorTokens.semantic;
  readonly tone: string;
  readonly label: LocalizedCopy;
}> = [
  { key: 'statusSuccess', subtleKey: 'statusSuccessSubtle', tone: 'success', label: { pl: 'Sukces', en: 'Success' } },
  { key: 'statusWarning', subtleKey: 'statusWarningSubtle', tone: 'warning', label: { pl: 'Ostrzeżenie', en: 'Warning' } },
  { key: 'statusDanger', subtleKey: 'statusDangerSubtle', tone: 'danger', label: { pl: 'Krytyczny', en: 'Danger' } },
  { key: 'statusInfo', subtleKey: 'statusInfoSubtle', tone: 'info', label: { pl: 'Informacja', en: 'Info' } },
  { key: 'statusNeutral', subtleKey: 'statusNeutralSubtle', tone: 'neutral', label: { pl: 'Neutralny', en: 'Neutral' } },
];

const contractRules: ReadonlyArray<{
  readonly rule: keyof typeof colorContract.rules;
  readonly label: LocalizedCopy;
}> = [
  { rule: 'colorIsNeverTheOnlySignal', label: { pl: 'Kolor nigdy nie jest jedynym nośnikiem informacji — zawsze towarzyszy mu ikona, etykieta lub tekst.', en: 'Color is never the only signal — it is always paired with an icon, label or text.' } },
  { rule: 'brandIsSeparateFromDataAndStatusSemantics', label: { pl: 'Kolor marki jest oddzielony od semantyki danych i statusów — różowy nie oznacza „dobrze” ani „źle”.', en: 'Brand color is separate from data and status semantics — pink never means "good" or "bad".' } },
  { rule: 'neutralSurfacesRemainDominant', label: { pl: 'Powierzchnie neutralne dominują w layoucie; kolor akcentuje, nie wypełnia.', en: 'Neutral surfaces dominate the layout; color accents, it does not fill.' } },
  { rule: 'decorativeNeonIsForbidden', label: { pl: 'Dekoracyjny neon i nasycone tęczowe akcenty są zabronione.', en: 'Decorative neon and saturated rainbow accents are forbidden.' } },
  { rule: 'cssVariablesAreRuntimeSource', label: { pl: 'Zmienne CSS (--pd-*) są jedynym źródłem prawdy w runtime — tokeny TS je tylko nazywają.', en: 'CSS variables (--pd-*) are the single runtime source of truth — TS tokens only name them.' } },
];

export const KoloryIStatusy: Story = {
  name: 'Kolory i statusy',
  render: () => (
    <StoryPresentationPage
      className="pd-color-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry kontraktu kolorów', en: 'Color contract parameters' })}
          items={[
            { label: <Localized pl="Motywy" en="Themes" />, value: colorContract.themes.join(' / ') },
            { label: <Localized pl="Role semantyczne" en="Semantic roles" />, value: String(colorContract.semanticRoles.length) },
            { label: <Localized pl="Role marki" en="Brand roles" />, value: String(colorContract.brandRoles.length) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="colors"
      summary={
        <Localized
          pl="Paleta marki, powierzchnie semantyczne, statusy i seria kolorów danych. Wszystkie wartości pochodzą z żywych zmiennych --pd-* i reagują na przełącznik motywu w toolbarze."
          en="Brand palette, semantic surfaces, statuses and the data-series scale. Every value comes from live --pd-* variables and reacts to the theme toggle in the toolbar."
        />
      }
      title={<Localized pl="Kolor niesie znaczenie, nie dekorację." en="Color carries meaning, not decoration." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Marka" en="Brand" />}
        summary={<Localized pl="Różowy PapaData jest zarezerwowany dla akcji podstawowych i akcentów marki — nigdy dla statusu danych." en="PapaData pink is reserved for primary actions and brand accents — never for data status." />}
      >
        <div className="pd-f0-icon-line" data-testid="color-brand-roles">
          {brandRoles.map((role) => (
            <span key={role.key}>
              <span className="pd-f0-swatch" data-color={role.swatch} style={{ background: colorTokens.brand[role.key] }} />
              {copy(role.label)}
              <code className="pd-f0-color-value">--pd-brand{role.key === 'main' ? '' : `-${role.key.replace(/([A-Z])/g, '-$1').toLowerCase()}`}</code>
            </span>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Powierzchnie i tekst" en="Surfaces and text" />}
        summary={<Localized pl="Powierzchnie neutralne budują hierarchię — canvas, surface, surface uniesiona, overlay." en="Neutral surfaces build the hierarchy — canvas, surface, raised surface, overlay." />}
      >
        <div className="pd-f0-icon-groups" data-testid="color-surface-roles">
          {surfaceRoles.map((role) => (
            <article key={role.key}>
              <h3>{copy(role.label)}</h3>
              <div>
                <span className="pd-f0-color-chip" data-color={role.key === 'canvas' ? 'canvas' : role.key === 'surface' || role.key === 'surfaceRaised' || role.key === 'surfaceOverlay' ? 'surface' : role.key === 'text' ? 'text' : role.key === 'textSecondary' || role.key === 'textMuted' ? 'secondary' : role.key === 'separator' ? 'separator' : role.key === 'interactive' ? 'interactive' : 'focus'} style={{ background: colorTokens.semantic[role.key] }} />
                <code className="pd-f0-color-value">{colorTokens.semantic[role.key]}</code>
              </div>
            </article>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Statusy" en="Statuses" />}
        summary={<Localized pl="Każdy status ma wersję pełną (tekst/ikona) i przytłumioną (tło odznaki/pasa)." en="Every status has a full variant (text/icon) and a subtle one (badge/strip background)." />}
      >
        <div className="pd-f0-series" data-testid="color-status-roles">
          {statusRoles.map((role) => (
            <div key={role.key}>
              <span style={{ background: colorTokens.semantic[role.key] }} />
              <div>
                <strong>{copy(role.label)}</strong>
                <code>{colorTokens.semantic[role.key]} / {colorTokens.semantic[role.subtleKey]}</code>
              </div>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="04"
        title={<Localized pl="Seria danych (wykresy)" en="Data series (charts)" />}
        summary={<Localized pl="10-kolorowa paleta cyklicznie przypisywana seriom przez resolveSeriesColor(index). Nigdy nie przypisuj koloru serii ręcznie na sztywno." en="A 10-color palette assigned cyclically to series via resolveSeriesColor(index). Never hardcode a series color by hand." />}
      >
        <div className="pd-f0-icon-line" data-testid="color-series">
          {dataSeriesTokens.map((token, index) => (
            <span key={token}>
              <span className="pd-f0-swatch" data-color="data" style={{ background: token }} />
              {`S${index + 1}`}
            </span>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="05"
        title={<Localized pl="Reguły kontraktu" en="Contract rules" />}
      >
        <div className="pd-f0-decision-list" data-testid="color-rules">
          {contractRules.map((entry) => (
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

    await expect(canvas.getByTestId('color-brand-roles')).toBeInTheDocument();
    await expect(canvas.getByTestId('color-surface-roles')).toBeInTheDocument();
    await expect(canvas.getByTestId('color-status-roles')).toBeInTheDocument();
    await expect(canvas.getByTestId('color-series').querySelectorAll('.pd-f0-swatch')).toHaveLength(dataSeriesTokens.length);
    await expect(canvas.getByTestId('color-rules').children).toHaveLength(contractRules.length);
  },
};
