---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-MOB-000
title: Indeks aplikacji mobilnej
type: architektura-operacje
status: approved-target
updated_at: 2026-07-30T07:30:00+00:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Indeks aplikacji mobilnej

## Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
## Kontrakt

| Endpoint z pakietu źródłowego | Status |
| --- | --- |
| /pairings | draft source, wymaga zatwierdzenia |
| /pairings/{pairingId} | draft source, wymaga zatwierdzenia |
| /pairings/{pairingId}/scan | draft source, wymaga zatwierdzenia |
| /pairings/{pairingId}/approve | draft source, wymaga zatwierdzenia |
| /pairings/{pairingId}/deny | draft source, wymaga zatwierdzenia |
| /pairings/{pairingId}/cancel | draft source, wymaga zatwierdzenia |
| /pairings/{pairingId}/exchange | draft source, wymaga zatwierdzenia |
| /token/refresh | draft source, wymaga zatwierdzenia |
| /logout | draft source, wymaga zatwierdzenia |
| /me | draft source, wymaga zatwierdzenia |
| /devices | draft source, wymaga zatwierdzenia |
| /devices/{deviceId} | draft source, wymaga zatwierdzenia |
| /seats | draft source, wymaga zatwierdzenia |
| /seats/assign | draft source, wymaga zatwierdzenia |
| /invitations | draft source, wymaga zatwierdzenia |
| /invitations/accept | draft source, wymaga zatwierdzenia |
| /invitations/{invitationId}/revoke | draft source, wymaga zatwierdzenia |
| /conversations | draft source, wymaga zatwierdzenia |
| /conversations/{conversationId}/messages | draft source, wymaga zatwierdzenia |
| /assistant-runs/{runId} | draft source, wymaga zatwierdzenia |
| /assistant-runs/{runId}/events | draft source, wymaga zatwierdzenia |
| /assistant-runs/{runId}/cancel | draft source, wymaga zatwierdzenia |
| /artifacts | draft source, wymaga zatwierdzenia |
| /artifacts/{artifactId} | draft source, wymaga zatwierdzenia |
| /artifacts/{artifactId}/download-grants | draft source, wymaga zatwierdzenia |
| /download/{grantToken} | draft source, wymaga zatwierdzenia |
| /push/subscriptions | draft source, wymaga zatwierdzenia |
| /notification-preferences | draft source, wymaga zatwierdzenia |

## Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

## Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.
