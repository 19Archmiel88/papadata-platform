# Observability i detekcja

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/10-observability-detection.md:L15-L35`
- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/13-release-gates.md:L17-L37`

## Implementacja repozytoryjna

- API emituje trace OTLP oraz metryki HTTP z route/method/status i histogramem latency.
- Request context utrzymuje correlation ID i request ID, a ApiProblem zwraca identyfikatory bez stack trace.
- `/metrics` wymaga osobnego tokenu infrastrukturalnego.
- `infra/otel/otel-collector-production.yaml` posiada batching, memory limiter, retry i kolejkę do zewnętrznego OTLP endpointu.

## Odbiór zewnętrzny

Wymagane są źródła i alerty dla:

- p95/p99 latency i 5xx API/BFF;
- auth failure, denied capability i step-up failure;
- Redis/PostgreSQL/storage readiness;
- queue depth, lease age, retry/dead-letter i scheduler drift;
- integracji: error class, provider rate limits i freshness;
- privacy SLA i deletion ledger failures;
- Cloud Armor deny/rate limit;
- Cloud SQL backup/PITR i restore drill.

Każdy alert musi mieć ownera, próg, okno, runbook, test sygnału i termin przeglądu. Debug exporter nie jest dopuszczalnym exporterem produkcyjnym.
