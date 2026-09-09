---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Aplikacja mobilna

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-00-indeks-mobile"></a>

## Indeks aplikacji mobilnej

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

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

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-01-product-brief"></a>

## Product brief mobile

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-02-ux-architecture-i-screen-map"></a>

## UX architecture i screen map

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-03-pairing-auth"></a>

## Pairing i Auth

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

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

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

### Decyzja P0 — dwa rodzaje QR
QR parowania jest oddzielony od smart QR pobrania aplikacji. Panel dystrybucji w ustawieniach jest dostępny tylko Ownerowi lub capability mobile.distribution.manage.

<a id="sekcja-04-mobile-security-privacy"></a>

## Mobile security i privacy

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-05-data-model"></a>

## Data model

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-06-openapi"></a>

## OpenAPI

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

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

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-07-push-deep-links-offline"></a>

## Push, deep linki i offline

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-08-store-compliance"></a>

## Store compliance

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-09-ci-cd-release"></a>

## CI/CD i release

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-10-observability-slo"></a>

## Observability i SLO

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-11-rollout-rollback"></a>

## Rollout i rollback

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-12-backlog-i-acceptance-plan"></a>

## Backlog i acceptance plan

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.

<a id="sekcja-13-adr-mobile"></a>

## ADR mobile

### Zakres

Dokument definiuje kompletny zakres wymagań dla aplikacji mobilnej.
### Kontrakt

| Wymaganie | Reguła |
| --- | --- |
| Model komercyjny | bezpłatna aplikacja towarzysząca istniejącej odpłatnej usłudze B2B |
| Brak artefaktu generatora placeholderów | identyfikatory techniczne muszą mieć jawne nazwy bez składni generatora |
| Privacy | App Store Privacy Labels i Google Data Safety |
| Account deletion | procedura dostępna i testowalna |

### Decyzje naprawcze

- Aplikacja mobilna jest bezpłatną aplikacją towarzyszącą istniejącej odpłatnej usłudze B2B.
- API używa parametrów `{runId}`, `{artifactId}`, `{deviceId}`, `{pairingId}`; nie wolno używać artefaktów generatora placeholderów.
- Mobile MVP jest read-only z kontrolowanymi wyjątkami dla pairing, sesji, urządzeń i preferencji powiadomień.
- Pairing web↔mobile jest osobną maszyną stanów, powiązaną z sesją i urządzeniem.

### Acceptance

Każda funkcja mobile musi mieć screen, endpoint lub decyzję braku endpointu, privacy impact, test i rollout/rollback.
