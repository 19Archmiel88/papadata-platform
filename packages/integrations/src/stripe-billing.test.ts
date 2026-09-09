import { describe, expect, it } from "vitest";
import { readPaymentMethodsConfig, resolveStripeCheckoutPaymentMethods } from "./stripe-billing.js";

// These two functions back the payment_method_types Stripe receives when
// BillingOperationsService.session() creates a checkout (see
// apps/api/src/production/platform-operations/billing-operations.service.ts). The
// checkout there always uses mode:'subscription', and Stripe's own payment-method-
// support docs (confirmed 2026-09-09) mark blik/p24/customer_balance as unsupported in
// that mode -- the tests below pin that exclusion down so a future change cannot
// silently start sending Stripe a combination it will reject.

describe("readPaymentMethodsConfig", () => {
  it("is fail-closed: every method is disabled when its env var is unset", () => {
    expect(readPaymentMethodsConfig({})).toEqual({
      card: false,
      blik: false,
      blikRecurring: false,
      fastBankTransfer: false,
      bankTransfer: false,
      applePay: false,
      googlePay: false,
    });
  });

  it("enables a method only for the exact string 'true', not truthy look-alikes", () => {
    const config = readPaymentMethodsConfig({
      PAYMENT_ENABLE_CARD: "true",
      PAYMENT_ENABLE_BLIK: "TRUE",
      PAYMENT_ENABLE_BLIK_RECURRING: "1",
      PAYMENT_ENABLE_FAST_TRANSFER: "yes",
    } as unknown as NodeJS.ProcessEnv);
    expect(config.card).toBe(true);
    expect(config.blik).toBe(false);
    expect(config.blikRecurring).toBe(false);
    expect(config.fastBankTransfer).toBe(false);
  });

  it("reads every PAYMENT_ENABLE_* flag from config/p0-integrations.env.example's shipped defaults (all 'true')", () => {
    const env = {
      PAYMENT_ENABLE_CARD: "true",
      PAYMENT_ENABLE_BLIK: "true",
      PAYMENT_ENABLE_BLIK_RECURRING: "true",
      PAYMENT_ENABLE_FAST_TRANSFER: "true",
      PAYMENT_ENABLE_BANK_TRANSFER: "true",
      PAYMENT_ENABLE_APPLE_PAY: "true",
      PAYMENT_ENABLE_GOOGLE_PAY: "true",
    } as unknown as NodeJS.ProcessEnv;
    expect(readPaymentMethodsConfig(env)).toEqual({
      card: true,
      blik: true,
      blikRecurring: true,
      fastBankTransfer: true,
      bankTransfer: true,
      applePay: true,
      googlePay: true,
    });
  });
});

describe("resolveStripeCheckoutPaymentMethods", () => {
  const allEnabled = {
    card: true,
    blik: true,
    blikRecurring: true,
    fastBankTransfer: true,
    bankTransfer: true,
    applePay: true,
    googlePay: true,
  };
  const allDisabled = {
    card: false,
    blik: false,
    blikRecurring: false,
    fastBankTransfer: false,
    bankTransfer: false,
    applePay: false,
    googlePay: false,
  };

  it("is deterministic for a given config (same input, same output, called twice)", () => {
    expect(resolveStripeCheckoutPaymentMethods(allEnabled)).toEqual(resolveStripeCheckoutPaymentMethods(allEnabled));
  });

  it("with every method enabled, only sends 'card' to Stripe -- blik/blik_recurring/fast_bank_transfer/traditional_bank_transfer are never subscription-checkout compatible", () => {
    const plan = resolveStripeCheckoutPaymentMethods(allEnabled);
    expect(plan.types).toEqual(["card"]);
  });

  it("with every method disabled, sends nothing to Stripe (an empty list, for the caller to reject rather than silently falling back)", () => {
    const plan = resolveStripeCheckoutPaymentMethods(allDisabled);
    expect(plan.types).toEqual([]);
  });

  it("still sends 'card' when only Apple Pay is enabled, since Apple Pay/Google Pay ride on the card payment method", () => {
    const plan = resolveStripeCheckoutPaymentMethods({ ...allDisabled, applePay: true });
    expect(plan.types).toEqual(["card"]);
    const card = plan.statuses.find((s) => s.method === "card");
    expect(card?.enabledByConfig).toBe(false);
    expect(card?.wiredToCheckout).toBe(true);
  });

  it("still sends 'card' when only Google Pay is enabled", () => {
    const plan = resolveStripeCheckoutPaymentMethods({ ...allDisabled, googlePay: true });
    expect(plan.types).toEqual(["card"]);
  });

  it("reports one status row per PaymentMethodType, each method appearing exactly once", () => {
    const plan = resolveStripeCheckoutPaymentMethods(allEnabled);
    const methods = plan.statuses.map((s) => s.method);
    expect(methods).toEqual(["card", "blik", "blik_recurring", "fast_bank_transfer", "traditional_bank_transfer", "apple_pay", "google_pay"]);
    expect(new Set(methods).size).toBe(methods.length);
  });

  it("never marks apple_pay/google_pay as wiredToCheckout, since this app cannot control or verify Stripe Dashboard wallet configuration", () => {
    const plan = resolveStripeCheckoutPaymentMethods(allEnabled);
    expect(plan.statuses.find((s) => s.method === "apple_pay")?.wiredToCheckout).toBe(false);
    expect(plan.statuses.find((s) => s.method === "google_pay")?.wiredToCheckout).toBe(false);
  });

  it("marks blik/blik_recurring/fast_bank_transfer/traditional_bank_transfer as configured but not wired, even when their flags are all on", () => {
    const plan = resolveStripeCheckoutPaymentMethods(allEnabled);
    for (const method of ["blik", "blik_recurring", "fast_bank_transfer", "traditional_bank_transfer"] as const) {
      const row = plan.statuses.find((s) => s.method === method);
      expect(row?.enabledByConfig).toBe(true);
      expect(row?.wiredToCheckout).toBe(false);
      expect(row?.note.length).toBeGreaterThan(0);
    }
  });

  it("reports enabledByConfig:false for every method when the config disables all of them", () => {
    const plan = resolveStripeCheckoutPaymentMethods(allDisabled);
    expect(plan.statuses.every((s) => s.enabledByConfig === false)).toBe(true);
  });
});
