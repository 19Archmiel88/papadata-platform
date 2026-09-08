import {
  useMemo,
  useState,
} from 'react';

import {
  Button,
  Icon,
  InlineNotice,
  PageHeader,
  Panel,
  SegmentedControl,
  Skeleton,
  StatusBadge,
  Switch,
  Tabs,
} from '../../design-system';
import type {
  SubscriptionBillingCycle,
  SubscriptionBillingInvoice,
  SubscriptionBillingMoney,
  SubscriptionBillingPayment,
  SubscriptionBillingPlan,
  SubscriptionBillingScreenData,
  SubscriptionBillingScreenProps,
} from './SubscriptionBillingScreen.model';
import './SubscriptionBillingScreen.css';

const statusPresentation = {
  active: {
    label: 'Aktywna',
    message: null,
    tone: 'success',
  },
  cancelled: {
    label: 'Anulowana',
    message: 'Subskrypcja została anulowana. Dostęp do części funkcji może być ograniczony po zakończeniu bieżącego okresu.',
    tone: 'critical',
  },
  expired: {
    label: 'Wygasła',
    message: 'Subskrypcja wygasła. Sprawdź dostępne plany, aby odzyskać pełny dostęp.',
    tone: 'critical',
  },
  grace: {
    label: 'Okres ochronny',
    message: 'Trwa okres ochronny po terminie płatności. Zweryfikuj rozliczenie przed ograniczeniem dostępu.',
    tone: 'warning',
  },
  pastDue: {
    label: 'Płatność zaległa',
    message: 'Płatność jest po terminie. Do czasu wyjaśnienia rozliczenia część operacji może działać tylko do odczytu.',
    tone: 'warning',
  },
  trial: {
    label: 'Okres próbny',
    message: 'Korzystasz z okresu próbnego. Limity i dostępne funkcje wynikają z bieżącego planu.',
    tone: 'info',
  },
  unknown: {
    label: 'Nieznany',
    message: 'Nie udało się jednoznacznie ustalić statusu subskrypcji.',
    tone: 'neutral',
  },
} as const;

const cycleItems = [
  { label: 'Miesięcznie', value: 'monthly' },
  { label: 'Rocznie', value: 'annual' },
] as const;

export function SubscriptionBillingScreen({
  data,
  onAutoRenewChange,
  onBillingCycleChange,
  onCancelSubscription,
  onInvoiceDownload,
  onPaymentMethodChange,
  onPlanChange,
  onReload,
  problem = null,
  state = 'ready',
}: SubscriptionBillingScreenProps) {
  const loading = state === 'loading';

  return (
    <div
      aria-busy={loading || undefined}
      className="pd-sub-billing"
      data-state={state}
    >
      <div className="pd-sub-billing__inner">
        <PageHeader
          actions={onReload ? (
            <Button
              loading={loading}
              loadingLabel="Odświeżanie"
              onClick={onReload}
              size="small"
              variant="secondary"
            >
              Odśwież dane
            </Button>
          ) : null}
          breadcrumbs={[
            { href: '/app', label: 'Aplikacja' },
            { href: '/app/settings/organizacja', label: 'Administracja' },
            { href: null, label: 'Subskrypcja i płatności' },
          ]}
          subtitle="Plan, limity, metoda płatności, faktury i historia rozliczeń w jednym miejscu."
          title="Subskrypcja i płatności"
        />

        {loading ? <SubscriptionBillingLoading /> : null}

        {!loading && (state === 'error' || state === 'forbidden') ? (
          <InlineNotice
            actionLabel={state === 'error' && onReload ? 'Spróbuj ponownie' : null}
            message={problem ?? (
              state === 'forbidden'
                ? 'Twoja rola nie obejmuje dostępu do danych subskrypcji i płatności.'
                : 'Nie udało się pobrać danych rozliczeniowych.'
            )}
            onAction={state === 'error' ? onReload : undefined}
            title={state === 'forbidden' ? 'Brak dostępu' : 'Dane są chwilowo niedostępne'}
            tone={state === 'forbidden' ? 'warning' : 'critical'}
          />
        ) : null}

        {!loading && data && state !== 'error' && state !== 'forbidden' ? (
          <SubscriptionBillingContent
            data={data}
            partial={state === 'partial'}
            onAutoRenewChange={onAutoRenewChange}
            onBillingCycleChange={onBillingCycleChange}
            onCancelSubscription={onCancelSubscription}
            onInvoiceDownload={onInvoiceDownload}
            onPaymentMethodChange={onPaymentMethodChange}
            onPlanChange={onPlanChange}
          />
        ) : null}
      </div>
    </div>
  );
}

