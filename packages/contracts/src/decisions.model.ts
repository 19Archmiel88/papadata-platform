export const decisionDomains = {
  products: 'Produkty',
  campaigns: 'Kampanie',
  orders: 'Zamówienia',
  customers: 'Klienci',
  data: 'Jakość danych',
  traffic: 'Ruch',
} as const;
export type DecisionDomain = keyof typeof decisionDomains;
export const decisionStatuses = {
  review: 'Do decyzji',
  blocked: 'Wymaga wyjaśnienia',
  approved: 'Do wykonania',
  measuring: 'W pomiarze',
  completed: 'Zmierzone',
  rejected: 'Odrzucone',
} as const;
export type DecisionStatus = keyof typeof decisionStatuses;
export type DecisionPriority = 'high' | 'medium' | 'low';
export const decisionPriorities = { high: 'Wysoki', medium: 'Średni', low: 'Niski' } as const;
export type DecisionEvidence = { label: string; value: string; source: string };
export type DecisionOption = {
  id: string;
  title: string;
  description: string;
  tradeoff: string;
  steps: string[];
};
export type DecisionMeasurement = {
  metric: string;
  unit: 'PLN' | '%' | 'szt.' | 'dni';
  direction: 'up' | 'down';
  baseline: number | null;
  baselineLabel: string;
  days: number;
  startsOn: string | null;
  endsOn: string | null;
  result: number | null;
  source: string | null;
};
export type DecisionContext = {
  reportId?: string | null;
  reportVersion?: number | null;
  budgetPlanId?: string | null;
  sourcePath: string;
  conversationId?: string | null;
  caseThreadId?: string | null;
  from?: string | null;
  to?: string | null;
  timezone?: string | null;
  filters?: Record<string, string>;
};
export type Decision = {
  context?: DecisionContext | null;
  id: string;
  title: string;
  domain: DecisionDomain;
  priority: DecisionPriority;
  status: DecisionStatus;
  observation: string;
  impact: string;
  evidence: DecisionEvidence[];
  evidencePeriod: string;
  evidencePath: string | null;
  evidenceReady: boolean;
  limitation: string;
  options: DecisionOption[];
  selectedOption: string | null;
  owner: string | null;
  due: string | null;
  rationale: string;
  measurement: DecisionMeasurement;
  createdAt: string;
};
export type DecisionActivity = {
  id: string;
  decisionId: string;
  at: string;
  actor: string;
  label: string;
  note: string;
};
export type DecisionsData = {
  id: string;
  sourceDate: string;
  decisions: Decision[];
  activity: DecisionActivity[];
};
export type DecisionStore = Pick<DecisionsData, 'decisions' | 'activity'>;
export type DecisionCommand =
  | { type: 'approve'; optionId: string; owner: string; due: string; note: string }
  | { type: 'block' | 'reject' | 'reopen' | 'comment'; note: string }
  | { type: 'execute'; date: string; note: string }
  | { type: 'measure'; value: number; source: string; note: string }
  | {
      type: 'create';
      metric: string;
      unit: DecisionMeasurement['unit'];
      direction: DecisionMeasurement['direction'];
      baseline: number | null;
      days: number;
      title: string;
      domain: DecisionDomain;
      observation: string;
      source: string;
      period: string;
      action: string;
      owner: string;
      due: string;
    };
export type DecisionEvent = {
  id: string;
  decisionId: string;
  at: string;
  actor: string;
  command: DecisionCommand;
  context?: DecisionContext | null;
};
export const decisionViews = {
  queue: 'Kolejka decyzji',
  measurement: 'Pomiar efektów',
  history: 'Rejestr decyzji',
} as const;
export type DecisionView = keyof typeof decisionViews;
export const decisionFilters = {
  open: 'Otwarte',
  overdue: 'Po terminie',
  review: 'Do decyzji',
  blocked: 'Wymaga wyjaśnienia',
  approved: 'Do wykonania',
  measuring: 'W pomiarze',
  closed: 'Zamknięte',
  all: 'Wszystkie',
} as const;
export type DecisionFilter = keyof typeof decisionFilters;

export type DecisionsRegistry = DecisionsData & { version: number; mode: 'server'; timezone: string };
export type DecisionMutation = { expectedVersion: number; decisionId: string; command: DecisionCommand; context?: DecisionContext | null };
