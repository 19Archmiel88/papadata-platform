import { Inject } from "@nestjs/common";
import { Controller, Headers, Param, ParseUUIDPipe, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { MvpIntegrationCatalogProviderId } from "@papadata/contracts";
import { ExternalProviderEndpoint, OperationId } from "../auth/route-policy.js";
import { fallbackEventId, WebhookService } from "./webhook.service.js";

@Controller("v1/integrations/webhooks")
export class WebhookController {
  constructor(@Inject(WebhookService) private readonly service: WebhookService) {}

  @Post(":provider/:connectionId")
  @OperationId("integrations.webhooks.receive")
  @ExternalProviderEndpoint()
  receive(
    @Param("provider") provider: MvpIntegrationCatalogProviderId,
    @Param("connectionId", new ParseUUIDPipe({ version: "4" })) connectionId: string,
    @Req() request: FastifyRequest & { rawBody?: Buffer },
    @Headers("x-wc-webhook-signature") wooSignature?: string,
    @Headers("x-shopify-hmac-sha256") shopifySignature?: string,
    @Headers("x-hub-signature-256") metaSignature?: string,
    @Headers("x-wc-webhook-delivery-id") wooEventId?: string,
    @Headers("x-shopify-event-id") shopifyEventId?: string,
    @Headers("x-meta-event-id") metaEventId?: string,
    @Headers("x-shopify-triggered-at") triggeredAt?: string,
  ): Promise<object> {
    const signature = wooSignature ?? shopifySignature ?? metaSignature ?? "";
    const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}), "utf8");
    const providerEventId = wooEventId
      ?? shopifyEventId
      ?? metaEventId
      ?? fallbackEventId({ providerId: provider, connectionId, rawBody });
    return this.service.receive({
      providerId: provider,
      connectionId,
      rawBody,
      signature,
      providerEventId,
      providerTimestamp: triggeredAt ?? null,
    });
  }
}
