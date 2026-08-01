import type {
  PapaDataIconName,
} from '../../icons';

export type FeedbackTone =
  | 'info'
  | 'success'
  | 'warning'
  | 'critical';

export type StatusBadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'critical'
  | 'processing';

export function resolveFeedbackRole(
  tone: FeedbackTone,
) {
  return tone === 'warning' || tone === 'critical'
    ? 'alert'
    : 'status';
}

export function resolveFeedbackIconName(
  tone: FeedbackTone,
): PapaDataIconName {
  switch (tone) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'security';
    case 'info':
    default:
      return 'data';
  }
}

export function resolveStatusBadgeIconName(
  tone: StatusBadgeTone,
): PapaDataIconName {
  switch (tone) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'security';
    case 'processing':
      return 'integration';
    case 'info':
      return 'data';
    case 'neutral':
    default:
      return 'billing';
  }
}
