import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';

import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  Icon,
} from '../../../design-system/icons';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import '../00-foundations/foundation-geometry.css';
import './data-decision-workspace.css';

const meta = {
  title: '18 Wzorce interfejsu/DataDecisionWorkspace',
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

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
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

function PatternPage({
  title,
  summary,
  children,
}: {
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <StoryPresentationPage
      headerAside={
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry wzorca', en: 'Pattern parameters' })}
          items={[
            { label: <Localized pl="Owner" en="Owner" />, value: '18' },
            { label: <Localized pl="Źródło zasad" en="Rule source" />, value: '00' },
            { label: <Localized pl="Tryb" en="Mode" />, value: <Localized pl="Decision workspace" en="Decision workspace" /> },
          ]}
        />
      }
      sectionCode="18"
      sectionLabel={<Localized pl="Wzorce interfejsu" en="Interface patterns" />}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
  );
}

function DecisionWorkspaceCanvas() {
  return (
    <div className="pd-f0-depth-stage pd-x18-decision-workspace">
      <div
        className="pd-f0-depth-stage__canvas"
        role="region"
        aria-label={copy({
          pl: 'Wzorzec decyzji: dane po lewej, asystent po prawej, rekomendacja jako warstwa pomocnicza i toast jako efekt akcji',
          en: 'Decision pattern: data on the left, assistant on the right, recommendation as a supporting layer and toast as an action result',
        })}
      >
        <div className="pd-f0-depth-stage__base" data-shadow="none">
          <div className="pd-f0-depth-stage__base-heading">
            <div>
              <span><Localized pl="Canvas aplikacji" en="Application canvas" /></span>
              <strong><Localized pl="Przychód, kampanie i decyzje" en="Revenue, campaigns and decisions" /></strong>
            </div>
            <span><Localized pl="Aktualizacja 2 min temu" en="Updated 2 min ago" /></span>
          </div>

          <div className="pd-f0-depth-stage__metrics">
            <div>
              <span><Localized pl="Przychód" en="Revenue" /></span>
              <strong>1 248 590 zł</strong>
            </div>
            <div>
              <span><Localized pl="Marża" en="Margin" /></span>
              <strong>24,8%</strong>
            </div>
            <div>
              <span><Localized pl="Alerty" en="Alerts" /></span>
              <strong>3</strong>
            </div>
          </div>

          <div className="pd-f0-depth-stage__workspace">
            <section className="pd-f0-depth-stage__data-surface" data-shadow="none">
              <header className="pd-f0-depth-stage__data-header">
                <div>
                  <span><Localized pl="Powierzchnia danych" en="Data surface" /></span>
                  <strong><Localized pl="Trend sprzedaży i kosztów" en="Sales and cost trend" /></strong>
                </div>

                <dl>
                  <div>
                    <dt><Localized pl="Wykres" en="Chart" /></dt>
                    <dd>15.01 / ChartFrame</dd>
                  </div>
                  <div>
                    <dt><Localized pl="Tabela" en="Table" /></dt>
                    <dd>DataTable runtime / 18.04 workflow</dd>
                  </div>
                </dl>
              </header>

              <div className="pd-f0-depth-stage__data-toolbar">
                <span><Localized pl="30 dni" en="30 days" /></span>
                <span>Meta Ads · GA4 · Commerce</span>
                <span><Localized pl="Dane gotowe" en="Data ready" /></span>
              </div>

              <div className="pd-f0-depth-stage__data-body">
                <div className="pd-f0-depth-stage__chart" aria-hidden="true">
                  <span className="pd-f0-depth-stage__chart-grid" />
                  <span className="pd-f0-depth-stage__chart-line" data-line="revenue" />
                  <span className="pd-f0-depth-stage__chart-line" data-line="cost" />
                  <span className="pd-f0-depth-stage__chart-point" data-point="one" />
                  <span className="pd-f0-depth-stage__chart-point" data-point="two" />
                  <span className="pd-f0-depth-stage__chart-point" data-point="three" />
                </div>

                <div className="pd-f0-depth-stage__table" aria-hidden="true">
                  <div className="pd-f0-depth-stage__table-row" data-head="true">
                    <span><Localized pl="Kanał" en="Channel" /></span>
                    <span><Localized pl="Przychód" en="Revenue" /></span>
                    <span>ROAS</span>
                  </div>
                  <div className="pd-f0-depth-stage__table-row">
                    <span>Commerce</span>
                    <span>742 100 zł</span>
                    <span>5,8</span>
                  </div>
                  <div className="pd-f0-depth-stage__table-row">
                    <span>Meta Ads</span>
                    <span>386 420 zł</span>
                    <span>4,1</span>
                  </div>
                  <div className="pd-f0-depth-stage__table-row">
                    <span>GA4</span>
                    <span>120 070 zł</span>
                    <span>3,7</span>
                  </div>
                </div>
              </div>

              <footer className="pd-f0-depth-stage__data-status">
                <span><Localized pl="Status danych" en="Data status" /></span>
                <strong><Localized pl="Gotowe do analizy bez dodatkowych ramek" en="Ready for analysis without extra frames" /></strong>
              </footer>
            </section>
          </div>
        </div>

        <div className="pd-f0-depth-stage__raised" data-shadow="raised">
          <span><Localized pl="Panel rekomendacji" en="Recommendation panel" /></span>
          <strong><Localized pl="Przenieś budżet z kosztownych kampanii" en="Shift budget from costly campaigns" /></strong>
          <p><Localized pl="Warstwa pomaga w decyzji, ale nie odcina użytkownika od wykresu ani tabeli." en="The layer supports the decision without cutting the user off from the chart or table." /></p>
        </div>

        <aside className="pd-f0-depth-stage__assistant" data-shadow="raised">
          <header className="pd-f0-depth-stage__assistant-header">
            <Icon decorative name="assistant" size={16} />
            <div>
              <span><Localized pl="Papa Asystent" en="Papa Assistant" /></span>
              <strong><Localized pl="Sidecar bez scrimu" en="Sidecar without scrim" /></strong>
            </div>
          </header>

          <div className="pd-f0-depth-stage__assistant-context">
            <span><Localized pl="Kontekst" en="Context" /></span>
            <strong>15.01 ChartFrame · DataTable runtime · 18.04</strong>
          </div>

          <div className="pd-f0-depth-stage__assistant-thread">
            <section>
              <span><Localized pl="Wniosek" en="Finding" /></span>
              <p><Localized pl="ROAS spada szybciej niż przychód w kampaniach prospectingowych." en="ROAS is dropping faster than revenue in prospecting campaigns." /></p>
            </section>
            <section>
              <span><Localized pl="Następny krok" en="Next step" /></span>
              <p><Localized pl="Porównaj segmenty kosztu z ostatnich 7 dni przed zmianą budżetu." en="Compare cost segments from the last 7 days before changing budget." /></p>
            </section>
          </div>

          <div className="pd-f0-depth-stage__assistant-composer">
            <span><Localized pl="Zapytaj o widoczny zakres danych" en="Ask about the visible data range" /></span>
            <strong><Localized pl="Wyślij" en="Send" /></strong>
          </div>
        </aside>

        <div className="pd-f0-depth-stage__toast" data-shadow="floating">
          <span className="pd-f0-depth-stage__toast-marker" />
          <div>
            <strong><Localized pl="Widok zapisany" en="View saved" /></strong>
            <p><Localized pl="Toast jest operacyjny i nie zmienia układu." en="The toast is operational and does not change the layout." /></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DataDecisionWorkspaceStory: Story = {
  name: 'DataDecisionWorkspace',
  render: () => (
    <PatternPage
      title={<Localized pl="DataDecisionWorkspace" en="DataDecisionWorkspace" />}
      summary={<Localized pl="Wzorzec łączy dane, rekomendację, asystenta i komunikat operacyjny bez przechodzenia do osobnego ekranu decyzji." en="The pattern combines data, recommendation, assistant and operational message without moving to a separate decision screen." />}
    >
      <StoryPresentationSection
        index="01"
        title={<Localized pl="Przestrzeń decyzji" en="Decision workspace" />}
        summary={<Localized pl="00 definiuje powierzchnie i komunikaty; 18 pokazuje ich produktowe użycie." en="00 defines surfaces and messaging; 18 shows their product use." />}
      >
        <DecisionWorkspaceCanvas />
      </StoryPresentationSection>
    </PatternPage>
  ),
};
