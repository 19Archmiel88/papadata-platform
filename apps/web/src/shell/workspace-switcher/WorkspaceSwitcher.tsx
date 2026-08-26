import {
  useState,
} from 'react';

import {
  EmptyState,
  ErrorState,
} from '../../design-system';
import type {
  ShellWorkspace,
} from '../app-shell/shellTypes';
import {
  AnchoredShellOverlay,
} from '../overlays';
import './workspace-switcher.css';

export function WorkspaceSwitcher({
  activeWorkspaceId,
  collapsed = false,
  error = null,
  onCreateWorkspace,
  onSelectWorkspace,
  pending = false,
  workspaces,
}: {
  readonly activeWorkspaceId: string | null;
  readonly collapsed?: boolean;
  readonly error?: string | null;
  readonly onCreateWorkspace?: () => void;
  readonly onSelectWorkspace?: (workspaceId: string) => void | Promise<void>;
  readonly pending?: boolean;
  readonly workspaces: readonly ShellWorkspace[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="pd-product-shell__workspace pd-workspace-switcher">
        <ErrorState
          errorCode="WORKSPACE_SWITCHER_ERROR"
          message={error}
          recoverable={false}
          supportLabel={null}
          title="Nie można odczytać workspace"
          variant="permission"
        />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="pd-product-shell__workspace pd-workspace-switcher">
        <EmptyState
          message="Konto nie ma przypisanego workspace. Poproś właściciela organizacji o dostęp."
          title="Brak workspace"
          variant="forbidden"
        />
      </div>
    );
  }

  const activeWorkspace = workspaces.find((workspace) => (
    workspace.id === activeWorkspaceId
  )) ?? workspaces[0];

  async function selectWorkspace(workspace: ShellWorkspace) {
    if (
      workspace.disabled
      || workspace.id === activeWorkspace.id
      || pending
      || !onSelectWorkspace
    ) return;

    setPendingWorkspaceId(workspace.id);
    setSelectionError(null);
    try {
      await onSelectWorkspace(workspace.id);
      setMenuOpen(false);
    } catch (cause) {
      setSelectionError(
        cause instanceof Error
          ? cause.message
          : 'Nie udało się zmienić workspace.',
      );
    } finally {
      setPendingWorkspaceId(null);
    }
  }

  return (
    <section
      aria-labelledby="runtime-workspace-switcher-title"
      className="pd-product-shell__workspace pd-workspace-switcher"
      data-collapsed={collapsed ? true : undefined}
    >
      <h2
        className="pd-product-shell__workspace-title pd-workspace-switcher__title"
        id="runtime-workspace-switcher-title"
      >
        Workspace
      </h2>

      <AnchoredShellOverlay
        align="start"
        className="pd-product-shell__workspace-overlay"
        description="Zmiana workspace aktualizuje bezpieczny kontekst sesji przed odświeżeniem danych."
        onOpenChange={setMenuOpen}
        open={menuOpen}
        title="Zmień workspace"
        trigger={(
          <button
            aria-busy={pending || pendingWorkspaceId !== null ? true : undefined}
            aria-label={`Zmień workspace. Wybrany workspace: ${activeWorkspace.name}`}
            className="pd-product-shell__workspace-trigger pd-workspace-switcher__trigger"
            disabled={pending}
            type="button"
          >
            <span aria-hidden="true" className="pd-product-shell__workspace-mark">
              {workspaceInitials(activeWorkspace.name)}
            </span>

            <span className="pd-product-shell__workspace-copy">
              <strong>{activeWorkspace.name}</strong>
              <small>
                {activeWorkspace.role}
                {' · '}
                {activeWorkspace.statusText}
              </small>
            </span>

            <span aria-hidden="true" className="pd-product-shell__workspace-chevron">
              ▾
            </span>
          </button>
        )}
      >
        <div className="pd-product-shell__workspace-options">
          {selectionError ? (
            <div className="pd-product-shell__workspace-selection-error" role="status">
              {selectionError}
            </div>
          ) : null}

          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspace.id;
            const isPending = pendingWorkspaceId === workspace.id;
            return (
              <button
                aria-current={isActive ? 'true' : undefined}
                className="pd-product-shell__workspace-option"
                data-active={isActive ? true : undefined}
                disabled={workspace.disabled || pending || pendingWorkspaceId !== null}
                key={workspace.id}
                onClick={() => void selectWorkspace(workspace)}
                type="button"
              >
                <span aria-hidden="true" className="pd-product-shell__workspace-mark">
                  {workspaceInitials(workspace.name)}
                </span>
                <span className="pd-product-shell__workspace-option-copy">
                  <strong>{workspace.name}</strong>
                  <small>
                    {workspace.role}
                    {' · '}
                    {workspace.statusText}
                  </small>
                </span>
                <span className="pd-product-shell__workspace-option-state">
                  {isPending ? 'Zmiana…' : isActive ? 'Wybrany' : 'Wybierz'}
                </span>
              </button>
            );
          })}

          {onCreateWorkspace ? (
            <div className="pd-product-shell__workspace-actions">
              <button
                className="pd-product-shell__workspace-create"
                onClick={() => {
                  setMenuOpen(false);
                  onCreateWorkspace();
                }}
                type="button"
              >
                <span aria-hidden="true" className="pd-product-shell__workspace-create-mark">+</span>
                <span>Dodaj workspace</span>
              </button>
            </div>
          ) : null}
        </div>
      </AnchoredShellOverlay>
    </section>
  );
}

function workspaceInitials(name: string) {
  return name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
