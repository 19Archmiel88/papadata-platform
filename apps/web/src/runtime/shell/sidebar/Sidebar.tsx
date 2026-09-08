import { useState } from 'react';
import { Icon } from '../../../design-system/index';
import type { ShellNavigationGroup, ShellNavigate } from '../app-shell/shellTypes';
import './sidebar.css';

export function Sidebar({
  activePath,
  collapsed = false,
  dense = false,
  groups,
  onNavigate,
}: {
  readonly activePath: string;
  readonly collapsed?: boolean;
  readonly dense?: boolean;
  readonly groups: readonly ShellNavigationGroup[];
  readonly onNavigate: ShellNavigate;
}) {
  const [analysesOpen, setAnalysesOpen] = useState(true);
  return (
    <nav
      aria-label="Nawigacja główna"
      className="pd-product-shell__sidebar pd-sidebar-navigation"
      data-collapsed={collapsed || undefined}
      data-density={dense ? 'dense' : 'comfortable'}
    >
      {groups.map((group) => {
        const expandable = group.id === 'analytics' && !collapsed;
        return (
          <section className="pd-product-shell__nav-group" data-group={group.id} key={group.id}>
            {expandable ? (
              <button
                className="pd-product-shell__nav-group-toggle"
                type="button"
                aria-expanded={analysesOpen}
                onClick={() => setAnalysesOpen((open) => !open)}
              >
                Analizy <span aria-hidden="true">{analysesOpen ? '⌄' : '›'}</span>
              </button>
            ) : group.label && !collapsed ? (
              <h2>{group.label}</h2>
            ) : null}
            {(!expandable || analysesOpen) && (
              <div className="pd-product-shell__nav-list">
                {group.items.map((item) => {
                  const active = activePath === item.path || activePath.startsWith(`${item.path}/`);
                  return (
                    <a
                      className="pd-product-shell__nav-item"
                      key={item.id}
                      href={item.href ?? item.path}
                      aria-label={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      aria-disabled={item.disabled || undefined}
                      title={collapsed ? item.label : (item.disabledReason ?? undefined)}
                      onClick={(event) => {
                        if (item.disabled) {
                          event.preventDefault();
                          return;
                        }
                        if (
                          !event.metaKey &&
                          !event.ctrlKey &&
                          !event.shiftKey &&
                          !event.altKey &&
                          event.button === 0
                        ) {
                          event.preventDefault();
                          onNavigate(item.path);
                        }
                      }}
                    >
                      <Icon decorative name={item.icon} size={16} />
                      <span className="pd-product-shell__nav-copy">
                        <span>{item.label}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </nav>
  );
}
