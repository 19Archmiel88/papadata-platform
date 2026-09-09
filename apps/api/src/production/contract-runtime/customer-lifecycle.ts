import { createHash } from "node:crypto";
import type { CanonicalOrderRecord } from "../../integrations/integrationDataCore.ts";
import { readEntity, readEntityString, readRowString } from "./command-center-metrics.real-source.ts";

/**
 * Legacy deterministic display ID. Raw PII is not sent to the UI, but an
 * unkeyed, truncated hash is pseudonymization, NOT anonymization: predictable
 * emails/provider IDs can be tested by dictionary lookup. Replacing it with
 * keyed/workspace-scoped IDs needs an explicit identity/link migration.
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
  const { references: customerReferenceByOrderId } = resolveCustomerReferences(rawRows);

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

/** Conservative resolver: never merge equal provider IDs from independent accounts. */
function resolveCustomerReferences(rawRows:readonly Record<string,unknown>[]) {
  const byOrder=new Map<string,{reference:string;source:string}>(),ambiguous=new Set<string>();
  const sourcesByReference=new Map<string,Set<string>>();
  for(const row of rawRows){
    const provider=readRowString(row.provider_id),external=readRowString(row.external_id);
    const reference=readEntityString(readEntity(row.canonical_payload),'customerReference');
    if(!provider||!external||!reference)continue;
    const source=readRowString(row.connection_id)??provider,key=`${provider}:${external}`,previous=byOrder.get(key);
    if(previous&&(previous.reference!==reference||previous.source!==source))ambiguous.add(key);
    byOrder.set(key,{reference,source});
    const sources=sourcesByReference.get(reference)??new Set<string>();sources.add(source);sourcesByReference.set(reference,sources);
  }
  const collisions=new Set([...sourcesByReference].filter(([,sources])=>sources.size>1).map(([reference])=>reference));
  const references=new Map<string,string>();
  for(const [key,item] of byOrder){if(collisions.has(item.reference))ambiguous.add(key);if(!ambiguous.has(key))references.set(key,item.reference);}
  return {references,ambiguous,conflictGroups:collisions.size};
}
export function customerIdentityDiagnostics(orders:readonly CanonicalOrderRecord[],rawRows:readonly Record<string,unknown>[]){
  const resolved=resolveCustomerReferences(rawRows);
  let missingReferenceOrders=0,ambiguousOrders=0;
  for(const order of orders){if(resolved.ambiguous.has(order.canonicalOrderId))ambiguousOrders++;else if(!resolved.references.has(order.canonicalOrderId))missingReferenceOrders++;}
  return {missingReferenceOrders,ambiguousOrders,conflictGroups:resolved.conflictGroups};
}

/** Query floor, NOT a guarantee that every source has imported history since this date. */
export const CUSTOMER_HISTORY_FLOOR = "2020-01-01T00:00:00.000Z";
