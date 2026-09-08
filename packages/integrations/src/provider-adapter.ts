import type {
  IntegrationFailureClass,
  MvpIntegrationCatalogProviderId,
} from "@papadata/contracts";

export type ProviderFetchRequest = {
  readonly streams: readonly string[];
  readonly from: string | null;
  readonly to: string | null;
  readonly checkpoint: string | null;
  // Opaque, adapter-defined resume token for one page within this fetch's
  // [from, to] window -- null means "start from the first page." Passed
  // straight through from app.sync_jobs.resume_page_cursor by the pipeline
  // (see DurableIngestionPipeline.run in apps/worker), which persists
  // whatever this call returns as `nextPageCursor` after every page. An
  // adapter that doesn't paginate internally (still most of them -- see
  // `nextPageCursor` below) can ignore this field entirely.
  readonly pageCursor: string | null;
};

export type ProviderRecord = {
  readonly stream: string;
  readonly externalId: string;
  readonly observedAt: string;
  readonly payload: unknown;
};

export type ProviderFetchResult = {
  readonly records: readonly ProviderRecord[];
  readonly nextCheckpoint: string | null;
  readonly partial: boolean;
  readonly limitations: readonly string[];
  // Non-null means "this call returned exactly one page of a larger
  // result; call fetch() again with pageCursor set to this value to get the
  // next page." Null means "this call already returned everything for the
  // requested window" -- either because the adapter fetched all pages
  // internally in one call (the default, unchanged behavior for every
  // adapter that doesn't implement paging through this field yet) or
  // because this genuinely was the last page.
  readonly nextPageCursor: string | null;
};

export class ProviderAdapterError extends Error {
  readonly failureClass: IntegrationFailureClass;
  readonly retryAfterSeconds: number | null;

  constructor(
    message: string,
    failureClass: IntegrationFailureClass,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "ProviderAdapterError";
    this.failureClass = failureClass;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface IntegrationProviderAdapter {
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly requiredScopes: readonly string[];
  readonly optionalScopes: readonly string[];
  isConfigured(): boolean;
  verifyConnection(): Promise<void>;
  fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult>;
}
