import { createHash } from 'node:crypto';
import type { KsefInvoiceReference, KsefInvoiceStatus } from '@papadata/contracts';

/** BillingOperationsService.read (billing-operations.service.ts) is the only intended
 * caller -- it derives a KSeF status per Stripe invoice from that invoice's own id and
 * creation time. There is no local invoices table: billing-operations.service.ts already
 * re-fetches the invoice list live from Stripe on every read, so `localInvoiceId` below is
 * always a Stripe invoice id (`in_...`), not a separate KSeF-side identifier. */
export type KsefEnv = 'demo' | 'production';
export type KsefAuthMode = 'certificate';
export type KsefRetryPolicy = 'none' | 'exponential';

export type KsefConfig = {
 readonly env: KsefEnv;
 readonly baseUrl: string | null;
 readonly authMode: KsefAuthMode;
 readonly certificateRef: string | null;
 readonly nipContext: string | null;
 readonly timeoutMs: number;
 readonly retryPolicy: KsefRetryPolicy;
};

/** Unlike readGusBirConfig/readStripeBillingConfig, this never throws: a malformed or
 * absent KSEF_* var must degrade the billing overview's ksefStatus to "not configured", not
 * take down the whole billing page (see BillingOperationsService.read, which already wraps
 * riskier sections in try/catch for the same reason). A malformed KSEF_BASE_URL is therefore
 * treated the same as an absent one. */
export function readKsefConfig(env: NodeJS.ProcessEnv = process.env): KsefConfig {
 const parsedEnv: KsefEnv = env.KSEF_ENV === 'production' ? 'production' : 'demo';
 const timeoutMs = Number(env.KSEF_TIMEOUT_MS || '30000');
 const retryPolicy: KsefRetryPolicy = env.KSEF_RETRY_POLICY === 'none' ? 'none' : 'exponential';
 let baseUrl: string | null = null;
 if (env.KSEF_BASE_URL) {
  try {
   const url = new URL(env.KSEF_BASE_URL);
   if (url.protocol === 'https:' && !url.username && !url.password) baseUrl = url.origin + url.pathname.replace(/\/$/, '');
  } catch {
   // Malformed KSEF_BASE_URL -- treated as "not configured", see doc comment above.
  }
 }
 const nipContext = typeof env.KSEF_NIP_CONTEXT === 'string' && env.KSEF_NIP_CONTEXT.trim().length > 0 ? env.KSEF_NIP_CONTEXT.trim() : null;
 return {
  env: parsedEnv,
  baseUrl,
  authMode: 'certificate',
  certificateRef: env.KSEF_CERTIFICATE_REF || null,
  nipContext,
  timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30000,
  retryPolicy,
 };
}

export type KsefAdapterFailureCode = 'not_connected' | 'not_implemented';

export type KsefAdapterResult =
 | { readonly ok: true; readonly reference: KsefInvoiceReference }
 | { readonly ok: false; readonly code: KsefAdapterFailureCode; readonly message: string };

export type KsefInvoiceInput = {
 readonly localInvoiceId: string;
 readonly createdAt: string;
};

/** Thin adapter over KSeF (Krajowy System e-Faktur), structurally mirroring
 * GusBirAdapter in gus-bir-adapter.ts: a config type, an explicit mode, and a
 * discriminated success/failure result shape, with no KSeF SDK or network call
 * reachable from domain code -- only this adapter (and its two mode-specific
 * functions below) knows how a status is actually produced. */
export class KsefAdapter {
 readonly config: KsefConfig;

 constructor(config: KsefConfig) {
  this.config = config;
 }

 async statusFor(invoice: KsefInvoiceInput, now: Date = new Date()): Promise<KsefAdapterResult> {
  if (this.config.env === 'demo') return demoStatusFor(invoice, now);
  if (!this.config.baseUrl || !this.config.certificateRef) {
   return { ok: false, code: 'not_connected', message: 'KSeF is not configured (KSEF_BASE_URL and/or KSEF_CERTIFICATE_REF are missing).' };
  }
  return productionStatusFor(invoice, this.config);
 }
}

