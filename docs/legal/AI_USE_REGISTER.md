# AI Use Register

Status: draft.
Not legal advice. Wymaga przeglądu prawnego, AI governance i ownera produktu.

## Current AI Surface

Repo zawiera lokalne funkcje Papa Asystenta w `apps/web/src/features/ai` oraz
szkielety backendowe dla AI briefings. AI działa na danych dopuszczonych przez
readiness i uprawnienia, zapisuje evidence, limitations, confidence, refusal,
approvals, simulation, revalidation i audit w kontrakcie domenowym.

## Allowed MVP Use Cases

Use case: assistant briefing.
Purpose: wyjaśnienie dashboardu i KPI z evidence.
Data used: readiness-approved metric snapshots, lineage/evidence summaries.
Human oversight: required for consequential actions.
Risk: incorrect recommendation, missing data, prompt injection.
Controls: refusal, evidence, limitations, confidence, tenant-safe retrieval.

Use case: recommendation draft.
Purpose: przygotowanie propozycji decyzji dla użytkownika.
Data used: canonical facts and metric snapshots with readiness.
Human oversight: approval required before execution.
Risk: action beyond policy, stale evidence.
Controls: proposal, approval, revalidation, idempotency, audit.

Use case: simulation.
Purpose: lokalna symulacja skutków decyzji bez autonomicznego wykonania.
Data used: approved scenario inputs and readiness-safe metrics.
Human oversight: required.
Risk: treating simulation as fact.
Controls: limitations, confidence, refusal on insufficient data.

## Forbidden

- Ustalanie source authority przez AI.
- Samodzielne nadawanie uprawnień.
- Autonomiczne działania finansowe, prawne, dostępowe lub operacyjne.
- Ujawnianie sekretów, promptów systemowych, tokenów i raw payloadów.
- Użycie danych z obcego tenant/workspace.

## Required Fields Per AI Feature

- feature owner;
- purpose;
- model/provider;
- data categories;
- retention;
- evidence source;
- refusal policy;
- human approval policy;
- evaluation dataset;
- incident runbook;
- legal basis: DO USTALENIA Z PRAWNIKIEM.

## Open Items

- Produkcyjny provider AI: DO USTALENIA Z OWNEREM.
- DPA/subprocessor AI: DO USTALENIA Z PRAWNIKIEM.
- Evaluation threshold: DO USTALENIA Z OWNEREM.
- Monitoring owner: DO USTALENIA Z OWNEREM.
