import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  InlineNotice,
} from '../../design-system';
import {
  createBillingStorybookData,
  findBillingScreenDefinition,
} from './billingData';
import type {
  BillingScreenDefinition,
  BillingScreenVariant,
  BillingWorkspaceData,
} from './billingData';
import './billing-workspace.css';

export type BillingScreenProps = {
  readonly path?: string;
};

type BillingTab = 'ai' | 'audit' | 'billing' | 'plan';
type BillingAccountState = 'ACTIVE' | 'EXPIRED' | 'GRACE' | 'PAST_DUE' | 'TRIAL';
type BillingRole = 'ADMIN' | 'MEMBER' | 'OWNER';
type BillingTone = 'amber' | 'emerald' | 'indigo' | 'rose' | 'slate';

type EntitlementRow = {
  readonly detail: string;
  readonly label: string;
  readonly progress: number | null;
  readonly status: string;
  readonly statusTone: BillingTone;
  readonly value: string;
};

type InvoiceRow = {
  readonly date: string;
  readonly gross: string;
  readonly id: string;
  readonly net: string;
  readonly period: string;
  readonly status: 'OPEN' | 'PAID';
  readonly vat: string;
};

type AiUsageMetric = {
  readonly caption: string;
  readonly limit: string;
  readonly status: string;
  readonly tone: BillingTone;
  readonly used: string;
  readonly value: number;
};

type AuditRow = {
  readonly fix: string;
  readonly id: string;
  readonly issue: string;
};

type RbacRow = {
  readonly admin: string;
  readonly member: string;
  readonly operation: string;
  readonly owner: string;
  readonly stepUp: string;
};

type PlanOption = {
  readonly badge?: string;
  readonly cta: string;
  readonly disabled?: boolean;
  readonly features: readonly {
    readonly enabled: boolean;
    readonly text: string;
    readonly strong?: boolean;
  }[];
  readonly id: 'enterprise' | 'professional' | 'starter';
  readonly name: string;
  readonly priceLabel: string;
  readonly priceNet: number | null;
};

const billingTabs: readonly {
  readonly icon: string;
  readonly id: BillingTab;
  readonly label: string;
}[] = [
  { icon: '📊', id: 'plan', label: 'Aktualny plan' },
  { icon: '💳', id: 'billing', label: 'Płatności i faktury' },
  { icon: '⚡', id: 'ai', label: 'Zużycie zasobów AI' },
  { icon: '🛡️', id: 'audit', label: 'Plan Naprawczy P0 i RBAC' },
];

const accountStateOptions: readonly {
  readonly id: BillingAccountState;
  readonly label: string;
}[] = [
  { id: 'ACTIVE', label: 'ACTIVE (Pełny dostęp)' },
  { id: 'TRIAL', label: 'TRIAL (Okres próbny - 6 dni)' },
  { id: 'PAST_DUE', label: 'PAST_DUE (Błąd płatności - Read Only)' },
  { id: 'GRACE', label: 'GRACE (Okres ochronny)' },
  { id: 'EXPIRED', label: 'EXPIRED (Wygasła - Billing Only)' },
];

const roleOptions: readonly {
  readonly id: BillingRole;
  readonly label: string;
}[] = [
  { id: 'OWNER', label: 'OWNER (Właściciel)' },
  { id: 'ADMIN', label: 'ADMIN (Brak edycji billing)' },
  { id: 'MEMBER', label: 'MEMBER (Tylko podgląd)' },
];

const accountStateCopy: Record<BillingAccountState, {
  readonly access: string;
  readonly badge: string;
  readonly bannerAction?: string;
  readonly bannerBody?: string;
  readonly bannerIcon?: string;
  readonly bannerTitle?: string;
  readonly bannerTone?: BillingTone;
  readonly recommendedAction: string;
  readonly tone: BillingTone;
}> = {
  ACTIVE: {
    access: 'ACTIVE (Pełny)',
    badge: 'AKTYWNY',
    recommendedAction: 'Wszystko pod kontrolą',
    tone: 'emerald',
  },
  EXPIRED: {
    access: 'BILLING_ONLY (Blokada)',
    badge: 'WYGASŁA (EXPIRED)',
    bannerAction: 'Odnów dostęp →',
    bannerBody: 'Dostępna jest wyłącznie sekcja Subskrypcja i płatności. Aktywuj konto ponownie.',
    bannerIcon: '🔒',
    bannerTitle: 'Dostęp do workspace został zablokowany (BILLING_ONLY).',
    bannerTone: 'slate',
    recommendedAction: 'Odnów dostęp',
    tone: 'slate',
  },
  GRACE: {
    access: 'FULL (Chwilowy Grace)',
    badge: 'OKRES OCHRONNY (GRACE)',
    bannerAction: 'Zaktualizuj płatność →',
    bannerBody: 'Zaktualizuj metodę płatności do 29 sierpnia, aby zapobiec całkowitej blokadzie dostępu.',
    bannerIcon: '🛡️',
    bannerTitle: 'Kończy się okres ochronny (Grace Period).',
    bannerTone: 'amber',
    recommendedAction: 'Napraw płatność',
    tone: 'amber',
  },
  PAST_DUE: {
    access: 'READ_ONLY (Brak edycji)',
    badge: 'PROBLEM Z PŁATNOŚCIĄ (PAST_DUE)',
    bannerAction: 'Ureguluj płatność teraz →',
    bannerBody: 'Nie udało się pobrać środków za kolejny okres. Dostęp do edycji danych biznesowych został wstrzymany.',
    bannerIcon: '⚠️',
    bannerTitle: 'Płatność nie powiodła się. Konto działa w trybie READ_ONLY.',
    bannerTone: 'rose',
    recommendedAction: 'Ureguluj płatność!',
    tone: 'rose',
  },
  TRIAL: {
    access: 'FULL (Pozostało 6 dni)',
    badge: 'OKRES PRÓBNY (TRIAL)',
    bannerAction: 'Wybierz plan komercyjny →',
    bannerBody: 'Wybierz pakiet produkcyjny, aby zachować ciągłość integracji i raportów.',
    bannerIcon: '⏳',
    bannerTitle: 'Okres próbny wygasa za 6 dni (1 września 2026).',
    bannerTone: 'amber',
    recommendedAction: 'Wybierz plan',
    tone: 'amber',
  },
};

