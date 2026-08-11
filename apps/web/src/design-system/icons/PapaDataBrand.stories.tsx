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
import type {
  PapaDataRuntimeLocale,
} from '../foundations';

import '../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../storybook-next/presentation/StoryPresentation';

const meta = {
  title: '00 Fundamenty/03 Marka',
  component: PapaDataBrand,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    label: 'PapaData logo',
    size: 'large',
    variant: 'lockup',
  },
  argTypes: {
    decorative: {
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

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

type VariantDefinition = {
  readonly description: LocalizedCopy;
  readonly id: string;
  readonly label: LocalizedCopy;
  readonly props: PapaDataBrandProps;
  readonly token: string;
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

const semanticVariants = [
  {
    id: 'lockup',
    label: { pl: 'Lockup informacyjny', en: 'Informational lockup' },
    description: {
      pl: 'Pełny znak z nazwą dostępną dla miejsc, gdzie logo samo identyfikuje produkt.',
      en: 'Full mark with accessible name for places where the logo identifies the product by itself.',
    },
    props: {
      label: 'PapaData logo',
      size: 'small',
      variant: 'lockup',
    },
    token: 'variant="lockup"',
  },
  {
    id: 'mark',
    label: { pl: 'Sygnet', en: 'Mark' },
    description: {
      pl: 'Sam warstwowy znak. Bez kreski pod spodem, zgodnie z wariantem mark-only.',
      en: 'The layered mark alone. No underline, aligned with the mark-only variant.',
    },
    props: {
      label: 'PapaData sygnet',
      size: 'small',
      variant: 'mark',
    },
    token: 'variant="mark"',
  },
  {
    id: 'wordmark',
    label: { pl: 'Wordmark', en: 'Wordmark' },
    description: {
      pl: 'Sam napis PapaData, kiedy kontekst już niesie znak marki.',
      en: 'The PapaData wordmark alone, when context already carries the brand mark.',
    },
    props: {
      label: 'PapaData logotyp',
      size: 'small',
      variant: 'wordmark',
    },
    token: 'variant="wordmark"',
  },
  {
    id: 'decorative',
    label: { pl: 'Dekoracyjny', en: 'Decorative' },
    description: {
      pl: 'Pełny znak jako ozdoba obok treści. Ukryty przed technologiami asystującymi.',
      en: 'Full mark as decoration next to content. Hidden from assistive technology.',
    },
    props: {
      size: 'small',
      variant: 'decorative',
    },
    token: 'aria-hidden',
  },
] satisfies readonly VariantDefinition[];

const brandRules = [
  {
    label: { pl: 'Geometria', en: 'Geometry' },
    value: '100x100',
    token: 'viewBox="0 0 100 100"',
  },
  {
    label: { pl: 'Warstwy', en: 'Layers' },
    value: { pl: '3 stacki', en: '3 stacks' },
    token: 'base / mid / top',
  },
  {
    label: { pl: 'Kolor', en: 'Color' },
    value: { pl: 'projektowy', en: 'design token' },
    token: '--pd-brand',
  },
  {
    label: { pl: 'Interakcja', en: 'Interaction' },
    value: 'center-out',
    token: '::after',
  },
] as const;

const brandPlacementRows = [
  {
    id: 'shell',
    title: { pl: 'App shell', en: 'App shell' },
    detail: {
      pl: 'Stały znak orientacyjny w powłoce produktu.',
      en: 'A stable orientation mark in the product shell.',
    },
    props: {
      label: 'PapaData app shell',
      size: 'small',
      variant: 'lockup',
    },
  },
  {
    id: 'auth',
    title: { pl: 'Auth', en: 'Auth' },
    detail: {
      pl: 'Pełna identyfikacja przy wejściu do aplikacji.',
      en: 'Full identity at the application entry point.',
    },
    props: {
      label: 'PapaData auth',
      size: 'medium',
      variant: 'lockup',
    },
  },
  {
    id: 'empty',
    title: { pl: 'Empty state', en: 'Empty state' },
    detail: {
      pl: 'Sygnet może wspierać pusty stan wysokiego poziomu.',
      en: 'The mark may support a high-level empty state.',
    },
    props: {
      label: 'PapaData empty state',
      size: 'small',
      variant: 'mark',
    },
  },
  {
    id: 'export',
    title: { pl: 'Dokument eksportu', en: 'Export document' },
    detail: {
      pl: 'Wordmark identyfikuje eksport bez przenoszenia UI aplikacji.',
      en: 'The wordmark identifies an export without carrying application UI.',
    },
    props: {
      label: 'PapaData export',
      size: 'small',
      variant: 'wordmark',
    },
  },
] satisfies readonly {
  readonly id: string;
  readonly title: LocalizedCopy;
  readonly detail: LocalizedCopy;
  readonly props: PapaDataBrandProps;
}[];

function StorySection({
  children,
  description,
  eyebrow,
  title,
}: {
  readonly children: ReactNode;
  readonly description: ReactNode;
  readonly eyebrow: string;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-brand-section"
      index={eyebrow}
      summary={description}
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
  return <code className="pd-brand-token">{children}</code>;
}

function renderVariantRow(variant: VariantDefinition) {
  return (
    <article className="pd-brand-row" key={variant.id}>
      <div>
        <h3>{copy(variant.label)}</h3>
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
        {copy(variant.description)}
        <Token>{variant.token}</Token>
      </p>
    </article>
  );
}

export const Marka: Story = {
  name: 'Marka',
  render: (args) => (
    <StoryPresentationPage
      className="pd-brand-system"
      headerAside={(
        <div className="pd-brand-hero__aside">
          <StoryPresentationMeta
            ariaLabel={copy({
              pl: 'Parametry kontraktu marki',
              en: 'Brand contract parameters',
            })}
            items={[
              { label: <Localized pl="Motyw" en="Theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
              { label: <Localized pl="Język" en="Language" />, value: readLocale().toUpperCase() },
              { label: <Localized pl="Warianty" en="Variants" />, value: <Localized pl="4 semantyczne" en="4 semantic" /> },
              { label: 'Status', value: 'accepted' },
            ]}
          />
          <div className="pd-brand-hero__sample">
            <span aria-hidden="true" className="pd-brand-focus-strip" />
            <PapaDataBrand
              {...args}
              data-testid="brand-controlled"
              label="PapaData controlled logo"
              size="large"
              variant="lockup"
            />
          </div>
        </div>
      )}
      sectionCode="00"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="00.12"
      summary={
        <Localized
          pl="Marka identyfikuje produkt i miejsca wysokiego poziomu. Nie definiuje palety danych, powierzchni, ikon ani lokalnego stylu ekranów."
          en="The brand identifies the product and high-level placements. It does not define the data palette, surfaces, icons or local screen style."
        />
      }
      title={<Localized pl="Marka jako identyfikacja produktu." en="Brand as product identity." />}
    >

        <StorySection
          description={<Localized pl="Sygnet i wordmark identyfikują PapaData w shellu, wejściu do aplikacji, eksporcie i miejscach pustych wysokiego poziomu." en="The mark and wordmark identify PapaData in the shell, app entry, exports and high-level empty placements." />}
          eyebrow="01"
          title={<Localized pl="Identyfikacja produktu" en="Product identity" />}
        >
          <div className="pd-brand-language">
            <article className="pd-brand-language__sample">
              <div className="pd-brand-language__line">
                <PapaDataBrand
                  data-testid="brand-language-lockup"
                  label="PapaData logo"
                  size="large"
                  variant="lockup"
                />
              </div>
              <p>
                <Localized
                  pl="Warstwowy sygnet, dwuczęściowy wordmark i kreska hover pozostają częścią jednego komponentu. Kolor marki nie przejmuje roli statusu ani danych."
                  en="The layered mark, two-part wordmark and hover line remain parts of one component. Brand color does not take over status or data roles."
                />
              </p>
            </article>

            <dl className="pd-brand-spec-list">
              {brandRules.map((rule) => (
                <div className="pd-brand-spec-row" key={rule.token}>
                  <dt>{copy(rule.label)}</dt>
                  <dd>
                    <strong>{typeof rule.value === 'string' ? rule.value : copy(rule.value)}</strong>
                    <Token>{rule.token}</Token>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </StorySection>

        <StorySection
          description={<Localized pl="Lockup informacyjny, Sygnet, Wordmark i Dekoracyjny są tym samym znakiem z różną semantyką dostępności." en="Informational lockup, Mark, Wordmark and Decorative are the same identity with different accessibility semantics." />}
          eyebrow="02"
          title={<Localized pl="Warianty komponentu" en="Component variants" />}
        >
          <div className="pd-brand-ledger">
            {semanticVariants.map(renderVariantRow)}
          </div>
        </StorySection>

        <StorySection
          description={<Localized pl="Rozmiary odpowiadają realnym miejscom użycia, tak jak w story ikon i przycisków." en="Sizes map to real usage contexts, like in icon and button stories." />}
          eyebrow="03"
          title={<Localized pl="Rozmiary w produkcie" en="Product sizes" />}
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
                <p><Localized pl="Nawigacja, topbar i zwarte powierzchnie." en="Navigation, topbar and compact surfaces." /></p>
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
                <p><Localized pl="Domyślny lockup dla powłoki aplikacji." en="Default lockup for the application shell." /></p>
              </div>
            </article>
            <article className="pd-brand-size-row">
              <div className="pd-brand-row__sample">
                <PapaDataBrand
                  data-testid="brand-size-large"
                  label="PapaData large"
                  size="large"
                />
              </div>
              <div>
                <h3>Large</h3>
                <p><Localized pl="Ekrany wejściowe i miejsca wysokiego poziomu." en="Entry screens and high-level contexts." /></p>
              </div>
            </article>
          </div>
        </StorySection>

        <StorySection
          description={<Localized pl="Marka pojawia się w miejscach identyfikacji produktu. Nie używamy jej jako ozdobnika lokalnych paneli ani substytutu statusu." en="The brand appears where the product needs identification. It is not used as local panel decoration or a status substitute." />}
          eyebrow="04"
          title={<Localized pl="Miejsca użycia" en="Placements" />}
        >
          <div className="pd-brand-placement-ledger">
            {brandPlacementRows.map((item) => (
              <article className="pd-brand-placement-row" key={item.id}>
                <div className="pd-brand-row__sample">
                  <PapaDataBrand
                    {...item.props}
                    data-testid={`brand-placement-${item.id}`}
                  />
                </div>
                <div>
                  <h3>{copy(item.title)}</h3>
                  <p>{copy(item.detail)}</p>
                </div>
              </article>
            ))}
          </div>
        </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByTestId('brand-controlled'),
    ).toBeInTheDocument();

    await expect(canvas.getByText(copy({ pl: 'Lockup informacyjny', en: 'Informational lockup' }))).toBeInTheDocument();
    await expect(canvas.getByText(copy({ pl: 'Sygnet', en: 'Mark' }))).toBeInTheDocument();
    await expect(canvas.getByText('Wordmark')).toBeInTheDocument();
    await expect(canvas.getByText(copy({ pl: 'Dekoracyjny', en: 'Decorative' }))).toBeInTheDocument();

    const lockup = canvas.getByTestId('brand-language-lockup');
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
