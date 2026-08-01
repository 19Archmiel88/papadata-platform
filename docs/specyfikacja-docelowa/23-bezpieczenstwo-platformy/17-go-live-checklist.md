---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-SEC-017
title: Go-live checklist
type: architektura-operacje
status: approved-target
updated_at: 2026-07-30T07:30:00+00:00
---

# Go-live checklist

## Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

## Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

## Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.
