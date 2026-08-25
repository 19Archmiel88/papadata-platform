import {
  useMemo,
} from 'react';

import {
  InlineNotice,
} from '../../design-system';
import {
  usePapaAssistantRuntime,
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

export function PapaScreen({
  path = '/app/papa/panel-kontekstowy-papa',
}: PapaScreenProps) {
  const normalizedPath = path === '/app/papa'
    ? '/app/papa/panel-kontekstowy-papa'
    : path;
  const definition = findPapaScreenDefinition(normalizedPath);
  const {
    lastSnapshot,
    messages,
    reports,
    scope,
  } = usePapaAssistantRuntime();
  const data = useMemo(() => createPapaRuntimeData({
    lastSnapshot,
    messages,
    reports,
    scope,
  }), [
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
