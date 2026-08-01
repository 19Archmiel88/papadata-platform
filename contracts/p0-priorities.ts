export const MVP_INTEGRATIONS = ["woocommerce","shopify","baselinker","allegro","google_ads","meta_ads","ga4"] as const;
export const BILLING_CYCLES = ["monthly","annual"] as const;
export const MVP_PAYMENT_METHODS = ["card","blik","blik_recurring","fast_bank_transfer","traditional_bank_transfer","apple_pay","google_pay"] as const;
export const P0_PRIORITY_IDS = ["P0-01","P0-02","P0-03","P0-04","P0-05","P0-06","P0-07","P0-08","P0-09","P0-10","P0-11","P0-12"] as const;
export type MvpIntegration = typeof MVP_INTEGRATIONS[number];
export type BillingCycle = typeof BILLING_CYCLES[number];
export type MvpPaymentMethod = typeof MVP_PAYMENT_METHODS[number];
