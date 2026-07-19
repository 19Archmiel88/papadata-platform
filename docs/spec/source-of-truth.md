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

- Tenant jest granicą klienta, własności danych, relacji handlowej, billingu i
  polityk nadrzędnych.
- Workspace jest granicą operacyjną danych, integracji, operacji, audytu i AI
  wewnątrz jednego tenanta.
- Kontrakty używają jawnie `tenantId` oraz `workspaceId`.
- Identyfikator organizacji Google Cloud nie jest identyfikatorem domenowym
  klienta.
- Role są pakietami capabilities oraz data scope.
- Autoryzacja jest egzekwowana po stronie backendu.
- MVP ma działać end-to-end.
- Ograniczenie MVP dotyczy liczby integracji, wariantów i skali.
- Każda funkcja MVP ma stany sukcesu, oczekiwania, błędu i recovery.

## Reguły identyfikatorów

- zasób tenanta zawiera `tenantId`;
- zasób workspace zawiera `tenantId` oraz `workspaceId`;
- zasób globalny nie zawiera żadnego z tych identyfikatorów;
- backend waliduje zgodność `tenantId` i `workspaceId` przed autoryzacją
  operacji;
- zmiana workspace resetuje cache, drafty i dane workspace;
- cache, drafty i dane nie mogą być przenoszone pomiędzy workspace.
