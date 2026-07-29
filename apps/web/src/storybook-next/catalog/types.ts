export type PapaDataStoryClass =
  | 'reference'
  | 'component'
  | 'pattern'
  | 'shell'
  | 'screen'
  | 'flow';

export type CatalogSourceStatus =
  | 'accepted'
  | 'specified';

export type CatalogDocumentationStatus =
  | 'planned'
  | 'draft'
  | 'review'
  | 'accepted'
  | 'deprecated';

export type CatalogPrototypeStatus =
  | 'none'
  | 'draft'
  | 'in_progress'
  | 'review'
  | 'implemented'
  | 'deprecated';

export type CatalogProductionStatus =
  | 'not_started'
  | 'in_progress'
  | 'review'
  | 'implemented'
  | 'deprecated';

export type CatalogTestStatus =
  | 'not_started'
  | 'partial'
  | 'passing'
  | 'failing'
  | 'blocked';

export type CatalogStoryStatus =
  | 'planned'
  | 'implemented'
  | 'deprecated';

export type CatalogStoryVisibility =
  | 'visible'
  | 'hidden';

export type CatalogEntryDefinition = {
  readonly id: string;
  readonly title: string;
  readonly displayTitle: string;
  readonly sectionId: string;
  readonly sectionTitle: string;
  readonly displaySectionTitle: string;
  readonly folder: string;
  readonly storyClass: PapaDataStoryClass;
  readonly owner: string;
  readonly layer: string;
  readonly note: string | null;
  readonly group: string | null;
  readonly sourceStatus: CatalogSourceStatus;
  readonly documentationStatus:
    CatalogDocumentationStatus;
  readonly prototypeStatus:
    CatalogPrototypeStatus;
  readonly productionStatus:
    CatalogProductionStatus;
  readonly testStatus: CatalogTestStatus;
  readonly storyStatus: CatalogStoryStatus;
  readonly storyVisibility:
    CatalogStoryVisibility;
  readonly requirements: readonly string[];
  readonly storyTitle: string | null;
  readonly storyFile: string | null;
  readonly storyExport?: string;
};
