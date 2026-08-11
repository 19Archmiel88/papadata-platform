import type {
  CSSProperties,
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
  Icon,
  papaDataIconNames,
  type PapaDataIconName,
} from './Icon';
import type {
  PapaDataRuntimeLocale,
} from '../foundations';

import '../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: '00 Fundamenty/04 Ikony',
  component: Icon,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    decorative: false,
    label: 'Controlled icon',
    name: 'home',
    size: 20,
  },
  argTypes: {
    decorative: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    name: {
      control: 'select',
      options: papaDataIconNames,
    },
    size: {
      control: 'inline-radio',
      options: [
        16,
        20,
        24,
      ],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function Localized({
  pl,
  en,
}: LocalizedCopy) {
  return <>{copy({ pl, en })}</>;
}

const sectionSummaryStyle = {
  margin: 0,
  color: 'var(--pd-text-secondary)',
} satisfies CSSProperties;

const iconLanguageStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
  gap: 'var(--pd-space-6)',
  alignItems: 'stretch',
} satisfies CSSProperties;

const iconLanguageSampleStyle = {
  display: 'grid',
  alignContent: 'space-between',
  gap: 'var(--pd-space-6)',
  minHeight: '190px',
  padding: 'var(--pd-space-6) 0 var(--pd-space-6) var(--pd-space-5)',
  borderTop: 'var(--pd-border-width-strong) solid var(--pd-brand)',
  borderBottom:
    'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
  borderLeft: 'var(--pd-border-width-strong) solid var(--pd-brand)',
  background:
    'linear-gradient(90deg, color-mix(in srgb, var(--pd-brand) 10%, transparent), transparent 42%)',
} satisfies CSSProperties;

const iconLineStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--pd-space-3)',
  alignItems: 'center',
  color: 'var(--pd-brand-strong)',
} satisfies CSSProperties;

const previewIconStyle = {
  width: '38px',
  height: '38px',
  padding: 'var(--pd-space-2)',
  borderBottom: 'var(--pd-border-width-strong) solid currentColor',
} satisfies CSSProperties;

const specListStyle = {
  display: 'grid',
  gap: 0,
  margin: 0,
  borderTop:
    'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
} satisfies CSSProperties;

const specRowStyle = {
  display: 'grid',
  gridTemplateColumns: '128px minmax(0, 1fr)',
  gap: 'var(--pd-space-4)',
  alignItems: 'center',
  padding: 'var(--pd-space-4) 0',
  borderBottom:
    'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
} satisfies CSSProperties;

const specTermStyle = {
  color: 'var(--pd-text-muted)',
  fontSize: 'var(--pd-type-size-caption)',
} satisfies CSSProperties;

const specDescriptionStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--pd-space-2)',
  alignItems: 'baseline',
  margin: 0,
} satisfies CSSProperties;

const tokenStyle = {
  display: 'inline-block',
  color: 'var(--pd-text-muted)',
  fontFamily: 'var(--pd-font-mono)',
  fontSize: 'var(--pd-type-size-caption)',
  fontWeight: 'var(--pd-font-weight-regular)',
  overflowWrap: 'anywhere',
} satisfies CSSProperties;

const semanticGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 'var(--pd-space-6)',
} satisfies CSSProperties;

const semanticArticleStyle = {
  display: 'grid',
  gridTemplateColumns: '76px minmax(0, 1fr)',
  gap: 'var(--pd-space-4)',
  alignItems: 'flex-start',
  minHeight: '168px',
  padding: 'var(--pd-space-5) 0',
  borderTop:
    'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
  background: 'transparent',
} satisfies CSSProperties;

const semanticTextStyle = {
  display: 'grid',
  gap: 'var(--pd-space-2)',
} satisfies CSSProperties;

const roleIconSampleStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--pd-space-2)',
  alignItems: 'center',
  color: 'var(--pd-text-secondary)',
} satisfies CSSProperties;

