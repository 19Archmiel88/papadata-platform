import {
  useMemo,
  useState,
} from 'react';

import {
  Dialog,
  EmptyState,
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

  return (
    <Dialog
      className="pd-product-shell__command-dialog"
      closeOnBackdrop
      closeOnEscape
      description="Global search i Command Palette obsługiwane klawiaturą."
      modal
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      open={open}
      title="Szukaj lub uruchom komendę"
    >
      <div className="pd-product-shell__command-palette">
        <TextField
          autocomplete="off"
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
            {results.map((result) => (
              <button
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
                <span>{result.section}</span>
                <strong>{result.label}</strong>
                <small>{result.description}</small>
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
