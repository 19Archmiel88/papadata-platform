import { BadRequestException, Controller, Headers, Post, Req } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { ExternalProviderEndpoint, OperationId } from "../auth/route-policy.js";
import { StripeWebhookService } from "./stripe-webhook.service.js";

@Controller("v1/billing/stripe")
export class StripeWebhookController {
  constructor(
    @Inject(StripeWebhookService) private readonly service: StripeWebhookService,
  ) {}

  @Post("webhook")
  @OperationId("billing.stripe.webhook.receive")
  @ExternalProviderEndpoint()
  async receive(
    @Req() request: FastifyRequest & { rawBody?: Buffer },
    @Headers("stripe-signature") signatureHeader?: string,
  ): Promise<object> {
    const rawBody = request.rawBody
      ?? Buffer.from(JSON.stringify(request.body ?? {}), "utf8");
    const outcome = await this.service.receive({ rawBody, signatureHeader });

    if (outcome.status === "rejected") {
      throw new BadRequestException({ code: outcome.reason });
    }

    return { data: { received: true, eventId: outcome.eventId } };
  }
}
