import {
  useState,
} from 'react';

import {
  EmptyState,
  ErrorState,
  Menu,
  StatusBadge,
} from '../../design-system';
import type {
  MenuItem,
} from '../../design-system';
import type {
  ShellWorkspace,
} from '../app-shell/shellTypes';

export function WorkspaceSwitcher({
  activeWorkspaceId,
  collapsed = false,
  error = null,
  onSelectWorkspace,
  workspaces,
}: {
  readonly activeWorkspaceId: string | null;
  readonly collapsed?: boolean;
  readonly error?: string | null;
  readonly onSelectWorkspace?: (workspaceId: string) => void;
  readonly workspaces: readonly ShellWorkspace[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenuItemId, setActiveMenuItemId] =
    useState<string | null>(activeWorkspaceId);

  if (error) {
    return (
      <div className="pd-product-shell__workspace">
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
      <div className="pd-product-shell__workspace">
        <EmptyState
          message="Konto nie ma przypisanego workspace. Poproś właściciela organizacji o dostęp."
          title="Brak workspace"
          variant="forbidden"
        />
      </div>
    );
  }

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId)
    ?? workspaces[0];

  const menuItems: readonly MenuItem[] = workspaces.map(
    (workspace) => ({
      checked: workspace.id === activeWorkspace.id,
      disabled: workspace.disabled,
      id: workspace.id,
      label: workspace.name,
      shortcut: `${workspace.role} · ${workspace.statusText}`,
    }),
  );

  return (
    <section
      aria-labelledby="runtime-workspace-switcher-title"
      className="pd-product-shell__workspace"
      data-collapsed={collapsed ? true : undefined}
    >
      <h2
        className="pd-product-shell__workspace-title"
        id="runtime-workspace-switcher-title"
      >
        Workspace
      </h2>

      <Menu
        activeItemId={activeMenuItemId}
        className="pd-product-shell__workspace-menu"
        items={menuItems}
        onAction={(workspaceId) => {
          const workspace = workspaces.find(
            (candidate) => candidate.id === workspaceId,
          );

          if (!workspace || workspace.disabled) {
            return;
          }

          setActiveMenuItemId(workspaceId);
          onSelectWorkspace?.(workspaceId);
        }}
        onActiveItemIdChange={setActiveMenuItemId}
        onOpenChange={(open) => {
          setMenuOpen(open);

          if (open) {
            setActiveMenuItemId(activeWorkspace.id);
          }
        }}
        open={menuOpen}
        placement="bottom-start"
        trigger={(
          <button
            aria-label={`Zmień workspace. Aktywny: ${activeWorkspace.name}, ${activeWorkspace.role}, ${activeWorkspace.statusText}`}
            className="pd-product-shell__workspace-trigger"
            type="button"
          >
            <span
              aria-hidden="true"
              className="pd-product-shell__workspace-mark"
            >
              {activeWorkspace.name
                .split(/\s+/u)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() ?? '')
                .join('')}
            </span>

            <span className="pd-product-shell__workspace-copy">
              <strong>{activeWorkspace.name}</strong>
              <small>
                {activeWorkspace.role}
              </small>
            </span>

            <StatusBadge
              status="Stan workspace"
              text={activeWorkspace.statusText}
              tone={activeWorkspace.tone}
            />

            <span
              aria-hidden="true"
              className="pd-product-shell__workspace-chevron"
            >
              ▾
            </span>
          </button>
        )}
      />
    </section>
  );
}
