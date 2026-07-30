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
  PapaDataBrand,
} from './PapaDataBrand';
import type {
  PapaDataBrandProps,
} from './PapaDataBrand';

const meta = {
  title: '10 Komponenty bazowe/Marka',
  component: PapaDataBrand,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    glow: true,
    label: 'PapaData logo',
    size: 'large',
    variant: 'lockup',
  },
  argTypes: {
    decorative: {
      control: 'boolean',
    },
    glow: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    showMark: {
      control: 'boolean',
    },
    showWordmark: {
      control: 'boolean',
    },
    size: {
      control: 'inline-radio',
      options: [
        'small',
        'medium',
        'large',
      ],
    },
    variant: {
      control: 'inline-radio',
      options: [
        'lockup',
        'mark',
        'wordmark',
        'decorative',
      ],
    },
  },
} satisfies Meta<typeof PapaDataBrand>;

export default meta;

type Story = StoryObj<typeof meta>;

type VariantDefinition = {
  readonly description: ReactNode;
  readonly id: string;
  readonly label: string;
  readonly props: PapaDataBrandProps;
  readonly token: string;
};

const semanticVariants = [
  {
    id: 'lockup',
    label: 'Lockup informacyjny',
    description:
      'Pełny znak z nazwą dostępną dla miejsc, gdzie logo samo identyfikuje produkt.',
    props: {
      label: 'PapaData logo',
      size: 'small',
      variant: 'lockup',
    },
    token: 'variant="lockup"',
  },
  {
    id: 'mark',
    label: 'Sygnet',
    description:
      'Sam warstwowy znak. Bez kreski pod spodem, zgodnie z wariantem mark-only.',
    props: {
      label: 'PapaData sygnet',
      size: 'small',
      variant: 'mark',
    },
    token: 'variant="mark"',
  },
  {
    id: 'wordmark',
    label: 'Wordmark',
    description:
      'Sam napis PapaData, kiedy kontekst już niesie znak marki.',
    props: {
      label: 'PapaData logotyp',
      size: 'small',
      variant: 'wordmark',
    },
    token: 'variant="wordmark"',
  },
  {
    id: 'decorative',
    label: 'Dekoracyjny',
    description:
      'Pełny znak jako ozdoba obok treści. Ukryty przed technologiami asystującymi.',
    props: {
      size: 'small',
      variant: 'decorative',
    },
    token: 'aria-hidden',
  },
] satisfies readonly VariantDefinition[];

const brandRules = [
  {
    label: 'Geometria',
    value: '100x100',
    token: 'viewBox="0 0 100 100"',
  },
  {
    label: 'Warstwy',
    value: '3 stacki',
    token: 'base / mid / top',
  },
  {
    label: 'Kolor',
    value: 'projektowy',
    token: '--pd-brand',
  },
  {
    label: 'Interakcja',
    value: 'center-out',
    token: '::after',
  },
] as const;

