import { useState } from 'react';

import { StoryPresentationMeta, StoryPresentationPage } from '../../../presentation/StoryPresentation';
import { AnalyticsAndDecisionsSection } from './sections/AnalyticsAndDecisionsSection';
import { DataOperationsSection } from './sections/DataOperationsSection';
import { LayersAndFeedbackSection } from './sections/LayersAndFeedbackSection';
import { OperationalQualitySection } from './sections/OperationalQualitySection';
import { OrientationAndFiltersSection } from './sections/OrientationAndFiltersSection';
import { RuntimeCoverageSection } from './sections/RuntimeCoverageSection';
import { componentIds, type EvidenceAction } from './runtime-context-data';
import { readLocale, readTheme } from './runtime-context-env';

export function RuntimeContextDocument() {
  const [actions, setActions] = useState<readonly EvidenceAction[]>([]);

  const pushEvidence = (label: string) => {
    setActions((currentActions) => [
      {
        id: `${Date.now()}-${label}`,
        label,
      },
      ...currentActions,
    ].slice(0, 6));
  };

  return (
    <StoryPresentationPage
      className="pd-c83-document"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry dokumentu realnych komponentów"
          items={[
            { label: 'Story', value: '00.24' },
            { label: 'Komponenty', value: componentIds.length },
            { label: 'Motyw', value: readTheme() === 'dark' ? 'dark' : 'light' },
            { label: 'Język', value: readLocale().toUpperCase() },
          ]}
        />
      )}
      sectionCode="00"
      sectionLabel="Fundamenty"
      storyId="00.24"
      summary="Dokument renderuje wymagane komponenty w przepływach roboczych. Każdy moduł pokazuje komponent w zadaniu, z separatorem zakresu i dowodem działania po interakcji."
      title="Realne konteksty 83 komponentów"
    >
      <OrientationAndFiltersSection pushEvidence={pushEvidence} />
      <DataOperationsSection pushEvidence={pushEvidence} />
      <AnalyticsAndDecisionsSection pushEvidence={pushEvidence} />
      <OperationalQualitySection pushEvidence={pushEvidence} />
      <LayersAndFeedbackSection pushEvidence={pushEvidence} />
      <RuntimeCoverageSection actions={actions} />
    </StoryPresentationPage>
  );
}