const entitlementRows: readonly EntitlementRow[] = [
  {
    detail: 'Maks. aktywne połączenia',
    label: 'Źródła danych (Integracje)',
    progress: 80,
    status: 'Blisko limitu (Near)',
    statusTone: 'amber',
    value: '12 / 15',
  },
  {
    detail: 'Izolowane tenanty',
    label: 'Przestrzenie Robocze (Workspaces)',
    progress: 66,
    status: 'OK',
    statusTone: 'emerald',
    value: '2 / 3',
  },
  {
    detail: 'Pobieranie surowych raportów',
    label: 'Eksport Danych (CSV/JSON/XLSX)',
    progress: null,
    status: 'Odblokowany',
    statusTone: 'emerald',
    value: 'Dostępny',
  },
  {
    detail: 'Generowanie zestawień',
    label: 'Harmonogram Raportów',
    progress: null,
    status: 'Na żądanie',
    statusTone: 'emerald',
    value: 'Na żądanie',
  },
  {
    detail: 'Papa Asystent & AI Lab',
    label: 'Moduły Sztucznej Inteligencji (AI)',
    progress: 78,
    status: 'Szczegóły AI →',
    statusTone: 'indigo',
    value: 'Aktywne (Max 78%)',
  },
];

const invoiceRows: readonly InvoiceRow[] = [
  { date: '2026-08-01', gross: '613.77 PLN', id: 'FV/2026/08/001', net: '499.00 PLN', period: '01.08.2026 - 31.08.2026', status: 'PAID', vat: '114.77 PLN' },
  { date: '2026-07-01', gross: '613.77 PLN', id: 'FV/2026/07/001', net: '499.00 PLN', period: '01.07.2026 - 31.07.2026', status: 'PAID', vat: '114.77 PLN' },
  { date: '2026-06-01', gross: '613.77 PLN', id: 'FV/2026/06/001', net: '499.00 PLN', period: '01.06.2026 - 30.06.2026', status: 'PAID', vat: '114.77 PLN' },
  { date: '2026-05-01', gross: '613.77 PLN', id: 'FV/2026/05/001', net: '499.00 PLN', period: '01.05.2026 - 31.05.2026', status: 'PAID', vat: '114.77 PLN' },
  { date: '2026-04-01', gross: '613.77 PLN', id: 'FV/2026/04/001', net: '499.00 PLN', period: '01.04.2026 - 30.04.2026', status: 'PAID', vat: '114.77 PLN' },
];

const aiUsageMetrics: readonly AiUsageMetric[] = [
  { caption: 'Zapytania AI (Requests)', limit: '/ 5 000', status: '62.4% wykorzystania — Status OK', tone: 'indigo', used: '3 120', value: 62.4 },
  { caption: 'Tokeny LLM (AI Tokens)', limit: '/ 2.50M', status: '78.0% (ALARM PROGU 80% ZA 4 DNI)', tone: 'amber', used: '1.95M', value: 78 },
  { caption: 'Predykcje Analityczne', limit: '/ 10', status: '30.0% wykorzystania — Status OK', tone: 'emerald', used: '3', value: 30 },
  { caption: 'Eksporty Raportów AI', limit: '/ 100', status: '4.0% wykorzystania — Status OK', tone: 'emerald', used: '4', value: 4 },
];

const auditRows: readonly AuditRow[] = [
  {
    fix: "Usunięcie hardcode'u. Wyłączną wartością jest COMMERCIAL_PLAN_CATALOG.",
    id: 'P0.1',
    issue: 'Sprzeczne limity AI (UI hardcode 1000/5000 vs Katalog 0/null).',
  },
  {
    fix: 'Rozdzielenie wskaźników. Wskaźnik zbiorczy = max utilization ratio.',
    id: 'P0.2',
    issue: 'Błędne matematyczne sumowanie zapytań + tokenów w 1 % overall.',
  },
  {
    fix: 'Przełączenie na Stripe Customer Portal / Checkout hosted solution.',
    id: 'P0.3',
    issue: 'Formularz zbierający numer PAN i CVC na serwerze PapaData.',
  },
  {
    fix: 'Oznaczenie jako tryb DEMO/Sandbox lub pełne API płatności bankowych.',
    id: 'P0.4',
    issue: 'Lokalne symulacje płatności BLIK/przelewów imitujące produkcję.',
  },
  {
    fix: 'Pobieranie dedykowanego konta bankowego wyłącznie z backend API.',
    id: 'P0.5',
    issue: 'Hardcodowany przykładowy IBAN (PL00 0000...) w przelewach.',
  },
  {
    fix: 'Tryb read-only dla formularza progów do czasu gotowości API.',
    id: 'P0.6',
    issue: 'Komunikat sukcesu zapisu limitów AI przy canConfigureAiLimits=false.',
  },
  {
    fix: 'Usunięcie fikcyjnego podziału na rzecz telemetrii usage per actor.',
    id: 'P0.7',
    issue: 'Syntetyczna atrybucja zużycia AI (arbitralny podział procentowy).',
  },
  {
    fix: 'Blokada public checkoutu do momentu zatwierdzenia Price Booka.',
    id: 'P0.8',
    issue: 'Niezatwierdzone ceny 199/499 PLN mają status HYPOTHESIS.',
  },
];

const rbacRows: readonly RbacRow[] = [
  {
    admin: '✓ Dostęp',
    member: '✓ Dostęp',
    operation: 'Podgląd stanu planu, limitów i faktur',
    owner: '✓ Dostęp',
    stepUp: 'Nie',
  },
  {
    admin: '✓ Dostęp*',
    member: '✓ Dostęp*',
    operation: 'Pobranie faktury PDF (Signed URL)',
    owner: '✓ Dostęp',
    stepUp: 'Nie',
  },
  {
    admin: '— Blokada',
    member: '— Blokada',
    operation: 'Zmiana planu (Upgrade / Downgrade)',
    owner: '✓ Dostęp',
    stepUp: 'Tak (@RequireStepUp)',
  },
  {
    admin: '— Blokada',
    member: '— Blokada',
    operation: 'Zmiana metody płatności (Stripe Portal)',
    owner: '✓ Dostęp',
    stepUp: 'Tak (@RequireStepUp)',
  },
  {
    admin: '— Blokada',
    member: '— Blokada',
    operation: 'Zmiana profilu billingowego / NIP',
    owner: '✓ Dostęp',
    stepUp: 'Tak (@RequireStepUp)',
  },
  {
    admin: '— Blokada',
    member: '— Blokada',
    operation: 'Anulowanie subskrypcji na koniec okresu',
    owner: '✓ Dostęp',
    stepUp: 'Tak (@RequireStepUp)',
  },
];

