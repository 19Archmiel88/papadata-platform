---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-MOB-011
title: Rollout i rollback
type: architektura-operacje
status: approved-target
updated_at: 2026-07-30T07:30:00+00:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Rollout i rollback

## Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
## Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | wszystkie identyfikatory jako `{{runId}}`, `{{artifactId}}`, `{{deviceId}}` |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

## Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

## Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.
