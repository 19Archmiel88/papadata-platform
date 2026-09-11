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
  surfaceStyleContract,
  surfaceStyleTokens,
} from './surface-style';

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
  title: 'DESIGN SYSTEM/Fundamenty/Promienie, obramowania i cienie',
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
      className="pd-surface-style-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const radiusEntries = Object.keys(surfaceStyleTokens.radius) as ReadonlyArray<
  keyof typeof surfaceStyleTokens.radius
>;

const shadowEntries = Object.keys(surfaceStyleTokens.shadow) as ReadonlyArray<
  keyof typeof surfaceStyleTokens.shadow
>;

const borderRoles: ReadonlyArray<{
  readonly key: 'subtle' | 'default' | 'interactive' | 'danger';
  readonly label: LocalizedCopy;
}> = [
  { key: 'subtle', label: { pl: 'Subtelny separator', en: 'Subtle separator' } },
  { key: 'default', label: { pl: 'Domyślny separator', en: 'Default separator' } },
  { key: 'interactive', label: { pl: 'Interaktywny (focus/hover ramka)', en: 'Interactive (focus/hover outline)' } },
  { key: 'danger', label: { pl: 'Niebezpieczny (błąd walidacji)', en: 'Danger (validation error)' } },
];

const rules: ReadonlyArray<{
  readonly rule: keyof typeof surfaceStyleContract.rules;
  readonly label: LocalizedCopy;
}> = [
  { rule: 'ordinarySectionsUseShadow', label: { pl: 'Zwykłe sekcje strony nie używają cienia — hierarchię buduje separator, nie głębia.', en: 'Ordinary page sections do not use shadow — the separator builds hierarchy, not depth.' } },
  { rule: 'overlaysMayUseShadow', label: { pl: 'Tylko overlaye (modal, popover, drawer, toast) mogą używać cienia.', en: 'Only overlays (modal, popover, drawer, toast) may use shadow.' } },
  { rule: 'focusFloorIsRequired', label: { pl: 'Każdy interaktywny element ma widoczny pierścień fokusu — to nie jest opcjonalne.', en: 'Every interactive element has a visible focus ring — this is never optional.' } },
  { rule: 'radiusDependsOnComponentRole', label: { pl: 'Promień zależy od roli komponentu (kontrolka, powierzchnia, overlay, pill), nie od jego rozmiaru.', en: 'Radius depends on the component role (control, surface, overlay, pill), not its size.' } },
  { rule: 'excessiveRoundingIsForbidden', label: { pl: 'Nadmierne zaokrąglenie poza kontraktem jest zabronione.', en: 'Excessive rounding outside the contract is forbidden.' } },
];

