# Retry i recovery integracji

## Macierz retry

Decyzję retry wylicza `retryDecisionForError`.

| Klasa błędu | Efekt |
| --- | --- |
| `RATE_LIMIT` | `RETRY_WAIT` z `retryAfterSeconds`. |
| `TRANSIENT` | `RETRY_WAIT` do wyczerpania budżetu. |
| `TIMEOUT` | `RETRY_WAIT`, potem `DLQ`. |
| `AUTH` | `REAUTH_REQUIRED`. |
| `REVOKED` | `REAUTH_REQUIRED` lub disconnect. |
| `SCOPE` | `LIMITED_ACCESS` i reconnect. |
| `SCHEMA_MISMATCH` | `FAILED`, manualna analiza mappingu. |
| `PERMISSION` | `FAILED`, brak automatycznego retry. |
| `VALIDATION_DATA` | `PARTIAL_SUCCESS` albo `FAILED`. |
| `BUG` | `DLQ` i eskalacja techniczna. |
| `INVARIANT` | `FAILED`, bez retry. |

## Retry wait

`RETRY_WAIT` zachowuje:

- `correlationId`;
- klasę błędu;
- następny możliwy czas próby;
- attempt;
- źródłowy `jobId`;
- status connection.

Retry nie tworzy nowego connection i nie kasuje checkpointów.

## DLQ

Job trafia do DLQ po wyczerpaniu retry budgetu lub przy błędzie technicznym,
którego nie wolno powtarzać automatycznie.

Replay z DLQ wymaga:

- capability `integration:replay`;
- zgodnego `tenantId` i `workspaceId`;
- idempotency key;
- powodu;
- ticketu operacyjnego.

Replay tworzy job typu `REPLAY` i zachowuje lineage do oryginalnego joba.

## Recovery po crashu

Worker crash po zapisie source i przed checkpointem jest wspierany jako
kontrolowany scenariusz:

- source records zostają w runtime;
- checkpoint pozostaje niepotwierdzony;
- kolejna próba deduplikuje source po naturalnym kluczu;
- checkpoint jest tworzony dopiero po udanym przebiegu;
- outbox publikuje zdarzenie po recovery.

## Partial failures

Disconnect przy błędzie revoke providera:

- usuwa lokalny credential material;
- oznacza connection jako `DISABLED`;
- tworzy alert operacyjny;
- zachowuje source data zgodnie z retencją;
- nie udaje pełnego revoke po stronie providera.
