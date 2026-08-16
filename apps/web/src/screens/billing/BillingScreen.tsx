import type {
  ReactNode,
} from 'react';

import {
  DataTable,
  InlineNotice,
  PageHeader,
  ProgressIndicator,
  SectionNavigation,
  StatusBadge,
} from '../../design-system';
import type {
  StatusBadgeTone,
} from '../../design-system';
import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import {
  billingAdjustmentColumns,
  billingInvoiceColumns,
  billingNavigationItems,
  billingPaymentColumns,
  billingPlanColumns,
  billingUsageColumns,
  billingVariantColumns,
  createBillingStorybookData,
  findBillingScreenDefinition,
} from './billingData';
import type {
  BillingScreenDefinition,
  BillingWorkspaceData,
} from './billingData';
import './billing-workspace.css';

export type BillingScreenProps = {
  readonly path?: string;
};

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
  return (
    <section
      aria-label={`Subskrypcja i płatności: ${definition.displayTitle}`}
      className="pd-billing-workspace"
      data-mode={mode}
      data-production-canvas="true"
      data-screen-id={definition.id}
      data-screen-variant={definition.variant}
    >
      <PageHeader
        breadcrumbs={[
          { label: 'PapaData', href: '/app' },
          { label: 'Subskrypcja i płatności', href: null },
        ]}
        description={definition.summary}
        meta={[
          { label: 'Plan', value: data.subscription.plan },
          { label: 'Cykl', value: data.subscription.cycle },
          { label: 'Odnowienie', value: data.subscription.renewalAt },
        ]}
        subtitle="Kontrola komercyjna z jasnymi konsekwencjami zmian i płatności."
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki subskrypcji i płatności"
        items={billingNavigationItems}
        orientation="horizontal"
        size="compact"
        sticky
      />

      <section className="pd-billing-workspace__grid" aria-label="Status subskrypcji">
        <div className="pd-billing-workspace__hero">
          <div>
            <p className="pd-billing-workspace__eyebrow">Status rozliczeń</p>
            <h2>Co trzeba sprawdzić w subskrypcji teraz</h2>
            <p>
              Widok pokazuje plan, limity, faktury i ryzyka dostępu w jednym miejscu,
              żeby użytkownik rozumiał skutki decyzji billingowych przed wykonaniem akcji.
            </p>
          </div>
          <StatusBadge
            status="Status subskrypcji"
            text={data.subscription.status}
            tone="success"
          />
        </div>

        <dl className="pd-billing-workspace__kpis" aria-label="Metryki billingowe">
          {data.kpis.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
              <dd>{item.hint}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pd-billing-workspace__section" aria-labelledby="billing-decisions-title">
        <div className="pd-billing-workspace__section-heading">
          <div>
            <p className="pd-billing-workspace__eyebrow">Guardrails</p>
            <h2 id="billing-decisions-title">Kolejka decyzji billingowych</h2>
          </div>
          <ProgressIndicator
            aria-label="Stabilność rozliczeń"
            indeterminate={false}
            label="Stabilność"
            max={100}
            showValue
            tone="success"
            value={72}
          />
        </div>
        <div className="pd-billing-workspace__decision-list">
          {data.decisionQueue.map((item) => (
            <article key={item.id} className="pd-billing-workspace__decision-card">
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
              <div className="pd-billing-workspace__decision-meta">
                <StatusBadge
                  status="Priorytet"
                  text={item.status}
                  tone={priorityTone(item.priority)}
                />
                <span>{item.due}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {renderBillingVariant(definition, data)}
    </section>
  );
}

function renderBillingVariant(
  definition: BillingScreenDefinition,
  data: BillingWorkspaceData,
) {
  if (definition.variant === 'subscription') {
    return (
      <BillingPanel title="Aktualna subskrypcja" summary="Plan, cykl, odnowienie i status są czytelne przed zmianą pakietu.">
        <dl className="pd-billing-workspace__details">
          <div><dt>Plan</dt><dd>{data.subscription.plan}</dd></div>
          <div><dt>Cykl</dt><dd>{data.subscription.cycle}</dd></div>
          <div><dt>Odnowienie</dt><dd>{data.subscription.renewalAt}</dd></div>
          <div><dt>Status</dt><dd>{data.subscription.status}</dd></div>
        </dl>
      </BillingPanel>
    );
  }

  if (definition.variant === 'usage-limits') {
    return tablePanel('Limity wykorzystania', 'Limity są pokazywane z jasnym statusem i bez ukrywania blokad.', billingUsageColumns, data.usageRows, 'Limity subskrypcji');
  }

  if (definition.variant === 'plans') {
    return tablePanel('Porównanie planów', 'Wariant porównuje plany bez natychmiastowego uruchamiania płatnej zmiany.', billingPlanColumns, data.planRows, 'Plany subskrypcji');
  }

  if (definition.variant === 'invoices') {
    return tablePanel('Faktury', 'Historia faktur pokazuje okres, kwotę i status dokumentu.', billingInvoiceColumns, data.invoiceRows, 'Faktury');
  }

  if (definition.variant === 'payments') {
    return tablePanel('Metody i zdarzenia płatnicze', 'Metody płatności mają status, właściciela i ostatnie obciążenie.', billingPaymentColumns, data.paymentRows, 'Płatności');
  }

  if (definition.variant === 'overdue-payment') {
    return (
      <BillingPanel title="Zaległa płatność" summary="Stan blokujący pokazuje ograniczenia dostępu i bezpieczną ścieżkę odzyskania usług.">
        <InlineNotice
          message="Dostęp do automatycznych rekomendacji zostaje ograniczony do czasu potwierdzenia płatności. Widok nie uruchamia płatności bez świadomego kroku użytkownika."
          title="Wymagana reakcja właściciela"
          tone="warning"
        />
      </BillingPanel>
    );
  }

  if (definition.variant === 'adjustments') {
    return tablePanel('Korekty i rabaty', 'Każda korekta ma powód, kwotę i status wymagany do audytu.', billingAdjustmentColumns, data.adjustmentRows, 'Korekty billingowe');
  }

  if (definition.variant === 'change-cancel') {
    return (
      <BillingPanel title="Zmiana lub anulowanie" summary="Ekran pokazuje konsekwencje przed zatwierdzeniem zmiany komercyjnej.">
        <ul className="pd-billing-workspace__checklist">
          <li>Utrata historii forecastów po downgrade wymaga jawnego potwierdzenia.</li>
          <li>Anulowanie zachowuje dostęp do danych do końca opłaconego okresu.</li>
          <li>Zmiana planu wymaga uprawnienia właściciela workspace.</li>
        </ul>
      </BillingPanel>
    );
  }

  if (definition.variant === 'pilot-to-subscription') {
    return (
      <BillingPanel title="Pilot do abonamentu" summary="Przejście z pilota rozdziela warunki handlowe, dane faktury i akceptację planu.">
        <ol className="pd-billing-workspace__steps">
          <li>Potwierdź dane firmy i NIP.</li>
          <li>Wybierz plan startowy i cykl rozliczeniowy.</li>
          <li>Zatwierdź zakres danych przenoszonych z pilota.</li>
        </ol>
      </BillingPanel>
    );
  }

  return tablePanel('Warianty billingowe', 'Warianty stanu pokazują aktywny plan, zaległości, limity i błędy płatności.', billingVariantColumns, data.variantRows, 'Warianty subskrypcji');
}

function BillingPanel({
  children,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly summary: string;
  readonly title: string;
}) {
  return (
    <section className="pd-billing-workspace__panel" aria-labelledby={`${slug(title)}-title`}>
      <div className="pd-billing-workspace__section-heading">
        <div>
          <p className="pd-billing-workspace__eyebrow">Widok domenowy</p>
          <h2 id={`${slug(title)}-title`}>{title}</h2>
          <p>{summary}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function tablePanel(
  title: string,
  summary: string,
  columns: readonly DataColumn[],
  rows: readonly DataRow[],
  ariaLabel: string,
) {
  return (
    <BillingPanel title={title} summary={summary}>
      <div className="pd-billing-workspace__table">
        <DataTable
          ariaLabel={ariaLabel}
          columns={columns}
          density="compact"
          emptyMessage="Brak danych billingowych dla bieżącego zakresu."
          loading={false}
          minWidth={720}
          rowCount={rows.length}
          rowHeaderColumnId={columns[0]?.id}
          rows={rows}
          selectedRowIds={[]}
          sort={null}
          summary={summary}
        />
      </div>
    </BillingPanel>
  );
}

function priorityTone(priority: 'critical' | 'high' | 'low' | 'medium'): StatusBadgeTone {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'warning';
  if (priority === 'medium') return 'info';
  return 'neutral';
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '');
}
