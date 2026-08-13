import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  CSSProperties,
  ReactNode,
} from 'react';

import {
  PapaDataBrand,
} from '../../../design-system/icons';
import '../../presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../presentation/StoryPresentation';
import './premium-surface-direction.css';

const meta = {
  title: '00 Fundamenty/03 Kierunek premium surface',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

function readLocale(): 'pl' | 'en' {
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

function PremiumFoundationPage({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <StoryPresentationPage
      headerAside={
        <StoryPresentationMeta
          ariaLabel={copy({
            pl: 'Parametry kierunku premium surface',
            en: 'Premium surface direction parameters',
          })}
          items={[
            { label: <Localized pl="Motyw" en="Theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
            { label: <Localized pl="Brand" en="Brand" />, value: 'PapaData' },
            { label: <Localized pl="Kontury" en="Contours" />, value: <Localized pl="Wycofane" en="Removed" /> },
          ]}
        />
      }
      sectionCode="00.03"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      summary={
        <Localized
          pl="Docelowy kierunek dla jasnego i ciemnego trybu: jeden ultranowoczesny materiał, wyraźna gra cieniem, bez konturowej konteneryzacji. Zostaje logotyp PapaData; reszta języka marki wynika z tokenów."
          en="Target direction for light and dark mode: one ultramodern material, explicit depth through shadow, no contour-heavy containerization. The PapaData logo remains; the rest of the brand language comes from tokens."
        />
      }
      title={<Localized pl="Premium surface direction" en="Premium surface direction" />}
    >
      {children}
    </StoryPresentationPage>
  );
}

const rules = [
  {
    index: '01',
    title: { pl: 'Jedna powierzchnia', en: 'One surface' },
    text: {
      pl: 'Canvas, panel i komunikat mają wyglądać jak poziomy tego samego materiału, nie jak osobne pudełka.',
      en: 'Canvas, panel and message should feel like levels of the same material, not separate boxes.',
    },
  },
  {
    index: '02',
    title: { pl: 'Cień zamiast obwódki', en: 'Shadow over outline' },
    text: {
      pl: 'Separacja ma wynikać z wysokości i kontrastu powierzchni. Kontur zostaje tylko jako awaryjny separator danych.',
      en: 'Separation should come from elevation and surface contrast. Contours remain only as fallback data separators.',
    },
  },
  {
    index: '03',
    title: { pl: 'Kolor jako sygnał', en: 'Color as signal' },
    text: {
      pl: 'Paleta nie dekoruje. Copper prowadzi markę i akcje, zielony odpowiada za dane, reszta tonuje stany.',
      en: 'The palette is not decoration. Copper owns brand/action, green owns data, remaining tones support states.',
    },
  },
] as const;

const tokens = [
  {
    name: '--pd-canvas',
    label: { pl: 'Canvas premium', en: 'Premium canvas' },
    color: 'var(--pd-canvas)',
  },
  {
    name: '--pd-surface-panel',
    label: { pl: 'Główna powierzchnia', en: 'Main surface' },
    color: 'var(--pd-surface-panel)',
  },
  {
    name: '--pd-brand-accent',
    label: { pl: 'Akcent marki', en: 'Brand accent' },
    color: 'var(--pd-brand-accent)',
  },
  {
    name: '--pd-data-accent',
    label: { pl: 'Akcent danych', en: 'Data accent' },
    color: 'var(--pd-data-accent)',
  },
] as const;

const checkpoints = [
  {
    index: 'A',
    title: { pl: 'Logotyp zostaje', en: 'Logo stays' },
    text: {
      pl: 'Nie wymieniamy znaku PapaData. Zmieniamy środowisko wizualne wokół niego: materiał, tło, cień i ton.',
      en: 'The PapaData mark is not replaced. The visual environment around it changes: material, background, shadow and tone.',
    },
  },
  {
    index: 'B',
    title: { pl: 'Mniej kontenerów', en: 'Fewer containers' },
    text: {
      pl: 'Komunikaty, metryki i bloki danych grupujemy przez rytm i wysokość, nie przez kolejne ramki.',
      en: 'Messages, metrics and data blocks are grouped by rhythm and elevation, not by more frames.',
    },
  },
  {
    index: 'C',
    title: { pl: 'Tryb ciemny bez chaosu', en: 'Dark mode without chaos' },
    text: {
      pl: 'Ciemny motyw jest grafitowo-perłowy z jedną osią copper/emerald. Nie używa przypadkowych, równorzędnych kolorów.',
      en: 'Dark mode is graphite-pearl with one copper/emerald axis. It avoids random equally loud colors.',
    },
  },
  {
    index: 'D',
    title: { pl: 'Storybook jako źródło prawdy', en: 'Storybook as source of truth' },
    text: {
      pl: 'Ten wzorzec ma być kopiowany do fundamentów, wykresów, wzorców i powłoki produktu przez tokeny, nie lokalne override’y.',
      en: 'This pattern should flow into foundations, charts, patterns and product shell through tokens, not local overrides.',
    },
  },
] as const;

function PremiumSurfacePreview({
  theme,
}: {
  readonly theme: 'light' | 'dark';
}) {
  return (
    <article className="pd-f0-premium-surface" data-theme={theme}>
      <header>
        <span className="pd-f0-premium-eyebrow">
          {theme === 'light'
            ? <Localized pl="Tryb jasny" en="Light mode" />
            : <Localized pl="Tryb ciemny" en="Dark mode" />}
        </span>
        <h3><Localized pl="Jedna powierzchnia robocza" en="One working surface" /></h3>
        <p>
          <Localized
            pl="Widoczna hierarchia bez obwódki. Panel czyta się jako premium materiał, a nie kolejna karta w karcie."
            en="Visible hierarchy without an outline. The panel reads as premium material, not another card inside a card."
          />
        </p>
      </header>
      <div className="pd-f0-premium-surface__metric">
        <div>
          <span><Localized pl="Przychód netto" en="Net revenue" /></span>
          <strong>1 248 590 zł</strong>
        </div>
        <span>+12.8%</span>
      </div>
      <div className="pd-f0-premium-surface__shadow-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </article>
  );
}

export const KierunekPremiumSurface: Story = {
  name: 'Kierunek premium surface',
  render: () => (
    <PremiumFoundationPage>
      <StoryPresentationSection
        index="01"
        title={<Localized pl="Założenie marki" en="Brand premise" />}
        summary={
          <Localized
            pl="Zachowujemy logotyp PapaData i budujemy wokół niego spokojny, brandingowy system materiału."
            en="The PapaData logo stays; the surrounding brand system becomes a calm premium material language."
          />
        }
      >
        <div className="pd-f0-premium-hero">
          <div className="pd-f0-premium-hero__copy">
            <div>
              <span className="pd-f0-premium-eyebrow">PapaData / premium foundation</span>
              <h3><Localized pl="Cień, materiał, precyzja" en="Shadow, material, precision" /></h3>
              <p>
                <Localized
                  pl="To jest baza dla całego Storybooka: mniej pudełek, mniej konturów, więcej spójnego materiału i kontrolowanej głębi."
                  en="This is the base for the whole Storybook: fewer boxes, fewer contours, more coherent material and controlled depth."
                />
              </p>
            </div>
          </div>
          <aside className="pd-f0-premium-brand-panel" aria-label={copy({ pl: 'Podgląd logotypu PapaData', en: 'PapaData logo preview' })}>
            <PapaDataBrand size="large" variant="lockup" />
            <span><Localized pl="Jedyny element marki pozostawiony bez wymiany" en="The only brand element retained without replacement" /></span>
          </aside>
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="02"
        title={<Localized pl="Reguły wizualne" en="Visual rules" />}
        summary={<Localized pl="Te zasady mają obowiązywać w jasnym i ciemnym trybie oraz w kolejnych sekcjach Storybooka." en="These rules apply to light and dark mode and to the following Storybook sections." />}
      >
        <div className="pd-f0-premium-rule-grid">
          {rules.map((rule) => (
            <article className="pd-f0-premium-rule" key={rule.index}>
              <span>{rule.index}</span>
              <h3>{copy(rule.title)}</h3>
              <p>{copy(rule.text)}</p>
            </article>
          ))}
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="03"
        title={<Localized pl="Jasny i ciemny materiał" en="Light and dark material" />}
        summary={<Localized pl="Oba tryby używają tej samej zasady: perłowy/grafitowy canvas, ciepły copper marki i zielony akcent danych." en="Both themes use the same principle: pearl/graphite canvas, warm brand copper and green data accent." />}
      >
        <div className="pd-f0-premium-theme-grid">
          <PremiumSurfacePreview theme="light" />
          <PremiumSurfacePreview theme="dark" />
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="04"
        title={<Localized pl="Tokeny do propagacji" en="Tokens to propagate" />}
        summary={<Localized pl="Poniższe tokeny są rdzeniem zmian dla fundamentów, komunikatów, wykresów i powłoki produktu." en="The following tokens are the core of the foundation, messaging, chart and product shell update." />}
      >
        <div className="pd-f0-premium-token-grid">
          {tokens.map((token) => (
            <article className="pd-f0-premium-token" key={token.name}>
              <i style={{ '--token-color': token.color } as CSSProperties} />
              <h3>{copy(token.label)}</h3>
              <code>{token.name}</code>
            </article>
          ))}
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection
        index="05"
        title={<Localized pl="Kontrola jakości" en="Quality checklist" />}
        summary={<Localized pl="Każda kolejna sekcja ma przejść przez te cztery decyzje przed dopracowaniem UI." en="Every following section should pass through these four decisions before visual polish." />}
      >
        <div className="pd-f0-premium-checkpoint-grid">
          {checkpoints.map((checkpoint) => (
            <article className="pd-f0-premium-checkpoint" key={checkpoint.index}>
              <span>{checkpoint.index}</span>
              <h3>{copy(checkpoint.title)}</h3>
              <p>{copy(checkpoint.text)}</p>
            </article>
          ))}
        </div>
      </StoryPresentationSection>
    </PremiumFoundationPage>
  ),
};
