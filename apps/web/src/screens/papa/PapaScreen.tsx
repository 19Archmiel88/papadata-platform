import {
  useMemo,
} from 'react';

import {
  InlineNotice,
} from '../../design-system';
import {
  usePapaAssistantRuntime,
  usePapaLabRuntime,
} from '../../shell/papa-assistant';
import {
  PapaWorkspace,
} from './PapaWorkspace';
import {
  findPapaScreenDefinition,
} from './papaData';
import {
  createPapaRuntimeData,
} from './papaRuntimeData';

export type PapaScreenProps = {
  readonly path?: string;
};

const PAPA_DEFAULT_SCREEN_PATH = '/app/papa/panel-kontekstowy-papa';

export function PapaScreen({
  path = '/app/papa',
}: PapaScreenProps) {
  const normalizedPath = path === '/app/papa' || path === '/app/papa/'
    ? PAPA_DEFAULT_SCREEN_PATH
    : path;
  const definition = findPapaScreenDefinition(normalizedPath);
  const {
    lastSnapshot,
    messages,
    reports,
    scope,
  } = usePapaAssistantRuntime();
  const labRuntime = usePapaLabRuntime({
    enabled: definition?.variant === 'lab',
  });
  const data = useMemo(() => createPapaRuntimeData({
    labRuntime: definition?.variant === 'lab' ? labRuntime : null,
    lastSnapshot,
    messages,
    reports,
    scope,
  }), [
    definition?.variant,
    labRuntime,
    lastSnapshot,
    messages,
    reports,
    scope,
  ]);

  if (!definition) {
    return (
      <InlineNotice
        message="Routing wskazuje ekran spoza zakresu Papa Asystenta."
        title="Nieobsługiwany ekran Papa"
        tone="critical"
      />
    );
  }

  return (
    <PapaWorkspace
      data={data}
      definition={definition}
      mode="runtime"
    />
  );
}
