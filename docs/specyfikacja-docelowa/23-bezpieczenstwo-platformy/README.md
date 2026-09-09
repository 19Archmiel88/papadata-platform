---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Bezpieczeństwo platformy

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-00-indeks-bezpieczenstwa"></a>

## Indeks bezpieczeństwa platformy

### Kontrakt bezpieczeństwa

| Metryka | Cel zachowany |
| --- | --- |
| RPO | <= 15 minut |
| RTO | <= 60 minut |
| P1 acknowledge | <= 15 minut |
| Containment objective | <= 60 minut |
| Release evidence | SBOM, provenance, attestation, rollback evidence |
| WAF bypass | niedopuszczalny |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-01-program-i-raci"></a>

## Program i RACI

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-02-architektura-docelowa"></a>

## Architektura docelowa

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-03-roadmapa-p0-p1-p2"></a>

## Roadmapa P0/P1/P2

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-04-mapa-zmian-w-repozytorium"></a>

## Mapa zmian w repozytorium

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-05-edge-waf-ddos"></a>

## Edge, WAF i DDoS

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-06-iam-secrets-kms"></a>

## IAM, Secret Manager i KMS

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-07-ci-supply-chain"></a>

## CI i supply chain

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-08-tenancy-dlp-ai"></a>

## Tenancy, DLP i AI

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-09-api-integracje"></a>

## API i integracje

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-10-observability-detection"></a>

## Observability i detection

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-11-incident-response-runbooks"></a>

## Incident response runbooks

### Kontrakt bezpieczeństwa

| Metryka | Cel zachowany |
| --- | --- |
| RPO | <= 15 minut |
| RTO | <= 60 minut |
| P1 acknowledge | <= 15 minut |
| Containment objective | <= 60 minut |
| Release evidence | SBOM, provenance, attestation, rollback evidence |
| WAF bypass | niedopuszczalny |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-12-dr-bcp-backup"></a>

## DR, BCP i backup

### Kontrakt bezpieczeństwa

| Metryka | Cel zachowany |
| --- | --- |
| RPO | <= 15 minut |
| RTO | <= 60 minut |
| P1 acknowledge | <= 15 minut |
| Containment objective | <= 60 minut |
| Release evidence | SBOM, provenance, attestation, rollback evidence |
| WAF bypass | niedopuszczalny |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-13-release-gates"></a>

## Release gates

### Kontrakt bezpieczeństwa

| Metryka | Cel zachowany |
| --- | --- |
| RPO | <= 15 minut |
| RTO | <= 60 minut |
| P1 acknowledge | <= 15 minut |
| Containment objective | <= 60 minut |
| Release evidence | SBOM, provenance, attestation, rollback evidence |
| WAF bypass | niedopuszczalny |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-14-test-plan"></a>

## Test plan security

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-15-backlog"></a>

## Backlog security

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-16-risk-register"></a>

## Risk register

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-17-go-live-checklist"></a>

## Go-live checklist

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.

<a id="sekcja-18-evidence-templates"></a>

## Evidence templates

### Kontrakt bezpieczeństwa

| Kontrola | Wymaganie |
| --- | --- |
| owner | RACI i evidence owner |
| evidence | plik, log, konfiguracja albo wynik testu |
| rollout | preview -> enforcement, gdy ryzykowne |
| rollback | opisany i przetestowany |

### Powiązania z produktem

- Auth, MFA, sesje i reauthentication;
- tenant/workspace isolation;
- integracje i dane osobowe;
- AI read-only w MVP i evidence panel;
- aplikacja mobilna, pairing i urządzenia;
- billing, support access i operacje administracyjne.

### Acceptance evidence

Każda kontrola wymaga właściciela, artefaktu dowodowego, daty wykonania, wyniku i decyzji GO/NO-GO.
