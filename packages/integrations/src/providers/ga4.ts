import type { IntegrationProviderAdapter, ProviderFetchRequest, ProviderFetchResult } from "../provider-adapter.js";
import { ProviderAdapterError } from "../provider-adapter.js";

export type Ga4AdapterConfig = {
  readonly propertyId: string;
  readonly accessToken: string;
};

export class Ga4Adapter implements IntegrationProviderAdapter {
  readonly providerId = "ga4" as const;
  readonly requiredScopes = ["https://www.googleapis.com/auth/analytics.readonly"] as const;
  readonly optionalScopes = [] as const;

  private readonly config: Ga4AdapterConfig | null;

  constructor(config: Ga4AdapterConfig | null) {
    this.config = config;
  }

  isConfigured(): boolean {
    return Boolean(this.config?.propertyId && this.config.accessToken);
  }

  async verifyConnection(): Promise<void> {
    await this.runReport({
      dateRanges: [{ startDate: "yesterday", endDate: "today" }],
      metrics: [{ name: "sessions" }],
    });
  }

  async fetch(request: ProviderFetchRequest): Promise<ProviderFetchResult> {
    const startDate = request.from?.slice(0, 10) ?? "30daysAgo";
    const endDate = request.to?.slice(0, 10) ?? "today";
    const payload = await this.runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "conversions" },
        { name: "purchaseRevenue" },
      ],
      limit: "100000",
    });
    return {
      records: [{
        stream: "traffic",
        externalId: `${startDate}:${endDate}`,
        observedAt: new Date().toISOString(),
        payload,
      }],
      nextCheckpoint: endDate,
      partial: false,
      limitations: [],
    };
  }

  private async runReport(body: object): Promise<unknown> {
    if (!this.config) {
      throw new ProviderAdapterError("GA4 is not configured", "authentication");
    }
    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${this.config.propertyId}:runReport`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (response.status === 429) {
      throw new ProviderAdapterError("GA4 rate limit", "rate_limit", 60);
    }
    if (response.status >= 500) {
      throw new ProviderAdapterError("GA4 temporary failure", "transient", 30);
    }
    if (!response.ok) {
      throw new ProviderAdapterError(`GA4 request failed: ${response.status}`, "permanent");
    }
    return response.json();
  }
}
