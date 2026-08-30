import type {
  FormEvent,
} from 'react';
import {
  useMemo,
  useState,
} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Button,
  Icon,
} from '../../../design-system';
import {
  defaultHelpRuntimeState,
  helpArticles,
  helpCategories,
  helpContextPack,
  helpDomainCards,
  helpExcludedMetadata,
  helpIncludedMetadata,
  helpRoleOptions,
  helpRoadmapPhases,
  helpCenterTabs,
  quickSearchPhrases,
  resolutionSegments,
  searchGapCandidates,
} from './HelpCenterBiPage.data';
import type {
  HelpArticle,
  HelpCategoryId,
  HelpCenterTabId,
  HelpCenterTone,
  HelpProcedureStep,
  HelpProviderStatus,
  HelpRole,
  HelpRuntimeState,
} from './HelpCenterBiPage.data';
import './HelpCenterBiPage.css';

const noop = () => undefined;

const chartColors = {
  amber: 'rgb(var(--pd-hc-amber-500))',
  blue: 'rgb(var(--pd-hc-blue-500))',
  brand: 'rgb(var(--pd-hc-brand-600))',
  emerald: 'rgb(var(--pd-hc-emerald-600))',
  red: 'rgb(var(--pd-hc-red-600))',
  slate: 'rgb(var(--pd-hc-slate-500))',
  violet: 'rgb(var(--pd-hc-violet-600))',
} as const satisfies Record<HelpCenterTone, string>;

type RuntimeArticleState = {
  readonly backendState: string;
  readonly ctaLabel: string;
  readonly ctaTone: HelpCenterTone;
  readonly disabled: boolean;
  readonly semanticStatus: string;
  readonly status: 'available' | 'capability-pending' | 'provider-disabled' | 'role-missing';
};

export function HelpCenterBiPage() {
  const [activeTab, setActiveTab] = useState<HelpCenterTabId>('kb');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategoryId>('ALL');
  const [roleFilter, setRoleFilter] = useState<HelpRole | 'ALL'>('ADMIN');
  const [searchQuery, setSearchQuery] = useState('');
  const [runtimeState, setRuntimeState] = useState<HelpRuntimeState>(defaultHelpRuntimeState);
  const [activeProcedureId, setActiveProcedureId] = useState<string | null>(null);
  const [procedureStepIndex, setProcedureStepIndex] = useState(0);
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [toast, setToast] = useState('Centrum Pomocy gotowe');
  const [copilotAnswer, setCopilotAnswer] = useState<string | null>(null);
  const activeProcedure = helpArticles.find((article) => article.id === activeProcedureId) ?? null;

  function openProcedure(articleId: string) {
    setActiveProcedureId(articleId);
    setProcedureStepIndex(0);
    setToast(`Otworzono procedurę ${articleId}`);
  }

  function openEscalation() {
    setActiveProcedureId(null);
    setEscalationOpen(true);
    setToast('Przygotowano zgłoszenie techniczne z Help Context Pack');
  }

  return (
    <main className="pd-hc" data-testid="help-center-bi-page">
      <div className="pd-hc__content">
        <HelpHeroSearch
          onClearSearch={() => setSearchQuery('')}
          onOpenEscalation={openEscalation}
          onOpenProcedure={openProcedure}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
        />

        <HelpContextSignal
          onOpenMetaArticles={() => setSearchQuery('Meta Ads')}
          onOpenProcedure={() => openProcedure('help-int-meta-reauth')}
        />

        <HelpCenterTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'kb' ? (
          <HelpKnowledgeBase
            onAskCopilot={(answer) => {
              setCopilotAnswer(answer);
              setToast('Papa Help Copilot przygotował odpowiedź');
            }}
            onCategoryChange={setSelectedCategory}
            onOpenEscalation={openEscalation}
            onOpenProcedure={openProcedure}
            onRoleFilterChange={setRoleFilter}
            roleFilter={roleFilter}
            runtimeState={runtimeState}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        ) : null}
        {activeTab === 'truth' ? (
          <HelpTruthEngine
            onRuntimeStateChange={(nextRuntimeState) => {
              setRuntimeState(nextRuntimeState);
              setRoleFilter(nextRuntimeState.activeRole);
              setToast('Product Truth Engine zaktualizował stany artykułów');
            }}
            runtimeState={runtimeState}
          />
        ) : null}
        {activeTab === 'context' ? (
          <HelpContextAndEscalation onOpenEscalation={openEscalation} />
        ) : null}
        {activeTab === 'domain' ? <HelpDomainRoadmap /> : null}
      </div>

      <HelpProcedureModal
        activeStepIndex={procedureStepIndex}
        article={activeProcedure}
        onBranchDecision={(decision) => setToast(decision ? 'Wykryto wygasły token OAuth Meta' : 'Sprawdzanie stanu połączenia Facebook Graph API')}
        onClose={() => setActiveProcedureId(null)}
        onEscalate={openEscalation}
        onStepChange={setProcedureStepIndex}
      />
      <HelpEscalationModal
        onClose={() => setEscalationOpen(false)}
        onSubmit={() => {
          setEscalationOpen(false);
          setToast('Zgłoszenie Techniczne zostało wysłane z bezpiecznym Help Context Pack');
        }}
        open={escalationOpen}
      />
      <HelpCopilotPanel
        answer={copilotAnswer}
        onClose={() => setCopilotAnswer(null)}
      />
      <HelpCenterToast message={toast} />
    </main>
  );
}

