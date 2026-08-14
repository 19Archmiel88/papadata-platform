import type {
  ReactNode,
} from 'react';

import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../presentation/StoryPresentation';
import '../presentation/story-presentation.css';
import './production-screen.css';

export type ProductionStoryContract = {
  readonly displayTitle: string;
  readonly documentPath: string;
  readonly id: string;
  readonly operationId?: string | null;
  readonly owner?: string | null;
  readonly productionStatus?: string | null;
  readonly sectionId?: string | null;
  readonly sectionLabel: string;
  readonly status?: string | null;
  readonly summary: string;
};

export type ProductionStoryShellProps = {
  readonly canvasSummary?: string;
  readonly canvasTitle?: string;
  readonly children: ReactNode;
  readonly contract: ProductionStoryContract;
  readonly wrapCanvas?: boolean;
};

export function ProductionStoryShell({
  canvasSummary = 'Canvas pokazuje docelowy interfejs produktu z lokalnym fixture Storybooka. Warstwa dokumentacyjna pozostaje poza ekranem aplikacji.',
  canvasTitle = 'Ekran produkcyjny',
  children,
  contract,
  wrapCanvas = true,
}: ProductionStoryShellProps) {
  return (
    <StoryPresentationPage
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={`Status story ${contract.id}`}
          items={[
            { label: 'Owner', value: contract.owner ?? 'Product' },
            { label: 'Status', value: contract.status ?? contract.productionStatus ?? 'runtime + target states' },
            { label: 'OperationId', value: contract.operationId ?? 'brak - Storybook/policy' },
            { label: 'Dokument', value: `docs/specyfikacja-docelowa/${contract.documentPath}` },
          ]}
        />
      )}
      sectionCode={contract.sectionId ?? contract.id.split('.')[0]}
      sectionLabel={contract.sectionLabel}
      storyId={contract.id}
      summary={contract.summary}
      title={contract.displayTitle}
    >
      {wrapCanvas ? (
        <StoryPresentationSection
          index={contract.id.split('.')[1] ?? '01'}
          layout="full"
          summary={canvasSummary}
          title={canvasTitle}
        >
          {children}
        </StoryPresentationSection>
      ) : children}
    </StoryPresentationPage>
  );
}

export type ProductionScreenCanvasProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly label: string;
  readonly mode?: 'runtime' | 'storybook';
  readonly screenId: string;
  readonly variant: string;
};

export function ProductionScreenCanvas({
  children,
  className,
  label,
  mode = 'storybook',
  screenId,
  variant,
}: ProductionScreenCanvasProps) {
  const rootClassName = [
    'pd-production-canvas',
    className,
  ].filter(Boolean).join(' ');

  return (
    <section
      aria-label={label}
      className={rootClassName}
      data-mode={mode}
      data-production-canvas="true"
      data-screen-id={screenId}
      data-screen-variant={variant}
    >
      {children}
    </section>
  );
}
