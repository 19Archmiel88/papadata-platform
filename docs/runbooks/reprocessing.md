# Runbook Reprocessingu

1. Zweryfikuj capability `data-quality:reprocess`.
2. Wskaż dataset, period, reason i target rule versions.
3. Utwórz `ReprocessJob` z idempotency key.
4. Wygeneruj impact report old/new.
5. Nie publikuj nowej wersji, jeżeli impact report lub reconciliation są poza
   bramą.
6. Zachowaj poprzedni wynik dostępny zgodnie z polityką.
7. Zapisz audit eventy `REPROCESS_REQUESTED`, `REPROCESS_STARTED` i
   `REPROCESS_COMPLETED` albo `REPROCESS_FAILED`.
