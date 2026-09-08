import { Inject, Injectable, Logger } from "@nestjs/common";
import { readProductionConfig } from "../config.js";
import { PlatformQueueService } from "../queue/platform-queue.service.js";
import {
  parseStripeWebhookEvent,
  verifyStripeSignature,
} from "./stripe-webhook.js";

export type StripeWebhookOutcome =
  | { readonly status: "accepted"; readonly eventId: string }
  | { readonly status: "rejected"; readonly reason: string };

/**
 * Thin by design: verifies the signature (the only part of this flow that's
 * fully testable without a real Stripe account), then hands the raw event
 * off to the SAME papadata-platform-jobs queue the reconciliation/retention/
 * report jobs already use. The actual DB writes happen in
 * PlatformWorkerService.processStripeWebhook (apps/worker), which already
 * holds a bypass-RLS PlatformDatabase connection -- an inbound webhook
 * generally does not know which tenant/workspace it belongs to until it
 * looks up a Stripe customer/subscription id, and apps/api's ProductionDatabase
 * intentionally never gets that bypass (see PlatformDatabase's own doc
 * comment: "must never be reused by API or BFF request handling").
 */
@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    @Inject(PlatformQueueService) private readonly queue: PlatformQueueService,
  ) {}

  async receive(input: {
    readonly rawBody: Buffer;
    readonly signatureHeader: string | null | undefined;
  }): Promise<StripeWebhookOutcome> {
    const config = readProductionConfig();
    if (!config.stripeWebhookSecret) {
      this.logger.warn("Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured.");
      return { status: "rejected", reason: "stripe_not_configured" };
    }

    const verification = verifyStripeSignature({
      rawBody: input.rawBody,
      signatureHeader: input.signatureHeader,
      webhookSecret: config.stripeWebhookSecret,
    });
    if (!verification.valid) {
      this.logger.warn(`Rejected Stripe webhook: ${verification.reason}`);
      return { status: "rejected", reason: verification.reason };
    }

    const event = parseStripeWebhookEvent(input.rawBody);
    if (!event) {
      return { status: "rejected", reason: "unparseable_event" };
    }

    await this.queue.enqueue({
      jobType: "stripe_webhook",
      tenantId: "system",
      workspaceId: null,
      payload: {
        stripeEventId: event.id,
        stripeEventType: event.type,
        stripeObject: event.data.object,
      },
      idempotencyKey: `stripe-webhook:${event.id}`,
    });

    return { status: "accepted", eventId: event.id };
  }
}
