# PapaData — Legal Readiness Report

**Covers:** `docs/legal/terms-of-service.pl.md` (v1.0), `docs/legal/privacy-notice.pl.md` (v1.0)
**Prepared:** 2026-09-14
**Status:** `LEGAL CONTENT — BLOCKED BY MISSING FACTS`

This report is a self-audit produced from the current state of the PapaData codebase and public legal sources as of 2026-09-14. It is not, and does not substitute for, review by a qualified lawyer, accountant, or Data Protection Officer. Nothing in this report or in the two documents it covers should be represented to a customer, regulator, or court as having received such review until it actually has.

## A. Confirmed factual statements

These are asserted in the documents because they were directly observed in the running system or its configuration, not inferred:

- The account/registration flow requires organization name, NIP, address (`apps/api/src/production/access-lifecycle/access-lifecycle.service.ts`), and email verification via a one-time, expiring link (`apps/api/src/production/access-lifecycle/access-mail.service.ts`, `apps/worker/src/production/access-mail-worker.service.ts`).
- Company data can be pulled from GUS/BIR and the source registry response is retained (`packages/integrations/src/gus-bir-adapter.ts`, `app.company_lookup_audit`).
- Tenant/workspace data isolation is enforced at the database level via Row-Level Security with `FORCE ROW LEVEL SECURITY` (`packages/database/migrations/0016_backend_release_hardening.sql` and subsequent migrations).
- The integration catalog is exactly seven providers: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads, GA4 (`packages/contracts/src/integration-platform.ts`, `mvpIntegrationCatalogProviderIds`).
- PapaData does not store full card numbers or CVV (Stripe-based billing integration, `packages/integrations/src/stripe-billing.ts`; no PAN/CVV field exists anywhere in the schema).
- Billing is Stripe-based but `mode: 'disabled'` in the currently running configuration (`apps/api/src/production/platform-operations/billing-operations.service.ts`) — no live payment collection, no published pricing, no self-service checkout is currently active.
- Papa Assistant's user-interface labels AI-authored messages distinctly (`PapaAssistantExperience.tsx`, "Papa · AI").
- A dedicated pre-provider redaction pass (`packages/papa-runtime/src/index.ts`, `redactPapaProviderInputForPrivacy`) detects and masks email addresses, phone numbers, PESEL, NIP, IBAN-shaped strings, and secret/API-key-shaped strings in the user's typed prompt before it is used to build the request sent to the AI provider, and records an audit event of the redaction (`appendAssistantPrivacyRedactionEvent`, policy `papa-dlp-v1`).
- The OpenAI Responses API call is made with `store: false` (`packages/ai-runtime/src/index.ts`, `OpenAiResponsesProvider.responsesBody`).
- When `AI_PROVIDER` is unset/not `openai`, Papa Assistant runs `LocalDeterministicProvider`, which never makes an outbound network call (`packages/ai-runtime/src/index.ts`).
- No first-party analytics or marketing tracking script is loaded by the web application; the only "Google Analytics"-named asset in the frontend is a static logo used to represent GA4 as a customer-configurable data *source*, not a PapaData tracker (`apps/web/src/runtime/features/auth/AuthDataSourceMarquee.tsx`).
- Cookie consent (necessary/preferences/analytics/marketing) defaults optional categories to off and requires an explicit choice; this was exercised live against the running stack during this task (see the E2E table).
- An `AiActionProposal`/`AiActionState` type models a propose → approve → execute → succeed/fail → compensate lifecycle for AI-initiated changes (`packages/contracts/src/ai-runtime.ts`); nothing observed in code executes such an action without a recorded approval step.
- A DSAR-style privacy request workflow exists with an identity-verification step (`apps/api/src/production/privacy/privacy.controller.ts`, `privacy.service.ts`, `app.privacy_requests`, `app.privacy_identity_verifications`) and is reachable from the product's Settings screen (`apps/web/src/app/settings/SettingsPage.tsx`).
- An opt-in worker deletes only explicitly time-boxed ephemeral assistant data (text attachments, memory notes past `expires_at`, stale partial generation results) and explicitly never deletes conversation/audit history (`apps/worker/src/production/assistant-retention.service.ts`).
- `app.legal_documents` is public-read-only via the API (`GET /v1/legal/documents/:type`) with no publish endpoint; publishing requires direct, privileged database access, by design (`apps/api/src/production/legal-documents/legal-documents.controller.ts`).

## B. Statements derived from runtime/code (interpreted, not literal)

