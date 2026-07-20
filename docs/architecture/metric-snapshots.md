# Metric Snapshots

`MetricSnapshot` jest niezmiennym wynikiem KPI dla lokalnego zakresu:

- tenant;
- workspace;
- okres;
- waluta;
- timezone;
- wersje datasetu i reguł.

Snapshot nie jest nadpisywany przez reprocessing. Nowe wejście lub nowa wersja
definicji tworzy osobny snapshot albo oznacza poprzedni jako wymagający
przeliczenia.

Snapshot przechowuje:

- wartość albo brak publikacji;
- readiness KPI;
- powody readiness;
- missing data;
- allowed i blocked decision types;
- evidence references;
- input hash;
- linki do reconciliation, lineage i Trust Drawer.

Stany readiness Fali 4:

- `READY`;
- `PARTIAL`;
- `EMPTY`;
- `STALE`;
- `INVALID`;
- `BLOCKED`;
- `PROCESSING`;
- `RECALCULATION_REQUIRED`.
