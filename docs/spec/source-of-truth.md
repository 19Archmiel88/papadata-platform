# Źródła prawdy i zasady interpretacji

## Status dokumentacji

Dokumentacja opisuje wymagany stan docelowy PapaData.

Nie potwierdza, że:

- funkcja została zaimplementowana,
- integracja działa,
- testy przeszły,
- środowisko produkcyjne istnieje,
- kontrola bezpieczeństwa została zweryfikowana.

## Zasady nadrzędne

- Organization jest granicą własności, billingu i polityk.
- Workspace jest granicą danych, integracji, operacji, audytu i AI.
- Kontrakty używają jawnie `tenantId` oraz `workspaceId`.
- Role są pakietami capabilities oraz data scope.
- Autoryzacja jest egzekwowana po stronie backendu.
- MVP ma działać end-to-end.
- Ograniczenie MVP dotyczy liczby integracji, wariantów i skali.
- Każda funkcja MVP ma stany sukcesu, oczekiwania, błędu i recovery.
