import {
  InlineNotice,
} from '../../design-system';
import {
  PapaWorkspace,
} from './PapaWorkspace';
import {
  createPapaStorybookData,
  findPapaScreenDefinition,
} from './papaData';

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
      data={createPapaStorybookData()}
      definition={definition}
    />
  );
}