const bodySmallStyle = {
  margin: 0,
  color: 'var(--pd-text-secondary)',
  fontSize: 'var(--pd-type-size-body-small)',
  lineHeight: 'var(--pd-line-height-normal)',
} satisfies CSSProperties;

const sizeLedgerStyle = {
  display: 'grid',
  gap: 0,
  borderTop:
    'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
} satisfies CSSProperties;

const sizeLedgerRowStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
  gap: 'var(--pd-space-5)',
  alignItems: 'center',
  minHeight: '118px',
  padding: 'var(--pd-space-5) 0',
  borderBottom:
    'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
} satisfies CSSProperties;

const sizeSampleStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--pd-space-3)',
  alignItems: 'center',
  minHeight: '64px',
  color: 'var(--pd-text-secondary)',
} satisfies CSSProperties;

const catalogGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 'var(--pd-space-6)',
} satisfies CSSProperties;

const catalogArticleStyle = {
  display: 'grid',
  gap: 'var(--pd-space-4)',
  minHeight: '188px',
  padding: 'var(--pd-space-5) 0',
  borderTop:
    'var(--pd-border-width-strong) solid var(--pd-separator-subtle)',
  background: 'transparent',
} satisfies CSSProperties;

const catalogListStyle = {
  display: 'grid',
  gap: 0,
} satisfies CSSProperties;

const catalogItemStyle = {
  display: 'grid',
  gridTemplateColumns: '28px minmax(0, 1fr) auto',
  gap: 'var(--pd-space-3)',
  alignItems: 'center',
  minHeight: '40px',
  borderBottom:
    'var(--pd-border-width-subtle) solid var(--pd-separator-subtle)',
  color: 'var(--pd-text-secondary)',
} satisfies CSSProperties;

const iconCategoryLabels = {
  home: { pl: 'Strona główna', en: 'Home' },
  search: { pl: 'Wyszukiwanie', en: 'Search' },
  trend: { pl: 'Trend', en: 'Trend' },
  data: { pl: 'Dane', en: 'Data' },
  integration: { pl: 'Integracja', en: 'Integration' },
  assistant: { pl: 'Asystent', en: 'Assistant' },
  security: { pl: 'Bezpieczeństwo', en: 'Security' },
  billing: { pl: 'Rozliczenia', en: 'Billing' },
  success: { pl: 'Sukces', en: 'Success' },
  warning: { pl: 'Ostrzeżenie', en: 'Warning' },
} satisfies Record<PapaDataIconName, LocalizedCopy>;

const iconCatalogGroups: readonly {
  readonly borderColor: string;
  readonly description: LocalizedCopy;
  readonly icons: readonly PapaDataIconName[];
  readonly title: LocalizedCopy;
}[] = [
  {
    borderColor: 'var(--pd-separator)',
    description: {
      pl: 'Nawigacja i wyszukiwanie w strukturze produktu.',
      en: 'Navigation and search in the product structure.',
    },
    icons: [
      'home',
      'search',
    ],
    title: { pl: 'Nawigacja', en: 'Navigation' },
  },
  {
    borderColor: 'var(--pd-data-accent)',
    description: {
      pl: 'Metryki, trendy i zbiory danych.',
      en: 'Metrics, trends and datasets.',
    },
    icons: [
      'trend',
      'data',
    ],
    title: { pl: 'Analityka', en: 'Analytics' },
  },
  {
    borderColor: 'var(--pd-brand)',
    description: {
      pl: 'Połączenia, asystent i przepływy automatyzacji.',
      en: 'Connections, assistant and automation flows.',
    },
    icons: [
      'integration',
      'assistant',
    ],
    title: { pl: 'Integracje', en: 'Integrations' },
  },
  {
    borderColor: 'var(--pd-interactive)',
    description: {
      pl: 'Operacje konta, rozliczenia i bezpieczeństwo.',
      en: 'Account operations, billing and security.',
    },
    icons: [
      'billing',
      'security',
    ],
    title: { pl: 'Operacje', en: 'Operations' },
  },
  {
    borderColor: 'var(--pd-status-warning)',
    description: {
      pl: 'Statusy pozytywne i ostrzegawcze.',
      en: 'Positive and warning statuses.',
    },
    icons: [
      'success',
      'warning',
    ],
    title: { pl: 'Status', en: 'Status' },
  },
] as const;