function StorySection({
  children,
  description,
  eyebrow,
  title,
}: {
  readonly children: ReactNode;
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}) {
  return (
    <section className="pd-brand-section">
      <header className="pd-brand-section__header">
        <p className="pd-brand-kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}

function Token({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <code className="pd-brand-token">{children}</code>;
}

function renderVariantRow(variant: VariantDefinition) {
  return (
    <article className="pd-brand-row" key={variant.id}>
      <div>
        <h3>{variant.label}</h3>
        <p className="pd-brand-row__meta">
          brand-{variant.id}
        </p>
      </div>
      <div className="pd-brand-row__sample">
        <PapaDataBrand
          {...variant.props}
          data-brand-size="brand-size-small"
          data-testid={`brand-${variant.id}`}
        />
      </div>
      <p>
        {variant.description}
        <Token>{variant.token}</Token>
      </p>
    </article>
  );
}

export const Marka: Story = {
  name: 'Marka',
  render: (args) => (
    <main className="pd-brand-system">
      <div className="pd-brand-system__inner">
        <header className="pd-brand-hero">
          <div>
            <p className="pd-brand-kicker">10.01 Marka</p>
            <h1>PapaDataBrand jako znak systemu.</h1>
            <p className="pd-brand-hero__lead">
              Komponent marki działa jak pozostałe elementy
              design-systemu: bez dekoracyjnych kontenerów, oparty na
              tokenach projektu i sprawdzalny w wariantach semantycznych.
            </p>
          </div>

          <div className="pd-brand-hero__sample">
            <span
              aria-hidden="true"
              className="pd-brand-focus-strip"
            />
            <PapaDataBrand
              {...args}
              data-testid="brand-controlled"
              glow
              label="PapaData controlled logo"
              size="large"
              variant="lockup"
            />
          </div>
        </header>

        <StorySection
          description="Sygnet ma dokładnie trzy warstwy z dostarczonego kodu. Zmieniony jest tylko kolor: zostaje token marki z projektu."
          eyebrow="01"
          title="Język marki"
        >
          <div className="pd-brand-language">
            <article className="pd-brand-language__sample">
              <div className="pd-brand-language__line">
                <PapaDataBrand
                  data-testid="brand-lockup"
                  glow
                  label="PapaData logo"
                  size="large"
                  variant="lockup"
                />
              </div>
              <p>
                Warstwowy sygnet, dwuczęściowy wordmark i kreska hover
                rozchodząca się od środka pozostają częścią jednego
                komponentu.
              </p>
            </article>

            <dl className="pd-brand-spec-list">
              {brandRules.map((rule) => (
                <div className="pd-brand-spec-row" key={rule.token}>
                  <dt>{rule.label}</dt>
                  <dd>
                    <strong>{rule.value}</strong>
                    <Token>{rule.token}</Token>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </StorySection>

        <StorySection
          description="Lockup informacyjny, Sygnet, Wordmark i Dekoracyjny są tym samym znakiem z różną semantyką dostępności."
          eyebrow="02"
          title="Warianty komponentu"
        >
          <div className="pd-brand-ledger">
            {semanticVariants.map(renderVariantRow)}
          </div>
        </StorySection>

        <StorySection
          description="Rozmiary odpowiadają realnym miejscom użycia, tak jak w story ikon i przycisków."
          eyebrow="03"
          title="Rozmiary w produkcie"
        >
          <div className="pd-brand-size-ledger">
            <article className="pd-brand-size-row">
              <div className="pd-brand-row__sample">
                <PapaDataBrand
                  data-testid="brand-size-small"
                  label="PapaData small"
                  size="small"
                />
              </div>
              <div>
                <h3>Small</h3>
                <p>Nawigacja, topbar i zwarte powierzchnie.</p>
              </div>
            </article>
            <article className="pd-brand-size-row">
              <div className="pd-brand-row__sample">
                <PapaDataBrand
                  data-testid="brand-size-medium"
                  label="PapaData medium"
                  size="medium"
                />
              </div>
              <div>
                <h3>Medium</h3>
                <p>Domyślny lockup dla powłoki aplikacji.</p>
              </div>
            </article>
            <article className="pd-brand-size-row">
              <div className="pd-brand-row__sample">
                <PapaDataBrand
                  data-testid="brand-size-large"
                  glow
                  label="PapaData large"
                  size="large"
                />
              </div>
              <div>
                <h3>Large</h3>
                <p>Ekrany wejściowe i miejsca wysokiego poziomu.</p>
              </div>
            </article>
          </div>
        </StorySection>
      </div>
    </main>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('img', {
        name: 'PapaData logo',
      }),
    ).toBeInTheDocument();

    await expect(canvas.getByText('Lockup informacyjny')).toBeInTheDocument();
    await expect(canvas.getByText('Sygnet')).toBeInTheDocument();
    await expect(canvas.getByText('Wordmark')).toBeInTheDocument();
    await expect(canvas.getByText('Dekoracyjny')).toBeInTheDocument();

    const lockup = canvas.getByTestId('brand-lockup');
    const mark = canvas.getByTestId('brand-mark');
    const wordmark = canvas.getByTestId('brand-wordmark');
    const decorative = canvas.getByTestId('brand-decorative');

    await expect(lockup).toHaveAttribute('role', 'img');
    await expect(lockup).toHaveAccessibleName('PapaData logo');
    await expect(lockup).toHaveClass('pd-brand-lockup--lockup');
    await expect(lockup).toHaveClass('pd-brand-lockup--large');
    await expect(lockup.querySelector('svg')).toBeInTheDocument();
    await expect(
      lockup.querySelector('.pd-brand-lockup__wordmark'),
    ).toBeInTheDocument();

    await expect(mark).toHaveAccessibleName('PapaData sygnet');
    await expect(mark).toHaveClass('pd-brand-lockup--mark');
    await expect(mark).toHaveClass('pd-brand-lockup--mark-only');
    await expect(mark.querySelector('svg')).toBeInTheDocument();
    await expect(
      mark.querySelector('.pd-brand-lockup__wordmark'),
    ).not.toBeInTheDocument();

    await expect(wordmark).toHaveAccessibleName('PapaData logotyp');
    await expect(wordmark).toHaveClass('pd-brand-lockup--wordmark');
    await expect(wordmark).toHaveClass(
      'pd-brand-lockup--wordmark-only',
    );
    await expect(wordmark.querySelector('svg')).not.toBeInTheDocument();
    await expect(
      wordmark.querySelector('.pd-brand-lockup__wordmark'),
    ).toBeInTheDocument();

    await expect(decorative).toHaveAttribute('aria-hidden', 'true');
    await expect(decorative).toHaveClass('pd-brand-lockup--decorative');
    await expect(decorative).not.toHaveAttribute('role');
    await expect(decorative).not.toHaveAttribute('aria-label');

    await expect(
      canvas.getByTestId('brand-size-small'),
    ).toHaveClass('pd-brand-lockup--small');
    await expect(
      canvas.getByTestId('brand-size-medium'),
    ).toHaveClass('pd-brand-lockup--medium');
    await expect(
      canvas.getByTestId('brand-size-large'),
    ).toHaveClass('pd-brand-lockup--large');

    const paths = canvasElement.querySelectorAll(
      '.pd-brand-lockup__mark path',
    );

    await expect(paths[0]).toHaveAttribute(
      'd',
      'M50 55 L85 72.5 L50 90 L15 72.5 Z',
    );
    await expect(paths[1]).toHaveAttribute(
      'd',
      'M50 35 L85 52.5 L50 70 L15 52.5 Z',
    );
    await expect(paths[2]).toHaveAttribute(
      'd',
      'M50 15 L85 32.5 L50 50 L15 32.5 Z',
    );

    for (const svg of canvasElement.querySelectorAll(
      '.pd-brand-lockup__mark',
    )) {
      await expect(svg).toHaveAttribute('focusable', 'false');
      await expect(svg).not.toHaveAttribute('tabindex');
    }
  },
};
