import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import {
  Button,
  InlineNotice,
  Select,
  StatusBadge,
  Toast,
} from "../../../design-system/components";
import { Icon, PapaDataBrand } from "../../../design-system/icons";
import "./communication-layers-lab.css";

const meta = {
  title: "05 Laboratorium decyzji/Tła i powierzchnie",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type MetricStripItem = Readonly<{
  label: string;
  value: string;
  note: string;
}>;

function DateRangeControl({
  label = "1–31 lip 2026",
}: {
  readonly label?: string;
}) {
  return (
    <button className="pd-cw-date-range" type="button">
      <Icon decorative name="data" size={20} />
      <span>{label}</span>
    </button>
  );
}

function IconAction({ label }: { readonly label: string }) {
  return (
    <button aria-label={label} className="pd-cw-icon-action" type="button">
      <Icon decorative name="search" size={20} />
      <span className="pd-cw-visually-hidden">{label}</span>
    </button>
  );
}

const channelOptions = [
  {
    value: "crm",
    label: "CRM",
  },
  {
    value: "commerce",
    label: "Commerce",
  },
  {
    value: "analytics",
    label: "Analityka",
  },
] as const;

function SelectPreview() {
  function makeLongOptions() {
    const opts: Array<{ value: string; label: string }> = [];
    for (let i = 1; i <= 30; i += 1) {
      opts.push({ value: `opt-${i}`, label: `Opcja ${i}` });
    }
    return opts;
  }

  const longOptions = makeLongOptions();

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div className="pd-cw-control-field">
        <Select
          label="Kanał danych"
          options={channelOptions}
          placeholder="Wybierz kanał danych"
          value="commerce"
        />
      </div>

      <div className="pd-cw-control-field">
        <Select
          label="Długa lista (scroll)"
          options={longOptions}
          placeholder="Wybierz opcję"
          value={null}
        />
      </div>
    </div>
  );
}

function readLocale() {
  if (typeof document === "undefined") {
    return "pl";
  }

  return document.documentElement.dataset.locale === "en" ? "en" : "pl";
}

function Localized({
  pl,
  en,
}: {
  readonly pl: ReactNode;
  readonly en: ReactNode;
}) {
  return readLocale() === "en" ? en : pl;
}

function LaboratoryPage({
  number,
  title,
  summary,
  children,
}: {
  readonly number: string;
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-cw-page">
      <div className="pd-cw-page__inner">
        <header className="pd-cw-page__header">
          <div className="pd-cw-page__index">{number}</div>
          <div className="pd-cw-page__heading">
            <p className="pd-cw-kicker">05 Laboratorium decyzji</p>
            <h1>{title}</h1>
          </div>
          <p className="pd-cw-page__summary">{summary}</p>
        </header>
        {children}
      </div>
    </main>
  );
}

function Section({
  number,
  title,
  summary,
  children,
}: {
  readonly number: string;
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="pd-cw-section">
      <header className="pd-cw-section__header">
        <span className="pd-cw-section__number">{number}</span>
        <div>
          <h2>{title}</h2>
          {summary ? <p>{summary}</p> : null}
        </div>
      </header>
      <div className="pd-cw-section__content">{children}</div>
    </section>
  );
}

function MetricStrip({
  items,
}: {
  readonly items: ReadonlyArray<MetricStripItem>;
}) {
  return (
    <dl className="pd-cw-metric-strip">
      {items.map((item) => (
        <div className="pd-cw-metric" key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          <p>{item.note}</p>
        </div>
      ))}
    </dl>
  );
}

function InsightRow({
  tone,
  title,
  text,
  action,
}: {
  readonly tone: "info" | "success" | "warning";
  readonly title: string;
  readonly text: string;
  readonly action: string;
}) {
  const icon =
    tone === "warning"
      ? "warning"
      : tone === "success"
        ? "success"
        : "assistant";

  return (
    <article className="pd-cw-insight-row" data-tone={tone}>
      <span className="pd-cw-insight-row__icon" aria-hidden="true">
        <Icon decorative name={icon} size={20} />
      </span>
      <div className="pd-cw-insight-row__body">
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <Button size="small" variant="ghost">
        {action}
      </Button>
    </article>
  );
}

