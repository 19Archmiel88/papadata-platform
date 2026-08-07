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

type EffectKind = 'brand' | 'visualization' | 'scrim' | 'depth' | 'premium' | 'chaos';

const effects: ReadonlyArray<{
  readonly kind: EffectKind;
  readonly tone: 'success' | 'critical';
  readonly title: { readonly pl: string; readonly en: string };
  readonly description: { readonly pl: string; readonly en: string };
}> = [
  { kind: 'brand', tone: 'success', title: { pl: 'Gradient zasobu marki', en: 'Brand asset gradient' }, description: { pl: 'Tylko w znaku, ilustracji albo kontrolowanym zasobie marki.', en: 'Only in a mark, illustration or controlled brand asset.' } },
  { kind: 'visualization', tone: 'success', title: { pl: 'Gradient wizualizacji', en: 'Visualization gradient' }, description: { pl: 'Koduje zakres, gęstość albo przedział danych.', en: 'Encodes range, density or a data interval.' } },
  { kind: 'scrim', tone: 'success', title: { pl: 'Scrim warstwy', en: 'Layer scrim' }, description: { pl: 'Oddziela overlay od dokumentu bez dekoracyjnego blur.', en: 'Separates an overlay from the document without decorative blur.' } },
  { kind: 'depth', tone: 'success', title: { pl: 'Techniczna głębia', en: 'Technical depth' }, description: { pl: 'Cień wyłącznie dla rzeczywistej warstwy nakładanej.', en: 'Shadow only for a real overlay layer.' } },
  { kind: 'premium', tone: 'success', title: { pl: 'Powierzchnia premium', en: 'Premium surface' }, description: { pl: 'Wynika z proporcji, typografii, rytmu i jakości danych.', en: 'Comes from proportion, typography, rhythm and data quality.' } },
  { kind: 'chaos', tone: 'critical', title: { pl: 'Dekoracyjny chaos', en: 'Decorative chaos' }, description: { pl: 'Glow, halo, glass i przypadkowy gradient jako domyślne tło AppShell.', en: 'Glow, halo, glass and random gradients as the AppShell default.' } },
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
      <div><ReviewBadge tone="critical"><Localized pl="AppShell" en="AppShell" /></ReviewBadge><h3><Localized pl="Glass, blur i glow są zabronione" en="Glass, blur and glow are forbidden" /></h3><p><Localized pl="Powłoka używa nieprzezroczystych powierzchni, separatorów i jawnych warstw." en="The shell uses opaque surfaces, separators and explicit layers." /></p></div>
      <div><ReviewBadge tone="info"><Localized pl="Poza AppShell" en="Outside AppShell" /></ReviewBadge><h3><Localized pl="Brak decyzji w dokumentacji" en="No decision in documentation" /></h3><p><Localized pl="Nie rozszerzamy glassmorphism na inne obszary bez osobnego kontraktu i akceptacji." en="We do not extend glassmorphism to other areas without a separate contract and approval." /></p></div>
    </div>
  );
}

export function EffectsLaboratory() {
  return (
    <StoryPage handoff={<Localized pl="00.08 — Głębia i warstwy" en="00.08 — Depth and layers" />} id="05.05" title={<Localized pl="Gradienty, światło i szkło" en="Gradients, light and glass" />} summary={<Localized pl="Efekt wizualny jest dozwolony tylko wtedy, gdy ma konkretną funkcję. Dekoracyjne gradienty, glow i glassmorphism są zabronione w AppShell." en="A visual effect is allowed only when it has a specific function. Decorative gradients, glow and glassmorphism are forbidden in AppShell." />} variants={<Localized pl="marka · dane · scrim · warstwa · light/dark" en="brand · data · scrim · layer · light/dark" />}>
      <StorySection index="01" title={<Localized pl="Dozwolone i zakazane zastosowania" en="Allowed and forbidden uses" />}>
        <div className="pd-s55-effect-list">{effects.map((effect) => <EffectSample key={effect.kind} kind={effect.kind} />)}</div>
      </StorySection>
      <StorySection index="02" title={<Localized pl="Light i dark" en="Light and dark" />} summary={<Localized pl="Motyw nie zmienia geometrii i nie potrzebuje neonowego podświetlenia." en="The theme does not change geometry and does not need neon lighting." />}><ThemeEffectPair /></StorySection>
      <StorySection index="03" title={<Localized pl="Decyzja o szkle" en="Glass decision" />}><GlassDecision /></StorySection>
      <StorySection index="04" title={<Localized pl="Decyzja docelowa" en="Target decision" />}>
        <DecisionRows accepted={<Localized pl="Kontrolowany gradient marki lub danych, scrim oraz techniczny cień prawdziwego overlayu." en="Controlled brand or data gradient, scrim and technical shadow of a real overlay." />} rejected={<Localized pl="Glassmorphism, przypadkowy glow, halo i gradient jako domyślne tło AppShell." en="Glassmorphism, random glow, halo and gradients as the default AppShell background." />} />
      </StorySection>
    </StoryPage>
  );
}
