import { createHash } from "node:crypto";
import type { CanonicalOrderRecord } from "../../integrations/integrationDataCore.ts";
import { readEntity, readEntityString, readRowString } from "./command-center-metrics.real-source.ts";

/**
 * Pseudonymizes a raw customer reference (email / provider customer id --
 * see `normalizeOrder` in canonical-normalizer.ts) into a stable,
 * non-reversible display id. Privacy-by-design: the contract's
 * `customerPseudonym`/`ConsentStatus` fields exist precisely so raw PII
 * never has to reach the UI. Stable across calls (same input -> same
 * output) so the same real customer always resolves to the same pseudonym,
 * but the hash cannot be reversed back to the email/customer id.
 */
export function pseudonymizeCustomerReference(customerReference: string): string {
  const digest = createHash("sha256").update(customerReference).digest("hex");
  return `CUST-${digest.slice(0, 10).toUpperCase()}`;
}

export type ClassifiedCustomerOrder = {
  readonly customerReference: string;
  /** True only for the customer's chronologically-first qualifying order across the whole history supplied, not just the caller's reporting window. */
  readonly isFirstOrder: boolean;
  readonly order: CanonicalOrderRecord;
};

/**
 * Resolves each qualifying order's owning customer (via the canonical
 * `customerReference` entity field, which normalizeOrder already captures
 * from every provider -- see canonical-normalizer.ts) and whether it is
 * that customer's first-ever qualifying order ("new") or a later one
 * ("returning").
 *
 * This must be computed from the customer's FULL order history (however far
 * back `orders`/`rawRows` reach), never just the reporting window a caller
 * happens to be building a KPI for -- otherwise a long-time customer's order
 * during the window would be misclassified as "new" just because their
 * earlier orders fall outside it. Callers are responsible for fetching
 * `orders`/`rawRows` from a floor date, then filtering the *returned*
 * classification down to whatever window they actually want to report on.
 *
 * An order without a resolvable `customerReference` is dropped rather than
 * attributed to a fabricated "new" bucket -- this is the real, previously
 * unfixed gap: before this function existed, every qualifying order was
 * silently counted as "new" because the field it read (`customerType`) was
 * never written by any part of the ingestion pipeline.
 */
export function classifyCustomerOrders(
  orders: readonly CanonicalOrderRecord[],
  rawRows: readonly Record<string, unknown>[],
): readonly ClassifiedCustomerOrder[] {
  const customerReferenceByOrderId = new Map<string, string>();
  for (const row of rawRows) {
    const providerId = readRowString(row.provider_id);
    const externalId = readRowString(row.external_id);
    if (!providerId || !externalId) {
      continue;
    }
    const entity = readEntity(row.canonical_payload);
    const customerReference = readEntityString(entity, "customerReference");
    if (!customerReference) {
      continue;
    }
    customerReferenceByOrderId.set(`${providerId}:${externalId}`, customerReference);
  }

  const byCustomer = new Map<string, CanonicalOrderRecord[]>();
  for (const order of orders) {
    const customerReference = customerReferenceByOrderId.get(order.canonicalOrderId);
    if (!customerReference) {
      continue;
    }
    const list = byCustomer.get(customerReference) ?? [];
    list.push(order);
    byCustomer.set(customerReference, list);
  }

  const classified: ClassifiedCustomerOrder[] = [];
  for (const [customerReference, customerOrders] of byCustomer) {
    const sorted = [...customerOrders].sort((a, b) => (
      a.orderedAt < b.orderedAt ? -1 : a.orderedAt > b.orderedAt ? 1 : 0
    ));
    sorted.forEach((order, index) => {
      classified.push({ customerReference, isFirstOrder: index === 0, order });
    });
  }
  return classified;
}

/** Real-data floor: nothing in the canonical pipeline predates ingestion going live (same constant orders/products/campaigns detail lookups use). */
export const CUSTOMER_HISTORY_FLOOR = "2020-01-01T00:00:00.000Z";
