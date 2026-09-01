import {
  Button,
  Icon,
  InlineNotice,
  PageHeader,
  Panel,
  Skeleton,
  StatusBadge,
} from '../../design-system';
import type {
  SubscriptionBillingMoney,
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
    message: 'Subskrypcja została anulowana. Dostęp do części funkcji może być ograniczony.',
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

export function SubscriptionBillingScreen({
  data,
  onReload,
  problem = null,
  state = 'ready',
}: SubscriptionBillingScreenProps) {
  const loading = state === 'loading';

  return (
    <main
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
          subtitle="Sprawdź aktualny plan, wykorzystanie limitów oraz stan dokumentów rozliczeniowych."
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
          <SubscriptionBillingContent data={data} partial={state === 'partial'} />
        ) : null}
      </div>
    </main>
  );
}

function SubscriptionBillingContent({
  data,
  partial,
}: {
  readonly data: SubscriptionBillingScreenData;
  readonly partial: boolean;
}) {
  const status = statusPresentation[data.subscription.status];

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
              label="Dostępne plany"
              value={formatCount(data.currentPlan.availablePlanCount, 'plan', 'plany', 'planów')}
            />
          </dl>
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

      <Panel
        bordered
        collapsed={false}
        collapsible={false}
        description="Stan danych udostępnianych przez kontrakty faktur, płatności i metody płatniczej."
        padding="md"
        title="Faktury i płatności"
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
      </Panel>

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
