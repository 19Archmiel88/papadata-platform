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
    title: { pl: 'Ambient canvas aplikacji', en: 'Application ambient canvas' },
    description: {
      pl: 'Jedno globalne tło workspace. Motyw treści nie zmienia ciemnego Dark Crystal Shell.',
      en: 'One global workspace canvas. The content theme does not change the dark Dark Crystal Shell.',
    },
  },
  {
    kind: 'brand',
    tone: 'success',
    title: { pl: 'Gradient zasobu marki', en: 'Brand asset gradient' },
    description: {
      pl: 'Kontrolowany gradient marki pozostaje dopuszczony w znaku, ilustracji i powierzchniach brandowych.',
      en: 'A controlled brand gradient remains allowed in marks, illustrations and brand surfaces.',
    },
  },
  {
    kind: 'visualization',
    tone: 'success',
    title: { pl: 'Gradient wizualizacji', en: 'Visualization gradient' },
    description: {
      pl: 'Koduje zakres, gęstość albo przedział danych i korzysta z semantyki danych.',
      en: 'Encodes range, density or a data interval and uses data semantics.',
    },
  },
  {
    kind: 'scrim',
    tone: 'success',
    title: { pl: 'Scrim warstwy', en: 'Layer scrim' },
    description: {
      pl: 'Oddziela modalną warstwę od dokumentu i nie zastępuje focus management.',
      en: 'Separates a modal layer from the document and does not replace focus management.',
    },
  },
  {
    kind: 'depth',
    tone: 'success',
    title: { pl: 'Dark Crystal', en: 'Dark Crystal' },
    description: {
      pl: 'Shell może używać kontrolowanej przezroczystości, blur, refrakcyjnego obramowania, refleksu i technicznej głębi.',
      en: 'The shell may use controlled transparency, blur, refractive borders, highlights and technical depth.',
    },
  },
  {
    kind: 'neutral',
    tone: 'success',
    title: { pl: 'Neutralny workspace', en: 'Neutral workspace' },
    description: {
      pl: 'Workspace pozostaje czytelny w light/dark i jest wizualnie niezależny od zawsze ciemnego shella.',
      en: 'The workspace stays readable in light/dark and remains visually independent from the always-dark shell.',
    },
  },
  {
    kind: 'chaos',
    tone: 'critical',
    title: { pl: 'Niekontrolowany efekt', en: 'Uncontrolled effect' },
    description: {
      pl: 'Zakazane są lokalne prywatne palety crystal, neonowy glow i efekty bez wspólnego tokenowego ownera.',
      en: 'Private local crystal palettes, neon glow and effects without a shared token owner are forbidden.',
    },
  },
];

function EffectSample({ kind }: { readonly kind: EffectKind }) {
  const effect = effects.find((item) => item.kind === kind);
  return (
    <article className="pd-s55-effect" data-kind={kind}>
      <div className="pd-s55-effect__preview" aria-hidden="true"><span /><span /><span /></div>
      <header>
        <ReviewBadge tone={kind === 'chaos' ? 'critical' : 'success'}>
          {kind === 'chaos'
            ? <Localized pl="Zakaz" en="Forbidden" />
            : <Localized pl="Dopuszczone" en="Allowed" />}
        </ReviewBadge>
        <h3>{copy(effect?.title ?? { pl: kind, en: kind })}</h3>
      </header>
      <p>{copy(effect?.description ?? { pl: '', en: '' })}</p>
    </article>
  );
}

function ThemeEffectPair() {
  return (
    <div className="pd-s55-theme-pair">
      <article data-theme="light"><span><Localized pl="Workspace jasny" en="Light workspace" /></span><h3><Localized pl="Dark Crystal pozostaje ciemny" en="Dark Crystal stays dark" /></h3><div aria-hidden="true"><i /><i /><i /></div></article>
      <article data-theme="dark"><span><Localized pl="Workspace ciemny" en="Dark workspace" /></span><h3><Localized pl="Ta sama geometria shella" en="The same shell geometry" /></h3><div aria-hidden="true"><i /><i /><i /></div></article>
    </div>
  );
}

function GlassDecision() {
  return (
    <div className="pd-s55-glass-decision">
      <div>
        <ReviewBadge tone="success"><Localized pl="Dark Crystal Shell" en="Dark Crystal Shell" /></ReviewBadge>
        <h3><Localized pl="Glass, blur i refleks są kontrolowaną częścią shella" en="Glass, blur and highlights are controlled shell tools" /></h3>
        <p><Localized pl="Topbar, Sidebar i shell-owned overlays pozostają ciemne niezależnie od motywu workspace i korzystają ze wspólnego kontraktu tokenów." en="Topbar, Sidebar and shell-owned overlays stay dark regardless of workspace theme and use one shared token contract." /></p>
      </div>
      <div>
        <ReviewBadge tone="critical"><Localized pl="Granica" en="Boundary" /></ReviewBadge>
        <h3><Localized pl="Bez neonowego chaosu" en="No neon chaos" /></h3>
        <p><Localized pl="Efekt nie może obniżać kontrastu, maskować focusu ani tworzyć osobnych lokalnych systemów wizualnych." en="Effects must not reduce contrast, hide focus or create separate local visual systems." /></p>
      </div>
    </div>
  );
}

export function EffectsLaboratory() {
  return (
    <StoryPage
      handoff={<Localized pl="00.08 — Głębia i warstwy" en="00.08 — Depth and layers" />}
      id="05.05"
      status="accepted"
      title={<Localized pl="Gradienty, światło i szkło" en="Gradients, light and glass" />}
      summary={<Localized pl="Dark Crystal jest kanonicznym kontraktem powłoki: kontrolowana przezroczystość, blur, refrakcja i głębia są dozwolone w shellu, przy zachowaniu czytelności i semantyki warstw." en="Dark Crystal is the canonical shell contract: controlled transparency, blur, refraction and depth are allowed while preserving readability and layer semantics." />}
      variants={<Localized pl="canvas · marka · dane · Dark Crystal · light/dark" en="canvas · brand · data · Dark Crystal · light/dark" />}
    >
      <StorySection index="01" title={<Localized pl="Dozwolone i zakazane zastosowania" en="Allowed and forbidden uses" />}>
        <div className="pd-s55-effect-list">{effects.map((effect) => <EffectSample key={effect.kind} kind={effect.kind} />)}</div>
      </StorySection>
      <StorySection index="02" title={<Localized pl="Workspace i shell" en="Workspace and shell" />} summary={<Localized pl="Motyw workspace nie przełącza Dark Crystal na jasną powierzchnię." en="The workspace theme does not switch Dark Crystal to a light surface." />}><ThemeEffectPair /></StorySection>
      <StorySection index="03" title={<Localized pl="Decyzja o szkle" en="Glass decision" />}><GlassDecision /></StorySection>
      <StorySection index="04" title={<Localized pl="Decyzja docelowa" en="Target decision" />}>
        <DecisionRows
          accepted={<Localized pl="Wspólny Dark Crystal Shell z kontrolowaną przezroczystością, blur, refrakcją, refleksami i techniczną głębią." en="One shared Dark Crystal Shell with controlled transparency, blur, refraction, highlights and technical depth." />}
          rejected={<Localized pl="Losowe lokalne efekty, neonowy glow, utrata kontrastu oraz light overlay wewnątrz ciemnego shella." en="Random local effects, neon glow, lost contrast and light overlays inside the dark shell." />}
        />
      </StorySection>
    </StoryPage>
  );
}
