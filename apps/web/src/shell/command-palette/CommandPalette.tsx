import {
  useMemo,
  useState,
} from 'react';

import {
  Dialog,
  EmptyState,
  Icon,
  TextField,
} from '../../design-system';
import type {
  ShellCommandAction,
  ShellCommandResult,
  ShellNavigate,
} from '../app-shell/shellTypes';

export function CommandPalette({
  commands,
  onCommandAction,
  onNavigate,
  onOpenChange,
  open,
}: {
  readonly commands: readonly ShellCommandResult[];
  readonly onCommandAction?: ((action: ShellCommandAction) => void) | undefined;
  readonly onNavigate: ShellNavigate;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return commands;

    return commands.filter((command) => {
      const haystack = [
        command.label,
        command.description,
        command.section,
        ...command.keywords,
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [commands, normalizedQuery]);
  const groupedResults = useMemo(() => {
    const groups: Array<{
      results: ShellCommandResult[];
      section: string;
    }> = [];

    for (const result of results) {
      const existingGroup = groups.find((group) => (
        group.section === result.section
      ));

      if (existingGroup) {
        existingGroup.results.push(result);
      } else {
        groups.push({
          results: [result],
          section: result.section,
        });
      }
    }

    return groups;
  }, [results]);

  return (
    <Dialog
      className="pd-product-shell__command-dialog"
      closeOnBackdrop
      closeOnEscape
      description="Szybka nawigacja, akcje i analiza bieżącego ekranu."
      modal
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      open={open}
      title="Szukaj lub uruchom komendę"
    >
      <div className="pd-product-shell__command-palette">
        <TextField
          autocomplete="off"
          autoFocus
          className="pd-product-shell__command-field"
          label="Fraza lub komenda"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Np. KPI, integracje, workspace"
          value={query}
        />
        {results.length === 0 ? (
          <EmptyState
            message="Zmień frazę lub użyj nawigacji bocznej. Pusty wynik nie zamyka dialogu."
            title="Brak wyników"
            variant="search"
          />
        ) : (
          <div
            aria-label="Wyniki command palette"
            className="pd-product-shell__command-results"
            role="listbox"
          >
            {groupedResults.map((group) => (
              <section
                aria-label={group.section}
                className="pd-product-shell__command-group"
                key={group.section}
                role="group"
              >
                <h3>{group.section}</h3>
                <div className="pd-product-shell__command-group-list">
                  {group.results.map((result) => (
                    <button
                      aria-selected="false"
                      className="pd-product-shell__command-result"
                      key={result.id}
                      onClick={() => {
                        if (result.action) {
                          onOpenChange(false);
                          onCommandAction?.(result.action);
                          return;
                        }

                        onNavigate(result.path);
                        onOpenChange(false);
                      }}
                      role="option"
                      type="button"
                    >
                      <span aria-hidden="true" className="pd-product-shell__command-result-icon">
                        <Icon decorative name={resolveCommandIcon(result)} size={20} />
                      </span>
                      <span className="pd-product-shell__command-result-copy">
                        <strong>{result.label}</strong>
                        <small>{result.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}

function resolveCommandIcon(result: ShellCommandResult) {
  if (result.action === 'open-papa' || result.action === 'analyze-screen') {
    return 'assistant';
  }

  if (result.path.includes('/integrations')) return 'integration';
  if (result.path.includes('/billing')) return 'billing';
  if (result.path.includes('/settings')) return 'security';
  if (result.path.includes('/products')) return 'products';
  if (result.path.includes('/customers')) return 'customers';
  if (result.path.includes('/traffic') || result.path.includes('/campaigns')) {
    return 'trend';
  }
  if (result.path.includes('/decisions')) return 'decisions';

  return 'search';
}
