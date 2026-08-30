import type {
  ShellNavigate,
  ShellOperation,
  ShellTone,
} from '../app-shell/shellTypes';
import './shell-footer.css';

export type ShellFooterStatus = {
  readonly label: string;
  readonly meta?: string | null;
  readonly tone: ShellTone;
};

export type ShellFooterLink = {
  readonly label: string;
  readonly path: string;
};

const toneDotModifier: Record<ShellTone, string> = {
  critical: 'pd-shell-footer__dot--critical',
  info: 'pd-shell-footer__dot--info',
  neutral: 'pd-shell-footer__dot--neutral',
  processing: 'pd-shell-footer__dot--info',
  success: 'pd-shell-footer__dot--success',
  warning: 'pd-shell-footer__dot--warning',
};

/**
 * Derives a footer-bar summary directly from the same `operations` list the
 * OperationCenter already renders — no separate data source, so the label
 * never claims more than the visible job list actually shows.
 */
export function deriveShellFooterStatus(
  operations: readonly ShellOperation[],
): ShellFooterStatus {
  const failed = operations.filter((operation) => operation.status === 'failed');
  const active = operations.filter((operation) => (
    operation.status === 'running' || operation.status === 'queued'
  ));

  if (failed.length > 0) {
    return {
      label: failed.length === 1
        ? '1 operacja integracji wymaga uwagi'
        : `${failed.length} operacje integracji wymagają uwagi`,
      meta: failed[0]?.title ?? null,
      tone: 'critical',
    };
  }

  if (active.length > 0) {
    return {
      label: 'Synchronizacja w toku',
      meta: active.length === 1 ? active[0]?.title ?? null : `${active.length} aktywnych operacji`,
      tone: 'info',
    };
  }

  if (operations.length > 0) {
    return {
      label: 'Brak aktywnych operacji integracji',
      meta: null,
      tone: 'success',
    };
  }

  return {
    label: 'Brak operacji integracji do wyświetlenia',
    meta: null,
    tone: 'neutral',
  };
}

export function ShellFooter({
  links = [],
  onNavigate,
  status,
  versionLabel = null,
}: {
  readonly links?: readonly ShellFooterLink[];
  readonly onNavigate?: ShellNavigate;
  readonly status: ShellFooterStatus;
  readonly versionLabel?: string | null;
}) {
  return (
    <footer aria-label="Stan synchronizacji" className="pd-shell-footer">
      <div className="pd-shell-footer__status">
        <span
          aria-hidden="true"
          className={`pd-shell-footer__dot ${toneDotModifier[status.tone]}`}
        />
        <span className="pd-shell-footer__label">{status.label}</span>
        {status.meta ? (
          <span className="pd-shell-footer__meta">{status.meta}</span>
        ) : null}
      </div>

      {links.length > 0 || versionLabel ? (
        <div className="pd-shell-footer__links">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => onNavigate?.(link.path)}
              type="button"
            >
              {link.label}
            </button>
          ))}
          {versionLabel ? (
            <span className="pd-shell-footer__version">{versionLabel}</span>
          ) : null}
        </div>
      ) : null}
    </footer>
  );
}
