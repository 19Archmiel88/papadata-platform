import { useCallback, useEffect, useRef, useState } from 'react';
import { applyReportCommand, parseReportsStore } from './SavedReports.store';
import { reportsActor, type ReportCommand, type ReportsStore } from './SavedReports.model';

export function useReportsStore(
  initial: ReportsStore,
  key: string | null,
  canManage: boolean,
  remoteCommit?: (command: ReportCommand) => Promise<ReportsStore>,
) {
  const initialRead = () => {
    try {
      const raw = key ? localStorage.getItem(key) : null;
      return { store: raw ? parseReportsStore(raw, initial.workspace) : initial, error: '' };
    } catch (error) {
      return {
        store: initial,
        error: error instanceof Error ? error.message : 'Nie można odczytać lokalnego zapisu.',
      };
    }
  };
  const [loaded] = useState(initialRead),
    [store, setStore] = useState(loaded.store),
    [readError, setReadError] = useState(loaded.error);
  const ref = useRef(store);
  ref.current = store;
  useEffect(() => {
    if (!key) {
      setStore(initial);
      ref.current = initial;
    }
  }, [initial, key]);
  useEffect(() => {
    if (!key) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key && event.key !== null) return;
      try {
        const raw = localStorage.getItem(key);
        const next = raw ? parseReportsStore(raw, initial.workspace) : initial;
        ref.current = next;
        setStore(next);
        setReadError('');
      } catch (error) {
        setReadError(error instanceof Error ? error.message : 'Nie można odczytać zmian.');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initial]);
  const commit = useCallback(
    async (command: ReportCommand) => {
      if (!canManage) throw new Error('Brak możliwości edycji w tym widoku.');
      if (readError)
        throw new Error(
          'Najpierw rozwiąż problem odczytu biblioteki. Oryginalny zapis pozostaje zachowany.',
        );
      if (remoteCommit) {
        const next = await remoteCommit(command);
        ref.current = next;
        setStore(next);
        return next;
      }
      const write = () => {
        const raw = key ? localStorage.getItem(key) : null;
        const current = raw ? parseReportsStore(raw, initial.workspace) : ref.current;
        const next = applyReportCommand(current, command, reportsActor, new Date().toISOString());
        const encoded = JSON.stringify(next);
        parseReportsStore(encoded, initial.workspace);
        if (key) {
          try {
            localStorage.setItem(key, encoded);
          } catch {
            throw new Error(
              'Nie udało się zapisać w przeglądarce. Formularz pozostaje otwarty. Zwolnij miejsce lub pobierz kopię szkicu.',
            );
          }
        }
        ref.current = next;
        setStore(next);
        return next;
      };
      return key && navigator.locks ? navigator.locks.request(key, write) : write();
    },
    [key, canManage, initial.workspace, readError, remoteCommit],
  );
  return { store, commit, readError };
}
