import type { WorkspaceContext, ReadinessState, EvidenceRef, DataSourceRef, DomainActionEvent, DateRange, ChartSeries, IntegrationProvider, PairingStepStatus, DevicePairingStatus, BudgetPacingStatus, DecisionStatus, SyncStatus } from './ui-contract-types';

export interface PairingFlowProps { context: WorkspaceContext; provider: IntegrationProvider; steps: Array<{ id: string; label: string; status: PairingStepStatus; challengeCode?: string; expiresAt?: string }>; deviceStatus?: DevicePairingStatus; sessionId?: string; onStart: (event: DomainActionEvent & { provider: IntegrationProvider }) => void; onConfirm: (event: DomainActionEvent & { challengeCode: string }) => void; onCancel?: (event: DomainActionEvent) => void; }

export interface BudgetPacingProps { context: WorkspaceContext; campaignId: string; plannedSpend: number; actualSpend: number; forecastSpend: number; status: BudgetPacingStatus; recommendation?: string; evidence: EvidenceRef[]; onCreateDecision?: (event: DomainActionEvent & { campaignId: string }) => void; }

export interface CohortMatrixProps { context: WorkspaceContext; cohortMetric: 'retention' | 'repeatPurchase' | 'ltv'; columns: string[]; rows: Array<{ cohortId: string; label: string; values: Array<number | null> }>; selectedCohortId?: string; onSelectCohort?: (event: DomainActionEvent & { cohortId: string }) => void; }

export interface LineageGraphProps { context: WorkspaceContext; rootRecordId: string; nodes: Array<{ id: string; label: string; type: 'source' | 'transform' | 'metric' | 'record'; status: ReadinessState }>; edges: Array<{ from: string; to: string; reason?: string }>; onOpenNode?: (event: DomainActionEvent & { nodeId: string }) => void; }

export interface DecisionQueueProps { context: WorkspaceContext; decisions: Array<{ id: string; title: string; status: DecisionStatus; priority: 'low' | 'medium' | 'high'; dueAt?: string; owner?: string }>; onOpenDecision: (event: DomainActionEvent & { decisionId: string }) => void; onChangeStatus?: (event: DomainActionEvent & { decisionId: string; status: DecisionStatus }) => void; }

export interface PlanPerformanceProps { context: WorkspaceContext; planSeries: ChartSeries; actualSeries: ChartSeries; forecastSeries?: ChartSeries; gapToTarget: number; pace: 'behind' | 'onTrack' | 'ahead'; confidenceBand?: ChartSeries; onRangeChange?: (range: DateRange) => void; }

export interface ResultDriversProps { context: WorkspaceContext; drivers: Array<{ id: string; label: string; contribution: number; direction: 'positive' | 'negative' | 'neutral'; evidence: EvidenceRef[] }>; baselineValue: number; currentValue: number; onInspectDriver?: (event: DomainActionEvent & { driverId: string }) => void; }

export interface SalesSourcesProps { context: WorkspaceContext; sources: Array<{ id: string; channel: string; revenue: number; orders: number; margin?: number; readiness: ReadinessState }>; compareToPrevious?: boolean; onOpenSource?: (event: DomainActionEvent & { sourceId: string }) => void; }

export interface CustomerSegmentsProps { context: WorkspaceContext; segments: Array<{ id: string; label: string; customers: number; revenue: number; ltv?: number; churnRisk?: number }>; selectedSegmentId?: string; onSelectSegment?: (event: DomainActionEvent & { segmentId: string }) => void; }

export interface SalesFunnelProps { context: WorkspaceContext; steps: Array<{ id: string; label: string; visitors: number; conversionRate: number; dropoffRate: number }>; onOpenStep?: (event: DomainActionEvent & { stepId: string }) => void; }

export interface EvidencePanelProps { context: WorkspaceContext; evidence: EvidenceRef[]; sources: DataSourceRef[]; confidence: number; onOpenEvidence?: (event: DomainActionEvent & { evidenceId: string }) => void; }

export interface RecommendationCardProps { context: WorkspaceContext; recommendationId: string; title: string; impact: 'low' | 'medium' | 'high'; effort: 'low' | 'medium' | 'high'; risk: 'low' | 'medium' | 'high'; evidence: EvidenceRef[]; onApprove?: (event: DomainActionEvent & { recommendationId: string }) => void; onReject?: (event: DomainActionEvent & { recommendationId: string }) => void; }

export interface DataStatusBannerProps { context: WorkspaceContext; readiness: ReadinessState; sources: DataSourceRef[]; blockingIssues: Array<{ id: string; label: string; severity: 'info' | 'warning' | 'critical' }>; onOpenIssue?: (event: DomainActionEvent & { issueId: string }) => void; }

export interface SyncTimelineProps { context: WorkspaceContext; runs: Array<{ id: string; provider: IntegrationProvider; status: SyncStatus; startedAt: string; endedAt?: string; recordsProcessed?: number; errorCode?: string }>; onOpenRun?: (event: DomainActionEvent & { runId: string }) => void; }

export interface AttributionComparisonProps { context: WorkspaceContext; models: Array<{ id: string; label: string; revenue: number; roas: number; confidence: number }>; selectedModelId: string; onSelectModel?: (event: DomainActionEvent & { modelId: string }) => void; }

export interface ReconciliationPanelProps { context: WorkspaceContext; conflicts: Array<{ id: string; entityType: string; sourceA: string; sourceB: string; proposedResolution?: string }>; onResolveConflict?: (event: DomainActionEvent & { conflictId: string; resolution: string }) => void; }

export interface FunnelStepProps { context: WorkspaceContext; stepId: string; label: string; visitors: number; conversions: number; conversionRate: number; previousStepId?: string; nextStepId?: string; onInspect?: (event: DomainActionEvent & { stepId: string }) => void; }

export interface MorningBriefProps { context: WorkspaceContext; highlights: Array<{ id: string; title: string; metric: string; severity: 'info' | 'warning' | 'critical' }>; decisionsDue: number; dataReadiness: ReadinessState; onOpenHighlight?: (event: DomainActionEvent & { highlightId: string }) => void; }
