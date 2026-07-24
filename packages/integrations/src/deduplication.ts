import { randomUUID } from "node:crypto";
import type { OverlapCandidate } from "@papadata/contracts";

export type DeduplicationInput = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly providerId: string;
  readonly externalId: string;
  readonly orderNumber: string | null;
  readonly emailHash: string | null;
  readonly grossAmountMinor: bigint;
  readonly currency: string;
  readonly occurredAt: string;
};

export class CrossProviderDeduplicationService {
  compare(left: DeduplicationInput, right: DeduplicationInput): OverlapCandidate | null {
    if (left.tenantId !== right.tenantId || left.workspaceId !== right.workspaceId) {
      return null;
    }
    if (left.providerId === right.providerId) {
      return null;
    }

    const signals: string[] = [];
    let score = 0;
    if (left.orderNumber && left.orderNumber === right.orderNumber) {
      signals.push("order_number");
      score += 0.55;
    }
    if (left.emailHash && left.emailHash === right.emailHash) {
      signals.push("email_hash");
      score += 0.15;
    }
    if (left.grossAmountMinor === right.grossAmountMinor && left.currency === right.currency) {
      signals.push("amount_currency");
      score += 0.2;
    }
    const timeDistance = Math.abs(
      new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
    );
    if (timeDistance <= 15 * 60 * 1000) {
      signals.push("time_window");
      score += 0.1;
    }

    if (score < 0.4) return null;
    return {
      tenantId: left.tenantId as OverlapCandidate["tenantId"],
      workspaceId: left.workspaceId as OverlapCandidate["workspaceId"],
      candidateId: randomUUID(),
      leftProviderId: left.providerId as OverlapCandidate["leftProviderId"],
      leftExternalId: left.externalId,
      rightProviderId: right.providerId as OverlapCandidate["rightProviderId"],
      rightExternalId: right.externalId,
      score,
      matchingSignals: signals,
      state: score >= 0.85 ? "automatic_match" : "manual_review",
      deduplicationVersion: "cross-provider.v1",
    };
  }
}
