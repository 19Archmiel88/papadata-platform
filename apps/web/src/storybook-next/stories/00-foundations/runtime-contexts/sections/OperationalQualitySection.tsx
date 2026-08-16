import { StoryPresentationSection } from '../../../../presentation/StoryPresentation';
import {
  AttributionComparison,
  BudgetPacing,
  CohortMatrix,
  CustomerSegments,
  FunnelChart,
  FunnelStep,
  LineageGraph,
  PairingFlow,
  PlanPerformance,
  ReconciliationPanel,
  ResultDrivers,
  SalesFunnel,
  SalesSources,
  SyncTimeline,
  WaterfallChart,
} from '../../../../../design-system/components';
import { RuntimeSequence } from '../RuntimeSequence';
import { evidence, workspaceContext } from '../runtime-context-data';
import type { PushEvidence } from '../runtime-context-types';

export function OperationalQualitySection({
  pushEvidence,
}: {
  readonly pushEvidence: PushEvidence;
}) {


  return (
    <StoryPresentationSection
            index="04"
            layout="full"
            summary="Komponenty domenowe dla jakości danych, sprzedaży, planu i integracji działają jako część jednego przebiegu analitycznego."
            title="Przebieg operacyjny i jakość danych"
          >
            <div className="pd-c83-flow">
              <RuntimeSequence
                evidenceLabel="PlanPerformance, ResultDrivers, SalesSources, FunnelStep, FunnelChart, WaterfallChart, BudgetPacing, AttributionComparison, ReconciliationPanel, SyncTimeline, LineageGraph, CohortMatrix, CustomerSegments, SalesFunnel i PairingFlow mają realny kontekst pracy."
                title="Analiza operacyjna"
              >
                <div className="pd-c83-domain-flow">
                  <PlanPerformance
                    actualSeries={{ id: 'actual', label: 'Wynik', points: [{ x: 'Pn', y: 82 }, { x: 'Wt', y: 88 }, { x: 'Śr', y: 91 }], unit: 'tys. zł' }}
                    context={workspaceContext}
                    forecastSeries={{ id: 'forecast', label: 'Prognoza', points: [{ x: 'Cz', y: 95 }, { x: 'Pt', y: 101 }], unit: 'tys. zł' }}
                    gapToTarget={0.08}
                    pace="ahead"
                    planSeries={{ id: 'plan', label: 'Plan', points: [{ x: 'Pn', y: 78 }, { x: 'Wt', y: 82 }, { x: 'Śr', y: 86 }], unit: 'tys. zł' }}
                  />
                  <ResultDrivers
                    baselineValue={120000}
                    context={workspaceContext}
                    currentValue={142000}
                    drivers={[
                      { contribution: 0.42, direction: 'positive', evidence, id: 'paid', label: 'Paid search' },
                      { contribution: -0.12, direction: 'negative', evidence, id: 'margin', label: 'Marża logistyczna' },
                    ]}
                    onInspectDriver={(event) => pushEvidence(`ResultDrivers otworzył driver: ${event.driverId}.`)}
                  />
                  <SalesSources
                    compareToPrevious
                    context={workspaceContext}
                    sources={[
                      { channel: 'Paid search', id: 'paid', margin: 0.22, orders: 128, readiness: 'ready', revenue: 520000 },
                      { channel: 'Organic', id: 'organic', margin: 0.29, orders: 74, readiness: 'partial', revenue: 310000 },
                    ]}
                    onOpenSource={(event) => pushEvidence(`SalesSources otworzył źródło: ${event.sourceId}.`)}
                  />
                  <FunnelStep
                    context={workspaceContext}
                    conversionRate={0.18}
                    conversions={820}
                    label="Produkt dodany do koszyka"
                    nextStepId="checkout"
                    previousStepId="product-view"
                    stepId="add-to-cart"
                    visitors={4550}
                    onInspect={(event) => pushEvidence(`FunnelStep otworzył krok: ${event.stepId}.`)}
                  />
                  <FunnelChart
                    orientation="vertical"
                    showDropoff
                    steps={[
                      { conversionRate: 0.42, id: 'view', label: 'Widok produktu', value: 10000 },
                      { conversionRate: 0.18, id: 'cart', label: 'Koszyk', value: 4200 },
                      { conversionRate: 0.09, id: 'checkout', label: 'Zakup', value: 1800 },
                    ]}
                  />
                  <SalesFunnel
                    context={workspaceContext}
                    steps={[
                      { conversionRate: 0.42, dropoffRate: 0.58, id: 'view', label: 'Widok produktu', visitors: 10000 },
                      { conversionRate: 0.18, dropoffRate: 0.24, id: 'cart', label: 'Koszyk', visitors: 4200 },
                      { conversionRate: 0.09, dropoffRate: 0.11, id: 'checkout', label: 'Zakup', visitors: 1800 },
                    ]}
                    onOpenStep={(event) => pushEvidence(`SalesFunnel otworzył krok: ${event.stepId}.`)}
                  />
                  <WaterfallChart
                    items={[
                      { id: 'start', kind: 'start', label: 'Plan', value: 120000 },
                      { id: 'paid', kind: 'increase', label: 'Paid', value: 22000 },
                      { id: 'returns', kind: 'decrease', label: 'Zwroty', value: -8000 },
                      { id: 'total', kind: 'total', label: 'Wynik', value: 134000 },
                    ]}
                    showCumulative
                    unit="zł"
                  />
                  <BudgetPacing
                    actualSpend={92000}
                    campaignId="campaign-148"
                    context={workspaceContext}
                    evidence={evidence}
                    forecastSpend={118000}
                    plannedSpend={120000}
                    recommendation="Utrzymać budżet i przesunąć alokację na search."
                    status="onPace"
                    onCreateDecision={(event) => pushEvidence(`BudgetPacing utworzył decyzję dla: ${event.campaignId}.`)}
                  />
                  <AttributionComparison
                    context={workspaceContext}
                    models={[
                      { confidence: 0.81, id: 'last-click', label: 'Last click', revenue: 430000, roas: 3.4 },
                      { confidence: 0.88, id: 'data-driven', label: 'Data driven', revenue: 510000, roas: 4.1 },
                    ]}
                    selectedModelId="data-driven"
                    onSelectModel={(event) => pushEvidence(`AttributionComparison wybrał model: ${event.modelId}.`)}
                  />
                  <ReconciliationPanel
                    conflicts={[
                      { entityType: 'order', id: 'conflict-1', proposedResolution: 'Utrzymać Shopify jako źródło prawdy', sourceA: 'Shopify nr 148', sourceB: 'GA4 transaction 148' },
                    ]}
                    context={workspaceContext}
                    onResolveConflict={(event) => pushEvidence(`ReconciliationPanel rozwiązał konflikt: ${event.conflictId}.`)}
                  />
                  <SyncTimeline
                    context={workspaceContext}
                    runs={[
                      { endedAt: '2026-08-16T01:45:00+01:00', id: 'sync-1', provider: 'shopify', recordsProcessed: 1480, startedAt: '2026-08-16T01:30:00+01:00', status: 'completed' },
                      { errorCode: 'META_DELAYED', id: 'sync-2', provider: 'meta', recordsProcessed: 620, startedAt: '2026-08-16T01:35:00+01:00', status: 'partial' },
                    ]}
                    onOpenRun={(event) => pushEvidence(`SyncTimeline otworzył run: ${event.runId}.`)}
                  />
                  <LineageGraph
                    context={workspaceContext}
                    edges={[
                      { from: 'shopify', reason: 'normalizacja', to: 'orders-mart' },
                      { from: 'orders-mart', reason: 'metryka', to: 'roas' },
                    ]}
                    nodes={[
                      { id: 'shopify', label: 'Shopify Orders', status: 'ready', type: 'source' },
                      { id: 'orders-mart', label: 'mart_orders', status: 'partial', type: 'transform' },
                      { id: 'roas', label: 'ROAS', status: 'partial', type: 'metric' },
                    ]}
                    rootRecordId="metric-roas"
                    onOpenNode={(event) => pushEvidence(`LineageGraph otworzył węzeł: ${event.nodeId}.`)}
                  />
                  <CohortMatrix
                    cohortMetric="retention"
                    columns={['D0', 'D7', 'D30']}
                    context={workspaceContext}
                    rows={[
                      { cohortId: '2026-07', label: 'Lipiec', values: [0.62, 0.38, 0.22] },
                      { cohortId: '2026-08', label: 'Sierpień', values: [0.68, 0.41, null] },
                    ]}
                    selectedCohortId="2026-08"
                    onSelectCohort={(event) => pushEvidence(`CohortMatrix wybrał kohortę: ${event.cohortId}.`)}
                  />
                  <CustomerSegments
                    context={workspaceContext}
                    segments={[
                      { churnRisk: 0.12, customers: 820, id: 'vip', label: 'VIP', ltv: 1200, revenue: 410000 },
                      { churnRisk: 0.24, customers: 2400, id: 'new', label: 'Nowi', ltv: 320, revenue: 290000 },
                    ]}
                    selectedSegmentId="vip"
                    onSelectSegment={(event) => pushEvidence(`CustomerSegments wybrał segment: ${event.segmentId}.`)}
                  />
                  <PairingFlow
                    context={workspaceContext}
                    deviceStatus="pending"
                    provider="shopify"
                    sessionId="pairing-148"
                    steps={[
                      { id: 'start', label: 'Rozpoczęcie', status: 'verified' },
                      { challengeCode: 'PAPA-482', expiresAt: '2026-08-16T02:45:00+01:00', id: 'challenge', label: 'Potwierdzenie kodu', status: 'active' },
                      { id: 'verify', label: 'Weryfikacja', status: 'waitingForProvider' },
                    ]}
                    onConfirm={(event) => pushEvidence(`PairingFlow potwierdził kod: ${event.challengeCode}.`)}
                    onStart={(event) => pushEvidence(`PairingFlow rozpoczął parowanie: ${event.provider}.`)}
                  />
                </div>
              </RuntimeSequence>
            </div>
          </StoryPresentationSection>
  );
}
