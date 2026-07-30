import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface DecisionCardProps extends BaseComponentProps {
  decisionId: string;
  title: string;
  status: 'proposed' | 'approved' | 'rejected' | 'executing' | 'measured';
  impact: 'low' | 'medium' | 'high';
  owner: string | null;
  dueAt: string | null;
}

export type DecisionCardEvent = ComponentEvent<{ type: 'decisioncard'; value?: string | number | boolean | null }>;
