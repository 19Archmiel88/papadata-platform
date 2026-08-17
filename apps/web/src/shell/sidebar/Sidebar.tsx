import {
  Icon,
} from '../../design-system';
import type {
  ShellNavigationGroup,
  ShellNavigate,
} from '../app-shell/shellTypes';
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
  return (
    <aside
      aria-label="Nawigacja główna"
      className="pd-product-shell__sidebar pd-sidebar-navigation"
      data-collapsed={collapsed ? true : undefined}
      data-density={dense ? 'dense' : 'comfortable'}
    >
      {groups.map((group) => (
        <section className="pd-product-shell__nav-group" key={group.id}>
          <h2>{group.label}</h2>

          <div className="pd-product-shell__nav-list">
            {group.items.map((item) => {
              const active =
                activePath === item.path
                || (
                  item.path === '/app/command-center'
                  && activePath.startsWith('/app/command-center/')
                )
                || (
                  item.path !== '/app/command-center'
                  && activePath.startsWith(`${item.path}/`)
                );

              const reasonId = item.disabledReason
                ? `pd-nav-${item.id}-reason`
                : undefined;

              const title = (
                collapsed || item.disabledReason
              )
                ? [
                    item.label,
                    item.disabledReason,
                    item.badge,
                  ].filter(Boolean).join(' — ')
                : undefined;

              return (
                <button
                  aria-current={active ? 'page' : undefined}
                  aria-describedby={reasonId}
                  aria-disabled={item.disabled ? true : undefined}
                  className="pd-product-shell__nav-item"
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      onNavigate(item.path);
                    }
                  }}
                  title={title}
                  type="button"
                >
                  <Icon
                    decorative
                    name={item.icon}
                    size={20}
                  />

                  <span className="pd-product-shell__nav-copy">
                    <span>{item.label}</span>
                    {item.status ? (
                      <small>{item.status}</small>
                    ) : null}
                    {item.disabledReason ? (
                      <span
                        className="pd-product-shell__sr-only"
                        id={reasonId}
                      >
                        {item.disabledReason}
                      </span>
                    ) : null}
                  </span>

                  {item.badge ? (
                    <span
                      aria-label={`Status: ${item.badge}`}
                      className="pd-product-shell__nav-badge"
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </aside>
  );
}
