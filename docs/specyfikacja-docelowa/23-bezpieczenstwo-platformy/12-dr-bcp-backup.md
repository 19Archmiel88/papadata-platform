---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-SEC-012
title: DR, BCP i backup
type: architektura-operacje
status: approved-target
updated_at: 2026-07-30T07:30:00+00:00
---

# DR, BCP i backup

## Kontrakt bezpieczeństwa

| Metryka | Cel zachowany |
| --- | --- |
| RPO | <= 15 minut |
| RTO | <= 60 minut |
| P1 acknowledge | <= 15 minut |
| Containment objective | <= 60 minut |
| Release evidence | SBOM, provenance, attestation, rollback evidence |
| WAF bypass | niedopuszczalny |

## Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

## Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.
