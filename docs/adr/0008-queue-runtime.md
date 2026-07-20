# ADR 0008: Kolejka i model jobow

## Status

Zaakceptowano.

## Kontekst

Integracje, synchronizacje, backfill, eksporty, AI actions, cleanup i
reprocessing wymagają asynchronicznego przetwarzania. Dokumentacja wymaga
idempotencji, retry budget, checkpointów, DLQ, replay, audytu i
obserwowalności jobów.

## Decyzja

Backend używa wspólnego kontraktu kolejki za portem aplikacyjnym. Lokalnie i w
CI działa `queue-emulator`. W GCP adapter może mapować komendy i eventy na
zatwierdzone usługi kolejki, w szczególności Pub/Sub oraz Cloud Tasks.

Payload kolejki jest minimalny i zawiera referencje, a nie pełne dane
biznesowe. Każdy job zachowuje `tenantId`, `workspaceId`, `operationId`,
`correlationId`, `causationId`, typ, wersję, checkpoint, licznik prób i klasę
błędu.

## Konsekwencje

- Konsumenci muszą być idempotentni.
- Retry używa backoff, jitter i jawnego retry budget.
- DLQ replay wymaga capability, uzasadnienia i audytu.
- Implementacja kolejki, workerów, outbox, storage i scheduler jest osobnym
  zadaniem backendu.
