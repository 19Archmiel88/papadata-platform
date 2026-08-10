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

import '../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: '00 Fundamenty/Ikony',
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
  home: 'Strona glowna',
  search: 'Wyszukiwanie',
  trend: 'Trend',
  data: 'Dane',
  integration: 'Integracja',
  assistant: 'Assistant',
  security: 'Bezpieczenstwo',
  billing: 'Rozliczenia',
  success: 'Success',
  warning: 'Warning',
} satisfies Record<PapaDataIconName, string>;

const iconCatalogGroups: readonly {
  readonly borderColor: string;
  readonly description: string;
  readonly icons: readonly PapaDataIconName[];
  readonly title: string;
}[] = [
  {
    borderColor: 'var(--pd-separator)',
    description: 'Nawigacja i wyszukiwanie w strukturze produktu.',
    icons: [
      'home',
      'search',
    ],
    title: 'Nawigacja',
  },
  {
    borderColor: 'var(--pd-data-accent)',
    description: 'Metryki, trendy i zbiory danych.',
    icons: [
      'trend',
      'data',
    ],
    title: 'Analityka',
  },
  {
    borderColor: 'var(--pd-brand)',
    description: 'Połączenia, asystent i przepływy automatyzacji.',
    icons: [
      'integration',
      'assistant',
    ],
    title: 'Integracje',
  },
  {
    borderColor: 'var(--pd-interactive)',
    description: 'Operacje konta, rozliczenia i bezpieczeństwo.',
    icons: [
      'billing',
      'security',
    ],
    title: 'Operacje',
  },
  {
    borderColor: 'var(--pd-status-warning)',
    description: 'Statusy pozytywne i ostrzegawcze.',
    icons: [
      'success',
      'warning',
    ],
    title: 'Status',
  },
] as const;

const languageRules = [
  {
    label: 'Geometria',
    value: '24x24',
    token: 'viewBox="0 0 24 24"',
  },
  {
    label: 'Linia',
    value: '1.75',
    token: 'strokeWidth',
  },
  {
    label: 'Zakończenia',
    value: 'round',
    token: 'strokeLinecap',
  },
  {
    label: 'Kolor',
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
      key={group.title}
      style={{
        ...catalogArticleStyle,
        borderTop:
          `var(--pd-border-width-strong) solid ${group.borderColor}`,
      }}
    >
      <header style={semanticTextStyle}>
        <strong>{group.title}</strong>
        <p style={bodySmallStyle}>{group.description}</p>
      </header>
      <div style={catalogListStyle}>
        {group.icons.map((name) => (
          <span key={name} style={catalogItemStyle}>
            <Icon
              data-testid={`icon-catalog-${name}`}
              name={name}
              size={20}
            />
            <span>{iconCategoryLabels[name]}</span>
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
          ariaLabel="Parametry kontraktu ikon"
          items={[
            { label: 'Geometria', value: '24×24' },
            { label: 'Linia', value: '1.75' },
            { label: 'Kolor', value: 'currentColor' },
          ]}
        />
      )}
      sectionCode="10"
      sectionLabel="Komponenty bazowe"
      storyId="10.11"
      summary="Pełny katalog ikon należy do komponentu Icon. Fundamenty definiują wyłącznie reguły geometrii, koloru i znaczenia."
      title="Ikony"
    >

        <StorySection
          index="01"
          title="Język ikon"
          summary="Jedna geometria i jedna grubość linii dla całego produktu."
        >
          <div style={iconLanguageStyle}>
            <article style={iconLanguageSampleStyle}>
              <span style={iconLineStyle}>
                <Icon
                  {...args}
                  data-testid="icon-controlled"
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
                Ikona nie niesie własnego koloru. Znaczenie wynika
                z roli, przycisku, statusu albo kontekstu danych.
              </p>
            </article>
            <dl style={specListStyle}>
              {languageRules.map((rule) => (
                <div key={rule.token} style={specRowStyle}>
                  <dt style={specTermStyle}>{rule.label}</dt>
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
          title="Role semantyczne"
          summary="Ta sama ikona może być dekoracyjna albo informacyjna, ale jej nazwa dostępna wynika z roli."
        >
          <div style={semanticGridStyle}>
            {renderSemanticArticle({
              title: 'Dekoracyjna',
              description:
                'Przy tekście ikona jest ukryta dla czytnika.',
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
              title: 'Informacyjna',
              description:
                'Jeśli ikona sama przekazuje stan, dostaje własną nazwę.',
              icon: (
                <span
                  style={{
                    ...roleIconSampleStyle,
                    color: 'var(--pd-interactive)',
                  }}
                >
                  <Icon
                    label="Security status"
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

        <StorySection index="03" title="Rozmiary w realnym użyciu">
          <div style={sizeLedgerStyle}>
            {renderSizeRow({
              title: '16 px',
              description:
                'Metadane, drobne etykiety i informacje pomocnicze.',
              icon: (
                <>
                  <Icon
                    data-testid="icon-size-16"
                    name="data"
                    size={16}
                    style={{ color: 'var(--pd-data-accent)' }}
                  />
                  <span>CRM</span>
                  <Token>12 rekordów</Token>
                </>
              ),
            })}
            {renderSizeRow({
              title: '20 px',
              description:
                'Przyciski, pozycje menu, listy i nawigacja boczna.',
              icon: (
                <>
                  <Icon
                    data-testid="icon-size-20"
                    name="integration"
                    size={20}
                    style={{ color: 'var(--pd-brand-strong)' }}
                  />
                  <span>Połącz</span>
                </>
              ),
            })}
            {renderSizeRow({
              title: '24 px',
              description:
                'Nagłówki paneli, landmarki i ważne punkty orientacyjne.',
              icon: (
                <>
                  <Icon
                    data-testid="icon-size-24"
                    name="assistant"
                    size={24}
                    style={{ color: 'var(--pd-brand-strong)' }}
                  />
                  <span>Asystent</span>
                </>
              ),
            })}
          </div>
        </StorySection>

        <StorySection
          index="04"
          title="Katalog"
          summary="Ikony są grupowane według zadania, nie według wyglądu."
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
      name: 'Controlled icon',
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
      'Controlled icon',
    );

    await expect(
      canvas.getByRole('img', {
        name: 'Security status',
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
