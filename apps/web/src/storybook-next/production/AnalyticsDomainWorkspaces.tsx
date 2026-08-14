import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';
import type {
  AttributionView,
  CampaignsRecord,
  CohortView,
  CustomersRecord,
  DiagnosticFinding,
  FunnelStepView,
  Money,
  OrdersRecord,
  ProductsRecord,
  RecommendationView,
  TrafficRecord,
} from '../../../../../contracts/api-schemas';
import {
  DataTable,
  InlineNotice,
  PageHeader,
  ProgressIndicator,
  SearchField,
  SectionNavigation,
  StatusBadge,
} from '../../design-system';
import type {
  StatusBadgeTone,
} from '../../design-system';
import {
  analyticsScreenDefinitions,
} from '../../screens/analytics';
import type {
  AnalyticsScreenDefinition,
  CampaignsModuleData,
  CustomersModuleData,
  OrdersModuleData,
  ProductsModuleData,
  TrafficModuleData,
} from '../../screens/analytics';
import {
  ProductionScreenCanvas,
} from './ProductionStoryShell';

type DomainWorkspaceProps<TData> = {
  readonly data: TData;
  readonly definition: AnalyticsScreenDefinition;
  readonly mode?: 'runtime' | 'storybook';
};

type DomainSummary = {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: string;
  readonly warning: number;
};

type DomainDecisionItem = {
  readonly detail: string;
  readonly due: string;
  readonly id: string;
  readonly impact: string;
  readonly metric: string;
  readonly owner: string;
  readonly priority: 'critical' | 'high' | 'low' | 'medium';
  readonly status: string;
  readonly title: string;
};

type DomainMetricItem = {
  readonly hint: string;
  readonly label: string;
  readonly value: string;
};

const campaignColumns: readonly DataColumn[] = [
  { id: 'name', label: 'Kampania', sortable: true, width: 240 },
  { id: 'channel', label: 'Kanał', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { align: 'right', id: 'spend', label: 'Koszt', sortable: true },
  { align: 'right', id: 'budgetPacing', label: 'Wykorzystanie', sortable: true },
  { align: 'right', id: 'roas', label: 'ROAS', sortable: true },
];

const campaignNavigationItems = analyticsScreenDefinitions
  .filter((definition) => definition.group === 'campaigns')
  .map((definition) => ({
    href: definition.routeBase,
    id: definition.id,
    label: resolveCampaignNavigationLabel(definition),
  }));

const orderNavigationItems = buildAnalyticsNavigation('orders', {
  '32.01': 'Przegląd',
  '32.02': 'Lista',
  '32.03': 'Szczegół',
  '32.04': 'Oś',
  '32.05': 'Źródła',
  '32.06': 'Rekoncyliacja',
  '32.07': 'Eksport',
  '32.08': 'Warianty',
});

const productNavigationItems = buildAnalyticsNavigation('products', {
  '33.01': 'Przegląd',
  '33.02': 'Katalog',
  '33.03': 'Szczegół',
  '33.04': 'Mapowanie',
  '33.05': 'Oferty',
  '33.06': 'Wydajność',
  '33.07': 'Braki',
  '33.08': 'Wpływ',
  '33.09': 'Warianty',
});

const customerNavigationItems = buildAnalyticsNavigation('customers', {
  '34.01': 'Przegląd',
  '34.02': 'Segmenty',
  '34.03': 'Kohorty',
  '34.04': 'Szczegół',
  '34.05': 'Konflikty',
  '34.06': 'Prywatność',
  '34.07': 'Wpływ',
  '34.08': 'Warianty',
});

const trafficNavigationItems = buildAnalyticsNavigation('traffic', {
  '35.01': 'Przegląd',
  '35.02': 'Kanały',
  '35.03': 'Lejek',
  '35.04': 'Krok',
  '35.05': 'Definicje',
  '35.06': 'GA4 vs zamówienia',
  '35.07': 'Zdarzenia',
  '35.08': 'Wejścia',
  '35.09': 'Warianty',
});

const orderColumns: readonly DataColumn[] = [
  { id: 'externalOrderId', label: 'Zamówienie', sortable: true, width: 180 },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { id: 'source', label: 'Źródło', sortable: true },
  { id: 'customerPseudonym', label: 'Klient', sortable: true },
  { align: 'right', id: 'amount', label: 'Wartość', sortable: true },
  { id: 'risk', label: 'Ryzyko', sortable: true },
];

const productColumns: readonly DataColumn[] = [
  { id: 'name', label: 'Produkt', sortable: true, width: 260 },
  { id: 'sku', label: 'SKU', sortable: true },
  { id: 'statusLabel', label: 'Status', sortable: true },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true },
  { align: 'right', id: 'units', label: 'Sztuki', sortable: true },
  { align: 'right', id: 'margin', label: 'Marża', sortable: true },
  { id: 'stockRisk', label: 'Ryzyko stanów', sortable: true },
];

const customerColumns: readonly DataColumn[] = [
  { id: 'customerPseudonym', label: 'Klient', sortable: true, width: 220 },
  { id: 'segment', label: 'Segment', sortable: true },
  { id: 'cohortKey', label: 'Kohorta', sortable: true },
  { align: 'right', id: 'ordersCount', label: 'Zamówienia', sortable: true },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true },
  { id: 'consentStatus', label: 'Zgoda', sortable: true },
];

const trafficColumns: readonly DataColumn[] = [
  { id: 'channel', label: 'Kanał', sortable: true },
  { align: 'right', id: 'sessions', label: 'Sesje', sortable: true },
  { align: 'right', id: 'users', label: 'Użytkownicy', sortable: true },
  { align: 'right', id: 'conversionRate', label: 'CVR', sortable: true },
  { align: 'right', id: 'revenue', label: 'Przychód', sortable: true },
  { id: 'eventQuality', label: 'Jakość eventów', sortable: true },
];

