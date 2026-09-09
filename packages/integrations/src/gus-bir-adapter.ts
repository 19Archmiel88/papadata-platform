import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
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
// PRODUCTION MODE -- real SOAP client for the official GUS/BIR REGON API
// (BIR1.1, service `UslugaBIRzewnPubl`). Verified live against the real
// test environment (wyszukiwarkaregontest.stat.gov.pl) 2026-09-09: login,
// search-by-NIP (both a real match and the documented ErrorCode 4 "not
// found" shape) and logout all round-tripped correctly with this exact
// envelope/header shape. `config.baseUrl`/`config.apiKey` point at either
// the production or test BIR endpoint+key -- this function doesn't care
// which, that's purely an environment-configuration choice.
//
// Two non-obvious things this service requires, confirmed by trial against
// the live server (neither is written down in the WSDL itself):
//  - Every call needs WS-Addressing <a:Action>/<a:To> SOAP headers, even
//    though the WSDL's soap12 binding shows only a <soap12:body>. Without
//    them the service faults with ActionMismatch, then DestinationUnreachable.
//  - The session id returned by Zaloguj is NOT a SOAP header -- it must be
//    sent as a plain HTTP request header literally named `sid` on every
//    subsequent call (DaneSzukajPodmioty, Wyloguj). This matches DOC-P0-005's
//    own note that GUS/BIR is SOAP-based, not REST+bearer as an earlier,
//    unverified placeholder in this file had assumed.
//  - Responses are MTOM/XOP multipart bodies (`Content-Type:
//    multipart/related`), not a bare SOAP envelope -- the actual XML has to
//    be pulled out from between the MIME part boundaries first.
//  - DaneSzukajPodmioty's real payload is itself an XML *string* embedded
//    (HTML-entity-escaped) inside the SOAP body, so it needs a second parse
//    pass. A result with an `ErrorCode` element (confirmed: code 4, "Nie
//    znaleziono podmiotu...") means no match, not a usable record.
// -----------------------------------------------------------------------

const BIR_NAMESPACE = 'http://CIS/BIR/PUBL/2014/07';
const BIR_DATA_CONTRACT_NAMESPACE = 'http://CIS/BIR/PUBL/2014/07/DataContract';
const xmlParser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });

function soapAction(operation: string): string {
 return `${BIR_NAMESPACE}/IUslugaBIRzewnPubl/${operation}`;
}

function buildEnvelope(baseUrl: string, operation: string, bodyXml: string): string {
 const action = soapAction(operation);
 return `<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing">`
  + `<soap12:Header><a:Action s:mustUnderstand="1" xmlns:s="http://www.w3.org/2003/05/soap-envelope">${action}</a:Action>`
  + `<a:To s:mustUnderstand="1" xmlns:s="http://www.w3.org/2003/05/soap-envelope">${escapeXml(baseUrl)}</a:To></soap12:Header>`
  + `<soap12:Body>${bodyXml}</soap12:Body></soap12:Envelope>`;
}