// -----------------------------------------------------------------------
// DEMO MODE -- deterministic, network-free lifecycle simulation. The same
// localInvoiceId+createdAt pair always reaches the same phase at the same wall-clock
// distance from createdAt, so a test can freeze `now` and assert a fixed status --
// the same determinism principle as gus-bir-adapter.ts's mockLookup, applied to a
// lifecycle instead of a single registry record. This only ever walks the
// draft -> ready_for_ksef -> submitted -> accepted happy path, on a fixed schedule
// measured from the invoice's own creation time; it never produces
// rejected/offline_pending/correction_required, which remain real values of
// KsefInvoiceReference['status'] for a future production integration to reach.
// This is a demonstration of the shape of the flow, NOT a real KSeF integration --
// see productionStatusFor below for the real thing's status.
// -----------------------------------------------------------------------

const DEMO_PHASES: ReadonlyArray<{ readonly afterMinutes: number; readonly status: KsefInvoiceStatus }> = [
 { afterMinutes: 0, status: 'draft' },
 { afterMinutes: 2, status: 'ready_for_ksef' },
 { afterMinutes: 5, status: 'submitted' },
 { afterMinutes: 10, status: 'accepted' },
];

// Confirm the current KSeF logical structure (schema) version before any real submission --
// this is a demo-mode placeholder constant, not verified against a live KSeF schema registry
// in this session.
const KSEF_DEMO_SCHEMA_VERSION = 'FA(2)';

function demoStatusFor(invoice: KsefInvoiceInput, now: Date): KsefAdapterResult {
 const createdMs = Date.parse(invoice.createdAt);
 const elapsedMinutes = Number.isFinite(createdMs) ? Math.max(0, (now.getTime() - createdMs) / 60_000) : 0;
 let phase = DEMO_PHASES[0]!;
 for (const candidate of DEMO_PHASES) {
  if (elapsedMinutes >= candidate.afterMinutes) phase = candidate;
 }
 const submitted = phase.status === 'submitted' || phase.status === 'accepted';
 const accepted = phase.status === 'accepted';
 // Demo-only identifiers -- deliberately prefixed so neither can be mistaken for a real
 // KSeF reference number or UPO if it leaks into a screenshot or bug report, the same
 // discipline gus-bir-adapter.ts's mockLookup applies to its "[DANE TESTOWE]" marker.
 const digest = createHash('sha256').update(`ksef-demo:${invoice.localInvoiceId}`).digest('hex');
 const ksefNumber = submitted ? `DEMO-KSEF-${digest.slice(0, 24).toUpperCase()}` : null;
 const upoReference = accepted ? `DEMO-UPO-${digest.slice(24, 40).toUpperCase()}` : null;
 const submittedAt = submitted && Number.isFinite(createdMs) ? new Date(createdMs + 5 * 60_000).toISOString() : null;
 const acceptedAt = accepted && Number.isFinite(createdMs) ? new Date(createdMs + 10 * 60_000).toISOString() : null;
 return {
  ok: true,
  reference: {
   localInvoiceId: invoice.localInvoiceId,
   ksefNumber,
   status: phase.status,
   schemaVersion: KSEF_DEMO_SCHEMA_VERSION,
   submittedAt,
   acceptedAt,
   upoReference,
  },
 };
}

// -----------------------------------------------------------------------
// PRODUCTION MODE -- intentionally NOT implemented in this session. A real KSeF
// integration needs a qualified certificate (or KSeF token) issued through the Polish
// Ministry of Finance, plus a verified SOAP/REST client against the government's real
// API -- this session has neither, so this function makes no network call and
// fabricates no result. This mirrors how gus-bir-adapter.ts's own production path
// looked before that adapter's real GUS/BIR SOAP client was verified and built earlier
// in this same session (see gus-bir-adapter.ts's production section comment): present,
// typed, and wired into the service, but explicitly refusing to pretend to succeed.
//
// Starting points for the real implementation, to verify before use -- UNCONFIRMED
// beyond being the Ministry of Finance's published KSeF entry points, since the API
// version/auth flow/schema are known to change between KSeF rollout phases:
//  - Test environment:       https://ksef-test.mf.gov.pl
//  - Production environment: https://ksef.mf.gov.pl
// -----------------------------------------------------------------------
function productionStatusFor(_invoice: KsefInvoiceInput, _config: KsefConfig): Promise<KsefAdapterResult> {
 return Promise.resolve({
  ok: false,
  code: 'not_implemented',
  message: 'KSeF production mode is configured but not implemented in this build. A verified certificate-based client is required before invoices can be submitted to or queried from the real KSeF API.',
 });
}