function SubscriptionBillingContent({
  data,
  onAutoRenewChange,
  onBillingCycleChange,
  onCancelSubscription,
  onInvoiceDownload,
  onPaymentMethodChange,
  onPlanChange,
  partial,
}: {
  readonly data: SubscriptionBillingScreenData;
  readonly onAutoRenewChange?: ((enabled: boolean) => void) | undefined;
  readonly onBillingCycleChange?: ((cycle: SubscriptionBillingCycle) => void) | undefined;
  readonly onCancelSubscription?: (() => void) | undefined;
  readonly onInvoiceDownload?: ((invoiceId: string) => void) | undefined;
  readonly onPaymentMethodChange?: (() => void) | undefined;
  readonly onPlanChange?: ((planCode: string, cycle: SubscriptionBillingCycle) => void) | undefined;
  readonly partial: boolean;
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const status = statusPresentation[data.subscription.status];
  const billingCycle = data.billing?.cycle ?? 'monthly';
  const tabs = useMemo(() => [
    {
      id: 'overview',
      label: 'Podsumowanie',
      panel: (
        <BillingOverview
          data={data}
          onAutoRenewChange={onAutoRenewChange}
          onCancelSubscription={onCancelSubscription}
          onOpenDocuments={() => setActiveTab('documents')}
          onOpenPlans={() => setActiveTab('plans')}
          onPaymentMethodChange={onPaymentMethodChange}
        />
      ),
    },
    {
      badge: data.currentPlan.availablePlanCount === null ? undefined : String(data.currentPlan.availablePlanCount),
      id: 'plans',
      label: 'Plany',
      panel: (
        <BillingPlans
          cycle={billingCycle}
          currentPlanCode={data.currentPlan.code}
          onBillingCycleChange={onBillingCycleChange}
          onPlanChange={onPlanChange}
          plans={data.plans ?? []}
        />
      ),
    },
    {
      badge: data.documents.invoiceCount === null ? undefined : String(data.documents.invoiceCount),
      id: 'documents',
      label: 'Faktury i płatności',
      panel: (
        <BillingDocuments
          invoices={data.invoices ?? []}
          onInvoiceDownload={onInvoiceDownload}
          payments={data.payments ?? []}
        />
      ),
    },
  ], [
    billingCycle,
    data,
    onAutoRenewChange,
    onBillingCycleChange,
    onCancelSubscription,
    onInvoiceDownload,
    onPaymentMethodChange,
    onPlanChange,
  ]);

  return (
    <div className="pd-sub-billing__content">
      {partial ? (
        <InlineNotice
          message="Część źródeł rozliczeniowych nie odpowiedziała. Pokazujemy dostępne dane bez uzupełniania braków wartościami domyślnymi."
          title="Dane częściowe"
          tone="warning"
        />
      ) : null}

      {status.message ? (
        <InlineNotice
          message={status.message}
          title={`Status: ${status.label}`}
          tone={status.tone === 'critical' ? 'critical' : status.tone === 'warning' ? 'warning' : 'info'}
        />
      ) : null}

      <Tabs
        activation="automatic"
        activeId={activeTab}
        ariaLabel="Sekcje subskrypcji i płatności"
        items={tabs}
        orientation="horizontal"
        size="compact"
        onActiveIdChange={(id) => setActiveTab(id)}
      />

      {data.limitations.length > 0 ? (
        <InlineNotice
          message={data.limitations.join(' ')}
          title="Ograniczenia środowiska rozliczeniowego"
          tone="info"
        />
      ) : null}
    </div>
  );
}

function BillingOverview({
  data,
  onAutoRenewChange,
  onCancelSubscription,
  onOpenDocuments,
  onOpenPlans,
  onPaymentMethodChange,
}: {
  readonly data: SubscriptionBillingScreenData;
  readonly onAutoRenewChange?: ((enabled: boolean) => void) | undefined;
  readonly onCancelSubscription?: (() => void) | undefined;
  readonly onOpenDocuments: () => void;
  readonly onOpenPlans: () => void;
  readonly onPaymentMethodChange?: (() => void) | undefined;
}) {
  const status = statusPresentation[data.subscription.status];

  return (
    <div className="pd-sub-billing__overview">
      <section className="pd-sub-billing__primary-grid" aria-label="Podsumowanie subskrypcji">
        <Panel
          bordered
          className="pd-sub-billing__plan-panel"
          collapsed={false}
          collapsible={false}
          description="Plan przypisany do bieżącego workspace i aktualny stan rozliczenia."
          padding="md"
          title="Aktualny plan"
        >
          <div className="pd-sub-billing__plan-heading">
            <div>
              <span className="pd-sub-billing__eyebrow">Plan</span>
              <strong>{data.currentPlan.name ?? 'Brak danych o planie'}</strong>
              {data.currentPlan.code ? <code>{data.currentPlan.code}</code> : null}
            </div>
            <StatusBadge
              icon={status.tone === 'success' ? 'success' : status.tone === 'warning' || status.tone === 'critical' ? 'warning' : 'billing'}
              status="Status subskrypcji"
              text={status.label}
              tone={status.tone}
            />
          </div>

          <dl className="pd-sub-billing__facts">
            <BillingFact
              label="Cena miesięczna planu"
              value={formatMoney(data.currentPlan.monthlyPrice)}
            />
            <BillingFact
              label="Kwota bieżącego okresu"
              value={formatMoney(data.subscription.amount)}
            />
            <BillingFact
              label="Bieżący okres"
              value={formatPeriod(data.subscription.periodStart, data.subscription.periodEnd)}
            />
            <BillingFact
              label="Następne rozliczenie"
              value={data.billing?.nextChargeAt ? formatDate(data.billing.nextChargeAt) : 'Brak danych'}
            />
          </dl>

          <div className="pd-sub-billing__panel-actions">
            <Button onClick={onOpenPlans} size="small" variant="secondary">Zobacz i porównaj plany</Button>
            {onCancelSubscription && data.subscription.status !== 'cancelled' ? (
              <Button onClick={onCancelSubscription} size="small" variant="ghost">Anuluj subskrypcję</Button>
            ) : null}
          </div>
        </Panel>

        <Panel
          bordered
          collapsed={false}
          collapsible={false}
          description="Wykorzystanie źródeł danych względem limitu bieżącego planu."
          padding="md"
          title="Użycie i limity"
        >
          <UsageMeter
            max={data.usage.maxDataSources}
            used={data.usage.connectedDataSources}
          />

          {data.entitlements.length > 0 ? (
            <ul className="pd-sub-billing__entitlements" aria-label="Funkcje planu">
              {data.entitlements.map((entitlement) => (
                <li data-enabled={entitlement.enabled} key={entitlement.id}>
                  <Icon
                    decorative
                    name={entitlement.enabled ? 'success' : 'warning'}
                    size={16}
                  />
                  <span>{entitlement.label}</span>
                  <strong>{entitlement.enabled ? 'Dostępna' : 'Niedostępna'}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pd-sub-billing__empty-copy">
              Kontrakt nie zwrócił informacji o funkcjach bieżącego planu.
            </p>
          )}
        </Panel>
      </section>

      <section className="pd-sub-billing__billing-grid" aria-label="Ustawienia rozliczeń">
        <Panel
          bordered
          collapsed={false}
          collapsible={false}
          description="Metoda pobierania opłat i cykl odnowienia subskrypcji."
          padding="md"
          title="Płatność i odnowienie"
        >
          <div className="pd-sub-billing__payment-method">
            <span className="pd-sub-billing__payment-method-icon"><Icon decorative name="billing" size={20} /></span>
            <div>
              <span>Metoda płatności</span>
              <strong>{data.billing?.paymentMethodLabel ?? formatAvailability(data.documents.paymentMethodConfigured)}</strong>
            </div>
            {onPaymentMethodChange ? (
              <Button onClick={onPaymentMethodChange} size="small" variant="secondary">Zmień</Button>
            ) : null}
          </div>

          <div className="pd-sub-billing__renewal-row">
            <div>
              <strong>Automatyczne odnowienie</strong>
              <span>{data.billing?.cycle === 'annual' ? 'Rozliczenie roczne' : 'Rozliczenie miesięczne'}</span>
            </div>
            {onAutoRenewChange && data.billing?.autoRenew !== null && data.billing?.autoRenew !== undefined ? (
              <Switch
                aria-label="Automatyczne odnowienie subskrypcji"
                checked={data.billing.autoRenew}
                label={data.billing.autoRenew ? 'Włączone' : 'Wyłączone'}
                onChange={(event) => onAutoRenewChange(event.target.checked)}
              />
            ) : (
              <strong>{data.billing?.autoRenew ? 'Włączone' : 'Wyłączone'}</strong>
            )}
          </div>
        </Panel>

        <Panel
          bordered
          collapsed={false}
          collapsible={false}
          description="Szybki podgląd dokumentów i historii rozliczeń."
          padding="md"
          title="Dokumenty rozliczeniowe"
        >
          <div className="pd-sub-billing__document-grid">
            <DocumentSummary
              icon="billing"
              label="Metoda płatności"
              value={formatAvailability(data.documents.paymentMethodConfigured)}
            />
            <DocumentSummary
              icon="data"
              label="Faktury"
              value={formatCount(data.documents.invoiceCount, 'dokument', 'dokumenty', 'dokumentów')}
            />
            <DocumentSummary
              icon="calendar"
              label="Płatności"
              value={formatCount(data.documents.paymentCount, 'płatność', 'płatności', 'płatności')}
            />
          </div>
          <div className="pd-sub-billing__panel-actions">
            <Button onClick={onOpenDocuments} size="small" variant="secondary">Przejdź do dokumentów</Button>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function BillingPlans({
  currentPlanCode,
  cycle,
  onBillingCycleChange,
  onPlanChange,
  plans,
}: {
  readonly currentPlanCode: string | null;
  readonly cycle: SubscriptionBillingCycle;
  readonly onBillingCycleChange?: ((cycle: SubscriptionBillingCycle) => void) | undefined;
  readonly onPlanChange?: ((planCode: string, cycle: SubscriptionBillingCycle) => void) | undefined;
  readonly plans: readonly SubscriptionBillingPlan[];
}) {
  if (plans.length === 0) {
    return (
      <InlineNotice
        message="Kontrakt planów nie zwrócił szczegółowej oferty. Bieżący plan pozostaje widoczny w podsumowaniu."
        title="Brak listy planów"
        tone="info"
      />
    );
  }

  return (
    <section className="pd-sub-billing__plans" aria-labelledby="pd-sub-billing-plans-title">
      <div className="pd-sub-billing__section-head">
        <div>
          <h2 id="pd-sub-billing-plans-title">Porównaj plany</h2>
          <p>Zmiana planu wpływa na limity i dostępne funkcje workspace.</p>
        </div>
        {onBillingCycleChange ? (
          <SegmentedControl
            ariaLabel="Cykl rozliczeniowy"
            items={cycleItems}
            onValueChange={(value) => onBillingCycleChange(value as SubscriptionBillingCycle)}
            size="compact"
            value={cycle}
          />
        ) : (
          <span className="pd-sub-billing__cycle-label">{cycle === 'annual' ? 'Rocznie' : 'Miesięcznie'}</span>
        )}
      </div>

      <div className="pd-sub-billing__plan-grid">
        {plans.map((plan) => {
          const current = plan.code === currentPlanCode;
          const price = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          const monthlyEquivalent = cycle === 'annual' && plan.annualPrice
            ? { ...plan.annualPrice, amount: plan.annualPrice.amount / 12 }
            : null;

          return (
            <article className="pd-sub-billing__plan-card" data-current={current || undefined} data-recommended={plan.recommended || undefined} key={plan.code}>
              <header>
                <div>
                  <span className="pd-sub-billing__eyebrow">{plan.recommended ? 'Najczęściej wybierany' : 'Plan'}</span>
                  <h3>{plan.name}</h3>
                </div>
                {current ? <StatusBadge status="Plan" text="Bieżący" tone="success" /> : null}
              </header>
              <p>{plan.description}</p>
              <div className="pd-sub-billing__plan-price">
                <strong>{formatMoney(price)}</strong>
                <span>{cycle === 'annual' ? '/ rok' : '/ miesiąc'}</span>
              </div>
              {monthlyEquivalent ? (
                <small>{formatMoney(monthlyEquivalent)} / mies. przy płatności rocznej</small>
              ) : null}
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><Icon decorative name="success" size={16} />{feature}</li>
                ))}
              </ul>
              <Button
                disabled={current || !onPlanChange}
                onClick={() => onPlanChange?.(plan.code, cycle)}
                size="small"
                variant={current ? 'secondary' : plan.recommended ? 'primary' : 'secondary'}
              >
                {current ? 'Bieżący plan' : 'Wybierz plan'}
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function BillingDocuments({
  invoices,
  onInvoiceDownload,
  payments,
}: {
  readonly invoices: readonly SubscriptionBillingInvoice[];
  readonly onInvoiceDownload?: ((invoiceId: string) => void) | undefined;
  readonly payments: readonly SubscriptionBillingPayment[];
}) {
  return (
    <div className="pd-sub-billing__documents-layout">
      <section className="pd-sub-billing__documents-section" aria-labelledby="pd-sub-billing-invoices-title">
        <div className="pd-sub-billing__section-head">
          <div>
            <h2 id="pd-sub-billing-invoices-title">Faktury</h2>
            <p>Historia dokumentów wystawionych dla bieżącego workspace.</p>
          </div>
        </div>
        {invoices.length > 0 ? (
          <div className="pd-sub-billing__table-scroll" role="region" aria-label="Lista faktur" tabIndex={0}>
            <table className="pd-sub-billing__table">
              <thead>
                <tr>
                  <th>Numer</th>
                  <th>Wystawiono</th>
                  <th>Termin</th>
                  <th>Status</th>
                  <th>Kwota</th>
                  <th aria-label="Akcje" />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><strong>{invoice.number}</strong></td>
                    <td>{formatDate(invoice.issuedAt)}</td>
                    <td>{invoice.dueAt ? formatDate(invoice.dueAt) : '—'}</td>
                    <td><BillingInvoiceStatus status={invoice.status} /></td>
                    <td>{formatMoney(invoice.amount)}</td>
                    <td>
                      {onInvoiceDownload ? (
                        <Button onClick={() => onInvoiceDownload(invoice.id)} size="small" variant="ghost">Pobierz</Button>
                      ) : <span className="pd-sub-billing__muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="pd-sub-billing__empty-copy">Brak faktur do wyświetlenia.</p>}
      </section>

      <section className="pd-sub-billing__documents-section" aria-labelledby="pd-sub-billing-payments-title">
        <div className="pd-sub-billing__section-head">
          <div>
            <h2 id="pd-sub-billing-payments-title">Historia płatności</h2>
            <p>Ostatnie próby obciążenia zapisanej metody płatności.</p>
          </div>
        </div>
        {payments.length > 0 ? (
          <div className="pd-sub-billing__payment-list">
            {payments.map((payment) => (
              <article key={payment.id}>
                <span className="pd-sub-billing__payment-status" data-status={payment.status}>
                  <Icon decorative name={payment.status === 'succeeded' ? 'success' : 'warning'} size={16} />
                </span>
                <div>
                  <strong>{formatMoney(payment.amount)}</strong>
                  <span>{payment.methodLabel} · {formatDateTime(payment.createdAt)}</span>
                </div>
                <BillingPaymentStatus status={payment.status} />
              </article>
            ))}
          </div>
        ) : <p className="pd-sub-billing__empty-copy">Brak historii płatności.</p>}
      </section>
    </div>
  );
}

function BillingInvoiceStatus({ status }: { readonly status: SubscriptionBillingInvoice['status'] }) {
  if (status === 'paid') return <StatusBadge status="Faktura" text="Opłacona" tone="success" />;
  if (status === 'overdue') return <StatusBadge status="Faktura" text="Po terminie" tone="critical" />;
  return <StatusBadge status="Faktura" text="Do zapłaty" tone="warning" />;
}

function BillingPaymentStatus({ status }: { readonly status: SubscriptionBillingPayment['status'] }) {
  if (status === 'succeeded') return <StatusBadge status="Płatność" text="Opłacona" tone="success" />;
  if (status === 'failed') return <StatusBadge status="Płatność" text="Nieudana" tone="critical" />;
  return <StatusBadge status="Płatność" text="W toku" tone="warning" />;
}

function BillingFact({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function UsageMeter({
  max,
  used,
}: {
  readonly max: number | null;
  readonly used: number | null;
}) {
  const ratio = used !== null && max !== null && max > 0
    ? Math.min(Math.max(used / max, 0), 1)
    : null;
  const percentage = ratio === null ? null : Math.round(ratio * 100);

  return (
    <div className="pd-sub-billing__usage">
      <div className="pd-sub-billing__usage-copy">
        <div>
          <span>Połączone źródła danych</span>
          <strong>{used ?? '—'} / {max ?? '—'}</strong>
        </div>
        <span>{percentage === null ? 'Brak danych' : `${percentage}% limitu`}</span>
      </div>
      <div
        aria-label="Wykorzystanie limitu źródeł danych"
        aria-valuemax={max ?? undefined}
        aria-valuemin={0}
        aria-valuenow={used ?? undefined}
        className="pd-sub-billing__progress"
        role="progressbar"
      >
        <span style={{ inlineSize: percentage === null ? '0%' : `${percentage}%` }} />
      </div>
    </div>
  );
}

function DocumentSummary({
  icon,
  label,
  value,
}: {
  readonly icon: 'billing' | 'calendar' | 'data';
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="pd-sub-billing__document-summary">
      <span aria-hidden="true"><Icon decorative name={icon} size={20} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SubscriptionBillingLoading() {
  return (
    <div className="pd-sub-billing__loading" aria-label="Ładowanie danych rozliczeniowych">
      <Skeleton height={18} lines={2} shape="text" width="48%" />
      <div className="pd-sub-billing__loading-grid">
        <Skeleton height={260} lines={1} shape="rect" width="100%" />
        <Skeleton height={260} lines={1} shape="rect" width="100%" />
      </div>
      <Skeleton height={180} lines={1} shape="rect" width="100%" />
    </div>
  );
}

function formatMoney(value: SubscriptionBillingMoney | null): string {
  if (!value) return 'Brak danych';
  return new Intl.NumberFormat('pl-PL', {
    currency: value.currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value.amount);
}

function formatPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return 'Brak danych';
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Brak danych';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Brak danych';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatAvailability(value: boolean | null): string {
  if (value === null) return 'Brak danych';
  return value ? 'Skonfigurowana' : 'Nie skonfigurowano';
}

function formatCount(
  value: number | null,
  singular: string,
  plural: string,
  genitivePlural: string,
): string {
  if (value === null) return 'Brak danych';
  const mod10 = value % 10;
  const mod100 = value % 100;
  const noun = value === 1
    ? singular
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
      ? plural
      : genitivePlural;
  return `${value} ${noun}`;
}
