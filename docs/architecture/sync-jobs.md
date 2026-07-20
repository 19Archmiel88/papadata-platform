# Sync joby

## Kontrakt

`SyncJob` jest wersjonowanym zasobem workspace i zawsze zawiera:

- `tenantId`;
- `workspaceId`;
- `connectionId`;
- `providerId`;
- typ joba;
- zakres;
- streamy;
- idempotency key;
- fingerprint komendy;
- attempt i retry budget;
- progress;
- checkpoint ref;
- status.

Typy jobów:

- `INITIAL`;
- `INCREMENTAL`;
- `BACKFILL`;
- `CATCH_UP`;
- `REPLAY`;
- `RECOVERY`.

Statusy jobów:

- `QUEUED`;
- `RUNNING`;
- `RETRY_WAIT`;
- `PARTIAL_SUCCESS`;
- `SUCCESS`;
- `FAILED`;
- `CANCELLED`;
- `DLQ`.

## Checkpoint

Checkpoint jest lokalny dla connection, streamu, tenanta i workspace.

Reguły:

- source batch i source records są zapisane przed checkpointem;
- checkpoint nie może cofnąć watermarka;
- checkpoint nie może zmienić connection, streamu, tenanta ani workspace;
- worker crash po zapisie source nie powoduje duplikacji source records;
- wznowienie używa ostatniego potwierdzonego checkpointu.

## Source ingest

Fala 2 zapisuje wyłącznie source data:

- `SourceBatch` opisuje pobraną stronę providera;
- `SourceRecord` przechowuje fingerprint, source checksum i payload ref;
- source payload jest przechowywany przez runtime jako referencja testowa;
- source record nie jest canonical record;
- source record nie oznacza gotowego datasetu ani KPI.

Naturalny klucz source zawiera:

- `tenantId`;
- `workspaceId`;
- `providerId`;
- `connectionId`;
- stream;
- external ID.

## Idempotencja

Komendy connect, job, replay, reconnect i disconnect wymagają idempotency key.

Runtime zapamiętuje fingerprint komendy:

- ten sam key i ten sam fingerprint zwraca istniejący wynik;
- ten sam key i inny fingerprint jest konfliktem;
- fingerprint nie zawiera sekretów ani payloadów providera.

## Outbox

Outbox event jest tworzony po zapisie source i checkpointu. Publikacja jest
jawna, powtarzalna i nie zmienia source data.

Outbox nie przenosi danych między workspace i nie zawiera credential material.
