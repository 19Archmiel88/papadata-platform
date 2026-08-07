import {
  DecisionRows,
  Localized,
  ReviewBadge,
  StoryPage,
  StorySection,
  copy,
} from './remaining-story-shared';
import './remaining-story-shared.css';
import './effects-laboratory.css';

type EffectKind =
  | 'canvas'
  | 'brand'
  | 'visualization'
  | 'scrim'
  | 'depth'
  | 'neutral'
  | 'chaos';

const effects: ReadonlyArray<{
  readonly kind: EffectKind;
  readonly tone: 'success' | 'critical';
  readonly title: { readonly pl: string; readonly en: string };
  readonly description: { readonly pl: string; readonly en: string };
}> = [
  {
    kind: 'canvas',
    tone: 'success',
    title: {
      pl: 'Ambient canvas aplikacji',
      en: 'Application ambient canvas',
    },
    description: {
      pl: 'Jedno globalne tło produktu: ciągłe pola marki i danych w light/dark, bez glow, blur i halo.',
      en: 'One global product background: continuous brand and data fields in light/dark, without glow, blur or halo.',
    },
  },
  {
    kind: 'brand',
    tone: 'success',
    title: {
      pl: 'Gradient zasobu marki',
      en: 'Brand asset gradient',
    },
    description: {
      pl: 'Tylko w znaku, ilustracji albo kontrolowanym zasobie marki.',
      en: 'Only in a mark, illustration or controlled brand asset.',
    },
  },
  {
    kind: 'visualization',
    tone: 'success',
    title: {
      pl: 'Gradient wizualizacji',
      en: 'Visualization gradient',
    },
    description: {
      pl: 'Koduje zakres, gęstość albo przedział danych i korzysta z semantyki danych.',
      en: 'Encodes range, density or a data interval and uses data semantics.',
    },
  },
  {
    kind: 'scrim',
    tone: 'success',
    title: {
      pl: 'Scrim warstwy',
      en: 'Layer scrim',
    },
    description: {
      pl: 'Oddziela overlay od dokumentu bez dekoracyjnego blur.',
      en: 'Separates an overlay from the document without decorative blur.',
    },
  },
  {
    kind: 'depth',
    tone: 'success',
    title: {
      pl: 'Techniczna głębia',
      en: 'Technical depth',
    },
    description: {
      pl: 'Cień wyłącznie dla rzeczywistej warstwy nakładanej.',
      en: 'Shadow only for a real overlay layer.',
    },
  },
  {
    kind: 'neutral',
    tone: 'success',
    title: {
      pl: 'Neutralna powierzchnia',
      en: 'Neutral surface',
    },
    description: {
      pl: 'Jakość powierzchni wynika z proporcji, typografii, rytmu i danych, nie z dekoracyjnego efektu.',
      en: 'Surface quality comes from proportion, typography, rhythm and data, not from decorative effects.',
    },
  },
  {
    kind: 'chaos',
    tone: 'critical',
    title: {
      pl: 'Dekoracyjny chaos',
      en: 'Decorative chaos',
    },
    description: {
      pl: 'Lokalne gradienty powierzchni, glow, halo i glass traktowane jako dekoracja AppShell.',
      en: 'Local surface gradients, glow, halo and glass treated as AppShell decoration.',
    },
  },
];

function EffectSample({ kind }: { readonly kind: EffectKind }) {
  return (
    <article className="pd-s55-effect" data-kind={kind}>
      <div className="pd-s55-effect__preview" aria-hidden="true"><span /><span /><span /></div>
      <header>
        <ReviewBadge tone={kind === 'chaos' ? 'critical' : 'success'}>{kind === 'chaos' ? <Localized pl="Zakaz" en="Forbidden" /> : <Localized pl="Dopuszczone" en="Allowed" />}</ReviewBadge>
        <h3>{copy(effects.find((effect) => effect.kind === kind)?.title ?? { pl: kind, en: kind })}</h3>
      </header>
      <p>{copy(effects.find((effect) => effect.kind === kind)?.description ?? { pl: '', en: '' })}</p>
    </article>
  );
}