const planOptions: readonly PlanOption[] = [
  {
    cta: 'Wybierz Starter',
    features: [
      { enabled: true, text: 'Maksymalnie 3 źródła danych' },
      { enabled: true, text: '1 Przestrzeń robocza (Workspace)' },
      { enabled: false, text: 'AI Wyłączone (0 zapytań)' },
      { enabled: true, text: 'Raporty miesięczne' },
      { enabled: false, text: 'Eksport danych wyłączony' },
    ],
    id: 'starter',
    name: 'Starter',
    priceLabel: '199 PLN / mies.',
    priceNet: 199,
  },
  {
    badge: 'Bieżący Plan',
    cta: 'Obecnie Aktywny',
    disabled: true,
    features: [
      { enabled: true, text: 'Maksymalnie 15 źródeł danych' },
      { enabled: true, text: '3 Przestrzenie robocze' },
      { enabled: true, strong: true, text: 'AI Aktywne (Limit zapytań)' },
      { enabled: true, text: 'Raporty na żądanie' },
      { enabled: true, text: 'Eksport danych (CSV/XLSX)' },
    ],
    id: 'professional',
    name: 'Professional',
    priceLabel: '499 PLN / mies.',
    priceNet: 499,
  },
  {
    cta: 'Poproś o ofertę →',
    features: [
      { enabled: true, text: 'Dedykowane źródła bez limitu' },
      { enabled: true, text: "Nielimitowane workspace'y" },
      { enabled: true, text: 'Dedykowana klasteryzacja AI' },
      { enabled: true, text: 'Raporty Custom & KSeF API' },
      { enabled: true, text: 'Dedykowany opiekun (SLA 99.9%)' },
    ],
    id: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Wyceptuj wycenę',
    priceNet: null,
  },
];

export function BillingScreen({
  path = '/app/billing/subskrypcja',
}: BillingScreenProps) {
  const definition = findBillingScreenDefinition(path);

  if (!definition) {
    return (
      <InlineNotice
        message="Routing wskazuje ekran spoza zakresu sekcji 70."
        title="Nieobsługiwany ekran billingowy"
        tone="critical"
      />
    );
  }

  return (
    <BillingWorkspace
      data={createBillingStorybookData()}
      definition={definition}
    />
  );
}

