import { useState } from 'react';

import { StoryPresentationSection } from '../../../../presentation/StoryPresentation';
import {
  ApprovalPanel,
  AssistantComposer,
  ChartDataState,
  ChartFrame,
  ChartInteractionLayer,
  ComparisonChart,
  CorrelationChart,
  DecisionCard,
  DecisionQueue,
  DetailPanel,
  EvidencePanel,
  ForecastChart,
  InlineNotice,
  MetricCard,
  MorningBrief,
  Panel,
  RecommendationCard,
  ShareChart,
  TextAction,
  TrendChart,
} from '../../../../../design-system/components';
import { RuntimeSequence } from '../RuntimeSequence';
import {
  chartPoints,
  comparisonData,
  comparisonSeries,
  correlationPoints,
  dataSources,
  evidence,
  forecast,
  forecastActual,
  lowerBound,
  shareSegments,
  trendData,
  upperBound,
  workspaceContext,
} from '../runtime-context-data';
import type { PushEvidence } from '../runtime-context-types';

export function AnalyticsAndDecisionsSection({
  pushEvidence,
}: {
  readonly pushEvidence: PushEvidence;
}) {
  const [chartFilter, setChartFilter] = useState('paid');
  const [chartPoint, setChartPoint] = useState('paid-search');

  return (
    <StoryPresentationSection
            index="03"
            layout="full"
            summary="Wizualizacje są osadzone w pytaniu biznesowym i mają stan danych, interakcję oraz dowód źródłowy."
            title="Analityka, wykresy i decyzje"
          >
            <div className="pd-c83-flow">
              <RuntimeSequence
                evidenceLabel="ChartFrame, MetricCard, TrendChart, ComparisonChart, CorrelationChart, ForecastChart, ShareChart, ChartDataState i ChartInteractionLayer pracują razem."
                title="Ramka wykresu i interakcje analityczne"
              >
                <div className="pd-c83-metrics">
                  <MetricCard
                    comparison={{ direction: 'up', label: '+12% vs poprzedni okres' }}
                    label="ROAS"
                    metricId="roas"
                    signal="positive"
                    sparklinePoints={[3.1, 3.4, 3.2, 3.8, 4.1]}
                    status="ready"
                    statusLabel="Aktualne"
                    targetLabel="Cel 3.6"
                    unit="x"
                    value="4.1"
                  />
                  <MetricCard
                    comparison={{ direction: 'down', label: '-4% vs plan' }}
                    emphasis="alert"
                    label="Marża netto"
                    metricId="margin"
                    signal="warning"
                    sparklinePoints={[18, 17, 16, 16, 15]}
                    status="partial"
                    statusLabel="Częściowe"
                    unit="%"
                    value="15%"
                  />
                </div>
                <ChartFrame
                  actions={<TextAction onClick={() => pushEvidence('ChartFrame przekazał pytanie do Papa Asystenta.')}>Zapytaj AI</TextAction>}
                  annotation={<InlineNotice message="Kanał paid search wyjaśnia największą część zmiany." title="Wniosek" tone="info" />}
                  businessQuestion="Czy wzrost przychodu wynika z lepszej konwersji czy z budżetu?"
                  description="Wykres pokazuje wynik, plan i średnią kroczącą w aktualnym zakresie."
                  freshnessLabel="15 min"
                  rangeLabel="1–16 sierpnia"
                  sourceLabel="Warehouse"
                  status="ready"
                  statusLabel="Dane aktualne"
                  summary="Trend pokazuje wzrost po korekcie budżetu i stabilny udział kampanii retargetingowej."
                  title="Przychód według kanału"
                  visualization={(
                    <TrendChart
                      ariaLabel="Trend przychodu"
                      data={trendData}
                      unit="tys. zł"
                      variant="area"
                    />
                  )}
                  visualizationLabel="Trend przychodu"
                />
                <ChartInteractionLayer
                  activeFilterId={chartFilter}
                  dateRangeLabel="1–16 sierpnia"
                  filters={[
                    { description: 'Ruch płatny', id: 'paid', label: 'Paid' },
                    { description: 'Ruch organiczny', id: 'organic', label: 'Organic' },
                    { description: 'Email i CRM', id: 'email', label: 'Email' },
                  ]}
                  points={chartPoints}
                  selectedPointId={chartPoint}
                  title="Interakcja z wykresem"
                  onDrillDown={(point) => pushEvidence(`ChartInteractionLayer wykonał drill-down: ${point.id}.`)}
                  onFilterChange={(filterId) => {
                    setChartFilter(filterId);
                    pushEvidence(`ChartInteractionLayer zmienił filtr: ${filterId}.`);
                  }}
                  onPointSelect={(pointId) => {
                    setChartPoint(pointId);
                    pushEvidence(`ChartInteractionLayer wybrał punkt: ${pointId}.`);
                  }}
                  onReset={() => {
                    setChartFilter('paid');
                    setChartPoint('paid-search');
                    pushEvidence('ChartInteractionLayer zresetował wybór.');
                  }}
                >
                  <ComparisonChart
                    ariaLabel="Porównanie kanałów"
                    benchmark={{ label: 'Plan', value: 100 }}
                    data={comparisonData}
                    series={comparisonSeries}
                    unit="tys. zł"
                    variant="grouped"
                  />
                </ChartInteractionLayer>
                <div className="pd-c83-analytics-line">
                  <ShareChart
                    ariaLabel="Udział kanałów"
                    display="donut"
                    segments={shareSegments}
                    total={1000000}
                  />
                  <ForecastChart
                    actual={forecastActual}
                    ariaLabel="Prognoza przychodu"
                    confidence={0.78}
                    forecast={forecast}
                    horizonLabel="7 dni"
                    lowerBound={lowerBound}
                    quality={{ description: 'Model ma pełne dane z ostatnich 30 dni.', label: 'Dobra jakość', level: 'high' }}
                    upperBound={upperBound}
                    unit="tys. zł"
                  />
                  <CorrelationChart
                    ariaLabel="Korelacja budżetu i przychodu"
                    correlation={0.74}
                    driverHypothesis="Budżet paid search tłumaczy część wzrostu przychodu."
                    evidence={{ description: 'Analiza porównawcza ostatnich 16 dni.', label: 'Korelacja obserwowana', level: 'driver-hypothesis' }}
                    points={correlationPoints}
                    relationshipLabel="Silna dodatnia zależność"
                    xLabel="Budżet"
                    yLabel="Przychód"
                  />
                </div>
                <ChartDataState
                  action={{ label: 'Ponów pobranie', onAction: () => pushEvidence('ChartDataState uruchomił ponowienie pobrania.') }}
                  state="stale"
                  title="Dane starsze niż oczekiwano"
                />
              </RuntimeSequence>

              <RuntimeSequence
                evidenceLabel="Komponenty domenowe pokazują decyzje, dowody, wyniki, kohorty, synchronizację i rekomendacje."
                title="Decyzje i dowody domenowe"
              >
                <div className="pd-c83-domain-flow">
                  <Panel
                    bordered={false}
                    collapsible={false}
                    collapsed={false}
                    description="Panel scala decyzję, dowody i rekomendację w jednym przebiegu."
                    padding="md"
                    title="Kontekst decyzji"
                  >
                    <DecisionCard
                      decisionId="decision-paid-budget"
                      dueAt="2026-08-18T10:00:00+01:00"
                      impact="high"
                      owner="Growth"
                      status="proposed"
                      title="Zwiększyć budżet paid search o 12%"
                    />
                  </Panel>
                  <DetailPanel
                    action={<TextAction size="small" onClick={() => pushEvidence('DetailPanel przekazał akcję rekordu.')}>Edytuj</TextAction>}
                    open
                    recordId="campaign-148"
                    sections={[
                      { fields: [{ label: 'Kanał', value: 'Paid search' }, { label: 'ROAS', value: '4.1x' }], id: 'base', title: 'Parametry' },
                      { fields: [{ label: 'Ryzyko', value: 'średnie' }, { label: 'Dowód', value: 'ev-attribution' }], id: 'risk', title: 'Ryzyko' },
                    ]}
                    title="Szczegóły kampanii"
                    width="md"
                  />
                  <RecommendationCard
                    context={workspaceContext}
                    effort="medium"
                    evidence={evidence}
                    impact="high"
                    recommendationId="rec-budget"
                    risk="medium"
                    title="Przenieś 8% budżetu z kampanii o słabej marży"
                    onApprove={(event) => pushEvidence(`RecommendationCard zaakceptował: ${event.recommendationId}.`)}
                    onReject={(event) => pushEvidence(`RecommendationCard odrzucił: ${event.recommendationId}.`)}
                  />
                  <EvidencePanel
                    confidence={0.86}
                    context={workspaceContext}
                    evidence={evidence}
                    sources={dataSources}
                    onOpenEvidence={(event) => pushEvidence(`EvidencePanel otworzył dowód: ${event.evidenceId}.`)}
                  />
                  <DecisionQueue
                    context={workspaceContext}
                    decisions={[
                      { dueAt: '2026-08-18T10:00:00+01:00', id: 'd1', owner: 'Growth', priority: 'high', status: 'review', title: 'Zwiększyć budżet paid search' },
                      { id: 'd2', owner: 'Ops', priority: 'medium', status: 'new', title: 'Naprawić mapowanie source/medium' },
                    ]}
                    onOpenDecision={(event) => pushEvidence(`DecisionQueue otworzył decyzję: ${event.decisionId}.`)}
                  />
                  <ApprovalPanel
                    approvers={[
                      { name: 'Anna Nowak', status: 'approved', userId: 'anna' },
                      { name: 'Piotr Kowalski', status: 'pending', userId: 'piotr' },
                    ]}
                    expiresAt="2026-08-18T12:00:00+01:00"
                    risk="medium"
                    subjectId="budget-change-12"
                    subjectLabel="Zmiana budżetu kampanii"
                  />
                  <MorningBrief
                    context={workspaceContext}
                    dataReadiness="partial"
                    decisionsDue={2}
                    highlights={[
                      { id: 'h1', metric: '+12%', severity: 'info', title: 'ROAS powyżej celu' },
                      { id: 'h2', metric: '93%', severity: 'warning', title: 'Opóźnione dane Meta Ads' },
                    ]}
                    onOpenHighlight={(event) => pushEvidence(`MorningBrief otworzył highlight: ${event.highlightId}.`)}
                  />
                  <AssistantComposer
                    attachments={[{ id: 'att-1', name: 'raport.csv', size: 24200 }]}
                    contextItemIds={['campaign-148', 'ev-attribution']}
                    label="Kompozytor asystenta"
                    placeholder="Zapytaj o zmianę budżetu"
                    submitting={false}
                    value="Wyjaśnij wzrost ROAS"
                  />
                </div>
              </RuntimeSequence>
            </div>
          </StoryPresentationSection>
  );
}