function escapeXml(value: string): string {
 return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Pulls the SOAP envelope out of an MTOM/XOP multipart response body. The
 * envelope's own XML declaration is absent from the extracted fragment,
 * which is fine -- callers only ever feed this into XMLParser. */
function extractSoapEnvelope(rawBody: string): string {
 const match = rawBody.match(/<s:Envelope[\s\S]*<\/s:Envelope>/);
 return match ? match[0] : rawBody;
}

type SoapCallResult = { readonly ok: true; readonly body: Record<string, unknown> } | { readonly ok: false; readonly fault: string };

async function callSoap(baseUrl: string, operation: string, bodyXml: string, signal: AbortSignal, sid?: string): Promise<SoapCallResult> {
 const envelope = buildEnvelope(baseUrl, operation, bodyXml);
 const action = soapAction(operation);
 const response = await fetch(baseUrl, {
  method: 'POST',
  redirect: 'error',
  signal,
  headers: {
   'Content-Type': `application/soap+xml; charset=utf-8; action="${action}"`,
   ...(sid ? { sid } : {}),
  },
  body: envelope,
 });
 const rawBody = await response.text();
 if (rawBody.length > 1024 * 1024) return { ok: false, fault: 'GUS/BIR response exceeded its safe size limit.' };
 const parsed = xmlParser.parse(extractSoapEnvelope(rawBody)) as { Envelope?: { Body?: Record<string, unknown> } };
 const body = parsed.Envelope?.Body;
 if (!body) return { ok: false, fault: `GUS/BIR: unrecognized response (HTTP ${response.status}).` };
 const fault = body.Fault as { Reason?: { Text?: unknown } } | undefined;
 if (fault) {
  const reasonText = fault.Reason?.Text;
  const reason = typeof reasonText === 'string' ? reasonText : (reasonText as { '#text'?: string } | undefined)?.['#text'];
  return { ok: false, fault: reason ?? `GUS/BIR SOAP fault (HTTP ${response.status}).` };
 }
 if (!response.ok) return { ok: false, fault: `GUS/BIR request failed (HTTP ${response.status}).` };
 return { ok: true, body };
}

async function productionLookup(nip: string, config: GusBirConfig): Promise<GusBirLookupResult> {
 if (!config.baseUrl || !config.apiKey) {
  return { ok: false, code: 'upstream_error', message: 'GUS/BIR production mode is missing base URL or API key.' };
 }
 const baseUrl = config.baseUrl;
 const apiKey = config.apiKey;
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), config.timeoutMs);
 let sid: string | null = null;
 try {
  let login: SoapCallResult;
  try {
   login = await callSoap(baseUrl, 'Zaloguj', `<Zaloguj xmlns="${BIR_NAMESPACE}"><pKluczUzytkownika>${escapeXml(apiKey)}</pKluczUzytkownika></Zaloguj>`, controller.signal);
  } catch (cause) {
   if (controller.signal.aborted) return { ok: false, code: 'timeout', message: `GUS/BIR request timed out after ${config.timeoutMs}ms.` };
   return { ok: false, code: 'upstream_error', message: cause instanceof Error ? cause.message : 'GUS/BIR login request failed.' };
  }
  if (!login.ok) return { ok: false, code: 'upstream_error', message: login.fault };
  const loginResult = (login.body.ZalogujResponse as { ZalogujResult?: unknown } | undefined)?.ZalogujResult;
  sid = typeof loginResult === 'string' && loginResult.length > 0 ? loginResult : null;
  if (!sid) return { ok: false, code: 'upstream_error', message: 'GUS/BIR: login rejected (invalid API key or service unavailable).' };

  const searchBody = `<DaneSzukajPodmioty xmlns="${BIR_NAMESPACE}"><pParametryWyszukiwania xmlns:dat="${BIR_DATA_CONTRACT_NAMESPACE}"><dat:Nip>${escapeXml(nip)}</dat:Nip></pParametryWyszukiwania></DaneSzukajPodmioty>`;
  let search: SoapCallResult;
  try {
   search = await callSoap(baseUrl, 'DaneSzukajPodmioty', searchBody, controller.signal, sid);
  } catch (cause) {
   if (controller.signal.aborted) return { ok: false, code: 'timeout', message: `GUS/BIR request timed out after ${config.timeoutMs}ms.` };
   return { ok: false, code: 'upstream_error', message: cause instanceof Error ? cause.message : 'GUS/BIR search request failed.' };
  }
  if (!search.ok) return { ok: false, code: 'upstream_error', message: search.fault };
  const resultXml = (search.body.DaneSzukajPodmiotyResponse as { DaneSzukajPodmiotyResult?: unknown } | undefined)?.DaneSzukajPodmiotyResult;
  if (typeof resultXml !== 'string' || resultXml.trim().length === 0) {
   return { ok: false, code: 'not_found', message: `GUS/BIR: no registry record for NIP ${nip}.` };
  }
  const inner = xmlParser.parse(resultXml) as { root?: { dane?: Record<string, unknown> } };
  const record = inner.root?.dane;
  const normalized = record ? mapGusBirResponse(record, nip) : null;
  if (!normalized) {
   const errorMessage = record?.ErrorMessagePl;
   return { ok: false, code: 'not_found', message: typeof errorMessage === 'string' ? errorMessage : `GUS/BIR: no registry record for NIP ${nip}.` };
  }
  return { ok: true, rawPayload: record, normalized, source: 'gus_bir', retrievedAt: new Date().toISOString() };
 } finally {
  clearTimeout(timer);
  if (sid) {
   // Best-effort logout -- the lookup result above is already final either
   // way, so a failure here must never surface to the caller.
   try {
    const logoutController = new AbortController();
    const logoutTimer = setTimeout(() => logoutController.abort(), 5000);
    await callSoap(baseUrl, 'Wyloguj', `<Wyloguj xmlns="${BIR_NAMESPACE}"><pIdentyfikatorSesji>${escapeXml(sid)}</pIdentyfikatorSesji></Wyloguj>`, logoutController.signal, sid).catch(() => undefined);
    clearTimeout(logoutTimer);
   } catch {
    // ignored -- see comment above
   }
  }
 }
}

/** Maps one <dane> record from DaneSzukajPodmioty's embedded XML to
 * CompanyProfile. `ErrorCode` present (confirmed live: code 4 = "Nie
 * znaleziono podmiotu dla podanych kryteriów wyszukiwania") means the
 * search matched nothing, not a usable record. `vatId` is set from the
 * already-checksum-validated input `nip`, not the round-tripped `Nip`
 * field, since fast-xml-parser coerces all-digit tag values to `number`
 * and a leading zero would be silently lost. */
function mapGusBirResponse(record: Record<string, unknown>, nip: string): CompanyProfile | null {
 if (record.ErrorCode !== undefined) return null;
 const text = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (typeof value === 'number') return String(value);
  return null;
 };
 const legalName = text(record.Nazwa);
 const streetName = text(record.Ulica);
 const buildingNumber = text(record.NrNieruchomosci);
 const unitNumber = text(record.NrLokalu);
 const city = text(record.Miejscowosc) ?? text(record.MiejscowoscPoczty);
 const postalCode = text(record.KodPocztowy);
 if (!legalName || !city || !postalCode) return null;
 const street = [streetName, buildingNumber].filter(Boolean).join(' ') + (unitNumber ? `/${unitNumber}` : '');
 if (!street.trim()) return null;
 return { legalName, vatId: nip, country: 'PL', street, city, postalCode };
}
