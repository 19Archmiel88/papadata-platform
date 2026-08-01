---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-019
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Plan ciągłości działania i odtwarzania — BCP/DR

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Cele i zakres

Plan obejmuje GCP production, bazy, storage, kolejki, IAM, integracje, payment/KSeF, AI provider, DNS, secrets, monitoring i komunikację. Lokalny stack służy do odtwarzalnego testu, ale nie zastępuje DR produkcji.

## 2. Klasy usług

| Klasa | Przykład | RTO | RPO | Tryb degradacji |
|---|---|---|---|---|
| C1 | auth, tenant isolation, billing authorization | `[X]` | `[X]` | fail closed / read-only |
| C2 | dashboard, metric snapshots, reports | `[X]` | `[X]` | ostatni potwierdzony snapshot |
| C3 | initial sync, AI batch, exports | `[X]` | `[X]` | queue/pause |

## 3. Scenariusze

Utrata regionu, błąd migracji DB, uszkodzenie danych, kompromitacja sekretów, niedostępność providerów, KSeF offline/awaria, payment webhook backlog, LLM outage, ransomware i masowa błędna AI Action.

## 4. Procedura aktywacji

Kto deklaruje disaster, kanał, kryteria, role, freeze zmian, backup verification, failover, walidacja izolacji i billing, komunikacja, powrót i zamknięcie. Każdy krok ma command/runbook i dowód.

## 5. Kopie i restore

Typ, częstotliwość, szyfrowanie, region, immutability, retention, restore order i test. Restore test co `[OKRES]` obejmuje aplikację, migracje, sample tenant, metryki, pliki i audyt.

## 6. Komunikacja

Status page, szablony Klientów, regulatorów i wewnętrzne. Komunikat podaje wpływ, obejście, kolejny update, nie niepotwierdzoną przyczynę.

## 7. Ćwiczenia

Tabletop kwartalny i techniczny restore/failover co `[OKRES]`. Wynik: osiągnięte RTO/RPO, odchylenia, działania i retest.
