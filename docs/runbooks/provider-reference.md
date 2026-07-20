# Runbook providera integracji

## Cel

Ten runbook opisuje minimalny proces operacyjny dla providerów Fali 2. Dotyczy
WooCommerce i jest szablonem dla kolejnych integracji MVP.

## Bramy dostępności

Provider można pokazać jako dostępny tylko wtedy, gdy:

- jest w katalogu;
- adapter jest zweryfikowany;
- środowisko jest skonfigurowane i zweryfikowane;
- runtime availability nie jest `disabled`;
- operational readiness nie jest `not_ready`;
- tenant ma entitlement;
- użytkownik ma capability;
- minimal scopes zostały przyznane lub UI pokazuje limited access.

## Connect

1. Sprawdź provider catalog.
2. Sprawdź entitlement workspace.
3. Sprawdź capability `integration:connect`.
4. Rozpocznij OAuth z idempotency key.
5. Zweryfikuj `state` i redirect.
6. Zapisz credential material w Secret Store.
7. Zwróć tylko metadata credential.
8. Ustaw connection jako `ACTIVE` albo `LIMITED_ACCESS`.
9. Zapisz audit event.

## Initial sync

1. Utwórz `SyncJob` typu `INITIAL`.
2. Pobierz stronę providera przez adapter.
3. Zapisz source batch i source records.
4. Zaktualizuj checkpoint.
5. Utwórz outbox event.
6. Opublikuj outbox.
7. Ustaw job jako `SUCCESS`, `PARTIAL_SUCCESS`, `RETRY_WAIT`, `FAILED` albo
   `DLQ`.

## Incremental sync

1. Zweryfikuj podpis webhooka.
2. Odrzuć duplikat event ID.
3. Utwórz job typu `INCREMENTAL`.
4. Użyj checkpointu streamu jako punktu startu.
5. Zastosuj tę samą kolejność source przed checkpointem.

## Backfill

Backfill wymaga capability `integration:backfill` i jawnego zakresu czasu.
Backfill nie usuwa checkpointu incremental i nie miesza danych między workspace.

## Reconnect

Reconnect jest wymagany przy:

- wygaśnięciu credential;
- revoked credential;
- zmianie scopes;
- `REAUTH_REQUIRED`;
- zmianie konfiguracji providera.

Nie wolno przepinać connection na inny `externalAccountRef`. Inne konto wymaga
nowego connection.

## Disconnect

Disconnect:

- anuluje przyszłe joby;
- próbuje revoke u providera;
- usuwa lokalny credential material;
- ustawia connection jako `DISABLED`;
- zachowuje source data zgodnie z retencją;
- zapisuje audit event;
- tworzy alert, jeżeli revoke providera się nie udał.

## Recovery

Przy `RETRY_WAIT` sprawdź klasę błędu i `retryAfterSeconds`. Przy `DLQ` wykonaj
replay tylko z ticketem operacyjnym i po potwierdzeniu, że problem został
usunięty.

Przy `SCHEMA_MISMATCH` nie uruchamiaj automatycznego retry. Najpierw popraw
mapping adaptera i dopiero potem wykonaj replay.

## Dowody

Dowody Fali 2 znajdują się w `docs/evidence/wave-2/README.md`.
