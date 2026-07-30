---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-002
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Parytet środowiska lokalnego i GCP

Ten sam kod aplikacyjny i te same kontrakty muszą działać w local, CI, development, staging i production. Różnić może się wyłącznie adapter infrastruktury oraz skala.

| Produkcja GCP | Lokalny odpowiednik |
|---|---|
| Cloud SQL PostgreSQL | PostgreSQL w Docker Compose |
| Memorystore/Redis | Redis w Docker Compose |
| Pub/Sub lub kolejki zarządzane | emulator albo Redis/BullMQ |
| Cloud Storage | MinIO lub emulator GCS |
| Secret Manager | plik `.env.local` niecommitowany + testowy secret store |
| Cloud Run/GKE | kontenery Docker uruchamiane lokalnie |
| Cloud Logging/Trace | OpenTelemetry + lokalny collector |
| Vertex/external LLM | lokalny mock lub lokalny provider AI |

## Zasady blokujące rozjazd

- jedna wersja PostgreSQL i migracji;
- ten sam seed kontraktowy;
- te same feature flags i walidacja konfiguracji;
- brak specjalnej logiki biznesowej tylko dla local;
- testy kontraktowe adapterów;
- rejestr jawnych odstępstw z ownerem i datą usunięcia;
- `docker compose up` uruchamia kompletny MVP bez połączenia z płatnym providerem.
