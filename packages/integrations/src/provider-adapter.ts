import type {
  IntegrationFailureClass,
  MvpIntegrationCatalogProviderId,
} from "@papadata/contracts";

export type ProviderFetchRequest = {
  readonly streams: readonly string[];
  readonly from: string | null;
  readonly to: string | null;
  readonly checkpoint: string | null;
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
