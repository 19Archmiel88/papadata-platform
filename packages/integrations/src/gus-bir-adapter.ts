import { createHash } from 'node:crypto';
import type { CompanyProfile } from '@papadata/contracts';

/** company.lookup's caller (contract-runtime.service.ts) already validates
 * the NIP checksum via @papadata/contracts' isValidNip before calling this
 * adapter -- lookup() trusts `nip` is already a normalized 10-digit string. */
export type GusBirMode = 'mock' | 'test' | 'production';

export type GusBirConfig = {
 readonly mode: GusBirMode;
 readonly baseUrl: string | null;
 readonly apiKey: string | null;
 readonly timeoutMs: number;
 readonly cacheTtlSeconds: number;
};

export type GusBirLookupSuccess = {
 readonly ok: true;
 /** Exact adapter response, unmodified -- persisted verbatim to the audit
  * table by the caller. Never trust this shape beyond JSON-serializability. */
 readonly rawPayload: unknown;
 readonly normalized: CompanyProfile;
 readonly source: 'gus_bir';
 readonly retrievedAt: string;
};

export type GusBirLookupErrorCode = 'timeout' | 'not_found' | 'rate_limited' | 'upstream_error';

export type GusBirLookupFailure = {
 readonly ok: false;
 readonly code: GusBirLookupErrorCode;
 readonly message: string;
};

export type GusBirLookupResult = GusBirLookupSuccess | GusBirLookupFailure;

export function readGusBirConfig(env: NodeJS.ProcessEnv = process.env): GusBirConfig {
 const mode: GusBirMode = env.GUS_BIR_MODE === 'production' || env.GUS_BIR_MODE === 'test' ? env.GUS_BIR_MODE : 'mock';
 const timeoutMs = Number(env.GUS_BIR_TIMEOUT_MS || '10000');
 const cacheTtlSeconds = Number(env.GUS_BIR_CACHE_TTL_SECONDS || '86400');
 if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 60_000) {
  throw new Error('GUS_BIR_TIMEOUT_MS must be a positive integer up to 60000.');
 }
 if (!Number.isFinite(cacheTtlSeconds) || cacheTtlSeconds <= 0) {
  throw new Error('GUS_BIR_CACHE_TTL_SECONDS must be a positive integer.');
 }
 let baseUrl: string | null = null;
 if (mode === 'production') {
  if (!env.GUS_BIR_BASE_URL || !env.GUS_BIR_API_KEY) {
   throw new Error('GUS_BIR_BASE_URL and GUS_BIR_API_KEY are required when GUS_BIR_MODE=production.');
  }
  const url = new URL(env.GUS_BIR_BASE_URL);
  if (url.protocol !== 'https:' || url.username || url.password) {
   throw new Error('GUS_BIR_BASE_URL must be a plain HTTPS origin.');
  }
  baseUrl = url.origin + url.pathname.replace(/\/$/, '');
 }
 return { mode, baseUrl, apiKey: env.GUS_BIR_API_KEY || null, timeoutMs, cacheTtlSeconds };
}

/** Thin adapter over the GUS/BIR (REGON) company registry. company.lookup
 * (contract-runtime.service.ts) is the only caller -- the UI never reaches
 * this class or the network directly (see DOC-P0-005). */
export class GusBirAdapter {
 readonly config: GusBirConfig;

 constructor(config: GusBirConfig) {
  this.config = config;
 }

 async lookup(nip: string): Promise<GusBirLookupResult> {
  if (this.config.mode === 'production') return productionLookup(nip, this.config);
  return Promise.resolve(mockLookup(nip, this.config.mode));
 }
}

// Deterministic, network-free stand-in for both `mock` (local/dev) and
// `test` (QA) modes -- same NIP always yields the same company, so UI and
// integration tests can assert on a fixed result. `test` mode additionally
// marks the payload so a QA record can never be mistaken for production
// registry data if it leaks into a screenshot or bug report.
function mockLookup(nip: string, mode: 'mock' | 'test'): GusBirLookupResult {
 // A NIP ending in four zeros is reserved as the deterministic "no record"
 // fixture, so the not-found/manual-fallback path is exercisable without a
 // real registry -- see DOC-P0-005 step 5.
 if (nip.endsWith('0000')) {
  return { ok: false, code: 'not_found', message: `GUS/BIR: no registry record for NIP ${nip}.` };
 }
 const digest = createHash('sha256').update(`gus-bir:${mode}:${nip}`).digest('hex');
 const segment = (start: number, len: number, mod: number): number => Number.parseInt(digest.slice(start, start + len), 16) % mod;
 const cities = ['Warszawa', 'Krakow', 'Gdansk', 'Wroclaw', 'Poznan', 'Lodz', 'Katowice'] as const;
 const city = cities[segment(0, 4, cities.length)]!;
 const streetNumber = 1 + segment(4, 4, 199);
 const postalCode = `${String(10 + segment(8, 3, 90)).padStart(2, '0')}-${String(segment(11, 3, 1000)).padStart(3, '0')}`;
 const legalNameSuffix = digest.slice(14, 20).toUpperCase();
 const testMarker = mode === 'test' ? '[DANE TESTOWE] ' : '';
 const legalName = `${testMarker}Firma ${legalNameSuffix} Sp. z o.o.`;
 const retrievedAt = new Date().toISOString();
 const normalized: CompanyProfile = {
  legalName,
  vatId: nip,
  country: 'PL',
  street: `ul. Testowa ${streetNumber}`,
  city,
  postalCode,
 };
 return {
  ok: true,
  rawPayload: {
   __gusBirMode: mode,
   __notice: mode === 'test'
    ? 'TEST DATA: deterministic fixture derived from the NIP. Does not represent a real registry record.'
    : 'MOCK DATA: no network call was made. GUS_BIR_MODE=production is required for real lookups.',
   nip,
   regon: digest.slice(0, 9).replace(/[a-f]/g, (char) => String(char.charCodeAt(0) % 10)),
   generatedAt: retrievedAt,
   name: legalName,
   address: { street: normalized.street, city: normalized.city, postalCode: normalized.postalCode, country: 'PL' },
  },
  normalized,
  source: 'gus_bir',
  retrievedAt,
 };
}