export function CampaignsWorkspace({
  data,
  definition,
  mode = 'storybook',
}: DomainWorkspaceProps<CampaignsModuleData>) {
  const context = buildCampaignContext(data);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--campaigns"
      label={`Kampanie: ${definition.displayTitle}`}
      mode={mode}
      screenId={definition.id}
      variant={definition.variant}
    >
      <CampaignScreenHeader
        context={context}
        data={data}
        definition={definition}
      />

      <CampaignCommandBrief
        context={context}
      />

      <CampaignDecisionQueue decisions={context.decisions} />

      {renderCampaignVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

type CampaignDecisionPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

type CampaignDecision = {
  readonly description: string;
  readonly due: string;
  readonly id: string;
  readonly impact: string;
  readonly metric: string;
  readonly owner: string;
  readonly priority: CampaignDecisionPriority;
  readonly readiness: string;
  readonly title: string;
};

type CampaignContext = {
  readonly budget: Money;
  readonly budgetPressure: number;
  readonly decisions: readonly CampaignDecision[];
  readonly inefficientRecords: readonly CampaignsRecord[];
  readonly overPacedRecords: readonly CampaignsRecord[];
  readonly revenue: Money;
  readonly roas: number;
  readonly selectedRecord: CampaignsRecord | null;
  readonly spend: Money;
  readonly trackingIssues: readonly DiagnosticFinding[];
};

function CampaignScreenHeader({
  context,
  data,
  definition,
}: {
  readonly context: CampaignContext;
  readonly data: CampaignsModuleData;
  readonly definition: AnalyticsScreenDefinition;
}) {
  const summaryTone = resolveCampaignSummaryTone(data.summary);

  return (
    <>
      <PageHeader
        className="pd-production-campaign-header"
        actions={(
          <StatusBadge
            status="Stan portfela"
            text={resolveCampaignSummaryLabel(data.summary)}
            tone={summaryTone}
          />
        )}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: '/app/campaigns/przeglad', label: 'Kampanie płatne' },
          { href: null, label: definition.displayTitle },
        ]}
        meta={[
          {
            label: 'Zakres',
            value: '01 sie - 12 sie',
          },
          {
            label: 'Portfel',
            value: `${formatInteger(data.records.length)} kampanie`,
          },
          {
            label: 'Odświeżono',
            value: formatDateTime(data.generatedAt),
          },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />

      <SectionNavigation
        activeId={definition.id}
        ariaLabel="Widoki kampanii płatnych"
        className="pd-production-campaign-nav"
        items={campaignNavigationItems}
        orientation="horizontal"
        size="compact"
      />

      <dl className="pd-campaign-health-strip" aria-label="Skrót kondycji kampanii">
        <div>
          <dt>Stan danych</dt>
          <dd>
            <StatusBadge
              status="Stan danych"
              text={resolveCampaignSummaryLabel(data.summary)}
              tone={summaryTone}
            />
          </dd>
        </div>
        <div>
          <dt>Koszt</dt>
          <dd>{formatMoney(context.spend)}</dd>
        </div>
        <div>
          <dt>ROAS</dt>
          <dd>{formatNumber(context.roas)}</dd>
        </div>
        <div>
          <dt>Do decyzji</dt>
          <dd>{formatInteger(context.decisions.length)}</dd>
        </div>
      </dl>
    </>
  );
}

function CampaignCommandBrief({
  context,
}: {
  readonly context: CampaignContext;
}) {
  const topDecision = context.decisions[0] ?? null;

  return (
    <section className="pd-production-hero pd-campaign-command-brief">
      <header>
        <p className="pd-production-eyebrow">Brief operacyjny</p>
        <h2>Co zmienić w płatnym ruchu teraz</h2>
        <strong>
          {topDecision
            ? topDecision.title
            : 'Portfel nie wymaga pilnej zmiany budżetu.'}
        </strong>
        <span>
          {topDecision
            ? `${topDecision.impact} · ${topDecision.owner} · ${topDecision.due}`
            : 'Monitoruj ROAS, koszt i jakość danych bez pozornej akcji zatwierdzania.'}
        </span>
      </header>

      <aside className="pd-campaign-budget-card" aria-label="Budżet kampanii">
        <header>
          <h3>Wykorzystanie budżetu</h3>
          <StatusBadge
            status="Budżet"
            text={context.budgetPressure >= 0.92 ? 'Blisko limitu' : 'Pod kontrolą'}
            tone={context.budgetPressure >= 0.92 ? 'warning' : 'success'}
          />
        </header>
        <ProgressIndicator
          description={`${formatMoney(context.spend)} wykorzystane z ${formatMoney(context.budget)} budżetu.`}
          indeterminate={false}
          label="Wykorzystanie budżetu"
          max={Math.max(context.budget.amount, 1)}
          showValue
          tone={context.budgetPressure >= 0.92 ? 'warning' : 'success'}
          value={context.spend.amount}
        />
        <KpiStrip
          items={[
            ['Przychód', formatMoney(context.revenue)],
            ['ROAS', formatNumber(context.roas)],
            ['Ryzyka', formatInteger(context.overPacedRecords.length + context.inefficientRecords.length)],
            ['Diagnostyka', formatInteger(context.trackingIssues.length)],
          ]}
        />
      </aside>
    </section>
  );
}

function CampaignDecisionQueue({
  decisions,
}: {
  readonly decisions: readonly CampaignDecision[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Decyzje</p>
          <h2>Decyzje budżetowe do obsługi</h2>
        </div>
        <span>{formatInteger(decisions.length)} pozycji</span>
      </header>

      {decisions.length > 0 ? (
        <ol className="pd-campaign-decision-grid">
          {decisions.map((decision) => (
            <li
              data-priority={decision.priority}
              key={decision.id}
            >
              <div>
                <span>{resolveCampaignPriorityLabel(decision.priority)}</span>
                <strong>{decision.title}</strong>
                <p>{decision.description}</p>
              </div>
              <dl>
                <div><dt>Metryka</dt><dd>{decision.metric}</dd></div>
                <div><dt>Wpływ</dt><dd>{decision.impact}</dd></div>
                <div><dt>Właściciel</dt><dd>{decision.owner}</dd></div>
                <div><dt>Termin</dt><dd>{decision.due}</dd></div>
              </dl>
              <StatusBadge
                status="Stan"
                text={decision.readiness}
                tone={resolveCampaignPriorityTone(decision.priority)}
              />
            </li>
          ))}
        </ol>
      ) : (
        <InlineNotice
          message="Wszystkie kampanie mają akceptowalny koszt, ROAS i jakość danych w bieżącym fixture."
          title="Brak pilnych decyzji"
          tone="success"
        />
      )}
    </section>
  );
}

function renderCampaignVariant(
  definition: AnalyticsScreenDefinition,
  data: CampaignsModuleData,
  context: CampaignContext,
) {
  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <CampaignPortfolioBoard records={data.records} />
          <CampaignChannelSection records={data.records} />
        </>
      );
    case 'list':
      return <CampaignListSurface records={data.records} />;
    case 'detail':
      return (
        <CampaignDetailSurface
          record={context.selectedRecord}
          records={data.records}
        />
      );
    case 'attribution':
      return (
        <CampaignAttributionSurface
          attribution={data.attribution}
          records={data.records}
        />
      );
    case 'budget':
      return (
        <CampaignBudgetSurface
          context={context}
          records={data.records}
        />
      );
    case 'diagnostics':
      return (
        <CampaignDiagnosticsSurface
          context={context}
          diagnostics={data.diagnostics}
        />
      );
    case 'recommendations':
      return <CampaignRecommendationsSurface recommendations={data.recommendations} />;
    case 'variants':
      return (
        <CampaignVariantsSurface
          context={context}
          data={data}
        />
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function CampaignPortfolioBoard({
  records,
}: {
  readonly records: readonly CampaignsRecord[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Portfel</p>
          <h2>Portfel kampanii według ryzyka</h2>
        </div>
        <span>{formatInteger(records.length)} kampanie</span>
      </header>
      <div className="pd-campaign-portfolio" aria-label="Kampanie według budżetu i ROAS">
        {records.map((record) => {
          const pressure = campaignBudgetPressure(record);
          return (
            <article
              data-risk={resolveCampaignRisk(record)}
              key={record.campaignId}
            >
              <header>
                <div>
                  <span>{campaignChannelLabel(record.channel)}</span>
                  <strong>{record.name}</strong>
                </div>
                <StatusBadge
                  status="Kampania"
                  text={resolveCampaignStatus(record.status)}
                  tone={resolveCampaignStatusTone(record.status)}
                />
              </header>
              <dl>
                <div><dt>Koszt</dt><dd>{formatMoney(record.spend)}</dd></div>
                <div><dt>Budżet</dt><dd>{formatMoney(record.budget)}</dd></div>
                <div><dt>ROAS</dt><dd>{record.roas === null ? 'brak' : formatNumber(record.roas)}</dd></div>
                <div><dt>Przychód</dt><dd>{formatMoney(record.revenue)}</dd></div>
              </dl>
              <span className="pd-campaign-board__track" aria-hidden="true">
                <span
                  className="pd-campaign-board__fill"
                  style={{ inlineSize: `${Math.min(Math.max(pressure * 100, 4), 100)}%` }}
                />
              </span>
              <p>{resolveCampaignOperatorHint(record)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CampaignChannelSection({
  records,
}: {
  readonly records: readonly CampaignsRecord[];
}) {
  const channels = aggregateCampaignChannels(records);
  const maxRevenue = Math.max(...channels.map((item) => item.revenue.amount), 1);

  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Kanały</p>
          <h2>Udział kanałów i odpowiedzialność</h2>
        </div>
        <span>{formatInteger(channels.length)} kanały</span>
      </header>
      <ol className="pd-campaign-channel-list">
        {channels.map((channel) => (
          <li key={channel.label}>
            <div>
              <strong>{channel.label}</strong>
              <span>{formatInteger(channel.count)} kampanie · właściciel {resolveCampaignOwner(channel.key)}</span>
            </div>
            <span aria-hidden="true" className="pd-campaign-board__track">
              <span
                className="pd-campaign-board__fill"
                style={{ inlineSize: `${Math.max((channel.revenue.amount / maxRevenue) * 100, 4)}%` }}
              />
            </span>
            <dl>
              <div><dt>Koszt</dt><dd>{formatMoney(channel.spend)}</dd></div>
              <div><dt>Przychód</dt><dd>{formatMoney(channel.revenue)}</dd></div>
              <div><dt>ROAS</dt><dd>{formatNumber(channel.roas)}</dd></div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CampaignListSurface({
  records,
}: {
  readonly records: readonly CampaignsRecord[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Lista</p>
          <h2>Portfel kampanii i szybkie filtrowanie</h2>
        </div>
        <span>{formatInteger(records.length)} kampanie</span>
      </header>
      <div className="pd-production-toolbar" aria-label="Filtry kampanii">
        <div className="pd-production-toolbar__group">
          <SearchField
            debounceMs={120}
            hideLabel
            label="Szukaj kampanii"
            loading={false}
            placeholder="Szukaj po nazwie, kanale lub statusie"
            query=""
            resultCount={records.length}
            size="compact"
          />
        </div>
        <div className="pd-production-toolbar__group">
          <StatusBadge status="Widok" text="Porównanie" tone="info" />
          <StatusBadge status="Akcje" text="Tylko odczyt" tone="neutral" />
        </div>
      </div>
      <DomainTable
        ariaLabel="Lista kampanii płatnych"
        columns={campaignColumns}
        rows={campaignRows(records)}
        summary={`${records.length} kampanii`}
      />
      <CampaignMobileRecords records={records} />
    </section>
  );
}

function CampaignMobileRecords({
  records,
}: {
  readonly records: readonly CampaignsRecord[];
}) {
  return (
    <ol className="pd-campaign-mobile-records" aria-label="Lista kampanii na małym ekranie">
      {records.map((record) => (
        <li key={record.campaignId}>
          <header>
            <div>
              <span>{campaignChannelLabel(record.channel)}</span>
              <strong>{record.name}</strong>
            </div>
            <StatusBadge
              status="Kampania"
              text={resolveCampaignStatus(record.status)}
              tone={resolveCampaignStatusTone(record.status)}
            />
          </header>
          <dl>
            <div><dt>Koszt</dt><dd>{formatMoney(record.spend)}</dd></div>
            <div><dt>Budżet</dt><dd>{formatMoney(record.budget)}</dd></div>
            <div><dt>ROAS</dt><dd>{record.roas === null ? 'brak' : formatNumber(record.roas)}</dd></div>
            <div><dt>Następny krok</dt><dd>{resolveCampaignOperatorHint(record)}</dd></div>
          </dl>
        </li>
      ))}
    </ol>
  );
}

function CampaignDetailSurface({
  record,
  records,
}: {
  readonly record: CampaignsRecord | null;
  readonly records: readonly CampaignsRecord[];
}) {
  if (!record) {
    return <EmptyDomainMessage />;
  }

  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Szczegół</p>
          <h2>Kampania w kontekście budżetu i wyniku</h2>
        </div>
        <StatusBadge
          status="Kampania"
          text={resolveCampaignStatus(record.status)}
          tone={resolveCampaignStatusTone(record.status)}
        />
      </header>
      <div className="pd-campaign-detail-grid">
        <article>
          <span>{campaignChannelLabel(record.channel)}</span>
          <strong>{record.name}</strong>
          <p>{resolveCampaignOperatorHint(record)}</p>
          <ProgressIndicator
            description={`${formatMoney(record.spend)} wykorzystane z ${formatMoney(record.budget)}.`}
            indeterminate={false}
            label="Wykorzystanie budżetu kampanii"
            max={Math.max(record.budget.amount, 1)}
            showValue
            tone={campaignBudgetPressure(record) >= 0.9 ? 'warning' : 'success'}
            value={record.spend.amount}
          />
        </article>
        <dl>
          <div><dt>Koszt</dt><dd>{formatMoney(record.spend)}</dd></div>
          <div><dt>Budżet</dt><dd>{formatMoney(record.budget)}</dd></div>
          <div><dt>Przychód</dt><dd>{formatMoney(record.revenue)}</dd></div>
          <div><dt>ROAS</dt><dd>{record.roas === null ? 'brak' : formatNumber(record.roas)}</dd></div>
          <div><dt>Właściciel</dt><dd>{resolveCampaignOwner(record.channel)}</dd></div>
          <div><dt>Ryzyko</dt><dd>{resolveCampaignRiskLabel(record)}</dd></div>
        </dl>
      </div>
      <CampaignPeerComparison
        activeRecord={record}
        records={records}
      />
    </section>
  );
}

function CampaignPeerComparison({
  activeRecord,
  records,
}: {
  readonly activeRecord: CampaignsRecord;
  readonly records: readonly CampaignsRecord[];
}) {
  return (
    <div className="pd-campaign-peer-list" aria-label="Porównanie kampanii">
      {records.map((record) => (
        <div
          data-current={record.campaignId === activeRecord.campaignId ? true : undefined}
          key={record.campaignId}
        >
          <strong>{record.name}</strong>
          <span>{campaignChannelLabel(record.channel)} · koszt {formatMoney(record.spend)}</span>
          <b>ROAS {record.roas === null ? 'brak' : formatNumber(record.roas)}</b>
        </div>
      ))}
    </div>
  );
}

function CampaignAttributionSurface({
  attribution,
  records,
}: {
  readonly attribution: readonly AttributionView[];
  readonly records: readonly CampaignsRecord[];
}) {
  const total = sumMoney(attribution.map((item) => item.revenue));
  const campaignRevenue = sumMoney(records.map((record) => record.revenue));

  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Atrybucja</p>
          <h2>Wkład źródeł w sprzedaż</h2>
          <p>Udziały pochodzą z kolekcji atrybucji; kampanie są kontekstem kosztowym, nie źródłem przeliczonego modelu.</p>
        </div>
        <span>{formatMoney(total)} w modelu</span>
      </header>
      <div className="pd-campaign-attribution-grid">
        <ol>
          {attribution.map((item) => (
            <li key={`${item.source}-${item.model}`}>
              <div>
                <strong>{item.source}</strong>
                <span>{item.model} · {formatInteger(item.orders)} zamówień</span>
              </div>
              <span aria-hidden="true" className="pd-campaign-board__track">
                <span
                  className="pd-campaign-board__fill"
                  style={{ inlineSize: `${Math.max(item.contribution * 100, 4)}%` }}
                />
              </span>
              <dl>
                <div><dt>Udział</dt><dd>{formatPercent(item.contribution)}</dd></div>
                <div><dt>Przychód</dt><dd>{formatMoney(item.revenue)}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
        <aside>
          <h3>Kontrola spójności</h3>
          <dl>
            <div><dt>Przychód kampanii</dt><dd>{formatMoney(campaignRevenue)}</dd></div>
            <div><dt>Przychód modelu</dt><dd>{formatMoney(total)}</dd></div>
            <div><dt>Różnica</dt><dd>{formatMoney({ amount: campaignRevenue.amount - total.amount, currency: campaignRevenue.currency })}</dd></div>
          </dl>
          <InlineNotice
            message="Różnica jest jawna, bo atrybucja może obejmować źródła wspomagające spoza listy kampanii."
            title="Model nie jest tabelą kampanii"
            tone="info"
          />
        </aside>
      </div>
    </section>
  );
}

function CampaignBudgetSurface({
  context,
  records,
}: {
  readonly context: CampaignContext;
  readonly records: readonly CampaignsRecord[];
}) {
  const sorted = [...records].sort((a, b) => campaignBudgetPressure(b) - campaignBudgetPressure(a));

  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Budżet</p>
          <h2>Wykorzystanie budżetu i ryzyko przepalenia</h2>
        </div>
        <span>{formatPercent(context.budgetPressure)} portfela</span>
      </header>
      <ol className="pd-campaign-budget-list">
        {sorted.map((record) => {
          const pressure = campaignBudgetPressure(record);
          return (
            <li
              data-risk={resolveCampaignRisk(record)}
              key={record.campaignId}
            >
              <div>
                <strong>{record.name}</strong>
                <span>{campaignChannelLabel(record.channel)} · {resolveCampaignOwner(record.channel)}</span>
              </div>
              <span aria-hidden="true" className="pd-campaign-board__track">
                <span
                  className="pd-campaign-board__fill"
                  style={{ inlineSize: `${Math.min(Math.max(pressure * 100, 4), 100)}%` }}
                />
              </span>
              <dl>
                <div><dt>Wykorzystanie</dt><dd>{formatPercent(pressure)}</dd></div>
                <div><dt>Koszt / budżet</dt><dd>{formatMoney(record.spend)} / {formatMoney(record.budget)}</dd></div>
                <div><dt>Następny krok</dt><dd>{resolveCampaignOperatorHint(record)}</dd></div>
              </dl>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function CampaignDiagnosticsSurface({
  context,
  diagnostics,
}: {
  readonly context: CampaignContext;
  readonly diagnostics: readonly DiagnosticFinding[];
}) {
  const campaignRisks = [
    ...context.overPacedRecords,
    ...context.inefficientRecords,
  ].filter((record, index, records) => (
    records.findIndex((item) => item.campaignId === record.campaignId) === index
  ));

  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Diagnostyka</p>
          <h2>Blokady danych i kampanii przed decyzją</h2>
        </div>
        <span>{formatInteger(diagnostics.length + campaignRisks.length)} sygnały</span>
      </header>
      <div className="pd-campaign-diagnostics-grid">
        <ol className="pd-campaign-diagnostics-list">
          {diagnostics.map((finding) => (
            <li
              data-severity={finding.severity}
              key={finding.findingId}
            >
              <StatusBadge
                status="Waga"
                text={diagnosticSeverityLabel(finding.severity)}
                tone={finding.severity === 'error' ? 'critical' : finding.severity === 'warning' ? 'warning' : 'info'}
              />
              <div>
                <strong>{finding.code}</strong>
                <p>{finding.message}</p>
                <span>{finding.sourceRef ?? 'źródło niepodane'}</span>
              </div>
            </li>
          ))}
        </ol>
        <aside>
          <h3>Kampanie do przeglądu</h3>
          <ol className="pd-production-list">
            {campaignRisks.map((record) => (
              <li key={record.campaignId}>
                <strong>{record.name}</strong>
                <span>{resolveCampaignRiskLabel(record)} · {resolveCampaignOperatorHint(record)}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}

function CampaignRecommendationsSurface({
  recommendations,
}: {
  readonly recommendations: readonly RecommendationView[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Rekomendacje</p>
          <h2>Rekomendacje do oceny przez człowieka</h2>
          <p>Widok pokazuje uzasadnienie, pewność i wpływ, ale nie udaje operacji zatwierdzania.</p>
        </div>
        <span>{formatInteger(recommendations.length)} rekomendacje</span>
      </header>
      {recommendations.length > 0 ? (
        <div className="pd-campaign-recommendation-grid">
          {recommendations.map((item) => (
            <article key={item.recommendationId}>
              <div>
                <StatusBadge
                  status="Wpływ"
                  text={impactLabel(item.impact)}
                  tone={item.impact === 'high' ? 'warning' : 'info'}
                />
                <strong>{item.title}</strong>
                <p>{item.rationale}</p>
              </div>
              <dl>
                <div><dt>Pewność</dt><dd>{formatPercent(item.confidence)}</dd></div>
                <div><dt>Tryb</dt><dd>Do zatwierdzenia</dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <InlineNotice
          message="Endpoint nie zwrócił rekomendacji dla bieżącego portfela."
          title="Brak rekomendacji"
          tone="info"
        />
      )}
    </section>
  );
}

function CampaignVariantsSurface({
  context,
  data,
}: {
  readonly context: CampaignContext;
  readonly data: CampaignsModuleData;
}) {
  const states = [
    ['Gotowy', `${data.summary.ready}/${data.summary.total}`, 'Rekordy z kompletnym stanem portfela.', 'success'],
    ['Częściowy', formatInteger(data.summary.warning), 'Wymagają kontroli kosztu, ROAS albo jakości danych.', 'warning'],
    ['Krytyczny', formatInteger(data.summary.critical), 'Blokady, które powinny trafić do diagnostyki.', 'critical'],
    ['Pusty', '0', 'Ekran pokazuje pusty stan bez dopisywania kampanii.', 'neutral'],
    ['Brak dostępu', 'wariant', 'Widok powinien zatrzymać akcje i wyjaśnić uprawnienia.', 'critical'],
    ['Bez połączenia', 'wariant', 'Zachowany układ i komunikat o ponowieniu odczytu.', 'warning'],
  ] as const;

  return (
    <>
      <InlineNotice
        message="Warianty opisują stany produkcyjne ekranu bez duplikowania metryk poza kontraktem kampanii."
        title="Warianty w jednym kontrakcie"
        tone="info"
      />
      <section className="pd-production-section">
        <header>
          <div>
            <p className="pd-production-eyebrow">Warianty</p>
            <h2>Jak ekran zachowuje się w stanach produkcyjnych</h2>
          </div>
          <span>{formatInteger(states.length)} stanów</span>
        </header>
        <div className="pd-campaign-state-grid">
          {states.map(([title, value, description, tone]) => (
            <article key={title}>
              <StatusBadge status="Stan" text={title} tone={tone} />
              <strong>{value}</strong>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <CampaignPortfolioBoard records={data.records} />
      <CampaignBudgetSurface
        context={context}
        records={data.records}
      />
    </>
  );
}

function buildCampaignContext(data: CampaignsModuleData): CampaignContext {
  const spend = sumMoney(data.records.map((record) => record.spend));
  const budget = sumMoney(data.records.map((record) => record.budget));
  const revenue = sumMoney(data.records.map((record) => record.revenue));
  const roas = spend.amount > 0
    ? revenue.amount / spend.amount
    : 0;
  const overPacedRecords = data.records.filter((record) => campaignBudgetPressure(record) >= 0.88);
  const inefficientRecords = data.records.filter((record) => (
    record.roas === null
    || record.roas < 2.4
  ));
  const trackingIssues = data.diagnostics.filter((finding) => finding.severity !== 'info');
  const selectedRecord = data.record
    ?? [...data.records].sort((first, second) => campaignRiskScore(second) - campaignRiskScore(first))[0]
    ?? null;

  return {
    budget,
    budgetPressure: spend.amount / Math.max(budget.amount, 1),
    decisions: buildCampaignDecisions({
      diagnostics: data.diagnostics,
      inefficientRecords,
      overPacedRecords,
      recommendations: data.recommendations,
      records: data.records,
    }),
    inefficientRecords,
    overPacedRecords,
    revenue,
    roas,
    selectedRecord,
    spend,
    trackingIssues,
  };
}

function buildCampaignDecisions({
  diagnostics,
  inefficientRecords,
  overPacedRecords,
  recommendations,
  records,
}: {
  readonly diagnostics: readonly DiagnosticFinding[];
  readonly inefficientRecords: readonly CampaignsRecord[];
  readonly overPacedRecords: readonly CampaignsRecord[];
  readonly recommendations: readonly RecommendationView[];
  readonly records: readonly CampaignsRecord[];
}): readonly CampaignDecision[] {
  const decisions: CampaignDecision[] = [];
  const warningDiagnostic = diagnostics.find((finding) => finding.severity !== 'info') ?? null;

  if (warningDiagnostic) {
    decisions.push({
      description: warningDiagnostic.message,
      due: 'dzisiaj 11:00',
      id: `diagnostic-${warningDiagnostic.findingId}`,
      impact: 'Ryzyko błędnej decyzji budżetowej',
      metric: warningDiagnostic.sourceRef ?? warningDiagnostic.code,
      owner: 'Analityka danych',
      priority: warningDiagnostic.severity === 'error' ? 'critical' : 'high',
      readiness: warningDiagnostic.severity === 'error' ? 'Zablokowane' : 'Do weryfikacji',
      title: 'Zweryfikuj jakość danych przed zmianą budżetu',
    });
  }

  const overPacedInefficient = overPacedRecords.find((record) => (
    record.roas === null
    || record.roas < 3
  )) ?? null;

  if (overPacedInefficient) {
    decisions.push({
      description: `${campaignChannelLabel(overPacedInefficient.channel)} zużywa ${formatPercent(campaignBudgetPressure(overPacedInefficient))} budżetu przy ROAS ${overPacedInefficient.roas === null ? 'bez danych' : formatNumber(overPacedInefficient.roas)}.`,
      due: 'dzisiaj 12:00',
      id: `budget-${overPacedInefficient.campaignId}`,
      impact: 'Ryzyko przepalenia budżetu',
      metric: overPacedInefficient.name,
      owner: resolveCampaignOwner(overPacedInefficient.channel),
      priority: 'high',
      readiness: 'Do decyzji',
      title: 'Ogranicz lub wstrzymaj budżet kampanii z niskim ROAS',
    });
  }

  const pausedHighRoas = records.find((record) => (
    record.status === 'paused'
    && (record.roas ?? 0) >= 3.4
  )) ?? null;

  if (pausedHighRoas) {
    decisions.push({
      description: `${pausedHighRoas.name} ma ROAS ${formatNumber(pausedHighRoas.roas ?? 0)} i wstrzymany status.`,
      due: 'dzisiaj 14:00',
      id: `paused-${pausedHighRoas.campaignId}`,
      impact: 'Szansa odzyskania sprzedaży',
      metric: pausedHighRoas.name,
      owner: resolveCampaignOwner(pausedHighRoas.channel),
      priority: 'medium',
      readiness: 'Do oceny',
      title: 'Sprawdź, czy kampania wstrzymana powinna wrócić do emisji',
    });
  }

  const lowRoas = inefficientRecords.find((record) => record !== overPacedInefficient) ?? null;

  if (lowRoas) {
    decisions.push({
      description: `${lowRoas.name} obniża wynik portfela i wymaga decyzji o dalszym teście.`,
      due: 'jutro 10:00',
      id: `roas-${lowRoas.campaignId}`,
      impact: 'Ryzyko słabej efektywności',
      metric: lowRoas.name,
      owner: resolveCampaignOwner(lowRoas.channel),
      priority: 'medium',
      readiness: 'Do przeglądu',
      title: 'Oceń kampanię testową przed kolejnym wydatkiem',
    });
  }

  const highImpactRecommendation = recommendations.find((item) => item.impact === 'high') ?? recommendations[0] ?? null;

  if (highImpactRecommendation) {
    decisions.push({
      description: highImpactRecommendation.rationale,
      due: 'dzisiaj 15:00',
      id: `recommendation-${highImpactRecommendation.recommendationId}`,
      impact: `Pewność ${formatPercent(highImpactRecommendation.confidence)}`,
      metric: highImpactRecommendation.title,
      owner: 'Growth lead',
      priority: highImpactRecommendation.impact === 'high' ? 'high' : 'low',
      readiness: 'Do zatwierdzenia',
      title: 'Oceń rekomendację przesunięcia budżetu',
    });
  }

  return decisions
    .filter((decision, index, all) => (
      all.findIndex((item) => item.title === decision.title) === index
    ))
    .slice(0, 4);
}

function campaignBudgetPressure(record: CampaignsRecord): number {
  return record.spend.amount / Math.max(record.budget.amount, 1);
}

function campaignRiskScore(record: CampaignsRecord): number {
  const pressureScore = campaignBudgetPressure(record) >= 0.92
    ? 4
    : campaignBudgetPressure(record) >= 0.82
      ? 2
      : 0;
  const roasScore = record.roas === null
    ? 3
    : record.roas < 2.4
      ? 4
      : record.roas < 3
        ? 2
        : 0;
  const statusScore = record.status === 'draft'
    ? 1
    : record.status === 'paused'
      ? 1
      : 0;

  return pressureScore + roasScore + statusScore;
}

function aggregateCampaignChannels(records: readonly CampaignsRecord[]) {
  const groups = new Map<CampaignsRecord['channel'], {
    count: number;
    revenue: Money;
    spend: Money;
  }>();

  for (const record of records) {
    const current = groups.get(record.channel) ?? {
      count: 0,
      revenue: { amount: 0, currency: record.revenue.currency },
      spend: { amount: 0, currency: record.spend.currency },
    };

    groups.set(record.channel, {
      count: current.count + 1,
      revenue: {
        amount: current.revenue.amount + record.revenue.amount,
        currency: current.revenue.currency,
      },
      spend: {
        amount: current.spend.amount + record.spend.amount,
        currency: current.spend.currency,
      },
    });
  }

  return [...groups.entries()].map(([key, value]) => ({
    ...value,
    key,
    label: campaignChannelLabel(key),
    roas: value.spend.amount > 0
      ? value.revenue.amount / value.spend.amount
      : 0,
  }));
}

function resolveCampaignNavigationLabel(definition: AnalyticsScreenDefinition): string {
  switch (definition.id) {
    case '31.04':
      return 'Atrybucja';
    case '31.07':
      return 'Rekomendacje';
    case '31.08':
      return 'Warianty';
    default:
      return definition.displayTitle;
  }
}

function resolveCampaignSummaryLabel(summary: CampaignsModuleData['summary']): string {
  if (summary.critical > 0) return 'Krytyczny';
  if (summary.warning > 0) return 'Częściowy';
  return 'Gotowy';
}

function resolveCampaignSummaryTone(
  summary: CampaignsModuleData['summary'],
): 'critical' | 'success' | 'warning' {
  if (summary.critical > 0) return 'critical';
  if (summary.warning > 0) return 'warning';
  return 'success';
}

function resolveCampaignPriorityLabel(priority: CampaignDecisionPriority): string {
  switch (priority) {
    case 'critical':
      return 'Krytyczne';
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
    default:
      return 'Niskie';
  }
}

function resolveCampaignPriorityTone(
  priority: CampaignDecisionPriority,
): 'critical' | 'info' | 'success' | 'warning' {
  switch (priority) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
    default:
      return 'success';
  }
}

function resolveCampaignStatusTone(
  status: CampaignsRecord['status'],
): 'neutral' | 'success' | 'warning' {
  if (status === 'active') return 'success';
  if (status === 'paused' || status === 'draft') return 'warning';
  return 'neutral';
}

function campaignChannelLabel(channel: CampaignsRecord['channel']): string {
  switch (channel) {
    case 'googleAds':
      return 'Google Ads';
    case 'metaAds':
      return 'Meta Ads';
    case 'tiktokAds':
      return 'TikTok Ads';
    case 'other':
    default:
      return 'Inny kanał';
  }
}

function resolveCampaignOwner(channel: CampaignsRecord['channel']): string {
  switch (channel) {
    case 'googleAds':
      return 'Performance marketing';
    case 'metaAds':
      return 'Social paid';
    case 'tiktokAds':
      return 'Growth eksperymenty';
    case 'other':
    default:
      return 'Właściciel obszaru';
  }
}

function resolveCampaignRisk(record: CampaignsRecord): 'critical' | 'high' | 'low' | 'medium' {
  const score = campaignRiskScore(record);
  if (score >= 7) return 'critical';
  if (score >= 5) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function resolveCampaignRiskLabel(record: CampaignsRecord): string {
  switch (resolveCampaignRisk(record)) {
    case 'critical':
      return 'Wysokie ryzyko';
    case 'high':
      return 'Wymaga decyzji';
    case 'medium':
      return 'Do monitoringu';
    case 'low':
    default:
      return 'Pod kontrolą';
  }
}

function resolveCampaignOperatorHint(record: CampaignsRecord): string {
  const pressure = campaignBudgetPressure(record);

  if ((record.roas ?? 0) < 2.4) {
    return 'Oceń kreacje, odbiorców i dalszy sens testu.';
  }

  if (pressure >= 0.92) {
    return 'Sprawdź limit budżetu przed kolejną emisją.';
  }

  if (record.status === 'paused') {
    return 'Zweryfikuj powód wstrzymania i gotowość do wznowienia.';
  }

  return 'Utrzymaj tempo i monitoruj koszt pozyskania.';
}

function diagnosticSeverityLabel(severity: DiagnosticFinding['severity']): string {
  switch (severity) {
    case 'error':
      return 'Błąd';
    case 'warning':
      return 'Ostrzeżenie';
    case 'info':
    default:
      return 'Informacja';
  }
}

function impactLabel(impact: RecommendationView['impact']): string {
  switch (impact) {
    case 'high':
      return 'Wysoki';
    case 'medium':
      return 'Średni';
    case 'low':
    default:
      return 'Niski';
  }
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

function UnsupportedVariant({ definition }: { readonly definition: AnalyticsScreenDefinition }) {
  return (
    <InlineNotice
      message={`Wariant ${definition.variant} nie ma jeszcze dedykowanej kompozycji w tym module.`}
      title="Brak kompozycji"
      tone="warning"
    />
  );
}

function EmptyDomainMessage() {
  return (
    <InlineNotice
      message="Bieżący endpoint nie zwrócił rekordów potrzebnych do zbudowania tej części widoku."
      title="Brak danych"
      tone="info"
    />
  );
}

export function OrdersWorkspace({
  data,
  definition,
  mode = 'storybook',
}: DomainWorkspaceProps<OrdersModuleData>) {
  const context = buildOrdersContext(data);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--orders"
      label={`Zamówienia: ${definition.displayTitle}`}
      mode={mode}
      screenId={definition.id}
      variant={definition.variant}
    >
      <AnalyticsDomainHeader
        definition={definition}
        navigationItems={orderNavigationItems}
        navigationLabel="Widoki zamówień"
        sectionLabel="Zamówienia"
        statusLabel={resolveDomainSummaryLabel(data.summary)}
        statusTone={resolveDomainSummaryTone(data.summary)}
        summary={data.summary}
      />

      <DomainHealthStrip
        items={[
          { hint: 'suma wartości w kontrakcie', label: 'Sprzedaż', value: formatMoney(context.revenue) },
          { hint: 'nowe lub opłacone', label: 'Do obsługi', value: formatInteger(context.openQueue.length) },
          { hint: 'zwroty i anulowania', label: 'Problemy', value: formatInteger(context.problemQueue.length) },
          { hint: 'aktywny podział źródeł', label: 'Źródła', value: formatInteger(context.sources.length) },
        ]}
      />

      <DomainCommandBrief
        heading="Co trzeba obsłużyć w zamówieniach teraz"
        kicker="Brief operacyjny"
        lead="Najpierw zamówienia opłacone i ryzyka zwrotu, potem eksport i rekonsyliacja. Ekran nie udaje operacji mutujących."
        metricLabel="Wartość kolejki"
        metricTone={context.problemQueue.length > 0 ? 'warning' : 'success'}
        metricValue={formatMoney(sumMoney(context.openQueue.map((record) => record.amount)))}
      />

      <DomainDecisionQueue
        countLabel={`${context.decisions.length} decyzje`}
        items={context.decisions}
        title="Kolejka obsługi zamówień"
      />

      {renderOrdersVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

export function ProductsWorkspace({
  data,
  definition,
  mode = 'storybook',
}: DomainWorkspaceProps<ProductsModuleData>) {
  const context = buildProductsContext(data);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--products"
      label={`Produkty: ${definition.displayTitle}`}
      mode={mode}
      screenId={definition.id}
      variant={definition.variant}
    >
      <AnalyticsDomainHeader
        definition={definition}
        navigationItems={productNavigationItems}
        navigationLabel="Widoki produktów"
        sectionLabel="Produkty"
        statusLabel={resolveDomainSummaryLabel(data.summary)}
        statusTone={resolveDomainSummaryTone(data.summary)}
        summary={data.summary}
      />

      <DomainHealthStrip
        items={[
          { hint: 'przychód produktów', label: 'Przychód', value: formatMoney(context.revenue) },
          { hint: 'sprzedane jednostki', label: 'Sztuki', value: formatInteger(context.units) },
          { hint: 'braki mapowania lub marży', label: 'Braki', value: formatInteger(context.gaps.length) },
          { hint: 'średnia z produktów z marżą', label: 'Marża', value: context.margin === null ? 'brak' : formatPercent(context.margin) },
        ]}
      />

      <DomainCommandBrief
        heading="Co naprawić w katalogu przed kolejną decyzją"
        kicker="Brief merchandisingowy"
        lead="Największe ryzyko to produkty z brakami mapowania, niepełną marżą i wysoką sprzedażą bez pełnego kontekstu."
        metricLabel="Przychód pod ryzykiem"
        metricTone={context.gaps.length > 0 ? 'warning' : 'success'}
        metricValue={formatMoney(sumMoney(context.gaps.map((record) => record.revenue)))}
      />

      <DomainDecisionQueue
        countLabel={`${context.decisions.length} decyzje`}
        items={context.decisions}
        title="Kolejka merchandisingowa"
      />

      {renderProductsVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

export function CustomersWorkspace({
  data,
  definition,
  mode = 'storybook',
}: DomainWorkspaceProps<CustomersModuleData>) {
  const context = buildCustomersContext(data);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--customers"
      label={`Klienci: ${definition.displayTitle}`}
      mode={mode}
      screenId={definition.id}
      variant={definition.variant}
    >
      <AnalyticsDomainHeader
        definition={definition}
        navigationItems={customerNavigationItems}
        navigationLabel="Widoki klientów"
        sectionLabel="Klienci"
        statusLabel={resolveDomainSummaryLabel(data.summary)}
        statusTone={resolveDomainSummaryTone(data.summary)}
        summary={data.summary}
      />

      <DomainHealthStrip
        items={[
          { hint: 'rekordy pseudonimizowane', label: 'Klienci', value: formatInteger(data.records.length) },
          { hint: 'aktywny podział zachowań', label: 'Segmenty', value: formatInteger(context.segments.length) },
          { hint: 'kohorta z najwyższą retencją', label: 'Najlepsza', value: context.bestCohort?.cohortKey ?? 'brak' },
          { hint: 'zgody cofnięte lub nieznane', label: 'Ryzyko zgód', value: formatInteger(context.consentRisks.length) },
        ]}
      />

      <DomainCommandBrief
        heading="Co sprawdzić w klientach bez wychodzenia poza prywatność"
        kicker="Brief CRM"
        lead="Widok pracuje wyłącznie na pseudonimach, segmentach, kohortach i statusach zgody. Każde ryzyko jest opisane bez danych osobowych."
        metricLabel="LTV w widoku"
        metricTone={context.consentRisks.length > 0 ? 'warning' : 'success'}
        metricValue={formatMoney(context.ltv)}
      />

      <DomainDecisionQueue
        countLabel={`${context.decisions.length} decyzje`}
        items={context.decisions}
        title="Kolejka prywatności i segmentacji"
      />

      {renderCustomersVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

export function TrafficWorkspace({
  data,
  definition,
  mode = 'storybook',
}: DomainWorkspaceProps<TrafficModuleData>) {
  const context = buildTrafficContext(data);

  return (
    <ProductionScreenCanvas
      className="pd-production-canvas--traffic"
      label={`Ruch i lejek: ${definition.displayTitle}`}
      mode={mode}
      screenId={definition.id}
      variant={definition.variant}
    >
      <AnalyticsDomainHeader
        definition={definition}
        navigationItems={trafficNavigationItems}
        navigationLabel="Widoki ruchu i lejka"
        sectionLabel="Ruch na stronie i lejek sprzedażowy"
        statusLabel={resolveDomainSummaryLabel(data.summary)}
        statusTone={resolveDomainSummaryTone(data.summary)}
        summary={data.summary}
      />

      <DomainHealthStrip
        items={[
          { hint: 'sesje w bieżącym zakresie', label: 'Sesje', value: formatInteger(context.sessions) },
          { hint: 'użytkownicy bez duplikacji źródła', label: 'Użytkownicy', value: formatInteger(context.users) },
          { hint: 'średni współczynnik konwersji', label: 'Konwersja', value: formatPercent(context.conversionRate) },
          { hint: 'średnia kompletność zdarzeń', label: 'Jakość zdarzeń', value: context.eventQuality === null ? 'brak' : formatPercent(context.eventQuality) },
        ]}
      />

      <DomainCommandBrief
        heading="Co sprawdzić w ruchu przed interpretacją sprzedaży"
        kicker="Brief analityczny"
        lead="Najpierw jakość zdarzeń i spójność lejka, potem kanały, strony wejścia i porównanie z zamówieniami."
        metricLabel="Przychód z ruchu"
        metricTone={context.lowQualityRecords.length > 0 ? 'warning' : 'success'}
        metricValue={formatMoney(context.revenue)}
      />

      <DomainDecisionQueue
        countLabel={`${context.decisions.length} decyzje`}
        items={context.decisions}
        title="Kolejka analityki ruchu"
      />

      {renderTrafficVariant(definition, data, context)}
    </ProductionScreenCanvas>
  );
}

function AnalyticsDomainHeader({
  definition,
  navigationItems,
  navigationLabel,
  sectionLabel,
  statusLabel,
  statusTone,
  summary,
}: {
  readonly definition: AnalyticsScreenDefinition;
  readonly navigationItems: readonly {
    readonly href: string;
    readonly id: string;
    readonly label: string;
  }[];
  readonly navigationLabel: string;
  readonly sectionLabel: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly summary: DomainSummary;
}) {
  return (
    <>
      <PageHeader
        actions={<StatusBadge status="Stan" text={statusLabel} tone={statusTone} />}
        breadcrumbs={[
          { href: '/app', label: 'Aplikacja' },
          { href: definition.routeBase, label: sectionLabel },
          { href: null, label: definition.displayTitle },
        ]}
        className="pd-production-domain-header"
        meta={[
          { label: 'Rekordy', value: formatInteger(summary.total) },
          { label: 'Gotowe', value: `${formatInteger(summary.ready)}/${formatInteger(summary.total)}` },
          { label: 'Odświeżono', value: formatDateTime(summary.updatedAt) },
        ]}
        subtitle={definition.summary}
        title={definition.displayTitle}
      />
      <SectionNavigation
        activeId={definition.id}
        ariaLabel={navigationLabel}
        className="pd-production-domain-nav"
        items={navigationItems}
        orientation="horizontal"
        size="compact"
      />
    </>
  );
}

function DomainHealthStrip({
  items,
}: {
  readonly items: readonly DomainMetricItem[];
}) {
  return (
    <dl className="pd-domain-health-strip">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          <dd className="pd-domain-health-strip__hint">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

function DomainCommandBrief({
  heading,
  kicker,
  lead,
  metricLabel,
  metricTone,
  metricValue,
}: {
  readonly heading: string;
  readonly kicker: string;
  readonly lead: string;
  readonly metricLabel: string;
  readonly metricTone: StatusBadgeTone;
  readonly metricValue: string;
}) {
  return (
    <section className="pd-domain-command-brief" aria-label={kicker}>
      <header>
        <p className="pd-production-eyebrow">{kicker}</p>
        <h2>{heading}</h2>
        <span>{lead}</span>
      </header>
      <aside>
        <span>{metricLabel}</span>
        <strong>{metricValue}</strong>
        <StatusBadge status="Sygnał" text={metricTone === 'success' ? 'Pod kontrolą' : 'Do przeglądu'} tone={metricTone} />
      </aside>
    </section>
  );
}

function DomainDecisionQueue({
  countLabel,
  items,
  title,
}: {
  readonly countLabel: string;
  readonly items: readonly DomainDecisionItem[];
  readonly title: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Decyzje</p>
          <h2>{title}</h2>
        </div>
        <span>{countLabel}</span>
      </header>
      <ol className="pd-domain-decision-grid">
        {items.map((item) => (
          <li data-priority={item.priority} key={item.id}>
            <div>
              <StatusBadge
                status="Priorytet"
                text={resolveDomainPriorityLabel(item.priority)}
                tone={resolveDomainPriorityTone(item.priority)}
              />
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            <dl>
              <div><dt>Metryka</dt><dd>{item.metric}</dd></div>
              <div><dt>Wpływ</dt><dd>{item.impact}</dd></div>
              <div><dt>Właściciel</dt><dd>{item.owner}</dd></div>
              <div><dt>Termin</dt><dd>{item.due}</dd></div>
            </dl>
            <StatusBadge status="Status" text={item.status} tone={resolveDomainPriorityTone(item.priority)} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function DomainStateGrid({
  items,
}: {
  readonly items: readonly {
    readonly detail: string;
    readonly id: string;
    readonly status: string;
    readonly title: string;
    readonly tone: StatusBadgeTone;
    readonly value: string;
  }[];
}) {
  return (
    <div className="pd-domain-state-grid">
      {items.map((item) => (
        <article key={item.id}>
          <StatusBadge status="Stan" text={item.status} tone={item.tone} />
          <strong>{item.value}</strong>
          <h3>{item.title}</h3>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function DomainRecordList({
  items,
}: {
  readonly items: readonly {
    readonly detail: string;
    readonly id: string;
    readonly meta: string;
    readonly tone: StatusBadgeTone;
    readonly title: string;
    readonly value: string;
  }[];
}) {
  return (
    <ol className="pd-domain-record-list">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <span>{item.meta}</span>
          </div>
          <b>{item.value}</b>
          <StatusBadge status="Stan" text={item.detail} tone={item.tone} />
        </li>
      ))}
    </ol>
  );
}

function DomainTableSection({
  ariaLabel,
  columns,
  recordsLabel,
  rows,
  title,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly recordsLabel: string;
  readonly rows: readonly DataRow[];
  readonly title: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Rejestr</p>
          <h2>{title}</h2>
        </div>
        <span>{recordsLabel}</span>
      </header>
      <DomainTable
        ariaLabel={ariaLabel}
        columns={columns}
        rows={rows}
        summary={recordsLabel}
      />
    </section>
  );
}

function ProcessRail({
  activeId,
  items,
}: {
  readonly activeId: string;
  readonly items: readonly {
    readonly detail: string;
    readonly id: string;
    readonly label: string;
    readonly status: string;
  }[];
}) {
  return (
    <ol className="pd-production-process" aria-label="Kroki procesu">
      {items.map((item) => (
        <li
          data-active={item.id === activeId ? 'true' : undefined}
          key={item.id}
        >
          <div>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </div>
          <StatusBadge
            status="Stan"
            text={resolveProcessStatusLabel(item.status)}
            tone={resolveProcessStatusTone(item.status)}
          />
        </li>
      ))}
    </ol>
  );
}

function renderOrdersVariant(
  definition: AnalyticsScreenDefinition,
  data: OrdersModuleData,
  context: ReturnType<typeof buildOrdersContext>,
) {
  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <section className="pd-production-section">
            <header>
              <div>
                <p className="pd-production-eyebrow">Przegląd</p>
                <h2>Obsługa zamówień według ryzyka</h2>
              </div>
              <span>{formatInteger(data.records.length)} zamówień</span>
            </header>
            <div className="pd-domain-split">
              <OrderDispatchColumn title="Nowe i opłacone" records={context.openQueue} />
              <article className="pd-domain-card">
                <h3>Statusy zamówień</h3>
                <OrderStatusBars records={data.records} />
              </article>
              <article className="pd-domain-card">
                <h3>Aktywny rekord</h3>
                <OrderDetailPanel record={context.selected} bare />
              </article>
            </div>
          </section>
          <OrdersSourceBoard sources={context.sources} />
        </>
      );
    case 'list':
      return (
        <>
          <section className="pd-production-section">
            <header>
              <div>
                <p className="pd-production-eyebrow">Lista</p>
                <h2>Rejestr operacyjny zamówień</h2>
              </div>
              <span>{formatInteger(data.records.length)} rekordów</span>
            </header>
            <DomainSearchToolbar
              label="Szukaj zamówienia"
              placeholder="Szukaj po numerze, źródle lub kliencie"
              resultCount={data.records.length}
              statuses={[
                ['Do obsługi', context.openQueue.length, 'warning'],
                ['Problemy', context.problemQueue.length, 'critical'],
              ]}
            />
            <DomainTable
              ariaLabel="Lista zamówień"
              columns={orderColumns}
              rows={orderRows(data.records)}
              summary={`${data.records.length} zamówień`}
            />
            <OrdersMobileRecords records={data.records} />
          </section>
        </>
      );
    case 'detail':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Szczegół</p>
              <h2>Zamówienie bez ujawniania danych poza kontraktem</h2>
            </div>
            <StatusBadge
              status="Zamówienie"
              text={context.selected ? resolveOrderStatus(context.selected.status) : 'Brak'}
              tone={context.selected && isProblemOrder(context.selected) ? 'critical' : 'success'}
            />
          </header>
          <div className="pd-domain-split">
            <OrderDetailPanel record={context.selected} />
            <article className="pd-domain-card">
              <h3>Porównanie z kolejką</h3>
              <DomainRecordList
                items={data.records.slice(0, 5).map((record) => ({
                  detail: resolveOrderStatus(record.status),
                  id: record.orderId,
                  meta: `${record.source} · ${record.customerPseudonym ?? 'klient anonimowy'}`,
                  title: record.externalOrderId,
                  tone: isProblemOrder(record) ? 'critical' : record.status === 'fulfilled' ? 'success' : 'warning',
                  value: formatMoney(record.amount),
                }))}
              />
            </article>
          </div>
        </section>
      );
    case 'timeline':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Oś zdarzeń</p>
              <h2>Chronologia zamówień i statusów</h2>
            </div>
            <span>{formatInteger(data.records.length)} zdarzeń</span>
          </header>
          <ProcessRail
            activeId={context.selected?.orderId ?? data.records[0]?.orderId ?? ''}
            items={[...data.records]
              .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime())
              .map((record) => ({
                detail: `${formatDateTime(record.orderedAt)} · ${record.source} · ${formatMoney(record.amount)}`,
                id: record.orderId,
                label: record.externalOrderId,
                status: isProblemOrder(record) ? 'blocked' : record.status === 'fulfilled' ? 'ready' : 'partial',
              }))}
          />
        </section>
      );
    case 'source-comparison':
      return <OrdersSourceBoard sources={context.sources} />;
    case 'reconciliation':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Rekoncyliacja</p>
              <h2>Skrót zgodności zamówień i źródeł</h2>
            </div>
            <span>{formatInteger(context.problemQueue.length)} odchyleń</span>
          </header>
          <div className="pd-domain-card-grid">
            {context.sources.map((source) => (
              <article key={source.id}>
                <StatusBadge status="Źródło" text={source.problems > 0 ? 'Do sprawdzenia' : 'Zgodne'} tone={source.problems > 0 ? 'warning' : 'success'} />
                <h3>{source.id}</h3>
                <dl className="pd-production-facts">
                  <div><dt>Zamówienia</dt><dd>{formatInteger(source.count)}</dd></div>
                  <div><dt>Wartość</dt><dd>{formatMoney(source.amount)}</dd></div>
                  <div><dt>Problemy</dt><dd>{formatInteger(source.problems)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      );
    case 'export':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Eksport</p>
              <h2>Pakiet eksportu bez uruchamiania operacji pobrania</h2>
              <p>Storybook pokazuje gotowość danych i ograniczenia; właściwe pobranie wymaga osobnego kontraktu eksportowego.</p>
            </div>
            <StatusBadge status="Eksport" text={context.problemQueue.length > 0 ? 'Częściowy' : 'Gotowy'} tone={context.problemQueue.length > 0 ? 'warning' : 'success'} />
          </header>
          <DomainStateGrid
            items={[
              { detail: 'Lista zawiera status, źródło, klienta pseudonimizowanego i kwotę.', id: 'ledger', status: 'Gotowe', title: 'Rejestr zamówień', tone: 'success', value: formatInteger(data.records.length) },
              { detail: 'Zwroty i anulowania są jawnie oznaczone przed eksportem.', id: 'risk', status: 'Do kontroli', title: 'Ryzyka', tone: context.problemQueue.length > 0 ? 'warning' : 'success', value: formatInteger(context.problemQueue.length) },
              { detail: 'Eksport nie zawiera danych osobowych poza pseudonimem z kontraktu.', id: 'privacy', status: 'Ograniczony', title: 'Prywatność', tone: 'info', value: 'PII: 0' },
            ]}
          />
        </section>
      );
    case 'variants':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Warianty</p>
              <h2>Stany produkcyjne zamówień</h2>
            </div>
            <span>6 stanów</span>
          </header>
          <DomainStateGrid
            items={[
              { detail: 'Zamówienia opłacone i gotowe do dalszej obsługi.', id: 'ready', status: 'Gotowe', title: 'Gotowe do realizacji', tone: 'success', value: formatInteger(context.openQueue.length) },
              { detail: 'Zwroty, anulowania i ryzyka zgodności.', id: 'problem', status: 'Krytyczne', title: 'Problemy', tone: 'critical', value: formatInteger(context.problemQueue.length) },
              { detail: 'Dane z kilku źródeł w jednym rejestrze.', id: 'sources', status: 'Aktywne', title: 'Źródła', tone: 'info', value: formatInteger(context.sources.length) },
              { detail: 'Ekran nie dopisuje rekordów przy pustej odpowiedzi.', id: 'empty', status: 'Pusty', title: 'Brak danych', tone: 'neutral', value: '0' },
              { detail: 'Eksport pozostaje tylko stanem gotowości.', id: 'export', status: 'Tylko odczyt', title: 'Eksport', tone: 'warning', value: 'read' },
              { detail: 'Brak uprawnień zatrzymuje akcje i zachowuje kontekst.', id: 'forbidden', status: 'Blokada', title: 'Dostęp', tone: 'critical', value: '403' },
            ]}
          />
        </section>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function renderProductsVariant(
  definition: AnalyticsScreenDefinition,
  data: ProductsModuleData,
  context: ReturnType<typeof buildProductsContext>,
) {
  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <ProductPortfolio records={data.records} />
          <ProductCategoryBoard records={data.records} />
        </>
      );
    case 'catalog':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Katalog</p>
              <h2>Katalog produktów i szybkie filtrowanie</h2>
            </div>
            <span>{formatInteger(data.records.length)} produktów</span>
          </header>
          <DomainSearchToolbar
            label="Szukaj SKU"
            placeholder="Szukaj po nazwie, SKU albo kategorii"
            resultCount={data.records.length}
            statuses={[
              ['Aktywne', data.records.filter((record) => record.status === 'active').length, 'success'],
              ['Braki', context.gaps.length, 'warning'],
            ]}
          />
          <DomainTable
            ariaLabel="Katalog produktów"
            columns={productColumns}
            rows={productRows(data.records)}
            summary={`${data.records.length} produktów`}
          />
          <ProductsMobileRecords records={data.records} />
        </section>
      );
    case 'detail':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Szczegół</p>
              <h2>Produkt w kontekście sprzedaży i mapowania</h2>
            </div>
            <StatusBadge
              status="Produkt"
              text={context.selected ? resolveProductStatus(context.selected.status) : 'Brak'}
              tone={context.selected?.status === 'missingMapping' ? 'warning' : 'success'}
            />
          </header>
          <div className="pd-domain-split">
            <ProductDetailPanel record={context.selected} />
            <ProductCategoryBoard records={data.records} compact />
          </div>
        </section>
      );
    case 'mapping':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Mapowanie</p>
              <h2>Jakość mapowania SKU</h2>
              <p>Widok pokazuje braki i skutki, ale nie udaje edycji mapowania bez kontraktu mutacji.</p>
            </div>
            <span>{formatInteger(context.gaps.length)} braków</span>
          </header>
          <DomainRecordList
            items={(context.gaps.length > 0 ? context.gaps : data.records).map((record) => ({
              detail: record.status === 'missingMapping' ? 'Brak mapowania' : record.margin === null ? 'Brak marży' : 'Gotowy',
              id: record.productId,
              meta: `${record.sku} · ${record.category ?? 'brak kategorii'}`,
              title: record.name,
              tone: record.status === 'missingMapping' || record.margin === null ? 'warning' : 'success',
              value: formatMoney(record.revenue),
            }))}
          />
        </section>
      );
    case 'offers':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Oferty</p>
              <h2>Oferty i gotowość ekspozycji produktu</h2>
            </div>
            <span>{formatInteger(data.records.length)} SKU</span>
          </header>
          <div className="pd-domain-card-grid">
            {data.records.map((record) => (
              <article key={record.productId}>
                <StatusBadge status="Oferta" text={record.status === 'active' ? 'W emisji' : resolveProductStatus(record.status)} tone={record.status === 'active' ? 'success' : 'warning'} />
                <h3>{record.name}</h3>
                <p>{record.sku} · {record.category ?? 'brak kategorii'}</p>
                <dl className="pd-production-facts">
                  <div><dt>Przychód</dt><dd>{formatMoney(record.revenue)}</dd></div>
                  <div><dt>Sztuki</dt><dd>{formatInteger(record.units)}</dd></div>
                  <div><dt>Marża</dt><dd>{record.margin === null ? 'brak' : formatPercent(record.margin)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      );
    case 'performance':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Wydajność</p>
              <h2>Ranking produktów według wyniku i marży</h2>
            </div>
            <span>{formatMoney(context.revenue)}</span>
          </header>
          <DomainRecordList
            items={[...data.records]
              .sort((a, b) => b.revenue.amount - a.revenue.amount)
              .map((record) => ({
                detail: resolveProductRisk(record),
                id: record.productId,
                meta: `${formatInteger(record.units)} szt. · marża ${record.margin === null ? 'brak' : formatPercent(record.margin)}`,
                title: record.name,
                tone: record.status === 'missingMapping' || record.margin === null ? 'warning' : 'success',
                value: formatMoney(record.revenue),
              }))}
          />
        </section>
      );
    case 'gaps':
      return (
        <RiskList
          items={context.gaps.map((record) => ({
            detail: `${record.sku} · ${record.status === 'missingMapping' ? 'brak mapowania' : 'brak marży'}`,
            title: record.name,
          }))}
          title="Kolejka braków katalogowych"
        />
      );
    case 'impact':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Wpływ</p>
              <h2>Wpływ braków produktowych na sprzedaż</h2>
            </div>
            <span>{formatMoney(sumMoney(context.gaps.map((record) => record.revenue)))}</span>
          </header>
          <div className="pd-domain-card-grid">
            {context.decisions.map((item) => (
              <article data-priority={item.priority} key={item.id}>
                <StatusBadge status="Priorytet" text={resolveDomainPriorityLabel(item.priority)} tone={resolveDomainPriorityTone(item.priority)} />
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <strong>{item.impact}</strong>
              </article>
            ))}
          </div>
        </section>
      );
    case 'variants':
      return (
        <>
          <section className="pd-production-section">
            <header>
              <div>
                <p className="pd-production-eyebrow">Warianty</p>
                <h2>Stany produkcyjne katalogu</h2>
              </div>
              <span>6 stanów</span>
            </header>
            <DomainStateGrid
              items={[
                { detail: 'Aktywne SKU z przychodem i marżą.', id: 'ready', status: 'Gotowe', title: 'Katalog gotowy', tone: 'success', value: formatInteger(data.records.filter((record) => record.status === 'active').length) },
                { detail: 'Braki mapowania lub marży zatrzymują decyzję.', id: 'gaps', status: 'Do uzupełnienia', title: 'Braki', tone: 'warning', value: formatInteger(context.gaps.length) },
                { detail: 'Produkty historyczne bez aktywnej ekspozycji.', id: 'archive', status: 'Archiwum', title: 'Archiwum', tone: 'neutral', value: formatInteger(data.records.filter((record) => record.status === 'archived').length) },
                { detail: 'Pusty katalog zachowuje shell i komunikat.', id: 'empty', status: 'Pusty', title: 'Brak rekordów', tone: 'neutral', value: '0' },
                { detail: 'Źródło częściowe pokazuje blokadę mapowania.', id: 'partial', status: 'Częściowe', title: 'Dane źródłowe', tone: 'warning', value: formatInteger(data.summary.warning) },
                { detail: 'Brak uprawnień nie pokazuje danych produktu.', id: 'forbidden', status: 'Blokada', title: 'Dostęp', tone: 'critical', value: '403' },
              ]}
            />
          </section>
          <ProductPortfolio records={data.records} />
        </>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function renderCustomersVariant(
  definition: AnalyticsScreenDefinition,
  data: CustomersModuleData,
  context: ReturnType<typeof buildCustomersContext>,
) {
  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <CustomerCohortBoard data={data} context={context} />
          <CustomerSegmentBoard records={data.records} />
        </>
      );
    case 'segments':
      return <CustomerSegmentBoard records={data.records} />;
    case 'cohorts':
      return <CustomerCohortBoard data={data} context={context} />;
    case 'detail':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Szczegół</p>
              <h2>Pseudonimizowany szczegół klienta</h2>
              <p>Widok trzyma się pseudonimu, kohorty, LTV i zgody. Nie pokazuje danych osobowych.</p>
            </div>
            <StatusBadge status="Zgoda" text={context.selected ? resolveConsentLabel(context.selected.consentStatus) : 'Brak'} tone={context.selected && context.selected.consentStatus === 'granted' ? 'success' : 'warning'} />
          </header>
          {context.selected ? (
            <div className="pd-domain-split">
              <article className="pd-domain-card">
                <h3>{context.selected.customerPseudonym}</h3>
                <dl className="pd-production-facts">
                  <div><dt>Segment</dt><dd>{shortSegmentId(context.selected.segmentId)}</dd></div>
                  <div><dt>Kohorta</dt><dd>{context.selected.cohortKey ?? 'brak'}</dd></div>
                  <div><dt>Zamówienia</dt><dd>{formatInteger(context.selected.ordersCount)}</dd></div>
                  <div><dt>Przychód</dt><dd>{formatMoney(context.selected.revenue)}</dd></div>
                  <div><dt>LTV</dt><dd>{context.selected.ltv ? formatMoney(context.selected.ltv) : 'brak'}</dd></div>
                </dl>
              </article>
              <CustomerSegmentBoard records={data.records} compact />
            </div>
          ) : <EmptyDomainMessage />}
        </section>
      );
    case 'identity-conflicts':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Konflikty</p>
              <h2>Rekordy wymagające decyzji tożsamości</h2>
            </div>
            <span>{formatInteger(context.identityConflicts.length)} konfliktów</span>
          </header>
          <DomainRecordList
            items={(context.identityConflicts.length > 0 ? context.identityConflicts : data.records).map((record) => ({
              detail: record.segmentId ? 'Przypisany' : 'Do przypisania',
              id: record.customerPseudonym,
              meta: `${record.cohortKey ?? 'bez kohorty'} · zgoda ${resolveConsentLabel(record.consentStatus)}`,
              title: record.customerPseudonym,
              tone: record.segmentId && record.cohortKey ? 'success' : 'warning',
              value: formatMoney(record.revenue),
            }))}
          />
        </section>
      );
    case 'privacy':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Prywatność</p>
              <h2>Stan zgód i ograniczeń danych</h2>
            </div>
            <span>{formatInteger(context.consentRisks.length)} do kontroli</span>
          </header>
          <div className="pd-domain-card-grid">
            {(['granted', 'unknown', 'withdrawn'] as const).map((status) => {
              const records = data.records.filter((record) => record.consentStatus === status);
              return (
                <article key={status}>
                  <StatusBadge status="Zgoda" text={resolveConsentLabel(status)} tone={status === 'granted' ? 'success' : status === 'unknown' ? 'warning' : 'critical'} />
                  <h3>{formatInteger(records.length)} klientów</h3>
                  <p>{status === 'granted' ? 'Pełny zakres analityczny w granicach pseudonimizacji.' : 'Dalsza praca wymaga ograniczeń segmentacji i komunikacji.'}</p>
                  <strong>{formatMoney(sumMoney(records.map((record) => record.revenue)))}</strong>
                </article>
              );
            })}
          </div>
        </section>
      );
    case 'impact':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Wpływ</p>
              <h2>Wpływ segmentów na sprzedaż i LTV</h2>
            </div>
            <span>{formatMoney(context.revenue)}</span>
          </header>
          <DomainRecordList
            items={context.segments.map((segment) => ({
              detail: `${formatInteger(segment.orders)} zamówień`,
              id: segment.id,
              meta: `${formatInteger(segment.count)} klientów · LTV ${formatMoney(segment.ltv)}`,
              title: segment.label,
              tone: segment.consentRisks > 0 ? 'warning' : 'success',
              value: formatMoney(segment.revenue),
            }))}
          />
        </section>
      );
    case 'variants':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Warianty</p>
              <h2>Stany produkcyjne klientów</h2>
            </div>
            <span>6 stanów</span>
          </header>
          <DomainStateGrid
            items={[
              { detail: 'Pseudonimizowane rekordy z aktywną zgodą.', id: 'ready', status: 'Gotowe', title: 'Klienci gotowi', tone: 'success', value: formatInteger(data.records.filter((record) => record.consentStatus === 'granted').length) },
              { detail: 'Zgody nieznane lub cofnięte ograniczają użycie.', id: 'privacy', status: 'Do kontroli', title: 'Prywatność', tone: 'warning', value: formatInteger(context.consentRisks.length) },
              { detail: 'Segmenty są policzone bez danych osobowych.', id: 'segments', status: 'Aktywne', title: 'Segmenty', tone: 'info', value: formatInteger(context.segments.length) },
              { detail: 'Kohorty pokazują retencję i małe próby.', id: 'cohorts', status: 'Aktywne', title: 'Kohorty', tone: 'info', value: formatInteger(data.cohorts.length) },
              { detail: 'Pusty zestaw nie ujawnia nic poza shell.', id: 'empty', status: 'Pusty', title: 'Brak rekordów', tone: 'neutral', value: '0' },
              { detail: 'Brak capability zatrzymuje segmentację.', id: 'forbidden', status: 'Blokada', title: 'Dostęp', tone: 'critical', value: '403' },
            ]}
          />
        </section>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function renderTrafficVariant(
  definition: AnalyticsScreenDefinition,
  data: TrafficModuleData,
  context: ReturnType<typeof buildTrafficContext>,
) {
  switch (definition.variant) {
    case 'overview':
      return (
        <>
          <TrafficJourneyPanel data={data} />
          <TrafficChannelBoard records={data.records} />
        </>
      );
    case 'channels':
      return <TrafficChannelBoard records={data.records} />;
    case 'funnel':
      return <TrafficJourneyPanel data={data} />;
    case 'funnel-step':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Krok lejka</p>
              <h2>Szczegół najsłabszego kroku</h2>
            </div>
            <span>{context.weakStep?.label ?? 'brak'}</span>
          </header>
          {context.weakStep ? (
            <div className="pd-domain-split">
              <article className="pd-domain-card">
                <h3>{context.weakStep.label}</h3>
                <dl className="pd-production-facts">
                  <div><dt>Wejścia</dt><dd>{formatInteger(context.weakStep.entrants)}</dd></div>
                  <div><dt>Zakończenia</dt><dd>{formatInteger(context.weakStep.completions)}</dd></div>
                  <div><dt>Konwersja</dt><dd>{formatPercent(context.weakStep.conversionRate)}</dd></div>
                  <div><dt>Odpływ</dt><dd>{formatPercent(1 - context.weakStep.conversionRate)}</dd></div>
                </dl>
              </article>
              <article className="pd-domain-card">
                <h3>Kanały do sprawdzenia</h3>
                <TrafficBars records={data.records.slice(0, 4)} />
              </article>
            </div>
          ) : <EmptyDomainMessage />}
        </section>
      );
    case 'funnel-definitions':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Definicje</p>
              <h2>Kontraktowe definicje lejka</h2>
              <p>Edycja kroków pozostaje niedostępna; ekran pokazuje wpływ definicji na interpretację danych.</p>
            </div>
            <span>{formatInteger(data.steps.length)} kroki</span>
          </header>
          <ProcessRail
            activeId={context.weakStep?.stepId ?? data.steps[0]?.stepId ?? ''}
            items={data.steps.map((step) => ({
              detail: `${formatInteger(step.entrants)} wejść · ${formatInteger(step.completions)} zakończeń · CR ${formatPercent(step.conversionRate)}`,
              id: step.stepId,
              label: step.label,
              status: step.conversionRate >= 0.45 ? 'ready' : 'partial',
            }))}
          />
        </section>
      );
    case 'ga4-orders':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">GA4 vs zamówienia</p>
              <h2>Spójność ruchu z warstwą zamówień</h2>
            </div>
            <StatusBadge status="Spójność" text={context.lowQualityRecords.length > 0 ? 'Częściowa' : 'Gotowa'} tone={context.lowQualityRecords.length > 0 ? 'warning' : 'success'} />
          </header>
          <div className="pd-domain-card-grid">
            <article>
              <h3>Konwersje GA4</h3>
              <strong>{formatInteger(context.conversions)}</strong>
              <p>Łączna liczba konwersji z wymiarów ruchu.</p>
            </article>
            <article>
              <h3>Przychód z ruchu</h3>
              <strong>{formatMoney(context.revenue)}</strong>
              <p>Przychód przypisany do bieżących kanałów i stron wejścia.</p>
            </article>
            <article>
              <h3>Ryzyko jakości</h3>
              <strong>{formatInteger(context.lowQualityRecords.length)}</strong>
              <p>Kanały z jakością zdarzeń poniżej progu interpretacji.</p>
            </article>
          </div>
        </section>
      );
    case 'event-quality':
      return (
        <>
          <DiagnosticsPanel diagnostics={data.diagnostics} />
          <DomainTableSection
            ariaLabel="Jakość zdarzeń według kanałów"
            columns={trafficColumns}
            recordsLabel={`${data.records.length} kanałów`}
            rows={trafficRows(data.records)}
            title="Kanały z jakością zdarzeń"
          />
        </>
      );
    case 'landing-pages':
      return <LandingPages records={data.records} />;
    case 'variants':
      return (
        <section className="pd-production-section">
          <header>
            <div>
              <p className="pd-production-eyebrow">Warianty</p>
              <h2>Stany produkcyjne ruchu i lejka</h2>
            </div>
            <span>6 stanów</span>
          </header>
          <DomainStateGrid
            items={[
              { detail: 'Kanały i lejek z kompletną jakością zdarzeń.', id: 'ready', status: 'Gotowe', title: 'Ruch gotowy', tone: 'success', value: formatInteger(data.records.length - context.lowQualityRecords.length) },
              { detail: 'Kanały z niższą jakością zdarzeń.', id: 'quality', status: 'Częściowe', title: 'Jakość zdarzeń', tone: 'warning', value: formatInteger(context.lowQualityRecords.length) },
              { detail: 'Kroki lejka z odpływem do interpretacji.', id: 'funnel', status: 'Aktywne', title: 'Lejek', tone: 'info', value: formatInteger(data.steps.length) },
              { detail: 'Porównanie z zamówieniami zostaje oznaczone jako częściowe przy ryzykach.', id: 'orders', status: 'Kontrola', title: 'GA4 vs zamówienia', tone: context.lowQualityRecords.length > 0 ? 'warning' : 'success', value: formatInteger(context.conversions) },
              { detail: 'Pusty zakres zachowuje strukturę i komunikat.', id: 'empty', status: 'Pusty', title: 'Brak ruchu', tone: 'neutral', value: '0' },
              { detail: 'Awaria GA4 blokuje interpretację bez dopisywania danych.', id: 'unavailable', status: 'Blokada', title: 'Źródło', tone: 'critical', value: '503' },
            ]}
          />
        </section>
      );
    default:
      return <UnsupportedVariant definition={definition} />;
  }
}

function DomainSearchToolbar({
  label,
  placeholder,
  resultCount,
  statuses,
}: {
  readonly label: string;
  readonly placeholder: string;
  readonly resultCount: number;
  readonly statuses: readonly (readonly [string, number, StatusBadgeTone])[];
}) {
  return (
    <div className="pd-production-toolbar" aria-label={label}>
      <div className="pd-production-toolbar__group">
        <SearchField
          debounceMs={120}
          hideLabel
          label={label}
          loading={false}
          placeholder={placeholder}
          query=""
          resultCount={resultCount}
          size="compact"
        />
      </div>
      <div className="pd-production-toolbar__group">
        {statuses.map(([text, count, tone]) => (
          <StatusBadge
            key={text}
            status={text}
            text={`${formatInteger(count)} ${text.toLowerCase()}`}
            tone={tone}
          />
        ))}
      </div>
    </div>
  );
}

function OrdersSourceBoard({
  sources,
}: {
  readonly sources: ReturnType<typeof aggregateOrdersSources>;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Źródła</p>
          <h2>Wartość i ryzyko według źródła zamówień</h2>
        </div>
        <span>{formatInteger(sources.length)} źródła</span>
      </header>
      <DomainRecordList
        items={sources.map((source) => ({
          detail: source.problems > 0 ? 'Do sprawdzenia' : 'Zgodne',
          id: source.id,
          meta: `${formatInteger(source.count)} zamówień · ${formatInteger(source.problems)} problemów`,
          title: source.id,
          tone: source.problems > 0 ? 'warning' : 'success',
          value: formatMoney(source.amount),
        }))}
      />
    </section>
  );
}

function ProductPortfolio({
  records,
}: {
  readonly records: readonly ProductsRecord[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Portfel</p>
          <h2>Produkty według wyniku i ryzyka katalogowego</h2>
        </div>
        <span>{formatInteger(records.length)} SKU</span>
      </header>
      <div className="pd-product-board__matrix pd-domain-card-grid">
        {records.map((record) => (
          <article data-priority={record.status === 'missingMapping' ? 'high' : 'low'} key={record.productId}>
            <StatusBadge
              status="Produkt"
              text={resolveProductStatus(record.status)}
              tone={record.status === 'missingMapping' ? 'warning' : record.status === 'archived' ? 'neutral' : 'success'}
            />
            <h3>{record.name}</h3>
            <p>{record.sku} · {record.category ?? 'brak kategorii'}</p>
            <dl className="pd-production-facts">
              <div><dt>Przychód</dt><dd>{formatMoney(record.revenue)}</dd></div>
              <div><dt>Sztuki</dt><dd>{formatInteger(record.units)}</dd></div>
              <div><dt>Marża</dt><dd>{record.margin === null ? 'brak' : formatPercent(record.margin)}</dd></div>
              <div><dt>Ryzyko</dt><dd>{resolveProductRisk(record)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductCategoryBoard({
  compact = false,
  records,
}: {
  readonly compact?: boolean;
  readonly records: readonly ProductsRecord[];
}) {
  const groups = aggregateProductsCategories(records);
  const content = (
    <>
      <header>
        <div>
          <p className="pd-production-eyebrow">Kategorie</p>
          <h2>Sprzedaż według kategorii</h2>
        </div>
        <span>{formatInteger(groups.length)} kategorie</span>
      </header>
      <DomainRecordList
        items={groups.map((group) => ({
          detail: group.gaps > 0 ? 'Braki' : 'Gotowe',
          id: group.id,
          meta: `${formatInteger(group.count)} SKU · ${formatInteger(group.units)} szt.`,
          title: group.id,
          tone: group.gaps > 0 ? 'warning' : 'success',
          value: formatMoney(group.revenue),
        }))}
      />
    </>
  );

  if (compact) {
    return <article className="pd-domain-card">{content}</article>;
  }

  return <section className="pd-production-section">{content}</section>;
}

function CustomerCohortBoard({
  context,
  data,
}: {
  readonly context: ReturnType<typeof buildCustomersContext>;
  readonly data: CustomersModuleData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Kohorty</p>
          <h2>Retencja M0-M3 i wartość kohort</h2>
        </div>
        <span>{context.bestCohort?.cohortKey ?? 'brak lidera'}</span>
      </header>
      <div className="pd-domain-split">
        <article className="pd-domain-card">
          <h3>Heatmapa retencji</h3>
          <CohortHeatmap cohorts={data.cohorts} />
        </article>
        <article className="pd-domain-card">
          <h3>Ranking kohort</h3>
          <DomainRecordList
            items={data.cohorts.map((cohort) => ({
              detail: cohort.retentionRate === null ? 'Brak retencji' : cohort.retentionRate >= 0.36 ? 'Stabilna' : 'Do kontroli',
              id: cohort.cohortKey,
              meta: `${formatInteger(cohort.users)} użytkowników · retencja ${cohort.retentionRate === null ? 'brak' : formatPercent(cohort.retentionRate)}`,
              title: cohort.cohortKey,
              tone: cohort.retentionRate === null || cohort.retentionRate < 0.32 ? 'warning' : 'success',
              value: formatMoney(cohort.revenue),
            }))}
          />
        </article>
      </div>
    </section>
  );
}

function CustomerSegmentBoard({
  compact = false,
  records,
}: {
  readonly compact?: boolean;
  readonly records: readonly CustomersRecord[];
}) {
  const segments = aggregateCustomerSegments(records);
  const content = (
    <>
      <header>
        <div>
          <p className="pd-production-eyebrow">Segmenty</p>
          <h2>Segmenty bez danych osobowych</h2>
        </div>
        <span>{formatInteger(segments.length)} segmenty</span>
      </header>
      <DomainRecordList
        items={segments.map((segment) => ({
          detail: segment.consentRisks > 0 ? 'Zgody do kontroli' : 'Gotowy',
          id: segment.id,
          meta: `${formatInteger(segment.count)} klientów · ${formatInteger(segment.orders)} zamówień`,
          title: segment.label,
          tone: segment.consentRisks > 0 ? 'warning' : 'success',
          value: formatMoney(segment.revenue),
        }))}
      />
    </>
  );

  if (compact) {
    return <article className="pd-domain-card">{content}</article>;
  }

  return <section className="pd-production-section">{content}</section>;
}

function TrafficJourneyPanel({
  data,
}: {
  readonly data: TrafficModuleData;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Lejek</p>
          <h2>Mapa ścieżki i jakość zdarzeń</h2>
        </div>
        <span>{formatInteger(data.steps.length)} kroki</span>
      </header>
      <div className="pd-traffic-journey" aria-label="Lejek ruchu i sygnały jakości">
        <div className="pd-traffic-journey__funnel">
          <h3>Lejek konwersji</h3>
          <FunnelPanel steps={data.steps} />
          <TrafficBars records={data.records} />
        </div>
        <aside className="pd-traffic-journey__signals" aria-label="Sygnały jakości ruchu">
          <DiagnosticsPanel diagnostics={data.diagnostics} compact />
          <LandingPages records={data.records} compact />
        </aside>
      </div>
    </section>
  );
}

function TrafficChannelBoard({
  records,
}: {
  readonly records: readonly TrafficRecord[];
}) {
  return (
    <section className="pd-production-section">
      <header>
        <div>
          <p className="pd-production-eyebrow">Kanały</p>
          <h2>Kanały według ruchu, konwersji i przychodu</h2>
        </div>
        <span>{formatInteger(records.length)} kanałów</span>
      </header>
      <DomainRecordList
        items={[...records]
          .sort((a, b) => b.sessions - a.sessions)
          .map((record) => ({
            detail: record.eventQuality === null || record.eventQuality < 0.92 ? 'Jakość do kontroli' : 'Gotowy',
            id: record.dimensionKey,
            meta: `${formatInteger(record.sessions)} sesji · CR ${formatPercent(record.conversionRate)}`,
            title: record.channel,
            tone: record.eventQuality === null || record.eventQuality < 0.92 ? 'warning' : 'success',
            value: formatMoney(record.revenue),
          }))}
      />
    </section>
  );
}

function OrdersMobileRecords({
  records,
}: {
  readonly records: readonly OrdersRecord[];
}) {
  return (
    <ol className="pd-domain-mobile-records" aria-label="Lista zamówień na małym ekranie">
      {records.map((record) => (
        <li key={record.orderId}>
          <header>
            <div>
              <span>{record.source}</span>
              <strong>{record.externalOrderId}</strong>
            </div>
            <StatusBadge status="Zamówienie" text={resolveOrderStatus(record.status)} tone={isProblemOrder(record) ? 'critical' : record.status === 'fulfilled' ? 'success' : 'warning'} />
          </header>
          <dl>
            <div><dt>Wartość</dt><dd>{formatMoney(record.amount)}</dd></div>
            <div><dt>Klient</dt><dd>{record.customerPseudonym ?? 'anonimowy'}</dd></div>
            <div><dt>Data</dt><dd>{formatDateTime(record.orderedAt)}</dd></div>
          </dl>
        </li>
      ))}
    </ol>
  );
}

function ProductsMobileRecords({
  records,
}: {
  readonly records: readonly ProductsRecord[];
}) {
  return (
    <ol className="pd-domain-mobile-records" aria-label="Lista produktów na małym ekranie">
      {records.map((record) => (
        <li key={record.productId}>
          <header>
            <div>
              <span>{record.sku}</span>
              <strong>{record.name}</strong>
            </div>
            <StatusBadge status="Produkt" text={resolveProductStatus(record.status)} tone={record.status === 'missingMapping' ? 'warning' : record.status === 'archived' ? 'neutral' : 'success'} />
          </header>
          <dl>
            <div><dt>Przychód</dt><dd>{formatMoney(record.revenue)}</dd></div>
            <div><dt>Sztuki</dt><dd>{formatInteger(record.units)}</dd></div>
            <div><dt>Marża</dt><dd>{record.margin === null ? 'brak' : formatPercent(record.margin)}</dd></div>
          </dl>
        </li>
      ))}
    </ol>
  );
}

function buildOrdersContext(data: OrdersModuleData) {
  const openQueue = data.records.filter((record) => record.status === 'new' || record.status === 'paid');
  const problemQueue = data.records.filter(isProblemOrder);
  const selected = data.record ?? openQueue[0] ?? data.records[0] ?? null;
  const sources = aggregateOrdersSources(data.records);
  const revenue = sumMoney(data.records.map((record) => record.amount));
  const decisions: readonly DomainDecisionItem[] = [
    {
      detail: 'Opłacone i nowe zamówienia powinny przejść do kolejki fulfillmentu przed kolejną synchronizacją.',
      due: 'dzisiaj 12:00',
      id: 'orders-open',
      impact: `${formatMoney(sumMoney(openQueue.map((record) => record.amount)))} w kolejce`,
      metric: `${formatInteger(openQueue.length)} zamówień`,
      owner: 'Operations',
      priority: openQueue.length > 2 ? 'high' : 'medium',
      status: 'Do obsługi',
      title: 'Przekaż otwarte zamówienia do fulfillmentu',
    },
    {
      detail: 'Zwroty i anulowania trzeba odseparować przed eksportem i rekonsyliacją.',
      due: 'dzisiaj 13:00',
      id: 'orders-problems',
      impact: `${formatInteger(problemQueue.length)} ryzyk`,
      metric: 'status problemowy',
      owner: 'Finanse operacyjne',
      priority: problemQueue.length > 0 ? 'critical' : 'low',
      status: problemQueue.length > 0 ? 'Do sprawdzenia' : 'Pod kontrolą',
      title: 'Zweryfikuj zwroty i anulowania',
    },
    {
      detail: 'Źródła są porównane po wartości i liczbie rekordów, bez dopisywania brakujących zamówień.',
      due: 'jutro 09:00',
      id: 'orders-sources',
      impact: `${formatInteger(sources.length)} źródła`,
      metric: 'porównanie źródeł',
      owner: 'Analityka danych',
      priority: sources.some((source) => source.problems > 0) ? 'medium' : 'low',
      status: 'Do przeglądu',
      title: 'Uzgodnij źródła przed raportem',
    },
  ];

  return {
    decisions,
    openQueue,
    problemQueue,
    revenue,
    selected,
    sources,
  };
}

function buildProductsContext(data: ProductsModuleData) {
  const selected = data.record ?? data.records[0] ?? null;
  const revenue = sumMoney(data.records.map((record) => record.revenue));
  const units = sum(data.records.map((record) => record.units));
  const margins = data.records
    .map((record) => record.margin)
    .filter((value): value is number => value !== null);
  const margin = margins.length > 0
    ? sum(margins) / margins.length
    : null;
  const gaps = data.records.filter((record) => record.status === 'missingMapping' || record.margin === null);
  const decisions: readonly DomainDecisionItem[] = [
    {
      detail: 'Produkty bez mapowania blokują wiarygodne porównanie sprzedaży i kampanii.',
      due: 'dzisiaj 15:00',
      id: 'products-mapping',
      impact: formatMoney(sumMoney(gaps.map((record) => record.revenue))),
      metric: `${formatInteger(gaps.length)} SKU`,
      owner: 'Merchandising',
      priority: gaps.length > 0 ? 'high' : 'low',
      status: gaps.length > 0 ? 'Do uzupełnienia' : 'Pod kontrolą',
      title: 'Uzupełnij mapowanie i marże SKU',
    },
    {
      detail: 'Największe produkty powinny mieć kompletne kategorie, marżę i status ekspozycji.',
      due: 'jutro 10:00',
      id: 'products-performance',
      impact: formatMoney(revenue),
      metric: 'ranking sprzedaży',
      owner: 'Commerce lead',
      priority: 'medium',
      status: 'Do przeglądu',
      title: 'Sprawdź bestsellery przed zmianą ofert',
    },
  ];

  return {
    decisions,
    gaps,
    margin,
    revenue,
    selected,
    units,
  };
}

function buildCustomersContext(data: CustomersModuleData) {
  const selected = data.record ?? data.records[0] ?? null;
  const revenue = sumMoney(data.records.map((record) => record.revenue));
  const ltv = sumMoney(data.records.map((record) => record.ltv ?? { amount: 0, currency: record.revenue.currency }));
  const consentRisks = data.records.filter((record) => record.consentStatus !== 'granted');
  const identityConflicts = data.records.filter((record) => !record.segmentId || !record.cohortKey || record.consentStatus !== 'granted');
  const segments = aggregateCustomerSegments(data.records);
  const bestCohort = [...data.cohorts].sort((a, b) => (b.retentionRate ?? -1) - (a.retentionRate ?? -1))[0] ?? null;
  const weakCohort = [...data.cohorts].sort((a, b) => (a.retentionRate ?? 2) - (b.retentionRate ?? 2))[0] ?? null;
  const decisions: readonly DomainDecisionItem[] = [
    {
      detail: 'Nieznane i cofnięte zgody ograniczają segmentację, komunikację i interpretację LTV.',
      due: 'dzisiaj 16:00',
      id: 'customers-consent',
      impact: `${formatInteger(consentRisks.length)} rekordy`,
      metric: 'status zgody',
      owner: 'Lifecycle',
      priority: consentRisks.length > 0 ? 'high' : 'low',
      status: consentRisks.length > 0 ? 'Do kontroli' : 'Pod kontrolą',
      title: 'Oddziel klientów z ryzykiem zgody',
    },
    {
      detail: 'Rekordy bez segmentu lub kohorty nie powinny sterować rekomendacją bez ręcznego przeglądu.',
      due: 'jutro 11:00',
      id: 'customers-identity',
      impact: `${formatInteger(identityConflicts.length)} rekordy`,
      metric: 'tożsamość i kohorta',
      owner: 'Analityka CRM',
      priority: identityConflicts.length > 0 ? 'medium' : 'low',
      status: 'Do przeglądu',
      title: 'Zweryfikuj konflikty tożsamości',
    },
  ];

  return {
    bestCohort,
    consentRisks,
    decisions,
    identityConflicts,
    ltv,
    revenue,
    segments,
    selected,
    weakCohort,
  };
}

function buildTrafficContext(data: TrafficModuleData) {
  const sessions = sum(data.records.map((record) => record.sessions));
  const users = sum(data.records.map((record) => record.users));
  const conversions = sum(data.records.map((record) => record.conversions));
  const revenue = sumMoney(data.records.map((record) => record.revenue));
  const qualityValues = data.records
    .map((record) => record.eventQuality)
    .filter((value): value is number => value !== null);
  const eventQuality = qualityValues.length > 0
    ? sum(qualityValues) / qualityValues.length
    : null;
  const conversionRate = sessions > 0 ? conversions / sessions : 0;
  const lowQualityRecords = data.records.filter((record) => record.eventQuality === null || record.eventQuality < 0.92);
  const weakStep = [...data.steps].sort((a, b) => a.conversionRate - b.conversionRate)[0] ?? null;
  const decisions: readonly DomainDecisionItem[] = [
    {
      detail: 'Kanały z niższą jakością zdarzeń nie powinny sterować decyzją sprzedażową bez oznaczenia ograniczeń.',
      due: 'dzisiaj 14:00',
      id: 'traffic-quality',
      impact: `${formatInteger(lowQualityRecords.length)} kanały`,
      metric: 'jakość zdarzeń',
      owner: 'Analityka danych',
      priority: lowQualityRecords.length > 0 ? 'high' : 'low',
      status: lowQualityRecords.length > 0 ? 'Do sprawdzenia' : 'Pod kontrolą',
      title: 'Oceń jakość zdarzeń przed interpretacją',
    },
    {
      detail: weakStep ? `${weakStep.label} ma najniższą konwersję w bieżącym lejku.` : 'Brak kroków lejka w kontrakcie.',
      due: 'jutro 10:00',
      id: 'traffic-funnel',
      impact: weakStep ? formatPercent(weakStep.conversionRate) : 'brak',
      metric: 'najsłabszy krok',
      owner: 'Growth',
      priority: weakStep && weakStep.conversionRate < 0.2 ? 'medium' : 'low',
      status: 'Do przeglądu',
      title: 'Sprawdź odpływ w lejku',
    },
  ];

  return {
    conversionRate,
    conversions,
    decisions,
    eventQuality,
    lowQualityRecords,
    revenue,
    sessions,
    users,
    weakStep,
  };
}

function buildAnalyticsNavigation(
  group: AnalyticsScreenDefinition['group'],
  labels: Partial<Record<AnalyticsScreenDefinition['id'], string>>,
) {
  return analyticsScreenDefinitions
    .filter((definition) => definition.group === group)
    .map((definition) => ({
      href: definition.routeBase,
      id: definition.id,
      label: labels[definition.id] ?? definition.displayTitle,
    }));
}

function resolveDomainSummaryLabel(summary: DomainSummary): string {
  if (summary.critical > 0) return 'Krytyczny';
  if (summary.warning > 0) return 'Częściowy';
  return 'Gotowy';
}

function resolveDomainSummaryTone(summary: DomainSummary): StatusBadgeTone {
  if (summary.critical > 0) return 'critical';
  if (summary.warning > 0) return 'warning';
  return 'success';
}

function resolveDomainPriorityLabel(priority: DomainDecisionItem['priority']): string {
  switch (priority) {
    case 'critical':
      return 'Krytyczne';
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
    default:
      return 'Niskie';
  }
}

function resolveDomainPriorityTone(priority: DomainDecisionItem['priority']): StatusBadgeTone {
  switch (priority) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
    default:
      return 'success';
  }
}

function resolveProcessStatusLabel(status: string): string {
  switch (status) {
    case 'ready':
    case 'connected':
    case 'active':
    case 'done':
      return 'Gotowe';
    case 'blocked':
    case 'failed':
    case 'high':
      return 'Zablokowane';
    case 'partial':
    case 'queued':
    case 'syncing':
    case 'warning':
      return 'Częściowe';
    default:
      return 'W trakcie';
  }
}

function resolveProcessStatusTone(status: string): StatusBadgeTone {
  switch (status) {
    case 'ready':
    case 'connected':
    case 'active':
    case 'done':
      return 'success';
    case 'blocked':
    case 'failed':
    case 'high':
      return 'critical';
    case 'partial':
    case 'queued':
    case 'syncing':
    case 'warning':
      return 'warning';
    default:
      return 'neutral';
  }
}

function isProblemOrder(record: OrdersRecord): boolean {
  return record.status === 'cancelled' || record.status === 'refunded';
}

function aggregateOrdersSources(records: readonly OrdersRecord[]) {
  const groups = new Map<string, OrdersRecord[]>();
  records.forEach((record) => {
    groups.set(record.source, [...(groups.get(record.source) ?? []), record]);
  });

  return [...groups.entries()].map(([id, rows]) => ({
    amount: sumMoney(rows.map((record) => record.amount)),
    count: rows.length,
    id,
    problems: rows.filter(isProblemOrder).length,
  }));
}

function aggregateProductsCategories(records: readonly ProductsRecord[]) {
  const groups = new Map<string, ProductsRecord[]>();
  records.forEach((record) => {
    const key = record.category ?? 'Brak kategorii';
    groups.set(key, [...(groups.get(key) ?? []), record]);
  });

  return [...groups.entries()].map(([id, rows]) => ({
    count: rows.length,
    gaps: rows.filter((record) => record.status === 'missingMapping' || record.margin === null).length,
    id,
    revenue: sumMoney(rows.map((record) => record.revenue)),
    units: sum(rows.map((record) => record.units)),
  }));
}

function aggregateCustomerSegments(records: readonly CustomersRecord[]) {
  const groups = new Map<string, CustomersRecord[]>();
  records.forEach((record) => {
    const key = shortSegmentId(record.segmentId);
    groups.set(key, [...(groups.get(key) ?? []), record]);
  });

  return [...groups.entries()].map(([id, rows]) => ({
    consentRisks: rows.filter((record) => record.consentStatus !== 'granted').length,
    count: rows.length,
    id,
    label: id,
    ltv: sumMoney(rows.map((record) => record.ltv ?? { amount: 0, currency: record.revenue.currency })),
    orders: sum(rows.map((record) => record.ordersCount)),
    revenue: sumMoney(rows.map((record) => record.revenue)),
  }));
}

function resolveConsentLabel(status: CustomersRecord['consentStatus']): string {
  switch (status) {
    case 'granted':
      return 'Udzielona';
    case 'withdrawn':
      return 'Cofnięta';
    case 'unknown':
    default:
      return 'Nieznana';
  }
}

function shortSegmentId(segmentId: string | null): string {
  if (!segmentId) return 'Brak segmentu';
  return `Segment ${segmentId.slice(-4)}`;
}

function KpiStrip({
  items,
}: {
  readonly items: readonly (readonly [string, string])[];
}) {
  return (
    <dl className="pd-production-kpis">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DomainTable({
  ariaLabel,
  columns,
  rows,
  summary,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly rows: readonly DataRow[];
  readonly summary: string;
}) {
  return (
    <div className="pd-production-table">
      <DataTable
        ariaLabel={ariaLabel}
        columns={columns}
        emptyMessage="Fixture nie zwrócił rekordów dla bieżącego widoku."
        emptyTitle="Brak danych"
        loading={false}
        minWidth={760}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={null}
        summary={summary}
      />
    </div>
  );
}

function RecommendationsPanel({
  compact = false,
  recommendations,
}: {
  readonly compact?: boolean;
  readonly recommendations: readonly RecommendationView[];
}) {
  const content = (
    <>
      <header>
        <h3>Rekomendacje</h3>
        <p>Propozycje są tylko do odczytu i wymagają osobnej akceptacji przed wykonaniem.</p>
      </header>
      <ol className="pd-production-list">
        {recommendations.slice(0, 4).map((item) => (
          <li key={item.recommendationId}>
            <strong>{item.title}</strong>
            <span>{item.rationale}</span>
            <small>Wpływ {impactLabel(item.impact)} · pewność {formatPercent(item.confidence)}</small>
          </li>
        ))}
      </ol>
    </>
  );

  if (compact) {
    return <div className="pd-campaign-board__pacing">{content}</div>;
  }

  return (
    <section className="pd-production-section">
      {content}
    </section>
  );
}

function DiagnosticsPanel({
  compact = false,
  diagnostics,
}: {
  readonly compact?: boolean;
  readonly diagnostics: readonly DiagnosticFinding[];
}) {
  const content = (
    <>
      <header>
        <h3>Diagnostyka</h3>
        <p>Problemy trackingowe i źródłowe są widoczne bez ukrywania ograniczeń danych.</p>
      </header>
      {diagnostics.length > 0 ? (
        <ol className="pd-production-list">
          {diagnostics.slice(0, 4).map((item) => (
            <li key={item.findingId}>
              <strong>{item.code}</strong>
              <span>{item.message}</span>
              <small>{item.severity}{item.sourceRef ? ` · ${item.sourceRef}` : ''}</small>
            </li>
          ))}
        </ol>
      ) : (
        <InlineNotice message="Brak findingów diagnostycznych w fixture." title="Diagnostyka czysta" tone="success" />
      )}
    </>
  );

  if (compact) {
    return <div className="pd-campaign-board__pacing">{content}</div>;
  }

  return (
    <section className="pd-production-section">
      {content}
    </section>
  );
}

function CampaignPacingBoard({
  records,
}: {
  readonly records: readonly CampaignsRecord[];
}) {
  return (
    <div className="pd-campaign-board__lane" aria-label="Wykorzystanie budżetu kampanii">
      <h3>Wykorzystanie według kanału</h3>
      {records.map((record) => {
        const pacing = record.spend.amount / Math.max(record.budget.amount, 1);
        return (
          <div className="pd-campaign-board__pacing" key={record.campaignId}>
            <div className="pd-production-row">
              <strong>{record.name}</strong>
              <StatusBadge
                status="Kampania"
                text={resolveCampaignStatus(record.status)}
                tone={record.status === 'active' ? 'success' : record.status === 'paused' ? 'warning' : 'neutral'}
              />
            </div>
            <span>{campaignChannelLabel(record.channel)} · koszt {formatMoney(record.spend)} · ROAS {record.roas === null ? 'brak' : formatNumber(record.roas)}</span>
            <span className="pd-campaign-board__track" aria-hidden="true">
              <span className="pd-campaign-board__fill" style={{ inlineSize: `${Math.min(Math.max(pacing * 100, 4), 100)}%` }} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OrderStatusBars({
  records,
}: {
  readonly records: readonly OrdersRecord[];
}) {
  const groups = ['new', 'paid', 'fulfilled', 'cancelled', 'refunded'] as const;
  const max = Math.max(...groups.map((status) => records.filter((record) => record.status === status).length), 1);

  return (
    <div className="pd-production-bars" aria-label="Statusy zamówień">
      {groups.map((status) => {
        const count = records.filter((record) => record.status === status).length;
        return (
          <div className="pd-production-bar" key={status}>
            <strong>{resolveOrderStatus(status)}</strong>
            <span className="pd-production-bar__track" aria-hidden="true">
              <span className="pd-production-bar__fill" style={{ inlineSize: `${Math.max((count / max) * 100, 4)}%` }} />
            </span>
            <span>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function OrderDetailPanel({
  bare = false,
  record,
}: {
  readonly bare?: boolean;
  readonly record: OrdersRecord | null;
}) {
  if (!record) {
    return <InlineNotice message="Brak wybranego zamówienia w fixture." title="Brak szczegółu" tone="info" />;
  }

  const content = (
    <>
      <header>
        <h3>Szczegół zamówienia</h3>
        <p>{record.externalOrderId} · {resolveOrderStatus(record.status)}</p>
      </header>
      <ol className="pd-production-list">
        <li><strong>Płatność</strong><span>{record.status === 'new' ? 'oczekuje' : 'potwierdzona'} · {formatMoney(record.amount)}</span></li>
        <li><strong>Realizacja</strong><span>{record.status === 'fulfilled' ? 'zrealizowane' : 'w kolejce'}</span></li>
        <li><strong>Wysyłka</strong><span>{record.status === 'cancelled' ? 'zablokowana' : 'gotowa do obsługi'}</span></li>
        <li><strong>Źródło danych</strong><span>{record.source} · {record.customerPseudonym ?? 'klient zanonimizowany'}</span></li>
      </ol>
    </>
  );

  if (bare) {
    return <div className="pd-order-column__header">{content}</div>;
  }

  return (
    <section className="pd-production-section">
      {content}
    </section>
  );
}

function OrderDispatchColumn({
  records,
  title,
}: {
  readonly records: readonly OrdersRecord[];
  readonly title: string;
}) {
  return (
    <div className="pd-order-column">
      <div className="pd-order-column__header">
        <h3>{title}</h3>
        <p>Zadania do obsługi przed fulfillmentem.</p>
      </div>
      {records.slice(0, 5).map((record) => (
        <div className="pd-order-ticket" key={record.orderId}>
          <strong>{record.externalOrderId}</strong>
          <span>{record.source} · {record.customerPseudonym ?? 'anon'} · {formatMoney(record.amount)}</span>
          <StatusBadge
            status="Zamówienie"
            text={resolveOrderStatus(record.status)}
            tone={record.status === 'paid' ? 'success' : 'warning'}
          />
        </div>
      ))}
    </div>
  );
}

function ProductDetailPanel({
  record,
}: {
  readonly record: ProductsRecord | null;
}) {
  if (!record) {
    return <InlineNotice message="Brak produktu do analizy." title="Brak produktu" tone="info" />;
  }

  return (
    <section className="pd-production-section">
      <header>
        <h2>Drill-down produktu</h2>
        <p>{record.sku} · {record.category ?? 'bez kategorii'}</p>
      </header>
      <ol className="pd-production-list">
        <li><strong>Przychód</strong><span>{formatMoney(record.revenue)}</span></li>
        <li><strong>Sprzedane sztuki</strong><span>{formatInteger(record.units)}</span></li>
        <li><strong>Marża</strong><span>{record.margin === null ? 'brak danych' : formatPercent(record.margin)}</span></li>
        <li><strong>Ryzyko dostępności</strong><span>{resolveProductRisk(record)}</span></li>
      </ol>
    </section>
  );
}

function RiskList({
  items,
  title,
}: {
  readonly items: readonly { readonly detail: string; readonly title: string }[];
  readonly title: string;
}) {
  return (
    <section className="pd-production-section">
      <header>
        <h2>{title}</h2>
        <p>Elementy wymagające merchandisingowego przeglądu.</p>
      </header>
      {items.length > 0 ? (
        <ol className="pd-production-list">
          {items.map((item) => (
            <li key={`${item.title}-${item.detail}`}>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </li>
          ))}
        </ol>
      ) : (
        <InlineNotice message="Brak braków katalogowych w bieżącym fixture." title="Kolejka czysta" tone="success" />
      )}
    </section>
  );
}

function CohortHeatmap({
  cohorts,
}: {
  readonly cohorts: readonly CohortView[];
}) {
  return (
    <div className="pd-production-heatmap" role="table" aria-label="Heatmapa retencji kohort">
      <div className="pd-production-heatmap__row" role="row">
        {['Kohorta', 'M0', 'M1', 'M2', 'M3'].map((label) => (
          <span key={label} role="columnheader">{label}</span>
        ))}
      </div>
      {cohorts.map((cohort) => {
        const base = cohort.retentionRate ?? 0;
        const values = [1, base, base * 0.78, base * 0.62];
        return (
          <div className="pd-production-heatmap__row" key={cohort.cohortKey} role="row">
            <span role="rowheader">{cohort.cohortKey} · {cohort.users} users</span>
            {values.map((value, index) => (
              <span data-strength={resolveStrength(value)} key={`${cohort.cohortKey}-${index}`} role="cell">
                {formatPercent(value)}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function SegmentComparison({
  compact = false,
  records,
}: {
  readonly compact?: boolean;
  readonly records: readonly CustomersRecord[];
}) {
  const segments = new Map<string, CustomersRecord[]>();
  records.forEach((record) => {
    const key = record.segmentId ?? 'brak segmentu';
    segments.set(key, [...(segments.get(key) ?? []), record]);
  });

  const content = (
    <>
      <header>
        <h3>Segmenty</h3>
        <p>Wielkość, wartość, powtarzalność zakupów i status zgody.</p>
      </header>
      <div>
        {[...segments.entries()].map(([segment, rows]) => (
          <div className="pd-customer-segment" key={segment}>
            <strong>{segment}</strong>
            <span>{rows.length} klientów · przychód {formatMoney(sumMoney(rows.map((row) => row.revenue)))}</span>
            <small>Średnio {formatNumber(sum(rows.map((row) => row.ordersCount)) / Math.max(rows.length, 1))} zamówień</small>
          </div>
        ))}
      </div>
    </>
  );

  if (compact) {
    return <div className="pd-campaign-board__pacing">{content}</div>;
  }

  return (
    <section className="pd-production-section">
      {content}
    </section>
  );
}

function FunnelPanel({
  steps,
}: {
  readonly steps: readonly FunnelStepView[];
}) {
  const max = Math.max(...steps.map((step) => step.entrants), 1);
  return (
    <div aria-label="Lejek konwersji">
      {steps.map((step) => (
        <div className="pd-traffic-step" key={step.stepId}>
          <strong>{step.label}</strong>
          <span className="pd-production-bar__track pd-traffic-step__drop" aria-hidden="true">
            <span className="pd-production-bar__fill" style={{ inlineSize: `${Math.max((step.entrants / max) * 100, 4)}%` }} />
          </span>
          <span>{formatPercent(step.conversionRate)}</span>
        </div>
      ))}
    </div>
  );
}

function TrafficBars({
  records,
}: {
  readonly records: readonly TrafficRecord[];
}) {
  const max = Math.max(...records.map((record) => record.sessions), 1);
  return (
    <div className="pd-production-bars" aria-label="Kanały ruchu">
      {records.map((record) => (
        <div className="pd-production-bar" key={record.dimensionKey}>
          <strong>{record.channel}</strong>
          <span className="pd-production-bar__track" aria-hidden="true">
            <span className="pd-production-bar__fill" style={{ inlineSize: `${Math.max((record.sessions / max) * 100, 4)}%` }} />
          </span>
          <span>{formatInteger(record.sessions)} sesji · CVR {formatPercent(record.conversionRate)}</span>
        </div>
      ))}
    </div>
  );
}

function LandingPages({
  compact = false,
  records,
}: {
  readonly compact?: boolean;
  readonly records: readonly TrafficRecord[];
}) {
  const content = (
    <>
      <header>
        <h3>Strony wejścia</h3>
        <p>Strony wejścia z przychodem i jakością zdarzeń.</p>
      </header>
      <ol className="pd-production-list">
        {records.filter((record) => record.landingPage).slice(0, 4).map((record) => (
          <li key={record.dimensionKey}>
            <strong>{record.landingPage}</strong>
            <span>{record.channel} · {formatMoney(record.revenue)}</span>
            <small>Jakość zdarzeń {record.eventQuality === null ? 'brak' : formatPercent(record.eventQuality)}</small>
          </li>
        ))}
      </ol>
    </>
  );

  if (compact) {
    return <div className="pd-campaign-board__pacing">{content}</div>;
  }

  return (
    <section className="pd-production-section">
      {content}
    </section>
  );
}

function campaignRows(records: readonly CampaignsRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    budgetPacing: formatPercent(record.spend.amount / Math.max(record.budget.amount, 1)),
    channel: campaignChannelLabel(record.channel),
    id: record.campaignId,
    name: record.name,
    roas: record.roas === null ? 'brak' : formatNumber(record.roas),
    spend: formatMoney(record.spend),
    statusLabel: resolveCampaignStatus(record.status),
  }));
}

function orderRows(records: readonly OrdersRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    amount: formatMoney(record.amount),
    customerPseudonym: record.customerPseudonym ?? 'anon',
    externalOrderId: record.externalOrderId,
    id: record.orderId,
    risk: record.status === 'cancelled' || record.status === 'refunded' ? 'problem' : 'ok',
    source: record.source,
    statusLabel: resolveOrderStatus(record.status),
  }));
}

function productRows(records: readonly ProductsRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    id: record.productId,
    margin: record.margin === null ? 'brak' : formatPercent(record.margin),
    name: record.name,
    revenue: formatMoney(record.revenue),
    sku: record.sku,
    statusLabel: resolveProductStatus(record.status),
    stockRisk: resolveProductRisk(record),
    units: formatInteger(record.units),
  }));
}

function customerRows(records: readonly CustomersRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    cohortKey: record.cohortKey ?? 'brak',
    consentStatus: record.consentStatus,
    customerPseudonym: record.customerPseudonym,
    id: record.customerPseudonym,
    ordersCount: record.ordersCount,
    revenue: formatMoney(record.revenue),
    segment: record.segmentId ?? 'brak',
  }));
}

function trafficRows(records: readonly TrafficRecord[]): readonly DataRow[] {
  return records.map((record) => ({
    channel: record.channel,
    conversionRate: formatPercent(record.conversionRate),
    eventQuality: record.eventQuality === null ? 'brak' : formatPercent(record.eventQuality),
    id: record.dimensionKey,
    revenue: formatMoney(record.revenue),
    sessions: formatInteger(record.sessions),
    users: formatInteger(record.users),
  }));
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function sumMoney(values: readonly Money[]): Money {
  const first = values[0];
  return {
    amount: values.reduce((total, value) => total + value.amount, 0),
    currency: first?.currency ?? 'PLN',
  };
}

function formatMoney(value: Money): string {
  return new Intl.NumberFormat('pl-PL', {
    currency: value.currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value.amount);
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: 0,
    style: 'percent',
  }).format(value);
}

function resolveCampaignStatus(status: CampaignsRecord['status']): string {
  switch (status) {
    case 'active':
      return 'Aktywna';
    case 'paused':
      return 'Wstrzymana';
    case 'ended':
      return 'Zakończona';
    case 'draft':
    default:
      return 'Szkic';
  }
}

function resolveOrderStatus(status: OrdersRecord['status']): string {
  switch (status) {
    case 'paid':
      return 'Opłacone';
    case 'fulfilled':
      return 'Zrealizowane';
    case 'cancelled':
      return 'Anulowane';
    case 'refunded':
      return 'Zwrot';
    case 'new':
    default:
      return 'Nowe';
  }
}

function resolveProductStatus(status: ProductsRecord['status']): string {
  switch (status) {
    case 'active':
      return 'Aktywny';
    case 'inactive':
      return 'Nieaktywny';
    case 'missingMapping':
      return 'Brak mapowania';
    case 'archived':
    default:
      return 'Archiwum';
  }
}

function resolveProductRisk(record: ProductsRecord): string {
  if (record.status === 'missingMapping') return 'mapowanie';
  if (record.margin === null || record.margin < 0.18) return 'marża';
  if (record.units > 150) return 'dostępność';
  return 'niski';
}

function resolveStrength(value: number): 'high' | 'medium' | 'low' {
  if (value >= 0.62) return 'high';
  if (value >= 0.38) return 'medium';
  return 'low';
}