export function BillingWorkspace({
  data,
  definition,
  mode = 'runtime',
}: {
  readonly data: BillingWorkspaceData;
  readonly definition: BillingScreenDefinition;
  readonly mode?: 'runtime' | 'storybook';
}) {
  const [activeTab, setActiveTab] = useState<BillingTab>(() => tabFromVariant(definition.variant));
  const [accountState, setAccountState] = useState<BillingAccountState>(() => stateFromVariant(definition.variant));
  const [role, setRole] = useState<BillingRole>('OWNER');
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<'ALL' | InvoiceRow['status']>('ALL');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [toast, setToast] = useState('');
  const [taxNip, setTaxNip] = useState('PL5252819000');
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const stateCopy = accountStateCopy[accountState];
  const isOwner = role === 'OWNER';

  useEffect(() => {
    setActiveTab(tabFromVariant(definition.variant));
    setAccountState(stateFromVariant(definition.variant));
  }, [definition.variant]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredInvoices = useMemo(() => {
    const query = invoiceQuery.trim().toLowerCase();

    return invoiceRows.filter((invoice) => {
      const matchesQuery = !query || invoice.id.toLowerCase().includes(query);
      const matchesStatus = invoiceStatus === 'ALL' || invoice.status === invoiceStatus;
      return matchesQuery && matchesStatus;
    });
  }, [invoiceQuery, invoiceStatus]);

  const checkoutSummary = selectedPlan?.priceNet == null
    ? null
    : {
      gross: selectedPlan.priceNet * 1.23,
      net: selectedPlan.priceNet,
      vat: selectedPlan.priceNet * 0.23,
    };

  function showToast(message: string) {
    setToast(message);
  }

  function requireOwner(action: string) {
    if (isOwner) return true;
    showToast(`${action} wymaga roli OWNER i step-up authentication.`);
    return false;
  }

  function openPlanModal() {
    if (!requireOwner('Zmiana planu')) return;
    setSelectedPlan(null);
    setIsPlanModalOpen(true);
  }

  function openStripePortal() {
    if (!requireOwner('Zmiana metod płatności')) return;
    showToast('Wymóg Step-Up Authentication: po potwierdzeniu MFA otwieramy Stripe Customer Portal.');
  }

  function triggerCancelAtPeriodEnd() {
    if (!requireOwner('Anulowanie subskrypcji')) return;
    setCancelAtPeriodEnd(true);
    showToast('Subskrypcja została oznaczona do wygaszenia z końcem okresu. Dostęp trwa do 31 sierpnia 2026.');
  }

  function editBillingProfile() {
    if (!requireOwner('Edycja profilu billingowego')) return;
    setTaxNip((currentValue) => (currentValue === 'PL5252819000' ? 'PL5252821000' : 'PL5252819000'));
    showToast('Dane podatkowe zaktualizowane. Trwa walidacja statusu VAT w rejestrze podatkowym.');
  }

  function downloadInvoice(invoiceId: string) {
    if (role === 'MEMBER') {
      showToast('Pobieranie faktur wymaga roli OWNER lub ADMIN.');
      return;
    }

    showToast(`Wygenerowano Signed URL dla ${invoiceId}. Link wygasa za 15 minut i jest przypisany do tenantu.`);
  }

  function selectPlan(plan: PlanOption) {
    if (plan.id === 'enterprise') {
      showToast('Zapytanie o ofertę Enterprise zostanie przekazane do zespołu sprzedaży PapaData.');
      return;
    }

    if (plan.disabled) return;
    setSelectedPlan(plan);
  }

  function executePlanChange() {
    if (!selectedPlan) {
      showToast('Wybierz plan przed utworzeniem sesji Stripe Checkout.');
      return;
    }

    if (!requireOwner('Operacje finansowe')) return;
    showToast(`Tworzenie sesji Stripe Checkout dla planu ${selectedPlan.name}. Proration i limity liczy backend.`);
    setIsPlanModalOpen(false);
  }

  function askAssistant(question: string) {
    if (question.includes('wystarczający')) {
      setAssistantAnswer("Na podstawie obecnego zużycia plan Professional jest w pełni optymalny. Wykorzystujesz 12 z 15 integracji oraz 2 z 3 workspace'ów. Nie rekomenduję płatności za wyższy pakiet Enterprise.");
      return;
    }

    if (question.includes('pierwszy')) {
      setAssistantAnswer('Najszybciej osiągniesz próg ostrzegawczy na Tokenach LLM, obecnie 78% limitu. Według estymacji trendu przekroczenie progu 80% nastąpi za 4 dni, 29 sierpnia.');
      return;
    }

    setAssistantAnswer('W stanie PAST_DUE system blokuje edycję danych i wprowadza tryb READ_ONLY. Użytkownicy mogą odczytywać dane, ale nie mogą dodawać nowych integracji ani generować raportów do czasu uregulowania płatności.');
  }

  return (
    <div
      aria-label={`Subskrypcja i płatności: ${definition.displayTitle}`}
      className="pd-billing-id10"
      data-mode={mode}
      data-production-canvas="true"
      data-screen-id={definition.id}
      data-screen-variant={definition.variant}
    >
      <header className="pd-billing-id10__topbar">
        <div className="pd-billing-id10__topbar-inner">
          <div className="pd-billing-id10__brand">
            <span className="pd-billing-id10__brand-name">PapaData</span>
            <span className="pd-billing-id10__scope">ID-10 / administration</span>
            <span className="pd-billing-id10__source">
              | Source of Truth: <code>docs/production/billing-and-commerce.md</code>
            </span>
          </div>

          <div className="pd-billing-id10__simulator" aria-label="Symulator stanu konta i roli">
            <label htmlFor="billing-state-simulator">Symulator Stanu Konta:</label>
            <select
              id="billing-state-simulator"
              onChange={(event) => setAccountState(event.currentTarget.value as BillingAccountState)}
              value={accountState}
            >
              {accountStateOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>

            <label htmlFor="billing-role-simulator">Rola:</label>
            <select
              id="billing-role-simulator"
              onChange={(event) => setRole(event.currentTarget.value as BillingRole)}
              value={role}
            >
              {roleOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {stateCopy.bannerTitle ? (
        <div className="pd-billing-id10__banner-shell">
          <div className={`pd-billing-id10__state-banner pd-billing-id10__state-banner--${stateCopy.bannerTone ?? stateCopy.tone}`}>
            <div className="pd-billing-id10__state-copy">
              <span className="pd-billing-id10__state-icon" aria-hidden="true">{stateCopy.bannerIcon}</span>
              <div>
                <strong>{stateCopy.bannerTitle}</strong>
                <span>{stateCopy.bannerBody}</span>
              </div>
            </div>
            <button
              className="pd-billing-id10__banner-button"
              onClick={accountState === 'TRIAL' || accountState === 'EXPIRED' ? openPlanModal : openStripePortal}
              type="button"
            >
              {stateCopy.bannerAction}
            </button>
          </div>
        </div>
      ) : null}

      <main className="pd-billing-id10__main">
        <div className="pd-billing-id10__page-header">
          <div>
            <div className="pd-billing-id10__title-row">
              <h1>Subskrypcja i płatności</h1>
              <span className={`pd-billing-id10__status-badge pd-billing-id10__status-badge--${stateCopy.tone}`}>
                {stateCopy.badge}
              </span>
            </div>
            <p>
              Zarządzaj planem komercyjnym, rozliczeniami, dokumentami oraz limitami zasobów AI w workspace.
            </p>
          </div>

          <div className="pd-billing-id10__header-actions">
            <button
              className="pd-billing-id10__assistant-trigger"
              onClick={() => setIsAssistantOpen(true)}
              type="button"
            >
              <span aria-hidden="true">🤖</span>
              <span>Papa Asystent Billing</span>
            </button>
            <button
              className="pd-billing-id10__primary-button"
              disabled={!isOwner}
              onClick={openPlanModal}
              title={!isOwner ? 'Tę zmianę może wykonać wyłącznie właściciel workspace (OWNER).' : undefined}
              type="button"
            >
              Zmień plan
            </button>
          </div>
        </div>

        <section className="pd-billing-id10__status-bar" aria-label="Globalny status billingowy">
          {[
            ['1. Jaki mam plan?', 'Professional', 'slate'],
            ['2. Czy konto działa?', stateCopy.access, stateCopy.tone],
            ['3. Ile płacę?', '499,00 PLN netto / mies.', 'slate'],
            ['4. Kiedy odnowienie?', '31 sierpnia 2026', 'slate'],
            ['5. Jak płacę?', 'Visa •••• 4242', 'slate'],
            ['6. Co muszę zrobić?', stateCopy.recommendedAction, stateCopy.tone],
          ].map(([label, value, tone]) => (
            <div key={label} className="pd-billing-id10__status-cell">
              <span>{label}</span>
              <strong className={`pd-billing-id10__tone-${tone}`}>{value}</strong>
            </div>
          ))}
        </section>

        <nav className="pd-billing-id10__tabs" aria-label="Zakładki billingowe">
          {billingTabs.map((tab) => (
            <button
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={activeTab === tab.id ? 'is-active' : undefined}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {activeTab === 'plan' ? (
          <PlanTab
            cancelAtPeriodEnd={cancelAtPeriodEnd}
            isOwner={isOwner}
            onCancel={triggerCancelAtPeriodEnd}
            onOpenPlanModal={openPlanModal}
            onOpenStripePortal={openStripePortal}
            onShowAi={() => setActiveTab('ai')}
          />
        ) : null}

        {activeTab === 'billing' ? (
          <BillingDocumentsTab
            filteredInvoices={filteredInvoices}
            invoiceQuery={invoiceQuery}
            invoiceStatus={invoiceStatus}
            onDownloadInvoice={downloadInvoice}
            onEditBillingProfile={editBillingProfile}
            onInvoiceQueryChange={setInvoiceQuery}
            onInvoiceStatusChange={setInvoiceStatus}
            onOpenStripePortal={openStripePortal}
            taxNip={taxNip}
          />
        ) : null}

        {activeTab === 'ai' ? (
          <AiUsageTab onReadOnlySave={() => showToast('Zapis limitów wyłączony do czasu wdrożenia API utrwalającego backendu. Brak symulacji jawnego sukcesu.')} />
        ) : null}

        {activeTab === 'audit' ? (
          <AuditTab />
        ) : null}
      </main>

      <footer className="pd-billing-id10__footer">
        <div>
          <strong>PapaData Subskrypcja i płatności</strong> — Wersja specyfikacji 2.0-PROD (Sierpień 2026)
        </div>
        <div className="pd-billing-id10__footer-links">
          <a href="/docs/api" onClick={(event) => event.preventDefault()}>Dokumentacja API</a>
          <a href="/docs/stripe" onClick={(event) => event.preventDefault()}>Stripe Portal API</a>
          <a href="/privacy" onClick={(event) => event.preventDefault()}>Polityka Prywatności</a>
        </div>
      </footer>

      {isPlanModalOpen ? (
        <PlanModal
          checkoutSummary={checkoutSummary}
          onClose={() => setIsPlanModalOpen(false)}
          onExecutePlanChange={executePlanChange}
          onSelectPlan={selectPlan}
          plans={planOptions}
          selectedPlan={selectedPlan}
        />
      ) : null}

      {isAssistantOpen ? (
        <AssistantModal
          answer={assistantAnswer}
          onAsk={askAssistant}
          onClose={() => setIsAssistantOpen(false)}
        />
      ) : null}

      <div className="pd-billing-id10__sr-state" aria-live="polite">{toast}</div>
      {toast ? (
        <div className="pd-billing-id10__toast" role="status">
          {toast}
        </div>
      ) : null}

      <span hidden>{data.generatedAt}</span>
    </div>
  );
}

function PlanTab({
  cancelAtPeriodEnd,
  isOwner,
  onCancel,
  onOpenPlanModal,
  onOpenStripePortal,
  onShowAi,
}: {
  readonly cancelAtPeriodEnd: boolean;
  readonly isOwner: boolean;
  readonly onCancel: () => void;
  readonly onOpenPlanModal: () => void;
  readonly onOpenStripePortal: () => void;
  readonly onShowAi: () => void;
}) {
  return (
    <div className="pd-billing-id10__tab-content">
      <div className="pd-billing-id10__context-note">
        <strong>Kontekst sekcji:</strong> Ta zakładka prezentuje aktualny kontrakt subskrypcyjny workspace'u, zestawienie wykorzystania przyznanych zasobów (Entitlements) oraz inteligentny rekomendator działań oparty na rzeczywistym zużyciu. Umożliwia bezpieczny proces upgrade/downgrade bez ryzyka utraty danych.
      </div>

      <div className="pd-billing-id10__plan-grid">
        <div className="pd-billing-id10__left-column">
          <section className="pd-billing-id10__panel">
            <div className="pd-billing-id10__panel-head">
              <div>
                <span>Aktywny Kontrakt</span>
                <h2>Plan Professional</h2>
              </div>
              <span className="pd-billing-id10__mini-badge pd-billing-id10__mini-badge--emerald">ACTIVE</span>
            </div>

            <dl className="pd-billing-id10__detail-list">
              <div>
                <dt>Cena miesięczna</dt>
                <dd>499,00 PLN netto (613,77 zł brutto)</dd>
              </div>
              <div>
                <dt>Cykl rozliczeniowy</dt>
                <dd>Miesięczny (odnawialny)</dd>
              </div>
              <div>
                <dt>Następne odnowienie</dt>
                <dd>31 sierpnia 2026</dd>
              </div>
              <div>
                <dt>Zarejestrowana karta</dt>
                <dd>Visa •••• 4242 (exp 09/28)</dd>
              </div>
              <div>
                <dt>Status odnowienia</dt>
                <dd className={cancelAtPeriodEnd ? 'pd-billing-id10__tone-amber' : 'pd-billing-id10__tone-emerald'}>
                  {cancelAtPeriodEnd ? 'Wygasa z dniem 31.08.2026' : 'Automatyczne odnawianie'}
                </dd>
              </div>
            </dl>

            <div className="pd-billing-id10__button-row">
              <button className="pd-billing-id10__primary-button" disabled={!isOwner} onClick={onOpenPlanModal} type="button">Zmień plan</button>
              <button className="pd-billing-id10__secondary-button" disabled={!isOwner} onClick={onOpenStripePortal} type="button">Stripe Portal</button>
              <button className="pd-billing-id10__danger-button" disabled={!isOwner} onClick={onCancel} type="button">Anuluj subskrypcję</button>
            </div>
          </section>

          <section className="pd-billing-id10__panel">
            <div className="pd-billing-id10__recommendation-title">
              <span aria-hidden="true">💡</span>
              <h3>Rekomendacja Produktowa PapaData</h3>
            </div>
            <div className="pd-billing-id10__recommendation-box">
              <p>
                Twój plan <strong>Professional</strong> idealnie odpowiada obecnemu wykorzystaniu. Wszystkie limity źródeł danych oraz workspace'ów mieszczą się w normie.
              </p>
              <button onClick={onOpenPlanModal} type="button">Porównaj wszystkie plany →</button>
            </div>
          </section>
        </div>

        <section className="pd-billing-id10__panel pd-billing-id10__entitlements">
          <div className="pd-billing-id10__section-title">
            <div>
              <h3>Limity i Przyznane Zasoby (Entitlements)</h3>
              <p>Zweryfikowane wykorzystanie zasobów w stosunku do katalogu handlowego.</p>
            </div>
            <span>Status: Standard</span>
          </div>

          <div className="pd-billing-id10__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Zasób / Entitlement</th>
                  <th>Wykorzystanie</th>
                  <th>Wskaźnik %</th>
                  <th>Status Biznesowy</th>
                </tr>
              </thead>
              <tbody>
                {entitlementRows.map((row) => (
                  <tr key={row.label}>
                    <td>
                      <strong>{row.label}</strong>
                      <span>{row.detail}</span>
                    </td>
                    <td><strong>{row.value}</strong></td>
                    <td>
                      {row.progress == null ? (
                        <span className="pd-billing-id10__muted">—</span>
                      ) : (
                        <ProgressBar tone={row.statusTone} value={row.progress} />
                      )}
                    </td>
                    <td>
                      {row.statusTone === 'indigo' ? (
                        <button className="pd-billing-id10__link-button" onClick={onShowAi} type="button">{row.status}</button>
                      ) : (
                        <span className={`pd-billing-id10__mini-badge pd-billing-id10__mini-badge--${row.statusTone}`}>{row.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pd-billing-id10__warning-note">
            <span aria-hidden="true">⚠️</span>
            <div>
              <strong>Reguła Przekroczenia Limitów:</strong> Próba dodania 16. źródła danych wyświetli blokadę z propozycją upgrade'u do Enterprise lub zwolnienia dotychczasowego slotu.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function BillingDocumentsTab({
  filteredInvoices,
  invoiceQuery,
  invoiceStatus,
  onDownloadInvoice,
  onEditBillingProfile,
  onInvoiceQueryChange,
  onInvoiceStatusChange,
  onOpenStripePortal,
  taxNip,
}: {
  readonly filteredInvoices: readonly InvoiceRow[];
  readonly invoiceQuery: string;
  readonly invoiceStatus: 'ALL' | InvoiceRow['status'];
  readonly onDownloadInvoice: (invoiceId: string) => void;
  readonly onEditBillingProfile: () => void;
  readonly onInvoiceQueryChange: (value: string) => void;
  readonly onInvoiceStatusChange: (value: 'ALL' | InvoiceRow['status']) => void;
  readonly onOpenStripePortal: () => void;
  readonly taxNip: string;
}) {
  return (
    <div className="pd-billing-id10__tab-content">
      <div className="pd-billing-id10__context-note">
        <strong>Kontekst sekcji:</strong> Ta zakładka służy do zarządzania tożsamością podatkową B2B, profilami płatniczymi oraz bezpiecznym pobieraniem dokumentów księgowych. Wszystkie faktury pobierane są przez jednorazowe, podpisane cyfrowo adresy URL (Signed URLs).
      </div>

      <div className="pd-billing-id10__two-grid">
        <section className="pd-billing-id10__panel">
          <div className="pd-billing-id10__section-title">
            <div>
              <h3>Profil Billingowy i Podatkowy B2B</h3>
              <p>Dane wykorzystywane na fakturach VAT</p>
            </div>
            <button className="pd-billing-id10__link-button" onClick={onEditBillingProfile} type="button">Edytuj profil</button>
          </div>

          <dl className="pd-billing-id10__profile-list">
            <div>
              <dt>Nazwa Podmiotu</dt>
              <dd>PapaData Analytics Sp. z o.o.</dd>
            </div>
            <div>
              <dt>NIP / VAT ID</dt>
              <dd>{taxNip}</dd>
            </div>
            <div>
              <dt>Weryfikacja VAT Status</dt>
              <dd><span className="pd-billing-id10__mini-badge pd-billing-id10__mini-badge--emerald">Zweryfikowany (Polska B2B)</span></dd>
            </div>
            <div>
              <dt>E-mail do faktur</dt>
              <dd>faktury@papadata.io</dd>
            </div>
            <div>
              <dt>Waluta rozliczeniowa</dt>
              <dd>PLN (Polski Złoty)</dd>
            </div>
          </dl>
        </section>

        <section className="pd-billing-id10__panel">
          <div className="pd-billing-id10__section-title">
            <div>
              <h3>Zapisane Metody Płatności</h3>
              <p>Bezpieczna obsługa przez Stripe Gateway</p>
            </div>
            <span>PCI-DSS Compliant</span>
          </div>

          <div className="pd-billing-id10__card-method">
            <div>
              <span>VISA</span>
              <div>
                <strong>Visa •••• 4242</strong>
                <small>Ważna do: 09/2028 · Domyślna metoda</small>
              </div>
            </div>
            <span className="pd-billing-id10__mini-badge pd-billing-id10__mini-badge--emerald">AKTYWNA</span>
          </div>

          <p className="pd-billing-id10__security-copy">
            🔒 <strong>Bezpieczeństwo Kart:</strong> Serwery PapaData nie przetwarzają ani nie przechowują surowych numerów kart (PAN/CVC). Wszystkie operacje realizowane są w bezpiecznej sesji Stripe Customer Portal.
          </p>

          <button className="pd-billing-id10__dark-button" onClick={onOpenStripePortal} type="button">
            Zarządzaj metodami w Stripe Portal →
          </button>
        </section>
      </div>

      <section className="pd-billing-id10__panel">
        <div className="pd-billing-id10__invoice-head">
          <div>
            <h3>Dokumenty Rozliczeniowe i Faktury</h3>
            <p>Pełna historia transakcji i pobieranie cyfrowe PDF.</p>
          </div>
          <div className="pd-billing-id10__filters">
            <input
              aria-label="Szukaj faktury po numerze"
              onChange={(event) => onInvoiceQueryChange(event.currentTarget.value)}
              placeholder="Szukaj po numerze..."
              type="text"
              value={invoiceQuery}
            />
            <select
              aria-label="Filtr statusu faktury"
              onChange={(event) => onInvoiceStatusChange(event.currentTarget.value as 'ALL' | InvoiceRow['status'])}
              value={invoiceStatus}
            >
              <option value="ALL">Wszystkie statusy</option>
              <option value="PAID">Opłacone (PAID)</option>
              <option value="OPEN">Do opłacenia (OPEN)</option>
            </select>
          </div>
        </div>

        <div className="pd-billing-id10__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Numer Faktury</th>
                <th>Data Wystawienia</th>
                <th>Okres Rozliczeniowy</th>
                <th>Kwota Netto</th>
                <th>VAT</th>
                <th>Kwota Brutto</th>
                <th>Status</th>
                <th>Dokument</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td><strong>{invoice.id}</strong></td>
                  <td>{invoice.date}</td>
                  <td>{invoice.period}</td>
                  <td>{invoice.net}</td>
                  <td>{invoice.vat}</td>
                  <td><strong>{invoice.gross}</strong></td>
                  <td><span className="pd-billing-id10__mini-badge pd-billing-id10__mini-badge--emerald">{invoice.status}</span></td>
                  <td>
                    <button className="pd-billing-id10__download-button" onClick={() => onDownloadInvoice(invoice.id)} type="button">
                      <span aria-hidden="true">📥</span>
                      <span>Pobierz PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td className="pd-billing-id10__empty-row" colSpan={8}>Brak faktur pasujących do filtrów.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AiUsageTab({
  onReadOnlySave,
}: {
  readonly onReadOnlySave: () => void;
}) {
  return (
    <div className="pd-billing-id10__tab-content">
      <div className="pd-billing-id10__context-note">
        <strong>Kontekst sekcji:</strong> Monitorowanie zużycia zasobów AI w cyklu miesięcznym. System udostępnia niepoprawioną analitykę poszczególnych jednostek (zapytań, tokenów, predykcji) zapobiegając błędnemu matematycznie sumowaniu nieporównywalnych parametrów.
      </div>

      <div className="pd-billing-id10__ai-grid">
        {aiUsageMetrics.map((metric) => (
          <article className={`pd-billing-id10__ai-card pd-billing-id10__ai-card--${metric.tone}`} key={metric.caption}>
            <span>{metric.caption}</span>
            <div>
              <strong>{metric.used}</strong>
              <small>{metric.limit}</small>
            </div>
            <ProgressBar tone={metric.tone} value={metric.value} />
            <p>{metric.status}</p>
          </article>
        ))}
      </div>

      <div className="pd-billing-id10__two-grid">
        <section className="pd-billing-id10__panel">
          <div className="pd-billing-id10__section-title">
            <div>
              <h3>Niezależne Wskaźniki Zużycia Zasobów AI</h3>
              <p>Poprawny brak matematycznego sumowania tokenów i zapytań</p>
            </div>
            <span>Cykl: 1–31 Sierpnia</span>
          </div>
          <QuotaCanvas />
        </section>

        <section className="pd-billing-id10__panel">
          <div className="pd-billing-id10__section-title">
            <div>
              <h3>Prognoza Zużycia Tokenów LLM</h3>
              <p>Estymacja osiągnięcia progu 80% i limitu pakietu</p>
            </div>
            <span className="pd-billing-id10__mini-badge pd-billing-id10__mini-badge--amber">Alert Progu: 4 dni</span>
          </div>
          <ForecastCanvas />
        </section>
      </div>

      <section className="pd-billing-id10__panel">
        <div className="pd-billing-id10__section-title">
          <div>
            <h3>Właścicielskie Progi Ostrzegawcze (Owner Thresholds)</h3>
            <p>Ustawienie alertów e-mail oraz powiadomień w systemie</p>
          </div>
          <span>canConfigureAiLimits: false (Backend Pending)</span>
        </div>

        <div className="pd-billing-id10__warning-note pd-billing-id10__warning-note--split">
          <div>
            <span aria-hidden="true">ℹ️</span>
            <span>
              <strong>Status Konfiguracji:</strong> Zmiana progów dostępna jest obecnie w trybie odczytu (Read-Only), oczekując na produkcyjne API zapisujące (`AI_LIMIT_CONFIGURATION_PENDING`).
            </span>
          </div>
          <button onClick={onReadOnlySave} type="button">Próbuj zapisać</button>
        </div>
      </section>
    </div>
  );
}

function AuditTab() {
  return (
    <div className="pd-billing-id10__tab-content">
      <div className="pd-billing-id10__context-note">
        <strong>Kontekst sekcji:</strong> Tablica kontrolna wymogów produkcyjnych i audytu bezpieczeństwa. Przedstawia listę wyeliminowanych podatności runtime'u (P0.1 - P0.8) oraz macierz uprawnień RBAC z wymogiem uwierzytelnienia krokowej autoryzacji (Step-Up MFA).
      </div>

      <section className="pd-billing-id10__panel">
        <h3 className="pd-billing-id10__standalone-heading">Plan Naprawczy Krytycznych Problemów Produkcyjnych (P0 Baseline)</h3>
        <div className="pd-billing-id10__table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Wykryty Problem Runtime</th>
                <th>Wymagana Naprawa Produkcyjna</th>
                <th>Status w UI</th>
              </tr>
            </thead>
            <tbody>
              {auditRows.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.id}</strong></td>
                  <td>{row.issue}</td>
                  <td>{row.fix}</td>
                  <td><span className="pd-billing-id10__mini-badge pd-billing-id10__mini-badge--emerald">Naprawiono</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pd-billing-id10__panel">
        <h3 className="pd-billing-id10__standalone-heading">Macierz Uprawnień Billingowych (RBAC & Step-Up Auth)</h3>
        <p className="pd-billing-id10__small-copy">
          Wszystkie operacje finansowe i modyfikacje planu są zastrzeżone wyłącznie dla roli <strong>OWNER</strong>. Użytkownicy z rolami ADMIN i MEMBER widzą UI w trybie odczytu.
        </p>
        <div className="pd-billing-id10__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Operacja w Module Subskrypcji</th>
                <th>OWNER</th>
                <th>ADMIN</th>
                <th>MEMBER / VIEWER</th>
                <th>Wymóg Step-Up MFA</th>
              </tr>
            </thead>
            <tbody>
              {rbacRows.map((row) => (
                <tr key={row.operation}>
                  <td><strong>{row.operation}</strong></td>
                  <td className="pd-billing-id10__access-yes">{row.owner}</td>
                  <td className={row.admin.includes('Blokada') ? 'pd-billing-id10__access-no' : 'pd-billing-id10__access-yes'}>{row.admin}</td>
                  <td className={row.member.includes('Blokada') ? 'pd-billing-id10__access-no' : 'pd-billing-id10__access-yes'}>{row.member}</td>
                  <td className={row.stepUp === 'Nie' ? 'pd-billing-id10__muted' : 'pd-billing-id10__tone-indigo'}>{row.stepUp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PlanModal({
  checkoutSummary,
  onClose,
  onExecutePlanChange,
  onSelectPlan,
  plans,
  selectedPlan,
}: {
  readonly checkoutSummary: {
    readonly gross: number;
    readonly net: number;
    readonly vat: number;
  } | null;
  readonly onClose: () => void;
  readonly onExecutePlanChange: () => void;
  readonly onSelectPlan: (plan: PlanOption) => void;
  readonly plans: readonly PlanOption[];
  readonly selectedPlan: PlanOption | null;
}) {
  return (
    <div className="pd-billing-id10__modal-backdrop" role="presentation">
      <div aria-labelledby="billing-plan-modal-title" aria-modal="true" className="pd-billing-id10__plan-modal" role="dialog">
        <div className="pd-billing-id10__modal-head">
          <div>
            <h3 id="billing-plan-modal-title">Zmień lub Odnów Plan Subskrypcji</h3>
            <p>Wszystkie podane ceny są kwotami netto w PLN (Należy doliczyć 23% VAT)</p>
          </div>
          <button aria-label="Zamknij modal planów" onClick={onClose} type="button">×</button>
        </div>

        <div className="pd-billing-id10__catalog-notice">
          ⚠️ <strong>Wersja Katalogu 2026-06-prelaunch-1:</strong> Ceny posiadają status <code>HYPOTHESIS</code>. Publiczny checkout wymaga formalnego zatwierdzenia Price Booka.
        </div>

        <div className="pd-billing-id10__plans-grid">
          {plans.map((plan) => (
            <article className={`pd-billing-id10__plan-option ${plan.id === 'professional' ? 'is-current' : ''}`} key={plan.id}>
              {plan.badge ? <span className="pd-billing-id10__current-badge">{plan.badge}</span> : null}
              <div>
                <h4>{plan.name}</h4>
                <div className="pd-billing-id10__price">{plan.priceLabel}</div>
                <ul>
                  {plan.features.map((feature) => (
                    <li className={!feature.enabled ? 'is-muted' : feature.strong ? 'is-strong' : undefined} key={feature.text}>
                      <span aria-hidden="true">{feature.enabled ? '✓' : '✕'}</span>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={plan.id === 'enterprise' ? 'pd-billing-id10__dark-button' : 'pd-billing-id10__secondary-button'}
                disabled={plan.disabled}
                onClick={() => onSelectPlan(plan)}
                type="button"
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>

        {selectedPlan && checkoutSummary ? (
          <div className="pd-billing-id10__checkout-summary">
            <h4>Podsumowanie zmiany planu i Proration</h4>
            <dl>
              <div>
                <dt>Wybrany plan:</dt>
                <dd>{selectedPlan.name}</dd>
              </div>
              <div>
                <dt>Kwota netto:</dt>
                <dd>{formatMoney(checkoutSummary.net)}</dd>
              </div>
              <div>
                <dt>Podatek VAT (23%):</dt>
                <dd>{formatMoney(checkoutSummary.vat)}</dd>
              </div>
              <div>
                <dt>Łącznie do zapłaty (Brutto):</dt>
                <dd>{formatMoney(checkoutSummary.gross)}</dd>
              </div>
            </dl>
            <button className="pd-billing-id10__confirm-button" onClick={onExecutePlanChange} type="button">
              Potwierdź Zmianę Planu w Stripe Checkout →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AssistantModal({
  answer,
  onAsk,
  onClose,
}: {
  readonly answer: string;
  readonly onAsk: (question: string) => void;
  readonly onClose: () => void;
}) {
  return (
    <div className="pd-billing-id10__modal-backdrop" role="presentation">
      <div aria-labelledby="billing-assistant-modal-title" aria-modal="true" className="pd-billing-id10__assistant-modal" role="dialog">
        <div className="pd-billing-id10__modal-head">
          <div className="pd-billing-id10__assistant-title">
            <span aria-hidden="true">🤖</span>
            <div>
              <h3 id="billing-assistant-modal-title">Papa Asystent Billing</h3>
              <p>Kontekst: <code>billing.overview</code></p>
            </div>
          </div>
          <button aria-label="Zamknij modal asystenta" onClick={onClose} type="button">×</button>
        </div>

        <div className="pd-billing-id10__assistant-intro">
          <p><strong>Cześć! Jestem Twoim asystentem billingowym.</strong></p>
          <p>Mogę pomóc Ci przeanalizować limity planu, podsumować wykorzystanie tokenów AI lub wyjaśnić różnicę między stanami konta PAST_DUE a GRACE.</p>
        </div>

        <div className="pd-billing-id10__assistant-questions">
          <span>Przykładowe pytania:</span>
          {[
            '❓ Czy mój obecny plan jest wystarczający?',
            '⚡ Który limit AI osiągnę jako pierwszy?',
            '🛡️ Co się stanie, gdy status zmieni się na PAST_DUE?',
          ].map((question) => (
            <button key={question} onClick={() => onAsk(question)} type="button">{question}</button>
          ))}
        </div>

        {answer ? (
          <div className="pd-billing-id10__assistant-answer">
            <span>Odpowiedź AI:</span>
            <p>{answer}</p>
          </div>
        ) : null}

        <p className="pd-billing-id10__assistant-disclaimer">
          ⚠️ Papa Asystent doradza w oparciu o dane billingowe, lecz nie realizuje transakcji finansowych bez zgody Ownera.
        </p>
      </div>
    </div>
  );
}

function ProgressBar({
  tone,
  value,
}: {
  readonly tone: BillingTone;
  readonly value: number;
}) {
  return (
    <div className="pd-billing-id10__progress" aria-label={`${value}% wykorzystania`} role="img">
      <span className={`pd-billing-id10__progress-fill pd-billing-id10__progress-fill--${tone}`} style={{ width: `${value}%` }} />
      <small>{value}%</small>
    </div>
  );
}

function QuotaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawQuotaChart(canvas);
  }, []);

  return (
    <div className="pd-billing-id10__chart">
      <canvas aria-label="Wykres wykorzystania limitów AI" ref={canvasRef} />
    </div>
  );
}

function ForecastCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawForecastChart(canvas);
  }, []);

  return (
    <div className="pd-billing-id10__chart">
      <canvas aria-label="Wykres prognozy zużycia tokenów LLM" ref={canvasRef} />
    </div>
  );
}

function drawQuotaChart(canvas: HTMLCanvasElement) {
  const context = prepareCanvas(canvas);
  if (!context) return;

  const metrics = [
    { color: 'rgb(79, 70, 229)', label: 'Zapytania AI', value: 62.4 },
    { color: 'rgb(245, 158, 11)', label: 'Tokeny LLM', value: 78 },
    { color: 'rgb(16, 185, 129)', label: 'Predykcje', value: 30 },
    { color: 'rgb(100, 116, 139)', label: 'Eksporty AI', value: 4 },
  ];
  const width = canvas.clientWidth;
  const barStart = 150;
  const valueColumnWidth = 58;
  const barWidth = Math.max(width - barStart - valueColumnWidth - 20, 120);
  const valueX = width - 14;

  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  context.font = '12px Inter, system-ui, sans-serif';
  metrics.forEach((metric, index) => {
    const y = 42 + index * 48;
    context.fillStyle = 'rgb(71, 85, 105)';
    context.fillText(metric.label, 12, y + 8);
    roundedRect(context, barStart, y - 7, barWidth, 14, 7, 'rgb(241, 245, 249)');
    roundedRect(context, barStart, y - 7, barWidth * (metric.value / 100), 14, 7, metric.color);
    context.fillStyle = 'rgb(51, 65, 85)';
    context.textAlign = 'right';
    context.fillText(`${metric.value}%`, valueX, y + 8);
    context.textAlign = 'start';
  });

  context.fillStyle = 'rgb(148, 163, 184)';
  context.font = '10px Inter, system-ui, sans-serif';
  context.fillText('0%', barStart, 238);
  context.fillText('100%', barStart + barWidth - 24, 238);
}

function drawForecastChart(canvas: HTMLCanvasElement) {
  const context = prepareCanvas(canvas);
  if (!context) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const padding = { bottom: 34, left: 42, right: 20, top: 24 };
  const points = [0.2, 0.5, 0.9, 1.3, 1.7, 1.95, 2.0, 2.15];
  const maxValue = 2.5;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  context.clearRect(0, 0, width, height);
  context.strokeStyle = 'rgb(226, 232, 240)';
  context.lineWidth = 1;
  for (let step = 0; step <= 5; step += 1) {
    const y = padding.top + chartHeight - (chartHeight * step) / 5;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }

  const thresholdY = padding.top + chartHeight - chartHeight * (2 / maxValue);
  context.strokeStyle = 'rgb(239, 68, 68)';
  context.setLineDash([5, 5]);
  context.beginPath();
  context.moveTo(padding.left, thresholdY);
  context.lineTo(width - padding.right, thresholdY);
  context.stroke();
  context.setLineDash([]);

  context.beginPath();
  points.forEach((value, index) => {
    const x = padding.left + (chartWidth * index) / (points.length - 1);
    const y = padding.top + chartHeight - chartHeight * (value / maxValue);
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.strokeStyle = 'rgb(245, 158, 11)';
  context.lineWidth = 3;
  context.stroke();

  points.forEach((value, index) => {
    const x = padding.left + (chartWidth * index) / (points.length - 1);
    const y = padding.top + chartHeight - chartHeight * (value / maxValue);
    context.fillStyle = 'rgb(245, 158, 11)';
    context.beginPath();
    context.arc(x, y, 3.5, 0, Math.PI * 2);
    context.fill();
  });

  context.fillStyle = 'rgb(100, 116, 139)';
  context.font = '10px Inter, system-ui, sans-serif';
  context.fillText('1 Aug', padding.left, height - 12);
  context.fillText('25 Aug', padding.left + chartWidth * 0.7, height - 12);
  context.fillText('31 Aug', width - padding.right - 36, height - 12);
  context.fillText('Próg 80%', width - padding.right - 60, thresholdY - 8);
}

function prepareCanvas(canvas: HTMLCanvasElement) {
  const scale = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 500;
  const height = canvas.clientHeight || 260;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.scale(scale, scale);
  return context;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) {
  context.fillStyle = fillStyle;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.fill();
}

function formatMoney(value: number) {
  return `${value.toFixed(2)} PLN`;
}

function tabFromVariant(variant: BillingScreenVariant): BillingTab {
  if (variant === 'invoices' || variant === 'payments') return 'billing';
  if (variant === 'usage-limits') return 'ai';
  if (variant === 'adjustments' || variant === 'billing-variants') return 'audit';
  return 'plan';
}

function stateFromVariant(variant: BillingScreenVariant): BillingAccountState {
  if (variant === 'overdue-payment') return 'PAST_DUE';
  if (variant === 'pilot-to-subscription') return 'TRIAL';
  return 'ACTIVE';
}