// -----------------------------------------------------------------------
// PRODUCTION MODE -- STRUCTURALLY COMPLETE, NOT VERIFIED AGAINST THE REAL
// GUS/BIR API.
//
// No production GUS_BIR_API_KEY was available in this session, so the
// request shape, authentication handshake and response mapping below are a
// best-effort placeholder, not a confirmed integration:
//  - The official GUS BIR1 interface is SOAP-based (WSDL) with a
//    session-token login call ("Zaloguj") rather than a bearer header, and
//    returns REGON/CEIDG data as an XML string embedded in the SOAP body.
//    A REST/JSON GUS_BIR_BASE_URL (as modeled here) implies either an
//    internal proxy in front of BIR1, or a different provider entirely.
//  - The exact field names in mapGusBirResponse() below are guesses at a
//    plausible JSON shape, not taken from real API documentation.
// Before setting GUS_BIR_MODE=production, confirm both against the actual
// GUS/BIR (or proxy) API docs and a live response, and update this function
// and mapGusBirResponse() accordingly.
// -----------------------------------------------------------------------
async function productionLookup(nip: string, config: GusBirConfig): Promise<GusBirLookupResult> {
 if (!config.baseUrl || !config.apiKey) {
  return { ok: false, code: 'upstream_error', message: 'GUS/BIR production mode is missing base URL or API key.' };
 }
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), config.timeoutMs);
 try {
  const url = new URL(`${config.baseUrl}/companies`);
  url.searchParams.set('nip', nip);
  let response: Response;
  try {
   response = await fetch(url, {
    method: 'GET',
    redirect: 'error',
    signal: controller.signal,
    headers: { Authorization: `Bearer ${config.apiKey}`, Accept: 'application/json' },
   });
  } catch (cause) {
   if (controller.signal.aborted) return { ok: false, code: 'timeout', message: `GUS/BIR request timed out after ${config.timeoutMs}ms.` };
   return { ok: false, code: 'upstream_error', message: cause instanceof Error ? cause.message : 'GUS/BIR request failed.' };
  }
  if (response.status === 404) return { ok: false, code: 'not_found', message: `GUS/BIR: no registry record for NIP ${nip}.` };
  if (response.status === 429) return { ok: false, code: 'rate_limited', message: 'GUS/BIR rate limit exceeded. Try again later.' };
  if (!response.ok) return { ok: false, code: 'upstream_error', message: `GUS/BIR request failed (${response.status}).` };
  const text = await response.text();
  if (text.length > 1024 * 1024) return { ok: false, code: 'upstream_error', message: 'GUS/BIR response exceeded its safe size limit.' };
  let raw: unknown;
  try {
   raw = JSON.parse(text);
  } catch {
   return { ok: false, code: 'upstream_error', message: 'GUS/BIR response was not valid JSON.' };
  }
  const normalized = mapGusBirResponse(raw, nip);
  if (!normalized) return { ok: false, code: 'not_found', message: `GUS/BIR: response for NIP ${nip} did not contain a usable company record.` };
  return { ok: true, rawPayload: raw, normalized, source: 'gus_bir', retrievedAt: new Date().toISOString() };
 } finally {
  clearTimeout(timer);
 }
}

// PLACEHOLDER MAPPING -- see the production-mode note above. Field names
// are unverified guesses and must be confirmed against real GUS/BIR (or
// proxy) API responses before production use.
function mapGusBirResponse(raw: unknown, nip: string): CompanyProfile | null {
 if (!raw || typeof raw !== 'object') return null;
 const row = raw as Record<string, unknown>;
 const text = (...keys: readonly string[]): string | null => {
  for (const key of keys) {
   const value = row[key];
   if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  }
  return null;
 };
 const legalName = text('nazwa', 'name', 'legalName');
 const street = text('ulica', 'street');
 const city = text('miejscowosc', 'city');
 const postalCode = text('kodPocztowy', 'postalCode');
 if (!legalName || !street || !city || !postalCode) return null;
 return { legalName, vatId: nip, country: 'PL', street, city, postalCode };
}