export const PromienieIObramowania: Story = {
  name: 'Promienie, obramowania i cienie',
  render: () => (
    <StoryPresentationPage
      className="pd-surface-style-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry powierzchni', en: 'Surface style parameters' })}
          items={[
            { label: <Localized pl="Promienie" en="Radius steps" />, value: String(radiusEntries.length) },
            { label: <Localized pl="Cienie" en="Shadow steps" />, value: String(shadowEntries.length) },
            { label: <Localized pl="Szerokości obramowań" en="Border widths" />, value: surfaceStyleContract.borderWidths.join(' / ') },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="surface-style"
      summary={
        <Localized
          pl="Promień, obramowanie i cień razem definiują, jak powierzchnia komunikuje swoją rolę i głębię w interfejsie."
          en="Radius, border and shadow together define how a surface communicates its role and depth in the interface."
        />
      }
      title={<Localized pl="Głębia jest wyjątkiem, nie domyślnym stanem." en="Depth is the exception, not the default." />}
    >
      <StorySection
        index="01"
        title={<Localized pl="Promienie" en="Radius" />}
        summary={<Localized pl="Od none po pill — każdy krok ma jedną rolę komponentu." en="From none to pill — every step maps to one component role." />}
      >
        <div className="pd-f0-radius-strip" data-testid="surface-radius">
          {radiusEntries.map((key) => (
            <div key={key}>
              <span data-radius={key} />
              <strong>{key}</strong>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="02"
        title={<Localized pl="Obramowania" en="Borders" />}
      >
        <div className="pd-f0-icon-groups" data-testid="surface-borders">
          {borderRoles.map((role) => (
            <article key={role.key}>
              <h3>{copy(role.label)}</h3>
              <div>
                <span className="pd-f0-border-sample" data-border={role.key} />
              </div>
            </article>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="03"
        title={<Localized pl="Cienie" en="Shadows" />}
        summary={<Localized pl="Cień oznacza uniesienie nad płaszczyzną strony — używany oszczędnie." en="Shadow signals lift above the page plane — used sparingly." />}
      >
        <div className="pd-f0-shadow-strip" data-testid="surface-shadows">
          {shadowEntries.map((key) => (
            <div key={key}>
              <span data-shadow={key === 'raised' || key === 'floating' ? 'overlay' : key} />
              <strong>{key}</strong>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="04"
        title={<Localized pl="Pierścień fokusu" en="Focus ring" />}
        summary={<Localized pl="Fokus jest zbudowany z tego samego tokenu we wszystkich komponentach interaktywnych." en="Focus is built from the same token across every interactive component." />}
      >
        <div className="pd-f0-icon-line" data-testid="surface-focus">
          <span>
            <button
              type="button"
              style={{
                minHeight: '36px',
                padding: '0 16px',
                border: `var(--pd-border-width-subtle) solid var(--pd-separator)`,
                borderRadius: surfaceStyleTokens.radius.control,
                outline: `var(--pd-focus-width) solid ${surfaceStyleTokens.focus.line}`,
                outlineOffset: 'var(--pd-focus-offset)',
                background: 'var(--pd-surface)',
                color: 'var(--pd-text)',
              }}
            >
              <Localized pl="Przykładowy fokus" en="Sample focus" />
            </button>
          </span>
        </div>
      </StorySection>

      <StorySection
        index="05"
        title={<Localized pl="Reguły kontraktu" en="Contract rules" />}
      >
        <div className="pd-f0-decision-list" data-testid="surface-rules">
          {rules.map((entry) => (
            <div key={entry.rule}>
              <strong>{entry.rule}</strong>
              <p>{copy(entry.label)}</p>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection
        index="06"
        title={<Localized pl="W praktyce" en="In practice" />}
      >
        <div className="pd-f0-ledger" data-testid="surface-practice-contract">
          <div className="pd-f0-ledger__row">
            <span className="pd-f0-ledger__label"><Localized pl="Dozwolone promienie (px)" en="Allowed radius values (px)" /></span>
            <span className="pd-f0-ledger__value">{surfaceStyleContract.allowedRadiusValues.join(' / ')}</span>
          </div>
        </div>

        <div className="pd-f0-note" data-testid="surface-practice-radius">
          <Localized
            pl="Do 2026-09-10 ponad 100 miejsc w realnym kodzie (screens/runtime/app) ustawiało border-radius ręczną liczbą zamiast zmienną --pd-radius-* — część trafiała przypadkiem w wartość z kontraktu, reszta była spoza skali (organiczny bałagan wielu rąk, nie świadomie rozszerzona skala). Doprowadzone do zgodności: każde miejsce dziś odwołuje się do tokenu, wartości spoza skali zaokrąglono do najbliższego kroku wg roli komponentu. Warto wiedzieć: role small i control nadal rozwiązują się do tej samej wartości (6px) — nieszkodliwy zbieg, nie błąd."
            en="Until 2026-09-10, 100+ places in real code (screens/runtime/app) set border-radius with a raw number instead of the --pd-radius-* variable — some happened to land on a contract value, the rest were off-scale (organic drift from many hands, not a deliberately extended scale). Brought into alignment: every place now references a token, with off-scale values rounded to the nearest step by component role. Worth knowing: the small and control roles still resolve to the same value (6px) — a harmless coincidence, not a bug."
          />
        </div>

        <div className="pd-f0-note" data-testid="surface-practice-shadow">
          <Localized
            pl="Cień jest czysty — realny kod nigdzie nie omija już --pd-shadow-* (ostatnie 2 wyjątki, podpowiedź wykresu recharts i .pd-shell-anchored-overlay, naprawione 2026-09-10)."
            en="Shadow is clean — real code no longer bypasses --pd-shadow-* anywhere (the last 2 exceptions, the recharts tooltip and .pd-shell-anchored-overlay, were fixed on 2026-09-10)."
          />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('surface-radius').children).toHaveLength(radiusEntries.length);
    await expect(canvas.getByTestId('surface-borders').children).toHaveLength(borderRoles.length);
    await expect(canvas.getByTestId('surface-shadows').children).toHaveLength(shadowEntries.length);
    await expect(canvas.getByTestId('surface-focus')).toBeInTheDocument();
    await expect(canvas.getByTestId('surface-rules').children).toHaveLength(rules.length);
    await expect(canvas.getByTestId('surface-practice-contract')).toBeInTheDocument();
    await expect(canvas.getByTestId('surface-practice-radius')).toBeInTheDocument();
    await expect(canvas.getByTestId('surface-practice-shadow')).toBeInTheDocument();
  },
};
