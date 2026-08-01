---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-001
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Kanoniczny katalog 58 metryk

Kanonicznym źródłem maszynowym są `contracts/metric-catalog-58.json`, `contracts/metric-catalog-58.ts` oraz `rejestry/metric-catalog-58.csv`.

## Reguły

1. Katalog zawiera dokładnie 58 stabilnych `metricKey`.
2. Wszystkie metryki należą do MVP. Status `migration_ready` oznacza kompletną definicję i mapowanie gotowe do wdrożenia w kanonicznym Metric Engine. Status `planned_p0` oznacza obowiązkową implementację w ramach MVP.
3. Frontend, raporty i AI nie zawierają własnych formuł. Pobierają ten sam `snapshotId` z backendowego Metric Engine.
4. Brak danych zwraca `value: null`, readiness i ograniczenia; nigdy fałszywe zero.
5. Każdy wynik zachowuje wersję definicji, okres, filtry, walutę, timezone, lineage i czas obliczenia.
6. Zmiana formuły tworzy nową wersję i kontrolowany reprocessing.

## Implementacja

- `packages/contracts`: katalog publiczny i typy.
- `apps/api`: odczyt katalogu i snapshotów.
- `apps/worker`: obliczenia, reprocessing i harmonogramy.
- PostgreSQL: definicje, snapshoty, lineage i joby.
- Web/raporty/AI: tylko konsumpcja wyników.

## Testy

Wymagane: 58/58 definicji, testy formuł, zero/no-data/partial/stale/invalid, zgodność snapshotu Dashboard–raport–AI oraz test blokujący formuły w frontendzie.