export function HelpHeroSearch({
  onClearSearch = noop,
  onOpenEscalation = noop,
  onOpenProcedure = noop,
  onSearchChange = noop,
  searchQuery = '',
}: {
  readonly onClearSearch?: () => void;
  readonly onOpenEscalation?: () => void;
  readonly onOpenProcedure?: (articleId: string) => void;
  readonly onSearchChange?: (query: string) => void;
  readonly searchQuery?: string;
}) {
  const matches = useMemo(() => getSearchMatches(searchQuery), [searchQuery]);
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <section className="pd-hc-hero">
      <div>
        <div className="pd-hc-tip">
          <Icon decorative name="help" size={16} />
          <span>Tip: Wpisz kod błędu np.</span>
          <button onClick={() => onSearchChange('PD-INT-401')} type="button">PD-INT-401</button>
          <span>lub opis problemu</span>
        </div>
        <h1>W czym możemy Ci pomóc?</h1>
        <p>Znajdź odpowiedź, przejdź przez procedurę krok po kroku albo uzyskaj wsparcie techniczne.</p>

        <div className="pd-hc-search">
          <Icon decorative name="search" size={20} />
          <input
            aria-label="Opisz problem"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Opisz problem (np. 'Meta przestała pobierać dane', 'jak zmienić rolę', 'PD-INT-401')..."
            type="search"
            value={searchQuery}
          />
          {hasQuery ? (
            <button aria-label="Wyczyść wyszukiwanie" onClick={onClearSearch} type="button">×</button>
          ) : null}
        </div>

        {hasQuery ? (
          <div className="pd-hc-search-results" role="listbox" aria-label="Wyniki wyszukiwania Centrum Pomocy">
            {matches.length > 0 ? matches.map((article) => (
              <button key={article.id} onClick={() => onOpenProcedure(article.id)} role="option" type="button">
                <div>
                  <strong>{article.title}</strong>
                  <span>{article.excerpt.slice(0, 92)}...</span>
                </div>
                <div>
                  <em>Procedura</em>
                  {article.errorCode ? <code>{article.errorCode}</code> : null}
                </div>
              </button>
            )) : (
              <div className="pd-hc-search-empty">
                <strong>Brak natychmiastowych wyników w bazie wiedzy dla "{searchQuery}".</strong>
                <button onClick={onOpenEscalation} type="button">Zgłoś problem do wsparcia technicznego</button>
              </div>
            )}
          </div>
        ) : null}

        <div className="pd-hc-quick-search">
          <span>Popularne frazy:</span>
          {quickSearchPhrases.map((phrase) => (
            <button key={phrase} onClick={() => onSearchChange(phrase)} type="button">{phrase}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HelpContextSignal({
  onOpenMetaArticles = noop,
  onOpenProcedure = noop,
}: {
  readonly onOpenMetaArticles?: () => void;
  readonly onOpenProcedure?: () => void;
}) {
  return (
    <section className="pd-hc-context-signal">
      <div>
        <span><Icon decorative name="notifications" size={20} /></span>
        <div>
          <h3>Pomoc dopasowana do Twojego widoku: <strong>Integracje · Meta Ads</strong></h3>
          <p>Wykryliśmy brak nowych danych z Meta Ads od 18 godzin. Poniżej sugerowane kroki naprawcze:</p>
        </div>
      </div>
      <div>
        <Button onClick={onOpenProcedure} variant="primary">Uruchom procedurę naprawczą</Button>
        <Button onClick={onOpenMetaArticles} variant="secondary">Zobacz artykuły dla Meta</Button>
      </div>
    </section>
  );
}

export function HelpCenterTabNav({
  activeTab = 'kb',
  onTabChange = noop,
}: {
  readonly activeTab?: HelpCenterTabId;
  readonly onTabChange?: (tabId: HelpCenterTabId) => void;
}) {
  return (
    <nav aria-label="Zakładki Centrum Pomocy" className="pd-hc-tabs">
      {helpCenterTabs.map((tab) => (
        <button className={activeTab === tab.id ? 'is-active' : ''} key={tab.id} onClick={() => onTabChange(tab.id)} type="button">
          <Icon decorative name={tab.icon} size={16} />
          {tab.label}
          {tab.badge ? <span>{tab.badge}</span> : null}
        </button>
      ))}
    </nav>
  );
}

export function HelpKnowledgeBase({
  onAskCopilot = noop,
  onCategoryChange = noop,
  onOpenEscalation = noop,
  onOpenProcedure = noop,
  onRoleFilterChange = noop,
  roleFilter = 'ADMIN',
  runtimeState = defaultHelpRuntimeState,
  searchQuery = '',
  selectedCategory = 'ALL',
}: {
  readonly onAskCopilot?: (answer: string) => void;
  readonly onCategoryChange?: (category: HelpCategoryId) => void;
  readonly onOpenEscalation?: () => void;
  readonly onOpenProcedure?: (articleId: string) => void;
  readonly onRoleFilterChange?: (role: HelpRole | 'ALL') => void;
  readonly roleFilter?: HelpRole | 'ALL';
  readonly runtimeState?: HelpRuntimeState;
  readonly searchQuery?: string;
  readonly selectedCategory?: HelpCategoryId;
}) {
  const filteredArticles = useMemo(() => helpArticles.filter((article) => {
    const matchesCategory = selectedCategory === 'ALL' || article.category === selectedCategory;
    const matchesRole = roleFilter === 'ALL' || article.requiredRole === roleFilter || runtimeState.activeRole === 'ADMIN';
    const matchesSearch = matchesHelpArticleSearch(article, searchQuery);
    return matchesCategory && matchesRole && matchesSearch;
  }), [roleFilter, runtimeState.activeRole, searchQuery, selectedCategory]);

  return (
    <section className="pd-hc-kb">
      <div className="pd-hc-kb__filters">
        <div className="pd-hc-category-filters" role="group" aria-label="Kategorie Centrum Pomocy">
          {helpCategories.map((category) => (
            <button
              className={selectedCategory === category.id ? 'is-active' : ''}
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
        <label>
          <span>Filtruj wg mojej roli:</span>
          <select onChange={(event) => onRoleFilterChange(event.target.value as HelpRole | 'ALL')} value={roleFilter}>
            {helpRoleOptions.map((roleOption) => (
              <option key={roleOption.value} value={roleOption.value}>{roleOption.label}</option>
            ))}
          </select>
        </label>
      </div>

      <HelpArticlesGrid
        articles={filteredArticles}
        onOpenEscalation={onOpenEscalation}
        onOpenProcedure={onOpenProcedure}
        runtimeState={runtimeState}
      />

      <HelpCopilotBox onAskCopilot={onAskCopilot} />
    </section>
  );
}

export function HelpArticlesGrid({
  articles,
  onOpenEscalation = noop,
  onOpenProcedure = noop,
  runtimeState = defaultHelpRuntimeState,
}: {
  readonly articles: readonly HelpArticle[];
  readonly onOpenEscalation?: () => void;
  readonly onOpenProcedure?: (articleId: string) => void;
  readonly runtimeState?: HelpRuntimeState;
}) {
  if (articles.length === 0) {
    return (
      <section className="pd-hc-empty-results">
        <Icon decorative name="search" size={24} />
        <h4>Nie znaleźliśmy potwierdzonej procedury</h4>
        <p>Spróbuj wpisać inną frazę lub skonsultuj problem bezpośrednio.</p>
        <div>
          <Button size="small" variant="secondary">Wyszukaj 'brak danych'</Button>
          <Button onClick={onOpenEscalation} size="small" variant="primary">Zgłoś problem techniczny</Button>
        </div>
      </section>
    );
  }

  return (
    <div className="pd-hc-articles-grid">
      {articles.map((article) => (
        <HelpArticleCard
          article={article}
          key={article.id}
          onOpenProcedure={onOpenProcedure}
          runtimeState={runtimeState}
        />
      ))}
    </div>
  );
}

function HelpArticleCard({
  article,
  onOpenProcedure,
  runtimeState,
}: {
  readonly article: HelpArticle;
  readonly onOpenProcedure: (articleId: string) => void;
  readonly runtimeState: HelpRuntimeState;
}) {
  const articleState = getArticleRuntimeState(article, runtimeState);

  return (
    <article className="pd-hc-article-card">
      <div>
        <div className="pd-hc-article-card__meta">
          <span>{article.categoryLabel}</span>
          <div>
            <em>{article.estimatedTime}</em>
            {article.errorCode ? <code>{article.errorCode}</code> : null}
          </div>
        </div>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
      </div>

      <div>
        <div className="pd-hc-article-card__facts">
          <span>Wymaga roli: <strong>{article.requiredRoleLabel}</strong></span>
          <span>Weryfikacja: <code>{article.lastVerified}</code></span>
        </div>
        <button
          className={`pd-hc-cta-button pd-hc-cta-button--${articleState.ctaTone}`}
          disabled={articleState.disabled}
          onClick={() => onOpenProcedure(article.id)}
          type="button"
        >
          {articleState.ctaLabel}
        </button>
      </div>
    </article>
  );
}

function HelpCopilotBox({
  onAskCopilot,
}: {
  readonly onAskCopilot: (answer: string) => void;
}) {
  const [query, setQuery] = useState('');

  function submitCopilot() {
    if (!query.trim()) return;
    onAskCopilot(`Odpowiadając na pytanie: '${query.trim()}' - na podstawie zweryfikowanej procedury 'Napraw brak danych Meta Ads' (Wersja 2.4 zaktualizowana 24.08.2026): Po ponownym rozłączeniu konta historia danych pozostaje zabezpieczona w PapaData Engine. Wymagane jest jedynie wznowienie tokena OAuth.`);
    setQuery('');
  }

  return (
    <section className="pd-hc-copilot-box">
      <div>
        <span><Icon decorative name="assistant" size={24} /></span>
        <div>
          <h4>Zapytaj Papa Help Copilota</h4>
          <p>Asystent odpowiada wyłącznie na podstawie zatwierdzonych procedur i aktualnego stanu runtime.</p>
        </div>
      </div>
      <div>
        <input
          aria-label="Pytanie do Papa Help Copilota"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitCopilot();
          }}
          placeholder="Zapytaj np. 'Co się stanie po rozłączeniu GA4?'"
          type="text"
          value={query}
        />
        <button className="pd-hc-brand-button" onClick={submitCopilot} type="button">Zapytaj AI</button>
      </div>
    </section>
  );
}

export function HelpTruthEngine({
  onRuntimeStateChange = noop,
  runtimeState = defaultHelpRuntimeState,
}: {
  readonly onRuntimeStateChange?: (runtimeState: HelpRuntimeState) => void;
  readonly runtimeState?: HelpRuntimeState;
}) {
  function updateRuntime(nextRuntimeState: HelpRuntimeState) {
    onRuntimeStateChange(nextRuntimeState);
  }

  function toggleShopifyState() {
    const current = runtimeState.providersReadiness.shopify;
    const next: HelpProviderStatus = current === 'disabled' ? 'production_ready' : 'disabled';
    updateRuntime({
      ...runtimeState,
      providersReadiness: {
        ...runtimeState.providersReadiness,
        shopify: next,
      },
    });
  }

  function toggleAiLimits() {
    updateRuntime({
      ...runtimeState,
      capabilities: {
        ...runtimeState.capabilities,
        'billing.configure_ai_limits': !runtimeState.capabilities['billing.configure_ai_limits'],
      },
    });
  }

  function changeRole(role: HelpRole) {
    updateRuntime({
      ...runtimeState,
      activeRole: role,
    });
  }

  return (
    <section className="pd-hc-truth">
      <div className="pd-hc-truth-console">
        <div className="pd-hc-truth-console__head">
          <div>
            <span>REGUŁA P0: Semantic Truthfulness</span>
            <h2>Product Truth Engine - Symulator Stanu Produktu</h2>
            <p>Dokumentacja w PapaData nie jest statycznym tekstem. Artykuły dynamicznie odczytują statusy dostawców (Provider Readiness Matrix) oraz uprawnienia z backendu.</p>
          </div>
          <button onClick={() => updateRuntime(defaultHelpRuntimeState)} type="button">↺ Przywróć stan fabryczny</button>
        </div>

        <div className="pd-hc-truth-controls">
          <HelpTruthControlCard
            body="W systemie zdiagnozowano audytowy błąd P0: Artykuł sugerował naprawę połączenia, gdy dostawca był wyłączony."
            label="Dostawca: Shopify"
            onAction={toggleShopifyState}
            stateLabel={runtimeState.providersReadiness.shopify}
            title="Stan Providera:"
            tone={runtimeState.providersReadiness.shopify === 'disabled' ? 'red' : 'emerald'}
            value={runtimeState.providersReadiness.shopify === 'disabled' ? 'Wyłączony (Disabled)' : 'Gotowy (Ready)'}
          />
          <HelpTruthControlCard
            body="Backend billing deklaruje canConfigureAiLimits: false. Help nie może wyświetlać aktywnego przycisku konfiguracji."
            label="Funkcja: Konfiguracja Limitów AI"
            onAction={toggleAiLimits}
            stateLabel={runtimeState.capabilities['billing.configure_ai_limits'] ? 'available' : 'pending'}
            title="Backend Capability:"
            tone={runtimeState.capabilities['billing.configure_ai_limits'] ? 'emerald' : 'amber'}
            value={runtimeState.capabilities['billing.configure_ai_limits'] ? 'Dostępna (Enabled)' : 'Oczekuje (Pending)'}
          />
          <article className="pd-hc-truth-card">
            <div>
              <div>
                <strong>Rola Użytkownika (RBAC)</strong>
                <span className="pd-hc-state-pill pd-hc-state-pill--brand">{runtimeState.activeRole}</span>
              </div>
              <p>Zmień rolę na VIEWER, aby sprawdzić jak przyciski akcji (CTA) zmieniają się na informację o braku uprawnień.</p>
            </div>
            <label>
              <span>Aktywna Rola:</span>
              <select onChange={(event) => changeRole(event.target.value as HelpRole)} value={runtimeState.activeRole}>
                <option value="ADMIN">ADMIN</option>
                <option value="VIEWER">VIEWER</option>
                <option value="ANALYST">ANALYST</option>
              </select>
            </label>
          </article>
        </div>
      </div>

      <HelpTruthMatrix runtimeState={runtimeState} />
    </section>
  );
}

function HelpTruthControlCard({
  body,
  label,
  onAction,
  stateLabel,
  title,
  tone,
  value,
}: {
  readonly body: string;
  readonly label: string;
  readonly onAction: () => void;
  readonly stateLabel: string;
  readonly title: string;
  readonly tone: HelpCenterTone;
  readonly value: string;
}) {
  return (
    <article className="pd-hc-truth-card">
      <div>
        <div>
          <strong>{label}</strong>
          <span className={`pd-hc-state-pill pd-hc-state-pill--${tone}`}>{stateLabel}</span>
        </div>
        <p>{body}</p>
      </div>
      <div className="pd-hc-truth-card__action">
        <span>{title}</span>
        <button className={`pd-hc-mini-button pd-hc-mini-button--${tone}`} onClick={onAction} type="button">{value}</button>
      </div>
    </article>
  );
}

export function HelpTruthMatrix({
  runtimeState = defaultHelpRuntimeState,
}: {
  readonly runtimeState?: HelpRuntimeState;
}) {
  return (
    <section className="pd-hc-panel">
      <h3>Podgląd Reakcji Artykułów na Stan Runtime</h3>
      <p>Poniższa tabela przedstawia, jak weryfikacja wymogów wpływa na stan przycisków akcji (CTA) w czasie rzeczywistym.</p>
      <div className="pd-hc-table-wrap">
        <table className="pd-hc-table">
          <thead>
            <tr>
              <th>Identyfikator Artykułu</th>
              <th>Wymagane Capabilities / Provider</th>
              <th>Obecny Stan Backend</th>
              <th>Stan Przycisku Akcji (CTA) w UI</th>
              <th>Status Prawdy Semantycznej</th>
            </tr>
          </thead>
          <tbody>
            {helpArticles.map((article) => {
              const articleState = getArticleRuntimeState(article, runtimeState);
              return (
                <tr key={article.id}>
                  <td><strong>{article.title}</strong></td>
                  <td><code>{article.requiredProvider ?? 'Standard'} / {article.requiredCapabilities.join(', ')}</code></td>
                  <td><code>{articleState.backendState}</code></td>
                  <td>{articleState.ctaLabel}</td>
                  <td><span className={`pd-hc-badge pd-hc-badge--${articleState.ctaTone}`}>{articleState.semanticStatus}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function HelpContextAndEscalation({
  onOpenEscalation = noop,
}: {
  readonly onOpenEscalation?: () => void;
}) {
  return (
    <section className="pd-hc-context-grid">
      <article className="pd-hc-panel pd-hc-context-pack">
        <div className="pd-hc-panel__head">
          <h3>Aktualny Help Context Pack</h3>
          <span>GET /help/context</span>
        </div>
        <p>Gdy użytkownik otwiera pomoc z konkretnego widoku lub zgłasza błąd, system buduje standaryzowaną paczkę kontekstu diagnostycznego.</p>
        <pre>{JSON.stringify(helpContextPack, null, 2)}</pre>
        <div className="pd-hc-context-pack__footer">
          <span>Czy kontekst jest automatycznie przesyłany?</span>
          <strong>Tylko za zgodą użytkownika</strong>
        </div>
      </article>

      <article className="pd-hc-panel pd-hc-privacy">
        <div className="pd-hc-panel__head">
          <h3>Kontrola Prywatności i Transparencja (P0)</h3>
          <span>Jawny Przegląd</span>
        </div>
        <p>Zgodnie ze specyfikacją Centrum Pomocy, użytkownik ma pełny wgląd w metadane dołączane do zgłoszenia technicznego:</p>
        <div className="pd-hc-privacy__lists">
          <MetadataList items={helpIncludedMetadata} title="Dołączane metadane techniczne:" tone="emerald" />
          <MetadataList items={helpExcludedMetadata} title="Kategorycznie wyłączone z przesyłania:" tone="red" />
        </div>
        <Button onClick={onOpenEscalation} variant="primary">Przetestuj Generowanie Zgłoszenia Technicznego →</Button>
      </article>
    </section>
  );
}

function MetadataList({
  items,
  title,
  tone,
}: {
  readonly items: readonly string[];
  readonly title: string;
  readonly tone: HelpCenterTone;
}) {
  return (
    <section className={`pd-hc-metadata-list pd-hc-metadata-list--${tone}`}>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function HelpDomainRoadmap() {
  return (
    <section className="pd-hc-domain">
      <article className="pd-hc-panel">
        <h3>Docelowy Podział Domenowy (Domain Separation)</h3>
        <p>Eliminacja mieszania self-service, zgłoszeń technicznych i consultingowych w jednym interfejsie.</p>
        <div className="pd-hc-domain-grid">
          {helpDomainCards.map((domain) => (
            <article className={`pd-hc-domain-card pd-hc-domain-card--${domain.tone}`} key={domain.title}>
              <div>
                <span>{domain.label}</span>
                <h4>{domain.title}</h4>
              </div>
              <p>{domain.body}</p>
              <code>Route: {domain.route}</code>
            </article>
          ))}
        </div>
      </article>

      <HelpAnalyticsCharts />

      <article className="pd-hc-panel pd-hc-roadmap">
        <h3>Harmonogram Wdrożenia (Implementation Roadmap)</h3>
        <div>
          {helpRoadmapPhases.map((phase) => (
            <section className={`pd-hc-roadmap-phase pd-hc-roadmap-phase--${phase.tone}`} key={phase.label}>
              <div>
                <span>{phase.label}</span>
                <em>{phase.status}</em>
              </div>
              <ul>
                {phase.items.map((item) => (
                  <li key={item.text}>
                    <strong>{item.done ? '✓' : '○'}</strong>
                    {item.text}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}

export function HelpAnalyticsCharts() {
  return (
    <section className="pd-hc-analytics">
      <article className="pd-hc-chart-panel">
        <h4>Skuteczność Self-Service i Analityka Wyszukiwań</h4>
        <p>Udział rozwiązań samodzielnych vs eskalacje do wsparcia technicznego.</p>
        <div className="pd-hc-chart" role="img" aria-label="Skuteczność self-service Centrum Pomocy">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="45%"
                data={resolutionSegments}
                dataKey="value"
                innerRadius={54}
                nameKey="label"
                outerRadius={88}
                paddingAngle={2}
              >
                {resolutionSegments.map((segment) => (
                  <Cell fill={chartColors[segment.tone]} key={segment.label} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="pd-hc-chart-panel">
        <h4>Najczęstsze Luki Wiedzy (Search-Gap Candidates)</h4>
        <p>Frazy wpisywane przez użytkowników nie dające bezpośredniego wyniku.</p>
        <div className="pd-hc-chart" role="img" aria-label="Najczęstsze luki wiedzy Centrum Pomocy">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={searchGapCandidates} margin={{ bottom: 8, left: 0, right: 16, top: 10 }}>
              <CartesianGrid stroke="rgb(var(--pd-hc-slate-200))" vertical={false} />
              <XAxis dataKey="label" interval={0} stroke="rgb(var(--pd-hc-slate-500))" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="rgb(var(--pd-hc-slate-500))" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={chartColors.slate} name="Liczba zapytań bez bezpośredniego wyniku" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

function HelpProcedureModal({
  activeStepIndex,
  article,
  onBranchDecision,
  onClose,
  onEscalate,
  onStepChange,
}: {
  readonly activeStepIndex: number;
  readonly article: HelpArticle | null;
  readonly onBranchDecision: (decision: boolean) => void;
  readonly onClose: () => void;
  readonly onEscalate: () => void;
  readonly onStepChange: (stepIndex: number) => void;
}) {
  if (!article) return null;

  const currentStep = article.steps[activeStepIndex] ?? article.steps[0];
  const isLastStep = activeStepIndex === article.steps.length - 1;
  const progress = ((activeStepIndex + 1) / article.steps.length) * 100;

  function nextStep() {
    if (isLastStep) {
      onClose();
      return;
    }

    onStepChange(activeStepIndex + 1);
  }

  return (
    <div className="pd-hc-modal-overlay">
      <section aria-label={article.title} aria-modal="true" className="pd-hc-procedure-modal" role="dialog">
        <div className="pd-hc-procedure-modal__head">
          <div>
            <div>
              <span>{article.categoryLabel}</span>
              <em>{article.estimatedTime}</em>
              <em>Wymaga: {article.requiredRoleLabel}</em>
            </div>
            <h3>{article.title}</h3>
          </div>
          <button aria-label="Zamknij procedurę" onClick={onClose} type="button">×</button>
        </div>

        <div className="pd-hc-procedure-modal__body">
          <div className="pd-hc-procedure-meta">
            <span>Zaktualizowano: <strong>{article.lastVerified}</strong></span>
            <span>Zespół odpowiedzialny: <strong>{article.ownerTeam}</strong></span>
            <span>Kod błędu: <code>{article.errorCode ?? 'Brak (Ogólna)'}</code></span>
          </div>

          <div className="pd-hc-progress-block">
            <div>
              <span>Postęp procedury (Guided Mode)</span>
              <strong>Krok {activeStepIndex + 1} z {article.steps.length}</strong>
            </div>
            <i><span style={{ width: `${progress}%` }} /></i>
          </div>

          <HelpProcedureStepCard index={activeStepIndex} step={currentStep} />

          {currentStep.hasBranching ? (
            <div className="pd-hc-branching">
              <h5>Czy widzisz komunikat "Token autoryzacyjny wygasł"?</h5>
              <div>
                <button onClick={() => onBranchDecision(true)} type="button">TAK - Przejdź do Reautoryzacji</button>
                <button onClick={() => onBranchDecision(false)} type="button">NIE - Sprawdź status sieci</button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="pd-hc-procedure-modal__footer">
          <button className="pd-hc-muted-button" disabled={activeStepIndex === 0} onClick={() => onStepChange(activeStepIndex - 1)} type="button">← Poprzedni krok</button>
          <div>
            <button className="pd-hc-danger-link" onClick={onEscalate} type="button">Nadal nie działa? Zgłoś</button>
            <button className={isLastStep ? 'pd-hc-success-button' : 'pd-hc-brand-button'} onClick={nextStep} type="button">
              {isLastStep ? '✓ Zakończ procedurę' : 'Następny krok →'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HelpProcedureStepCard({
  index,
  step,
}: {
  readonly index: number;
  readonly step: HelpProcedureStep;
}) {
  return (
    <article className="pd-hc-step-card">
      <div>
        <span>{index + 1}</span>
        <h4>{step.title}</h4>
      </div>
      <p>{step.description}</p>
      <section>
        <strong>Oczekiwany Rezultat:</strong>
        <p>{step.expectedResult}</p>
      </section>
      {step.actionBtnText ? <button className="pd-hc-muted-button" type="button">{step.actionBtnText}</button> : null}
    </article>
  );
}

function HelpEscalationModal({
  onClose,
  onSubmit,
  open,
}: {
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly open: boolean;
}) {
  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="pd-hc-modal-overlay">
      <section aria-label="Zgłoszenie do Wsparcia Technicznego" aria-modal="true" className="pd-hc-escalation-modal" role="dialog">
        <div className="pd-hc-modal-head">
          <div>
            <span>Eskalacja Techniczna</span>
            <h3>Zgłoszenie do Wsparcia Technicznego</h3>
          </div>
          <button aria-label="Zamknij zgłoszenie" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pd-hc-escalation-context">
            <strong>Do zgłoszenia dołączyliśmy automatyczny kontekst diagnostyczny:</strong>
            <p>Moduł: Integracje · Provider: Meta Ads · Błąd: PD-INT-401 · Wykonana procedura: HELP-INT-004</p>
          </div>
          <label>
            <span>Temat zgłoszenia</span>
            <input defaultValue="Błąd synchronizacji Meta Ads pomimo ponownego połączenia" required type="text" />
          </label>
          <label>
            <span>Opis problemu i zaobserwowane objawy</span>
            <textarea defaultValue="Przeszedłem procedurę Reautoryzacji Meta Ads. Krok 2 wyrzuca błąd PD-INT-401. Dane w panelu nie odświeżają się odczuwalnie od wczoraj." required rows={4} />
          </label>
          <label className="pd-hc-checkbox">
            <input defaultChecked type="checkbox" />
            <span>Załącz bezpieczne metadane z Help Context Pack (bez danych klientów i tokenów)</span>
          </label>
          <div className="pd-hc-modal-actions">
            <button className="pd-hc-muted-button" onClick={onClose} type="button">Anuluj</button>
            <button className="pd-hc-primary-button" type="submit">Wyślij Zgłoszenie Techniczne</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function HelpCopilotPanel({
  answer,
  onClose,
}: {
  readonly answer: string | null;
  readonly onClose: () => void;
}) {
  if (!answer) return null;

  return (
    <aside aria-label="Odpowiedź Papa Help Copilota" className="pd-hc-copilot-panel">
      <div>
        <strong>Papa Help Copilot odpowiedź</strong>
        <button aria-label="Zamknij odpowiedź Copilota" onClick={onClose} type="button">×</button>
      </div>
      <p>{answer}</p>
    </aside>
  );
}

function HelpCenterToast({
  message,
}: {
  readonly message: string;
}) {
  return (
    <output className="pd-hc-toast" aria-live="polite">
      {message}
    </output>
  );
}

function getSearchMatches(searchQuery: string) {
  const query = searchQuery.trim();
  if (!query) return [];
  return helpArticles.filter((article) => matchesHelpArticleSearch(article, query));
}

function matchesHelpArticleSearch(article: HelpArticle, searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return true;
  return (
    article.title.toLowerCase().includes(query)
    || article.excerpt.toLowerCase().includes(query)
    || (article.errorCode?.toLowerCase().includes(query) ?? false)
    || article.keywords.some((keyword) => keyword.toLowerCase().includes(query))
  );
}

function getArticleRuntimeState(article: HelpArticle, runtimeState: HelpRuntimeState): RuntimeArticleState {
  const providerStatus = article.requiredProvider ? runtimeState.providersReadiness[article.requiredProvider] : 'production_ready';
  const capabilityCheck = article.requiredCapabilities.every((capability) => runtimeState.capabilities[capability] === true);
  const roleCheck = runtimeState.activeRole === 'ADMIN' || article.requiredRole === runtimeState.activeRole;

  if (providerStatus === 'disabled') {
    return {
      backendState: `Provider: ${providerStatus}`,
      ctaLabel: 'Dostawca niedostępny w tej wersji',
      ctaTone: 'slate',
      disabled: true,
      semanticStatus: 'Prawdziwy (Blokuje akcję)',
      status: 'provider-disabled',
    };
  }

  if (!capabilityCheck) {
    return {
      backendState: 'Cap: false',
      ctaLabel: 'Funkcja w trakcie wdrażania (Pending)',
      ctaTone: 'amber',
      disabled: true,
      semanticStatus: 'Prawdziwy (Oczekuje na backend)',
      status: 'capability-pending',
    };
  }

  if (!roleCheck) {
    return {
      backendState: article.requiredProvider ? `Provider: ${providerStatus}` : 'Cap: true',
      ctaLabel: `Wymaga roli: ${article.requiredRoleLabel}`,
      ctaTone: 'slate',
      disabled: true,
      semanticStatus: 'Prawdziwy (RBAC)',
      status: 'role-missing',
    };
  }

  return {
    backendState: article.requiredProvider ? `Provider: ${providerStatus}` : 'Cap: true',
    ctaLabel: 'Uruchom procedurę krok-po-kroku',
    ctaTone: 'brand',
    disabled: false,
    semanticStatus: 'Dostępna w Runtime',
    status: 'available',
  };
}

const tooltipStyle = {
  background: 'rgb(58 58 54)',
  border: '1px solid rgb(96 96 88)',
  borderRadius: 'var(--pd-radius-control)',
  boxShadow: '0 16px 34px rgb(0 0 0 / 0.20)',
  color: 'white',
  fontSize: 12,
};
