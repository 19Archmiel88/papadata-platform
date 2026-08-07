import { useState } from 'react';

import {
  DecisionRows,
  Localized,
  ReviewBadge,
  StoryPage,
  StorySection,
  copy,
} from './remaining-story-shared';
import './remaining-story-shared.css';
import './separator-laboratory.css';

type LineRole = 'subtle' | 'default' | 'strong' | 'focus' | 'active' | 'danger';

const lineRoles: ReadonlyArray<{
  readonly id: LineRole;
  readonly token: string;
  readonly pl: string;
  readonly en: string;
}> = [
  { id: 'subtle', token: '--pd-separator-subtle', pl: 'Wiersze, nagłówki i podziały wewnętrzne.', en: 'Rows, headers and internal divisions.' },
  { id: 'default', token: '--pd-separator', pl: 'Topbar, sidebar, drawer i główne regiony.', en: 'Topbar, sidebar, drawer and main regions.' },
  { id: 'strong', token: '--pd-separator-strong', pl: 'Mocniejsza granica ważnej powierzchni, nie domyślna ramka kart.', en: 'Stronger boundary of an important surface, not a default card frame.' },
  { id: 'focus', token: '--pd-focus-visible', pl: 'Osobna rola dostępności.', en: 'Separate accessibility role.' },
  { id: 'active', token: '--pd-interactive', pl: 'Aktywna nawigacja albo kontrolka.', en: 'Active navigation or control.' },
  { id: 'danger', token: '--pd-status-danger', pl: 'Status krytyczny, nie zwykły active border.', en: 'Critical status, not an ordinary active border.' },
];

function LineLedger() {
  return (
    <div className="pd-s54-ledger" role="list" aria-label={copy({ pl: 'Role linii', en: 'Line roles' })}>
      {lineRoles.map((role) => (
        <div key={role.id} role="listitem">
          <strong>{role.id}</strong>
          <span className="pd-s54-line" data-role={role.id} aria-hidden="true"><i /><i /><i /></span>
          <code>{role.token}</code>
          <p>{copy(role)}</p>
        </div>
      ))}
    </div>
  );
}

function SeparationMap() {
  const [active, setActive] = useState<'sources' | 'quality' | 'history'>('sources');

  return (
    <div className="pd-s54-map">
      <header><span>PapaData</span><span>Topbar · separator default</span></header>
      <div className="pd-s54-map__body">
        <nav aria-label={copy({ pl: 'Przykładowa nawigacja', en: 'Example navigation' })}>
          {(['sources', 'quality', 'history'] as const).map((item) => (
            <button data-lab-control="section-navigation" key={item} aria-current={active === item ? 'page' : undefined} onClick={() => setActive(item)} type="button">{item === 'sources' ? <Localized pl="Źródła" en="Sources" /> : item === 'quality' ? <Localized pl="Jakość" en="Quality" /> : <Localized pl="Historia" en="History" />}</button>
          ))}
        </nav>
        <section>
          <header><h3><Localized pl="Tabela i wykres" en="Table and chart" /></h3><ReviewBadge tone="warning"><Localized pl="Wymaga uwagi" en="Needs attention" /></ReviewBadge></header>
          <div aria-hidden="true"><span /><span /><span /><span /></div>
        </section>
        <div className="pd-s54-map__drawer"><h3>Drawer</h3><p><Localized pl="Osobna granica regionu i techniczny cień wyłącznie jako warstwa." en="A separate region boundary and technical shadow only as a layer." /></p></div>
      </div>
    </div>
  );
}

function UsageMatrix() {
  const rows = [
    { area: { pl: 'Podział sekcji', en: 'Section division' }, role: 'subtle', rule: { pl: 'Hairline między grupami treści', en: 'Hairline between content groups' } },
    { area: { pl: 'Topbar / sidebar', en: 'Topbar / sidebar' }, role: 'default', rule: { pl: 'Granica regionu powłoki', en: 'Shell region boundary' } },
    { area: { pl: 'Tabela', en: 'Table' }, role: 'subtle', rule: { pl: 'Wiersze i nagłówek bez kratownicy', en: 'Rows and header without a grid cage' } },
    { area: { pl: 'Drawer', en: 'Drawer' }, role: 'default + overlay', rule: { pl: 'Granica warstwy i cień techniczny', en: 'Layer boundary and technical shadow' } },
    { area: { pl: 'Focus', en: 'Focus' }, role: 'focus', rule: { pl: 'Tylko element interaktywny', en: 'Interactive element only' } },
    { area: { pl: 'Alert krytyczny', en: 'Critical alert' }, role: 'danger', rule: { pl: 'Status, nie aktywny wybór', en: 'A status, not an active selection' } },
  ] as const;

  return (
    <div className="pd-s54-usage">
      {rows.map(({ area, role, rule }) => <div key={role}><strong>{copy(area)}</strong><code>{role}</code><p>{copy(rule)}</p></div>)}
    </div>
  );
}

function BorderAntiExample() {
  return (
    <div className="pd-s54-anti">
      <div><span /><span /><span /></div>
      <div><span /><span /><span /></div>
      <p><Localized pl="Każdy element ma tę samą ciężką ramkę; focus, active i danger tracą znaczenie." en="Every element has the same heavy frame; focus, active and danger lose their meaning." /></p>
    </div>
  );
}

export function SeparatorLaboratory() {
  return (
    <StoryPage handoff={<Localized pl="00.07 — Linie i separacja" en="00.07 — Lines and separation" />} id="05.04" status="accepted" title={<Localized pl="Separatory i obramowania" en="Separators and borders" />} summary={<Localized pl="Hairline divider buduje hierarchię. Active, focus i danger zachowują odrębne role i nie zastępują zwykłej granicy regionu." en="Hairline dividers build hierarchy. Active, focus and danger keep distinct roles and do not replace an ordinary region boundary." />} variants="subtle · default · strong · focus · active · danger">
      <StorySection index="01" title={<Localized pl="Poziomy i role linii" en="Line levels and roles" />}><LineLedger /></StorySection>
      <StorySection index="02" title={<Localized pl="Mapa separacji w aplikacji" en="Application separation map" />} summary={<Localized pl="Topbar, sidebar, treść i drawer są rozdzielone rolami, nie kartami wewnątrz kart." en="Topbar, sidebar, content and drawer are separated by roles, not cards inside cards." />}><SeparationMap /></StorySection>
      <StorySection index="03" title={<Localized pl="Katalog zastosowań" en="Usage catalogue" />}><UsageMatrix /></StorySection>
      <StorySection index="04" title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}>
        <DecisionRows accepted={<Localized pl="Separator opisuje hierarchię regionów, a focus, active i danger używają własnych tokenów." en="A separator describes region hierarchy while focus, active and danger use their own tokens." />} rejected={<Localized pl="Każda powierzchnia i każdy wiersz dostają mocną ramkę, przez co statusy i interakcje stają się nierozróżnialne." en="Every surface and row gets a strong frame, making statuses and interactions indistinguishable." />} />
        <BorderAntiExample />
      </StorySection>
    </StoryPage>
  );
}
