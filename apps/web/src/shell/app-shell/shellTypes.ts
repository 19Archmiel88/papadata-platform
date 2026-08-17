import type {
  ReactNode,
} from 'react';

import type {
  BackgroundOperationStatus,
} from '../../design-system';
import type {
  PapaDataIconName,
} from '../../design-system/icons';

export type ShellTone =
  | 'critical'
  | 'info'
  | 'neutral'
  | 'processing'
  | 'success'
  | 'warning';

export type ShellUser = {
  readonly displayName: string;
  readonly email: string;
  readonly role: string;
};

export type ShellWorkspace = {
  readonly capabilities: readonly string[];
  readonly disabled?: boolean;
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly statusText: string;
  readonly tone: ShellTone;
};

export type ShellNavigationItem = {
  readonly badge?: string | null;
  readonly disabled?: boolean;
  readonly disabledReason?: string | null;
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly status?: string | null;
};

export type ShellNavigationGroup = {
  readonly id: string;
  readonly items: readonly ShellNavigationItem[];
  readonly label: string;
};

export type ShellCommandResult = {
  readonly action?: ShellCommandAction | null;
  readonly description: string;
  readonly id: string;
  readonly keywords: readonly string[];
  readonly label: string;
  readonly path: string;
  readonly section: string;
};

export type ShellCommandAction =
  | 'analyze-screen'
  | 'open-papa';

export type ShellNotificationCategory =
  | 'ai'
  | 'billing'
  | 'data'
  | 'integrations'
  | 'reports'
  | 'support'
  | 'system';

export type ShellNotificationPriority =
  | 'critical'
  | 'high'
  | 'medium';

export type ShellNotification = {
  readonly actionLabel?: string | null;
  readonly actionPath?: string | null;
  readonly canSnooze?: boolean;
  readonly category: ShellNotificationCategory;
  readonly createdAt: string;
  readonly id: string;
  readonly message: string;
  readonly priority: ShellNotificationPriority;
  readonly readAt: string | null;
  readonly snoozedUntil: string | null;
  readonly time: string;
  readonly title: string;
  readonly tone: ShellTone;
  readonly unread: boolean;
};

export type ShellOperationAction = 'cancel' | 'retry';

export type ShellOperation = {
  readonly action?: ShellOperationAction | null;
  readonly actionLabel?: string | null;
  readonly description: string;
  readonly errorCode: string | null;
  readonly id: string;
  readonly progress: number | null;
  readonly startedAt: string | null;
  readonly status: BackgroundOperationStatus;
  readonly statusText?: string | null;
  readonly title: string;
};

export type ShellOverlay =
  | 'account'
  | 'calendar'
  | 'command'
  | 'mobile-navigation'
  | 'notifications'
  | 'operations'
  | 'papa-assistant'
  | null;

export type ShellNavigate = (path: string) => void;

export type ShellRegionProps = {
  readonly children?: ReactNode;
};
