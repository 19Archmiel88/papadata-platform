import { StoryPresentationSection } from '../../../../presentation/StoryPresentation';
import { EvidenceLog } from '../RuntimeSequence';
import { componentIds, type EvidenceAction } from '../runtime-context-data';

type RuntimeCoverageSectionProps = {
  readonly actions: readonly EvidenceAction[];
};

export function RuntimeCoverageSection({
  actions,
}: RuntimeCoverageSectionProps) {
  return (
    <StoryPresentationSection
      index="06"
      layout="wide"
      summary="Lista komponentów jest tylko kontrolą zakresu. Dowodem są realne renderowania w modułach powyżej i interakcje zapisane w logu działania."
      title="Zakres 83 komponentów"
    >
      <div className="pd-c83-scope" aria-label="Zakres komponentów renderowanych w dokumencie">
        {componentIds.map((componentId) => (
          <span key={componentId}>{componentId}</span>
        ))}
      </div>
      <EvidenceLog actions={actions} />
    </StoryPresentationSection>
  );
}