function AuthSurface() {
  return (
    <div className="pd-cw-auth-stage">
      <div className="pd-cw-auth-stage__main">
        <div className="pd-cw-auth-stage__brand">
          <PapaDataBrand size="medium" />
          <StatusBadge status="Stan" text="Bezpieczna sesja" tone="success" />
        </div>
        <div className="pd-cw-auth-copy">
          <p className="pd-cw-kicker">Dostęp do workspace</p>
          <h2>Zaloguj się do PapaData</h2>
          <p>
            Jedna ścieżka uwagi, spokojne tło i powierzchnia logowania uniesiona
            nad canvasem bez układu marketingowego 50/50.
          </p>
        </div>
        <form className="pd-cw-auth-form">
          <label>
            <span>Adres e-mail</span>
            <input defaultValue="anna@firma.pl" type="email" />
          </label>
          <label>
            <span>Hasło</span>
            <input defaultValue="••••••••••••" type="password" />
          </label>
          <div className="pd-cw-auth-form__actions">
            <Button startIcon={<Icon decorative name="security" size={20} />}>
              Zaloguj się
            </Button>
            <Button variant="ghost">Odzyskaj dostęp</Button>
          </div>
        </form>
      </div>
      <aside
        className="pd-cw-auth-stage__rail"
        aria-label="Informacje o dostępie"
      >
        <div className="pd-cw-rail-item">
          <Icon decorative name="security" size={20} />
          <div>
            <strong>Sesja kontrolowana</strong>
            <p>Rotowane odświeżanie i natychmiastowe unieważnienie dostępu.</p>
          </div>
        </div>
        <div className="pd-cw-rail-item">
          <Icon decorative name="data" size={20} />
          <div>
            <strong>Jedno źródło danych</strong>
            <p>Po zalogowaniu użytkownik trafia do przypisanego workspace.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function AppCanvas() {
  return (
    <div className="pd-cw-app-canvas">
      <header className="pd-cw-app-canvas__topbar">
        <PapaDataBrand size="small" />
        <nav aria-label="Nawigacja obszaru roboczego">
          <span>Centrum dowodzenia</span>
          <span>Dane</span>
          <span>Integracje</span>
        </nav>
        <div className="pd-cw-app-canvas__actions">
          <Button size="small" variant="ghost">
            Pomoc
          </Button>
          <Button size="small" variant="secondary">
            Anna Nowak
          </Button>
        </div>
      </header>
      <div className="pd-cw-app-canvas__body">
        <aside
          className="pd-cw-app-canvas__sidebar"
          aria-label="Nawigacja modułów"
        >
          <span className="pd-cw-nav-item" data-active="true">
            Podsumowanie
          </span>
          <span className="pd-cw-nav-item">Kampanie</span>
          <span className="pd-cw-nav-item">Zamówienia</span>
          <span className="pd-cw-nav-item">Klienci</span>
        </aside>
        <div className="pd-cw-app-canvas__content">
          <div className="pd-cw-content-heading">
            <div>
              <p className="pd-cw-kicker">Dzisiaj, 31 lipca</p>
              <h2>Centrum dowodzenia</h2>
            </div>
            <div className="pd-cw-heading-tools">
              <DateRangeControl />
              <StatusBadge
                status="Synchronizacja"
                text="Dane aktualne"
                tone="success"
              />
              <IconAction label="Wyszukaj" />
            </div>
          </div>
          <MetricStrip
            items={[
              {
                label: "Przychód",
                value: "248 420,40 zł",
                note: "+12,40% miesiąc do miesiąca",
              },
              { label: "ROAS", value: "4,82", note: "Cel miesięczny: 4,50" },
              { label: "Zamówienia", value: "1 284", note: "96 wymaga uwagi" },
              {
                label: "Marża",
                value: "31,70%",
                note: "+2,10 p.p. wobec planu",
              },
            ]}
          />
          <div className="pd-cw-data-region">
            <div className="pd-cw-data-region__heading">
              <div>
                <h3>Priorytety operacyjne</h3>
                <p>
                  Układ jest budowany separatorami, nie zestawem niezależnych
                  kart.
                </p>
              </div>
              <Button size="small" variant="ghost">
                Zobacz wszystkie
              </Button>
            </div>
            <InsightRow
              tone="warning"
              title="Koszt kampanii wzrósł szybciej niż przychód"
              text="W dwóch zestawach reklam koszt pozyskania przekroczył próg o 18,60%."
              action="Przejdź do kampanii"
            />
            <InsightRow
              tone="success"
              title="Produkty premium poprawiają marżę"
              text="Udział produktów o marży powyżej 35% zwiększył się o 6,20 p.p."
              action="Zobacz produkty"
            />
          </div>
        </div>
      </div>
      <div className="pd-cw-floating-toast">
        <Toast
          actionLabel="Otwórz raport"
          dismissible
          message="Synchronizacja Meta Ads zakończyła się bez błędów."
          title="Dane są aktualne"
          toastId="canvas-sync"
          tone="success"
        />
      </div>
    </div>
  );
}

function CommunicationSystem() {
  return (
    <div className="pd-cw-communication-system">
      <div className="pd-cw-communication-system__main">
        <InlineNotice
          actionLabel="Sprawdź źródło"
          message="Dane Google Ads są starsze niż 6 godzin. Ostatnia próba synchronizacji zakończyła się limitem API."
          title="Aktualność danych wymaga uwagi"
          tone="warning"
        />
        <div className="pd-cw-toolbar-row">
          <SelectPreview />
          <div className="pd-cw-toolbar-row__actions">
            <Button size="small" variant="ghost">
              Dodaj filtr
            </Button>
            <Button size="small" variant="ghost">
              Odśwież dane
            </Button>
          </div>
        </div>
        <div className="pd-cw-insight-list">
          <InsightRow
            tone="info"
            title="Budżet można przesunąć do kampanii o wyższym ROAS"
            text="Papa wykrył 28 400,00 zł niewykorzystanego potencjału w trzech kampaniach."
            action="Pokaż analizę"
          />
          <InsightRow
            tone="success"
            title="Dane potwierdzają wzrost jakości ruchu"
            text="Współczynnik konwersji wzrósł przy jednoczesnym spadku udziału nowych sesji."
            action="Zobacz dowody"
          />
          <InsightRow
            tone="warning"
            title="Dwie integracje wymagają ponownej autoryzacji"
            text="Brak odświeżenia tokenu może zatrzymać pobieranie danych w ciągu 24 godzin."
            action="Napraw integracje"
          />
        </div>
      </div>
      <aside
        className="pd-cw-notification-rail"
        aria-label="Powiadomienia i statusy"
      >
        <div className="pd-cw-notification-rail__heading">
          <h3>Powiadomienia</h3>
          <span>3 nowe</span>
        </div>
        <div className="pd-cw-notification-item">
          <span className="pd-cw-notification-item__dot" data-tone="warning" />
          <div>
            <strong>Budżet kampanii</strong>
            <p>Przekroczono dzienny próg ostrzegawczy.</p>
            <time>12 min temu</time>
          </div>
        </div>
        <div className="pd-cw-notification-item">
          <span className="pd-cw-notification-item__dot" data-tone="success" />
          <div>
            <strong>Synchronizacja zakończona</strong>
            <p>1 284 rekordy są gotowe do analizy.</p>
            <time>28 min temu</time>
          </div>
        </div>
        <div className="pd-cw-notification-item">
          <span className="pd-cw-notification-item__dot" data-tone="info" />
          <div>
            <strong>Nowy insight Papa</strong>
            <p>Wykryto zmianę trendu w kampaniach remarketingowych.</p>
            <time>1 godz. temu</time>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SeparationStage() {
  const rows = [
    {
      source: "Meta Ads",
      status: "Aktywne",
      owner: "Marketing",
      update: "2 min temu",
    },
    {
      source: "Google Analytics 4",
      status: "Aktywne",
      owner: "Analityka",
      update: "8 min temu",
    },
    {
      source: "Commerce",
      status: "Wymaga uwagi",
      owner: "Sprzedaż",
      update: "21 min temu",
    },
  ] as const;

  return (
    <div className="pd-cw-separation-stage">
      <div className="pd-cw-separation-stage__app">
        <header className="pd-cw-separation-stage__topbar">
          <PapaDataBrand size="small" />
          <nav aria-label="Nawigacja obszaru">
            <span data-active="true">Dane</span>
            <span>Operacje</span>
            <span>Ustawienia</span>
          </nav>
          <StatusBadge
            status="Synchronizacja"
            text="Dane aktualne"
            tone="success"
          />
        </header>

        <div className="pd-cw-separation-stage__layout">
          <aside
            className="pd-cw-separation-stage__sidebar"
            aria-label="Nawigacja modułów"
          >
            <span data-active="true">Źródła danych</span>
            <span>Reguły jakości</span>
            <span>Mapowanie</span>
            <span>Historia zmian</span>
          </aside>

          <section className="pd-cw-separation-stage__content">
            <header className="pd-cw-separation-stage__heading">
              <div>
                <p className="pd-cw-kicker">Workspace / Dane</p>
                <h2>Źródła i synchronizacja</h2>
                <p>
                  Główne regiony oddziela linia strukturalna. Wiersze i
                  nagłówki używają separatora subtelnego.
                </p>
              </div>
              <Button size="small" variant="secondary">
                Dodaj źródło
              </Button>
            </header>

            <div className="pd-cw-separation-stage__metrics">
              <div>
                <span>Źródła aktywne</span>
                <strong>12</strong>
              </div>
              <div>
                <span>Wymaga uwagi</span>
                <strong>1</strong>
              </div>
              <div>
                <span>Ostatnia synchronizacja</span>
                <strong>2 min</strong>
              </div>
            </div>

            <div
              className="pd-cw-separation-stage__table"
              role="table"
              aria-label="Źródła danych"
            >
              <div className="pd-cw-separation-stage__table-head" role="row">
                <span role="columnheader">Źródło</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Właściciel</span>
                <span role="columnheader">Aktualizacja</span>
              </div>
              {rows.map((row) => (
                <div
                  className="pd-cw-separation-stage__table-row"
                  key={row.source}
                  role="row"
                  data-attention={
                    row.status === "Wymaga uwagi" ? "true" : "false"
                  }
                >
                  <strong role="cell">{row.source}</strong>
                  <span role="cell">{row.status}</span>
                  <span role="cell">{row.owner}</span>
                  <time role="cell">{row.update}</time>
                </div>
              ))}
            </div>

            <footer className="pd-cw-separation-stage__sticky">
              <div>
                <strong>3 źródła w bieżącym widoku</strong>
                <span>Sticky surface oddziela akcje od treści tabeli.</span>
              </div>
              <Button size="small">Zastosuj filtr</Button>
            </footer>
          </section>

          <aside
            className="pd-cw-separation-stage__drawer"
            aria-label="Szczegóły źródła"
          >
            <header>
              <div>
                <p className="pd-cw-kicker">Panel szczegółów</p>
                <h3>Commerce</h3>
              </div>
              <Button size="small" variant="ghost">
                Zamknij
              </Button>
            </header>
            <dl>
              <div>
                <dt>Stan</dt>
                <dd>Wymaga uwagi</dd>
              </div>
              <div>
                <dt>Rekordy</dt>
                <dd>18 420</dd>
              </div>
              <div>
                <dt>Ostatni błąd</dt>
                <dd>Brak mapowania VAT</dd>
              </div>
            </dl>
            <div className="pd-cw-separation-stage__notice">
              <span />
              <div>
                <strong>Linia komunikatu</strong>
                <p>
                  Status jest lokalnym akcentem. Nie wypełnia całej
                  powierzchni panelu.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="pd-cw-separation-stage__legend" role="list">
        <article data-line="structure" role="listitem">
          <span aria-hidden="true" />
          <div>
            <strong>Linia strukturalna</strong>
            <code>--pd-separator</code>
            <p>Topbar, sidebar, drawer i główne regiony.</p>
          </div>
        </article>
        <article data-line="subtle" role="listitem">
          <span aria-hidden="true" />
          <div>
            <strong>Separator wewnętrzny</strong>
            <code>--pd-separator-subtle</code>
            <p>Nagłówki, wiersze i podziały wewnątrz regionu.</p>
          </div>
        </article>
        <article data-line="active" role="listitem">
          <span aria-hidden="true" />
          <div>
            <strong>Akcent aktywny</strong>
            <code>--pd-brand-accent</code>
            <p>Wybrana nawigacja i aktywna kontrolka.</p>
          </div>
        </article>
        <article data-line="status" role="listitem">
          <span aria-hidden="true" />
          <div>
            <strong>Linia statusu</strong>
            <code>--pd-status-*</code>
            <p>Feedback i komunikat wymagający uwagi.</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function PapaAssistantStage() {
  return (
    <div className="pd-cw-assistant-stage">
      <div className="pd-cw-assistant-stage__workspace">
        <div className="pd-cw-content-heading">
          <div>
            <p className="pd-cw-kicker">Analiza rentowności</p>
            <h2>Marża i koszty pozyskania</h2>
          </div>
          <div className="pd-cw-heading-tools">
            <DateRangeControl />
            <IconAction label="Wyszukaj w analizie" />
          </div>
        </div>
        <MetricStrip
          items={[
            {
              label: "Marża brutto",
              value: "31,70%",
              note: "+2,10 p.p. wobec planu",
            },
            {
              label: "CAC",
              value: "86,40 zł",
              note: "-7,20% miesiąc do miesiąca",
            },
            { label: "LTV:CAC", value: "4,30", note: "Stabilny poziom" },
          ]}
        />
        <div className="pd-cw-evidence-list">
          <div className="pd-cw-evidence-row">
            <span>01</span>
            <div>
              <strong>Kampanie produktowe</strong>
              <p>Wzrost ROAS o 12,80% po zmianie struktury budżetu.</p>
            </div>
            <StatusBadge status="Pewność" text="Wysoka" tone="success" />
          </div>
          <div className="pd-cw-evidence-row">
            <span>02</span>
            <div>
              <strong>Produkty premium</strong>
              <p>Wyższa marża kompensuje mniejszy wolumen sprzedaży.</p>
            </div>
            <StatusBadge status="Pewność" text="Średnia" tone="warning" />
          </div>
          <div className="pd-cw-evidence-row">
            <span>03</span>
            <div>
              <strong>Ruch remarketingowy</strong>
              <p>Niższy CAC przy zachowaniu jakości konwersji.</p>
            </div>
            <StatusBadge status="Pewność" text="Wysoka" tone="success" />
          </div>
        </div>
      </div>
      <aside
        className="pd-cw-assistant-panel"
        aria-label="Panel Papa Asystenta"
      >
        <header className="pd-cw-assistant-panel__header">
          <div className="pd-cw-assistant-panel__identity">
            <span className="pd-cw-assistant-panel__mark">
              <Icon decorative name="assistant" size={24} />
            </span>
            <div>
              <strong>Papa Asystent</strong>
              <p>Analiza z kontrolą dowodów</p>
            </div>
          </div>
          <StatusBadge status="Stan" text="Gotowy" tone="success" />
        </header>
        <div className="pd-cw-assistant-panel__body">
          <div className="pd-cw-assistant-answer">
            <p className="pd-cw-kicker">Najważniejszy wniosek</p>
            <h3>Możesz zwiększyć marżę bez podnoszenia całego budżetu.</h3>
            <p>
              Przesunięcie 18,00% wydatków z kampanii o najniższym ROAS do
              kampanii produktowych może zwiększyć marżę o około 1,90 p.p.
            </p>
          </div>
          <div className="pd-cw-confidence">
            <div>
              <span>Poziom pewności</span>
              <strong>86%</strong>
            </div>
            <div className="pd-cw-confidence__track">
              <span style={{ width: "86%" }} />
            </div>
            <p>
              Wniosek opiera się na trzech zgodnych źródłach i 30 dniach danych.
            </p>
          </div>
          <div className="pd-cw-assistant-recommendation">
            <div className="pd-cw-assistant-recommendation__heading">
              <Icon decorative name="trend" size={20} />
              <strong>Rekomendowane działanie</strong>
            </div>
            <p>Przygotuj wariant przesunięcia budżetu z limitem ryzyka 5%.</p>
          </div>
        </div>
        <footer className="pd-cw-assistant-panel__footer">
          <Button variant="ghost">Pokaż dowody</Button>
          <Button startIcon={<Icon decorative name="assistant" size={20} />}>
            Przygotuj wariant
          </Button>
        </footer>
      </aside>
    </div>
  );
}

export const TloAuth: Story = {
  name: "Tło Auth",
  render: () => (
    <LaboratoryPage
      number="05.01"
      title={
        <Localized pl="Tło Auth i dostęp" en="Auth and access background" />
      }
      summary={
        <Localized
          pl="Główne tło pozostaje spokojne. Formularz jest jedną uniesioną warstwą, a bezpieczeństwo i kontekst są budowane separatorami, nie dodatkowymi kartami."
          en="The main background stays calm. The form is one elevated layer, while security and context use separators instead of extra cards."
        />
      }
    >
      <Section number="01" title="Jedna ścieżka uwagi">
        <AuthSurface />
      </Section>
    </LaboratoryPage>
  ),
};

export const CanvasAplikacji: Story = {
  name: "Canvas aplikacji",
  render: () => (
    <LaboratoryPage
      number="05.02"
      title="Główne tło aplikacji"
      summary="Cały produkt jest osadzony na jednej powierzchni. Nawigacja, KPI, tabele i treść są porządkowane liniami, rytmem i hierarchią zamiast systemem niezależnych kart."
    >
      <Section number="01" title="Układ roboczy bez kafelkowego dashboardu">
        <AppCanvas />
      </Section>
    </LaboratoryPage>
  ),
};

export const PowierzchniaDanych: Story = {
  name: "Powierzchnie danych",
  render: () => (
    <LaboratoryPage
      number="05.03"
      title="Komunikaty, insighty i powiadomienia"
      summary="Komunikaty inline są częścią przepływu danych. Powiadomienia i elementy wymagające uwagi są wyniesione ponad canvas za pomocą kontrolowanej głębi."
    >
      <Section number="01" title="System komunikacji">
        <CommunicationSystem />
      </Section>
    </LaboratoryPage>
  ),
};

export const SeparatoryIObramowania: Story = {
  name: "Separatory i obramowania",
  render: () => (
    <LaboratoryPage
      number="05.04"
      title="Separatory i obramowania"
      summary="Struktura aplikacji wynika z hierarchii linii: mocniejszej granicy regionu, subtelnego podziału wewnętrznego, lokalnego akcentu interakcji i semantycznej linii komunikatu."
    >
      <Section number="01" title="Mapa separacji w układzie aplikacji">
        <SeparationStage />
      </Section>
    </LaboratoryPage>
  ),
};

export const GradientySwiatloISzklo: Story = {
  name: "Gradienty, światło i szkło",
  render: () => (
    <LaboratoryPage
      number="05.05"
      title="Papa Asystent jako warstwa operacyjna"
      summary="Panel asystenta jest wyraźnie wyniesiony ponad obszar analityczny, ale pozostaje narzędziem pracy. Głębia wynika z powierzchni i cienia, nie z dekoracyjnych halo."
    >
      <Section number="01" title="Asystent, dowody i zatwierdzanie działań">
        <PapaAssistantStage />
      </Section>
    </LaboratoryPage>
  ),
};