function ThemeEffectPair() {
  return (
    <div className="pd-s55-theme-pair">
      <article data-theme="light"><span><Localized pl="Tryb jasny" en="Light mode" /></span><h3><Localized pl="Czytelność bez halo" en="Readable without halo" /></h3><div aria-hidden="true"><i /><i /><i /></div></article>
      <article data-theme="dark"><span><Localized pl="Tryb ciemny" en="Dark mode" /></span><h3><Localized pl="Ta sama geometria" en="The same geometry" /></h3><div aria-hidden="true"><i /><i /><i /></div></article>
    </div>
  );
}

function GlassDecision() {
  return (
    <div className="pd-s55-glass-decision">
      <div>
        <ReviewBadge tone="critical">
          <Localized pl="Powierzchnie AppShell" en="AppShell surfaces" />
        </ReviewBadge>

        <h3>
          <Localized
            pl="Glass, blur i glow powierzchni są zabronione"
            en="Surface glass, blur and glow are forbidden"
          />
        </h3>

        <p>
          <Localized
            pl="AppShell może używać kanonicznego ambient canvasu, ale jego powierzchnie i kontrolki pozostają nieprzezroczyste, bez glassmorphismu i dekoracyjnego blur."
            en="AppShell may use the canonical ambient canvas, but its surfaces and controls remain opaque, without glassmorphism or decorative blur."
          />
        </p>
      </div>

      <div>
        <ReviewBadge tone="info">
          <Localized pl="Poza AppShell" en="Outside AppShell" />
        </ReviewBadge>

        <h3>
          <Localized
            pl="Brak decyzji w dokumentacji"
            en="No decision in documentation"
          />
        </h3>

        <p>
          <Localized
            pl="Nie rozszerzamy glassmorphism na inne obszary bez osobnego kontraktu i akceptacji."
            en="We do not extend glassmorphism to other areas without a separate contract and approval."
          />
        </p>
      </div>
    </div>
  );
}

export function EffectsLaboratory() {
  return (
    <StoryPage handoff={<Localized pl="00.08 — Głębia i warstwy" en="00.08 — Depth and layers" />} id="05.05" status="accepted" title={<Localized pl="Gradienty, światło i szkło" en="Gradients, light and glass" />} summary={<Localized pl="Efekt wizualny jest dozwolony tylko wtedy, gdy ma konkretną funkcję. AppShell używa jednego kanonicznego ambient canvasu; lokalne powierzchnie nie tworzą dekoracyjnych gradientów, glow ani glassmorphismu." en="A visual effect is allowed only when it has a specific function. AppShell uses one canonical ambient canvas; local surfaces do not create decorative gradients, glow or glassmorphism." />} variants={<Localized pl="canvas · marka · dane · scrim · warstwa · light/dark" en="canvas · brand · data · scrim · layer · light/dark" />}>
      <StorySection index="01" title={<Localized pl="Dozwolone i zakazane zastosowania" en="Allowed and forbidden uses" />}>
        <div className="pd-s55-effect-list">{effects.map((effect) => <EffectSample key={effect.kind} kind={effect.kind} />)}</div>
      </StorySection>
      <StorySection index="02" title={<Localized pl="Light i dark" en="Light and dark" />} summary={<Localized pl="Motyw nie zmienia geometrii i nie potrzebuje neonowego podświetlenia." en="The theme does not change geometry and does not need neon lighting." />}><ThemeEffectPair /></StorySection>
      <StorySection index="03" title={<Localized pl="Decyzja o szkle" en="Glass decision" />}><GlassDecision /></StorySection>
      <StorySection index="04" title={<Localized pl="Decyzja docelowa" en="Target decision" />}>
        <DecisionRows accepted={<Localized pl="Kanoniczny ambient canvas aplikacji, kontrolowany gradient marki lub danych, scrim oraz techniczny cień prawdziwego overlayu." en="The canonical application ambient canvas, controlled brand or data gradients, scrim and the technical shadow of a real overlay." />} rejected={<Localized pl="Lokalne dekoracyjne gradienty powierzchni, glassmorphism, przypadkowy glow i halo." en="Local decorative surface gradients, glassmorphism, random glow and halo." />} />
      </StorySection>
    </StoryPage>
  );
}
