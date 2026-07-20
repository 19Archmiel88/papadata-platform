# ADR 0009: Storage plikow i artefaktow

## Status

Zaakceptowano.

## Kontekst

PapaData będzie przechowywać eksporty, raporty, pliki integracji, artefakty AI
oraz pakiety dowodów. Pliki muszą zachować granice tenant/workspace, retencję,
audyt, recovery i bezpieczne udostępnianie.

## Decyzja

Kanonicznym kontraktem storage jest port aplikacyjny zgodny z wymaganiami
Google Cloud Storage. W GCP używamy Cloud Storage. Lokalnie i w CI używamy
emulatora GCS albo MinIO za adapterem storage, bez przeciekania typów dostawcy
do domeny.

Obiekt storage zachowuje `tenantId`, `workspaceId`, klasyfikację danych,
retencję, checksum, rozmiar, content type, `correlationId` i odniesienie do
audytu. Bezpośrednie publiczne linki nie są kontraktem domenowym.

## Konsekwencje

- Eksport i raport nie są uznane za gotowe bez rekordu audytu i zasad retencji.
- Storage nie może zawierać sekretów providerów ani niepotrzebnych danych
  osobowych.
- Operacje usunięcia wymagają ledger lub innego trwałego dowodu wykonania.
