# ADR 0003: Granica tenanta i hierarchia Google Cloud

## Status

Zaakceptowano.

## Kontekst

PapaData działa w jednej organizacji Google Cloud `papadata.pl`. Organizacja
GCP zawiera foldery środowiskowe, między innymi `env-dev`, `env-stg` i
`env-prod`.

Organizacja Google Cloud należy do operatora platformy i nie reprezentuje
klienta aplikacji.

Dotychczasowe kontrakty aplikacji używały nazwy `organizationId` jako
biznesowej granicy klienta. Nazwa ta jest niejednoznaczna i może być mylona z
identyfikatorem organizacji Google Cloud.

## Decyzja

- każdy klient PapaData jest tenantem;
- każdy klient otrzymuje osobny `tenantId`;
- jeden tenant może posiadać jeden lub wiele workspace;
- każdy workspace należy dokładnie do jednego tenanta;
- `tenantId` jest nadrzędną granicą izolacji;
- `workspaceId` jest granicą operacyjną wewnątrz tenanta;
- identyfikator organizacji Google Cloud nie występuje w kontraktach
  domenowych;
- dedykowany projekt GCP klienta jest opcjonalnym wariantem infrastruktury,
  a nie zamiennikiem `tenantId`.

## Zakres izolacji

`tenantId` jest obowiązkowy dla:

- danych i zapytań;
- użytkowników, członkostw i autoryzacji;
- integracji;
- billingu;
- eventów i jobów;
- cache;
- logów i audytu;
- eksportów;
- artefaktów i działań AI.

Operacje wykonywane w workspace zachowują jednocześnie `tenantId` i
`workspaceId`.

## Bezpieczeństwo

Backend waliduje:

1. istnienie tenanta;
2. przynależność workspace do tenanta;
3. członkostwo użytkownika w wymaganym zakresie;
4. wymagane capability;
5. brak dostępu do obcego tenanta lub workspace.

Każda operacja na danych wymaga testów negatywnych dla obcego `tenantId` oraz
obcego `workspaceId`.

## Konsekwencje

Istniejące typy i implementacje wykorzystujące `OrganizationId`,
`organizationId`, `Organization` oraz zakres `organization` są elementem
przejściowym.

Migracja kodu zostanie wykonana oddzielnie i obejmie:

- kontrakty TypeScript;
- auth i autoryzację;
- fixtures;
- API HTTP;
- persistence;
- audit;
- UI;
- testy jednostkowe, integracyjne, security i browser E2E.

Do zakończenia migracji nie należy dodawać nowych kontraktów domenowych
opartych na `organizationId`.