const languageRules = [
  {
    label: { pl: 'Geometria', en: 'Geometry' },
    value: '24x24',
    token: 'viewBox="0 0 24 24"',
  },
  {
    label: { pl: 'Linia', en: 'Line' },
    value: '1.75',
    token: 'strokeWidth',
  },
  {
    label: { pl: 'Zakończenia', en: 'Caps' },
    value: 'round',
    token: 'strokeLinecap',
  },
  {
    label: { pl: 'Kolor', en: 'Color' },
    value: 'currentColor',
    token: 'inherit',
  },
] as const;

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
      className="pd-icon-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function Token({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <code style={tokenStyle}>{children}</code>;
}

function renderCatalogGroup(group: typeof iconCatalogGroups[number]) {
  return (
    <article
      key={group.title.pl}
      style={{
        ...catalogArticleStyle,
        borderTop:
          `var(--pd-border-width-strong) solid ${group.borderColor}`,
      }}
    >
      <header style={semanticTextStyle}>
        <strong>{copy(group.title)}</strong>
        <p style={bodySmallStyle}>{copy(group.description)}</p>
      </header>
      <div style={catalogListStyle}>
        {group.icons.map((name) => (
          <span key={name} style={catalogItemStyle}>
            <Icon
              data-testid={`icon-catalog-${name}`}
              name={name}
              size={20}
            />
            <span>{copy(iconCategoryLabels[name])}</span>
            <Token>{name}</Token>
          </span>
        ))}
      </div>
    </article>
  );
}

function renderSemanticArticle({
  children,
  description,
  icon,
  title,
}: {
  readonly children: ReactNode;
  readonly description: ReactNode;
  readonly icon: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <article style={semanticArticleStyle}>
      {icon}
      <div style={semanticTextStyle}>
        <strong>{title}</strong>
        <p style={bodySmallStyle}>{description}</p>
        {children}
      </div>
    </article>
  );
}

function renderSizeRow({
  description,
  icon,
  title,
}: {
  readonly description: ReactNode;
  readonly icon: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <article style={sizeLedgerRowStyle}>
      <div style={sizeSampleStyle}>{icon}</div>
      <div style={semanticTextStyle}>
        <strong>{title}</strong>
        <p style={bodySmallStyle}>{description}</p>
      </div>
    </article>
  );
}