- **B2B-only classification**: derived from `docs/specyfikacja-docelowa/27-pakiet-prawny-i-organizacyjny/00-indeks-pakietu-prawnego.md` §1 ("PapaData jest projektowana przede wszystkim jako usługa B2B") combined with the registration flow requiring an organization/workspace and the absence of any consumer checkout path in the running code. Both documents state the B2B model as the default and name the consumer-rights carve-out as conditional on a future variant actually being enabled.
- **AI grounding context scope**: `buildGroundingContext` (`packages/papa-runtime/src/index.ts`) pulls from a screen/analysis snapshot the user is looking at or has explicitly attached ("Dodaj kontekst analizy" in the product UI) — metrics, evidence, table/chart data as currently displayed. This can include customer-identifying rows if the attached screen shows them (e.g. a Customers table). The Privacy Notice describes this as "context the user chose to attach," which is accurate to the code path, but does not itself constitute a guarantee that no personal data ever reaches the provider — this is stated explicitly rather than smoothed over.
- **OpenAI as a named subprocessor**: named directly (not as a placeholder) because the real `openai` SDK is imported and called in `packages/ai-runtime/src/index.ts` and a real API key is configured in this environment's local parity file — this is current, provable fact, not aspiration.

## C. Legal sources reviewed

- Regulation (EU) 2016/679 (GDPR) — Articles 5, 6, 12–14, 15–22, 28, 32, 44–49 (general knowledge, stable since 2018; no material amendment identified as of 2026-09-14).
- Regulation (EU) 2024/1689 (AI Act) — Article 50 transparency obligations for systems interacting with natural persons. Confirmed via web search: enforceable from 2 August 2026, i.e. already in force as of this report's date. See sources below.
- Ustawa z dnia 12 lipca 2024 r. Prawo komunikacji elektronicznej — successor to the former Prawo telekomunikacyjne; the cookie-consent provision formerly at art. 173 now sits at **art. 361**, with substantively unchanged requirements. Confirmed via web search (see sources below).
- Digital Services Act (Regulation (EU) 2022/2065): reviewed for applicability, not cited in either document. PapaData does not provide hosting, caching, mere-conduit, or public content-intermediation services to third parties, and does not operate an online platform connecting third-party traders/content to the public — it is a direct B2B SaaS analytics product used by one organization on its own data. Conclusion: DSA does not apply to PapaData's own service in its current form. This is a reasoned conclusion, not a citation-backed certainty; flagged for legal confirmation rather than silently assumed.
- Polish Civil Code / distance-contracting principles: referenced only generically (contract formation on acceptance) — no specific article cited, as none of the specific consumer-distance-contract provisions are engaged while the product remains B2B-only with no live consumer checkout.
- Polish consumer protection law: not applied to the primary Terms (B2B), with an explicit conditional carve-out written into §3 for a possible future consumer/quasi-consumer variant.

### Sources consulted (web search, 2026-09-14)

