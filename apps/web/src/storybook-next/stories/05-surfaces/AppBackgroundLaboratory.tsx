import { useState } from 'react';

import { Button } from '../../../design-system/components';
import { Icon, PapaDataBrand } from '../../../design-system/icons';
import {
  DecisionRows,
  Localized,
  ReviewBadge,
  StoryPage,
  StorySection,
  copy,
} from './remaining-story-shared';
import './remaining-story-shared.css';
import './app-background-laboratory.css';

type ShellVariant = 'sidebar' | 'no-sidebar' | 'papa' | 'compact';

const shellVariants: ReadonlyArray<{
  readonly id: ShellVariant;
  readonly pl: string;
  readonly en: string;
}> = [
  { id: 'sidebar', pl: 'Z sidebarem', en: 'With sidebar' },
  { id: 'no-sidebar', pl: 'Bez sidebara', en: 'Without sidebar' },
  { id: 'papa', pl: 'Panel Papa', en: 'Papa panel' },
  { id: 'compact', pl: 'Compact rail', en: 'Compact rail' },
];

function ShellCanvas({
  variant,
}: {
  readonly variant: ShellVariant;
}) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [papaOpen, setPapaOpen] = useState(variant === 'papa');
  const hasSidebar = variant !== 'no-sidebar';
  const compact = variant === 'compact';
  const panelVisible = variant === 'papa' && papaOpen;
  const selectedVariant = shellVariants.find(({ id }) => id === variant);
  const shellContext = {
    pl: `wariant ${selectedVariant?.pl ?? variant}`,
    en: `${selectedVariant?.en ?? variant} variant`,
  };

  return (
    <div className="pd-s52-shell" data-variant={variant}>
      <header className="pd-s52-shell__topbar">
        <PapaDataBrand size="small" />
        <span className="pd-s52-shell__topbar-copy"><Localized pl="Sticky topbar · nieprzezroczysta powierzchnia" en="Sticky topbar · opaque surface" /></span>
        <ReviewBadge tone="success"><Localized pl="Dane aktualne" en="Fresh data" /></ReviewBadge>
      </header>

      <div className="pd-s52-shell__body">
        {hasSidebar ? (
          <nav
            className="pd-s52-shell__nav"
            aria-label={copy({
              pl: `Nawigacja demonstracyjna — ${shellContext.pl}`,
              en: `Demo navigation — ${shellContext.en}`,
            })}
          >
            {['dashboard', 'campaigns', 'orders', 'customers'].map((item, index) => (
              <button
                data-lab-control="shell-navigation"
                key={item}
                aria-current={activeNav === item ? 'page' : undefined}
                className="pd-s52-shell__nav-item"
                onClick={() => setActiveNav(item)}
                type="button"
              >
                {compact ? <Icon decorative name={index === 0 ? 'home' : index === 1 ? 'trend' : index === 2 ? 'data' : 'security'} size={20} /> : null}
                <span>{copy({
                  pl: index === 0 ? 'Dashboard' : index === 1 ? 'Kampanie' : index === 2 ? 'Zamówienia' : 'Klienci',
                  en: index === 0 ? 'Dashboard' : index === 1 ? 'Campaigns' : index === 2 ? 'Orders' : 'Customers',
                })}</span>
              </button>
            ))}
          </nav>
        ) : null}

        <section
          className="pd-s52-shell__content"
          aria-label={copy({
            pl: `Region treści — ${shellContext.pl}`,
            en: `Content region — ${shellContext.en}`,
          })}
        >
          <header className="pd-s52-shell__content-header">
            <div>
              <span><Localized pl="Region treści" en="Content region" /></span>
              <h3><Localized pl="Centrum dowodzenia" en="Command center" /></h3>
            </div>
            <div className="pd-s52-shell__header-actions">
              <span className="pd-s52-shell__date"><Localized pl="Ostatnie 30 dni" en="Last 30 days" /></span>
              {variant === 'papa' ? (
                <Button onClick={() => setPapaOpen((current) => !current)} size="small" variant="secondary">
                  {panelVisible ? <Localized pl="Zamknij Papa" en="Close Papa" /> : <Localized pl="Otwórz Papa" en="Open Papa" />}
                </Button>
              ) : null}
            </div>
          </header>

          <div className="pd-s52-metrics" aria-label={copy({ pl: 'Przykładowe metryki', en: 'Example metrics' })}>
            <div><span><Localized pl="Przychód" en="Revenue" /></span><strong>248 420 zł</strong></div>
            <div><span>ROAS</span><strong>4,82</strong></div>
            <div><span><Localized pl="Alerty" en="Alerts" /></span><strong>3</strong></div>
          </div>

          <div className="pd-s52-shell__work-area">
            <div className="pd-s52-shell__work-heading">
              <div>
                <strong><Localized pl="Region roboczy" en="Working region" /></strong>
                <p><Localized pl="Treść korzysta z jednego canvasu i jawnych granic regionów bez mnożenia dekoracyjnych kart." en="Content uses one canvas and explicit region boundaries without multiplying decorative cards." /></p>
              </div>
              <ReviewBadge tone="info"><Localized pl="content" en="content" /></ReviewBadge>
            </div>
            <div className="pd-s52-shell__rows" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </div>
          </div>
        </section>

        {panelVisible ? (
          <>
            <button data-lab-control="overlay-scrim" aria-label={copy({ pl: 'Zamknij panel Papa', en: 'Close Papa panel' })} className="pd-s52-shell__scrim" onClick={() => setPapaOpen(false)} type="button" />
            <aside className="pd-s52-shell__papa" aria-label={copy({ pl: 'Panel Papa jako warstwa', en: 'Papa panel as a layer' })}>
              <header>
                <div><span><Localized pl="Warstwa operacyjna" en="Operational layer" /></span><strong>Papa</strong></div>
                <Button onClick={() => setPapaOpen(false)} size="small" variant="ghost"><Localized pl="Zamknij" en="Close" /></Button>
              </header>
              <p><Localized pl="Panel nakłada się na canvas i nie ściska głównego zadania. Ma własną odpowiedzialność, granicę i techniczny cień overlay." en="The panel overlays the canvas without squeezing the main task. It owns a responsibility, boundary and technical overlay shadow." /></p>
              <div className="pd-s52-shell__papa-lines" aria-hidden="true"><span /><span /><span /></div>
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ScrollOwnerProof() {
  return (
    <div className="pd-s52-scroll-owner">
      <header className="pd-s52-scroll-owner__topbar">
        <PapaDataBrand size="small" />
        <span>
          <Localized
            pl="Topbar pozostaje poza przewijanym regionem"
            en="Topbar stays outside the scrollable region"
          />
        </span>
        <ReviewBadge tone="success">sticky</ReviewBadge>
      </header>

      <div className="pd-s52-scroll-owner__body">
        <aside className="pd-s52-scroll-owner__nav" aria-hidden="true">
          <span />
          <span />
          <span />
        </aside>

        <section
          aria-label={copy({
            pl: 'Przewijany region danych — właściciel scrolla',
            en: 'Scrollable data region — scroll owner',
          })}
          className="pd-s52-scroll-owner__viewport"
          data-scroll-owner="content"
          role="region"
          tabIndex={0}
        >
          <header className="pd-s52-scroll-owner__heading">
            <div>
              <span><Localized pl="Region treści" en="Content region" /></span>
              <strong>
                <Localized
                  pl="Jedyny właściciel scrolla"
                  en="Single scroll owner"
                />
              </strong>
            </div>
            <ReviewBadge tone="info">scroll: content</ReviewBadge>
          </header>

          <div className="pd-s52-scroll-owner__rows" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <p className="pd-s52-scroll-owner__inside">
            <Localized
              pl="Dłuższa treść pozostaje wewnątrz regionu. Scroll nie przesuwa topbara, nawigacji ani warstwy Papa."
              en="Longer content stays inside this region. Scrolling does not move the topbar, navigation or Papa layer."
            />
          </p>
        </section>
      </div>

      <p className="pd-s52-scroll-owner__caption">
        <Localized
          pl="Dowód pokazuje odpowiedzialność scrolla, a nie drugi wariant kompletnego AppShell."
          en="This proof demonstrates scroll ownership rather than a second complete AppShell variant."
        />
      </p>
    </div>
  );
}

function WidthRules() {
  return (
    <div className="pd-s52-width-rules">
      <section>
        <span><Localized pl="Analiza" en="Analysis" /></span>
        <h3><Localized pl="Szeroki region roboczy" en="Wide working region" /></h3>
        <div className="pd-s52-width-rules__metrics"><strong>4,82 ROAS</strong><strong>248 420 zł</strong><strong>31,7%</strong></div>
      </section>
      <section>
        <span><Localized pl="Formularz" en="Form" /></span>
        <h3><Localized pl="Kontrolowana długość linii" en="Controlled line length" /></h3>
        <label><Localized pl="Nazwa raportu" en="Report name" /><input aria-label={copy({ pl: 'Nazwa raportu', en: 'Report name' })} /></label>
        <label><Localized pl="Zakres" en="Range" /><input aria-label={copy({ pl: 'Zakres', en: 'Range' })} /></label>
      </section>
    </div>
  );
}

function ShellAntiExample() {
  return (
    <div className="pd-s52-anti" aria-label={copy({ pl: 'Antyprzykład powłoki', en: 'Shell anti-example' })}>
      <div className="pd-s52-anti__sidebar"><span /><span /><span /></div>
      <div className="pd-s52-anti__cards"><span /><span /><span /></div>
      <div className="pd-s52-anti__panel"><Localized pl="Panel ściska treść" en="Panel squeezes content" /></div>
    </div>
  );
}

export function AppBackgroundLaboratory() {
  const [variant, setVariant] = useState<ShellVariant>('sidebar');

  return (
    <StoryPage
      handoff={<Localized pl="20 — Powłoka produktu / AppShell" en="20 — Product shell / AppShell" />}
      id="05.02" status="accepted"
      title={<Localized pl="Tło aplikacji" en="Application background" />}
      summary={<Localized pl="Canvas oddziela nawigację od zadania. Powłoka nie jest kolekcją dekoracyjnych kart, a warstwa Papa nie zmniejsza głównego regionu treści." en="The canvas separates navigation from the task. The shell is not a collection of decorative cards, and the Papa layer does not shrink the main content region." />}
      variants={<Localized pl="sidebar · bez sidebara · Papa · compact" en="sidebar · no sidebar · Papa · compact" />}
    >
      <StorySection index="01" title={<Localized pl="Układy powłoki" en="Shell layouts" />} summary={<Localized pl="Jeden reprezentatywny canvas pokazuje warianty bez mnożenia równorzędnych miniaturek." en="One representative canvas shows variants without multiplying equal miniatures." />}>
        <div className="pd-s52-variant-switch" role="group" aria-label={copy({ pl: 'Wybierz wariant powłoki', en: 'Choose shell variant' })}>
          {shellVariants.map((item) => (
            <button data-lab-control="variant-selector" key={item.id} aria-pressed={variant === item.id} onClick={() => setVariant(item.id)} type="button">{copy(item)}</button>
          ))}
        </div>
        <ShellCanvas variant={variant} />
        <p className="pd-s52-deferred"><ReviewBadge tone="info"><Localized pl="Mobile i tablet: odroczone" en="Mobile and tablet: deferred" /></ReviewBadge> <Localized pl="Bieżące review obejmuje desktop light/dark. Nie pokazujemy makiety mobile udającej zaakceptowany produkt." en="The current review covers desktop light/dark. No mobile mock is shown as if it were an accepted product." /></p>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Właściciel scrolla" en="Scroll owner" />} summary={<Localized pl="Skupiony dowód pokazuje jeden przewijany region treści; topbar i nawigacja pozostają poza jego odpowiedzialnością." en="A focused proof shows one scrollable content region; the topbar and navigation stay outside its responsibility." />}>
        <ScrollOwnerProof />
      </StorySection>

      <StorySection index="03" title={<Localized pl="Szerokość treści" en="Content width" />} summary={<Localized pl="Analiza wykorzystuje szeroki canvas, a formularz zachowuje czytelną długość linii." en="Analysis uses the wide canvas while a form keeps a readable line length." />}>
        <WidthRules />
      </StorySection>

      <StorySection index="04" title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}>
        <DecisionRows
          accepted={<Localized pl="Jeden canvas, hairline między regionami, jawny scroll owner i panel Papa jako warstwa overlay." en="One canvas, hairlines between regions, an explicit scroll owner and the Papa panel as an overlay layer." />}
          rejected={<Localized pl="Powłoka zbudowana z kart wewnątrz kart, przezroczystego sticky blur i panelu, który mechanicznie ściska zadanie." en="A shell built from cards inside cards, transparent sticky blur and a panel that mechanically squeezes the task." />}
        />
        <ShellAntiExample />
      </StorySection>
    </StoryPage>
  );
}
