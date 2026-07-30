import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface ApprovalPanelProps extends BaseComponentProps {
  subjectId: string;
  subjectLabel: string;
  risk: 'low' | 'medium' | 'high';
  approvers: Array<{ userId: string; name: string; status: 'pending' | 'approved' | 'rejected' }>;
  expiresAt: string | null;
}

export type ApprovalPanelEvent = ComponentEvent<{ type: 'approvalpanel'; value?: string | number | boolean | null }>;