- [EU AI Act Article 50: Transparency Obligations Take Effect – Cloud Security Alliance](https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-article-50-transparency-20260729/)
- [The EU AI Act's Transparency Rules: A Practical Guide to Article 50](https://artificialintelligenceact.eu/transparency-rules-article-50/)
- [Transparency obligations under Article 50 of the AI Act — European Commission](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act)
- [Ciasteczka a Prawo komunikacji elektronicznej — Kancelaria KHM](https://kancelariakhm.pl/ciasteczka-w-prawie-komunikacji-elektronicznej-wszystko-po-staremu/)
- [Prawo komunikacji elektronicznej a ochrona danych osobowych — Grant Thornton](https://grantthornton.pl/publikacja/prawo-komunikacji-elektronicznej-a-ochrona-danych-osobowych/)

## D. Missing operator facts (block publication)

| Placeholder | What is needed |
|---|---|
| `[[LEGAL_ENTITY_NAME_REQUIRED]]` | Full registered legal entity name and legal form |
| `[[REGISTERED_ADDRESS_REQUIRED]]` | Registered seat address |
| `[[REGISTER_REQUIRED]]` | Register the entity is recorded in (KRS or CEIDG) and its number |
| `[[NIP_REQUIRED]]` | Tax identification number |
| `[[REGON_REQUIRED]]` | Statistical number |
| `[[SUPPORT_CONTACT_REQUIRED]]` | Real, monitored support contact address |
| `[[LEGAL_CONTACT_REQUIRED]]` | Real, monitored legal contact address |
| `[[SECURITY_CONTACT_REQUIRED]]` | Real, monitored security-incident contact address |
| `[[PRIVACY_CONTACT_REQUIRED]]` | Real, monitored privacy/DSAR contact address |
| `[[DPO_CONTACT_REQUIRED]]` | Either DPO name/contact, or an explicit statement that none has been appointed (a business decision, not something inferable from code) |
| `[[COMPETENT_COURT_REQUIRED]]` | Competent court for disputes (depends on the registered seat, which is itself missing) |
| `[[NOTICE_PERIOD_DAYS_REQUIRED]]` | Days of advance notice for material Terms changes (business/legal decision) |
| `[[EXPORT_WINDOW_DAYS_REQUIRED]]` | Days of post-termination data export window (business decision, referenced consistently by both documents) |
| `[[LIABILITY_MODEL_REQUIRED]]` | Concrete liability caps/exclusions model (must be decided with counsel; a wrong default here is a real legal risk, so it is deliberately not guessed) |

## E. Missing contractual/provider facts

- `[[INTERNATIONAL_TRANSFER_MECHANISM_REQUIRED]]`: the concrete transfer mechanism (SCCs, adequacy, or other) for each subprocessor that in fact transfers data outside the EEA is not established in this repository — it depends on actual signed vendor agreements (e.g. the real OpenAI or hosting provider DPA/SCC annex), which are commercial documents, not code.
- `[[AI_PROVIDER_DPA_STATUS_REQUIRED]]`: whether the OpenAI account used in production is covered by a business agreement with a no-training/limited-retention commitment beyond the per-request `store: false` flag this codebase controls. This is a contract PapaData would sign with OpenAI, not something derivable from application code.
- The full subprocessor register (`docs/specyfikacja-docelowa/27-pakiet-prawny-i-organizacyjny/06-lista-podprocesorow.md`) remains templated for hosting/cloud and payment providers; only the AI provider (OpenAI) could be confirmed directly from code as actually integrated today.
- `[[SECURITY_LOG_RETENTION_REQUIRED]]` / `[[SUPPORT_TICKET_RETENTION_REQUIRED]]`: no concrete retention period is enforced in code for security/audit logs or support tickets; the internal retention template (`13-polityka-retencji-i-usuwania.md`) also leaves these open.

## F. Data flows needing external verification

- Whether the cloud hosting provider (implied by Terraform, `infra/terraform/main.tf`, to be GCP) and the payment provider (Stripe, per `packages/integrations/src/stripe-billing.ts`) have executed DPAs/SCCs with the operating entity — this exists (or doesn't) outside this repository.
- Whether `PAPADATA_AUTH_MAIL_ENABLED`/Resend is actually live in production and under what agreement (see the prior correction pass's report: staging/production currently have no Resend configuration in Terraform).

## G. Privacy processor/controller distinction

Both documents draw the same line consistently: PapaData is **controller** for account/auth/billing/security/support/its-own-marketing data, and (subject to a real DPA being executed) **processor** for personal data embedded in Customer Data the Client imports through Integrations or types into Papa Assistant about their own customers. Neither document claims the general Privacy Notice substitutes for that DPA.

## H. Consumer/B2B classification

**B2B by design, today.** See section B above. If a consumer or quasi-consumer checkout variant is ever enabled, both documents will require a dedicated update (consumer information duties, withdrawal rights, and Terms §3 ¶2's conditional clause would need to become operative rather than conditional) — this is flagged as a concrete follow-up trigger, not handled preemptively with unused boilerplate.

## I. AI/OpenAI disclosure audit

Summarized in section A/B above. Key finding worth surfacing explicitly: the ai-runtime package's separate `redactText`/`redactMessages` helper (used only by the generic `OpenAiCompatibleProvider`, i.e. a *non*-OpenAI-branded custom-endpoint path) is **not** applied on the `OpenAiResponsesProvider` path actually used when `AI_PROVIDER=openai`. That path relies entirely on `packages/papa-runtime`'s own, separate, more thorough `redactPapaProviderInputForPrivacy` pass applied earlier, at the point the user's prompt is first read — which does cover it. Net effect for the documents: accurate as drafted, but this is exactly the kind of internal duplication worth consolidating later so a future change to one redaction path doesn't create a silent gap; recorded here rather than fixed, since fixing it was outside this task's scope (correcting/publishing legal documents, not refactoring AI runtime code).

## J. Retention audit

No concrete, enforced retention period exists in code for: assistant conversation history, security/audit logs, or support tickets. The only enforced *deletions* found are for explicitly ephemeral assistant data (§A). This is reported as a real gap in both the Privacy Notice's retention table and this report — not glossed over with an invented number.

## K. International-transfer audit

Not established. See §E.

## L. Final placeholder count

**28 total occurrences, 18 distinct placeholder tokens**, split:
- Terms of Service: 12 distinct tokens (16 occurrences)
- Privacy Notice: 9 distinct tokens (12 occurrences)
- Shared across both: `[[LEGAL_ENTITY_NAME_REQUIRED]]`, `[[REGISTERED_ADDRESS_REQUIRED]]`, `[[NIP_REQUIRED]]`

Verified programmatically: `pnpm provision:legal-documents:validate` exits non-zero and enumerates every one of them; `tools/provision-legal-documents.test.mjs` asserts this state is what today's canonical files actually produce.

## Verdict

**LEGAL CONTENT — BLOCKED BY MISSING FACTS**

Both documents are complete, substantively grounded in the real product and current law, and structurally ready. They are correctly and deliberately **not** provisioned as active `app.legal_documents` rows, and the provisioning tool refuses to do so on its own, because 18 operator/business facts genuinely do not exist anywhere in this repository. Supplying section D's facts (and, ideally, section E's before a real DPA is signed) is what would move this to "ready for owner/legal approval" — not further drafting work.
