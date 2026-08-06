import assert from "node:assert/strict";
import test from "node:test";
import {
  mapBillingStatus,
  resolveAccess,
  resolveBillingTaxDecision,
  resolveKsefReadinessMetadata,
} from "@papadata/contracts";

test("migrated access policy preserves billing and security precedence", () => {
  assert.deepEqual(resolveAccess({
    billingStatus: "PAST_DUE",
    membershipsCount: 1,
    hasMultipleTenants: false,
    activeTenantId: "tenant-1",
    securityBlocked: true,
    onboardingCompletedAt: new Date("2026-01-01T00:00:00Z"),
    entitlementsWrite: true,
  }), {
    accessState: "BLOCKED",
    accessMode: null,
    reasons: ["SECURITY_BLOCKED", "BILLING_PAST_DUE"],
  });
  assert.equal(mapBillingStatus("TRIALING"), "TRIAL");
});

test("migrated billing tax policy applies EU reverse charge only after validation", () => {
  const valid = resolveBillingTaxDecision({
    taxCountry: "DE",
    vatId: "DE123456789",
    isBusinessCustomer: true,
    vatValidationStatus: "valid",
  });
  assert.equal(valid.taxRegime, "eu_reverse_charge");
  assert.equal(valid.reverseChargeApplied, true);

  const unknown = resolveBillingTaxDecision({
    taxCountry: "DE",
    vatId: "DE123456789",
    isBusinessCustomer: true,
    vatValidationStatus: "unavailable",
  });
  assert.equal(unknown.taxRegime, "unknown");
  assert.equal(unknown.requiresReview, true);
});

test("KSeF readiness remains explicit and does not make a false production claim", () => {
  assert.deepEqual(resolveKsefReadinessMetadata({ taxCountry: "PL" }), {
    ksefStatus: "not_integrated",
    invoiceFormat: "ksef_not_integrated",
    ksefApiIntegrationImplemented: false,
  });
});