export const Ikony: Story = {
  name: 'Ikony',
  render: (args) => (
    <StoryPresentationPage
      className="pd-icon-system"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({
            pl: 'Parametry kontraktu ikon',
            en: 'Icon contract parameters',
          })}
          items={[
            { label: <Localized pl="Motyw" en="Theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
            { label: <Localized pl="Język" en="Language" />, value: readLocale().toUpperCase() },
            { label: <Localized pl="Kolor" en="Color" />, value: 'currentColor' },
          ]}
        />
      )}
      sectionCode="00"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="00.13"
      summary={
        <Localized
          pl="04 Ikony pokazuje publiczny komponent Icon, katalog nazw i realne zastosowania. 01 Fundamenty wizualne definiują tylko reguły geometrii, koloru i znaczenia."
          en="04 Icons shows the public Icon component, name catalog and real usage. 01 Visual foundations define only geometry, color and meaning rules."
        />
      }
      title={<Localized pl="Icon jako katalog runtime." en="Icon as the runtime catalog." />}
    >

        <StorySection
          index="01"
          title={<Localized pl="Kontrakt komponentu" en="Component contract" />}
          summary={<Localized pl="Icon dziedziczy kolor z kontekstu i zachowuje jedną geometrię dla całego produktu." en="Icon inherits color from context and keeps one geometry for the entire product." />}
        >
          <div style={iconLanguageStyle}>
            <article style={iconLanguageSampleStyle}>
              <span style={iconLineStyle}>
                <Icon
                  {...args}
                  data-testid="icon-controlled"
                  label={copy({ pl: 'Ikona kontrolowana', en: 'Controlled icon' })}
                  size={24}
                  style={previewIconStyle}
                />
                <Icon
                  decorative
                  name="search"
                  size={24}
                  style={previewIconStyle}
                />
                <Icon
                  decorative
                  name="trend"
                  size={24}
                  style={{
                    ...previewIconStyle,
                    color: 'var(--pd-data-accent)',
                  }}
                />
                <Icon
                  decorative
                  name="data"
                  size={24}
                  style={{
                    ...previewIconStyle,
                    color: 'var(--pd-data-accent)',
                  }}
                />
              </span>
              <p style={sectionSummaryStyle}>
                <Localized
                  pl="Ikona nie niesie własnego koloru. Znaczenie wynika z roli, przycisku, statusu albo kontekstu danych."
                  en="An icon does not carry its own color. Meaning comes from role, button, status or data context."
                />
              </p>
            </article>
            <dl style={specListStyle}>
              {languageRules.map((rule) => (
                <div key={rule.token} style={specRowStyle}>
                  <dt style={specTermStyle}>{copy(rule.label)}</dt>
                  <dd style={specDescriptionStyle}>
                    <strong>{rule.value}</strong>
                    <Token>{rule.token}</Token>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </StorySection>

        <StorySection
          index="02"
          title={<Localized pl="Dostępność i znaczenie" en="Accessibility and meaning" />}
          summary={<Localized pl="Ta sama ikona może być dekoracyjna albo informacyjna, ale jej nazwa dostępna wynika z roli w interfejsie." en="The same icon can be decorative or informative, but its accessible name follows its interface role." />}
        >
          <div style={semanticGridStyle}>
            {renderSemanticArticle({
              title: <Localized pl="Dekoracyjna" en="Decorative" />,
              description: <Localized pl="Przy tekście ikona jest ukryta dla czytnika." en="Next to text, the icon is hidden from screen readers." />,
              icon: (
                <span
                  data-testid="icon-decorative"
                  style={{
                    ...roleIconSampleStyle,
                    color: 'var(--pd-data-accent)',
                  }}
                >
                  <Icon
                    decorative
                    name="trend"
                    size={24}
                    style={previewIconStyle}
                  />
                </span>
              ),
              children: <Token>aria-hidden</Token>,
            })}

            {renderSemanticArticle({
              title: <Localized pl="Informacyjna" en="Informative" />,
              description: <Localized pl="Jeśli ikona sama przekazuje stan, dostaje własną nazwę." en="When the icon itself communicates state, it receives its own name." />,
              icon: (
                <span
                  style={{
                    ...roleIconSampleStyle,
                    color: 'var(--pd-interactive)',
                  }}
                >
                  <Icon
                    label={copy({ pl: 'Status bezpieczeństwa', en: 'Security status' })}
                    name="security"
                    size={24}
                    style={previewIconStyle}
                  />
                </span>
              ),
              children: <Token>{'<title>'}</Token>,
            })}
          </div>
        </StorySection>

        <StorySection index="03" title={<Localized pl="Rozmiary w realnym użyciu" en="Sizes in real use" />}>
          <div style={sizeLedgerStyle}>
            {renderSizeRow({
              title: '16 px',
              description: <Localized pl="Metadane, drobne etykiety i informacje pomocnicze." en="Metadata, small labels and helper information." />,
              icon: (
                <>
                  <Icon
                    data-testid="icon-size-16"
                    name="data"
                    size={16}
                    style={{ color: 'var(--pd-data-accent)' }}
                  />
                  <span>CRM</span>
                  <Token>{copy({ pl: '12 rekordów', en: '12 records' })}</Token>
                </>
              ),
            })}
            {renderSizeRow({
              title: '20 px',
              description: <Localized pl="Przyciski, pozycje menu, listy i nawigacja boczna." en="Buttons, menu items, lists and side navigation." />,
              icon: (
                <>
                  <Icon
                    data-testid="icon-size-20"
                    name="integration"
                    size={20}
                    style={{ color: 'var(--pd-brand-strong)' }}
                  />
                  <span><Localized pl="Połącz" en="Connect" /></span>
                </>
              ),
            })}
            {renderSizeRow({
              title: '24 px',
              description: <Localized pl="Nagłówki paneli, landmarki i ważne punkty orientacyjne." en="Panel headers, landmarks and important orientation points." />,
              icon: (
                <>
                  <Icon
                    data-testid="icon-size-24"
                    name="assistant"
                    size={24}
                    style={{ color: 'var(--pd-brand-strong)' }}
                  />
                  <span><Localized pl="Asystent" en="Assistant" /></span>
                </>
              ),
            })}
          </div>
        </StorySection>

        <StorySection
          index="04"
          title={<Localized pl="Katalog" en="Catalog" />}
          summary={<Localized pl="Ikony są grupowane według zadania, nie według wyglądu. Ikony z przyszłych bibliotek trafiają do tego rejestru albo pozostają lokalnym assetem biblioteki, jeśli nie są częścią języka produktu." en="Icons are grouped by task, not by appearance. Icons from future libraries enter this registry or remain a local library asset when they are not part of the product language." />}
        >
          <div style={catalogGridStyle}>
            {iconCatalogGroups.map(renderCatalogGroup)}
          </div>
        </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const controlled = canvas.getByRole('img', {
      name: copy({ pl: 'Ikona kontrolowana', en: 'Controlled icon' }),
    });
    await expect(controlled).toHaveAttribute(
      'focusable',
      'false',
    );
    await expect(controlled).toHaveAttribute('role', 'img');
    await expect(controlled).toHaveAttribute(
      'aria-labelledby',
    );
    await expect(controlled).not.toHaveAttribute('aria-label');
    await expect(controlled).toHaveAttribute(
      'stroke',
      'currentColor',
    );

    const controlledTitleId =
      controlled.getAttribute('aria-labelledby');
    const controlledTitle =
      controlledTitleId
        ? canvasElement.ownerDocument.getElementById(
            controlledTitleId,
          )
        : null;

    expect(controlledTitle?.textContent).toBe(
      copy({ pl: 'Ikona kontrolowana', en: 'Controlled icon' }),
    );

    await expect(
      canvas.getByRole('img', {
        name: copy({ pl: 'Status bezpieczeństwa', en: 'Security status' }),
      }),
    ).toBeInTheDocument();

    const decorative =
      canvas.getByTestId('icon-decorative')
        .querySelector('svg');

    if (!decorative) {
      throw new Error('Decorative icon is not rendered.');
    }

    await expect(decorative).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(decorative).not.toHaveAttribute('role');
    await expect(decorative).not.toHaveAttribute(
      'aria-labelledby',
    );

    await expect(
      canvas.getByTestId('icon-size-16'),
    ).toHaveAttribute('width', '16');
    await expect(
      canvas.getByTestId('icon-size-20'),
    ).toHaveAttribute('width', '20');
    await expect(
      canvas.getByTestId('icon-size-24'),
    ).toHaveAttribute('width', '24');

    for (const iconName of papaDataIconNames) {
      await expect(
        canvas.getByTestId(`icon-catalog-${iconName}`),
      ).toHaveAttribute('width', '20');
    }

    for (const svg of canvasElement.querySelectorAll('svg')) {
      await expect(svg).toHaveAttribute(
        'focusable',
        'false',
      );
      await expect(svg).not.toHaveAttribute('tabindex');
    }
  },
};
