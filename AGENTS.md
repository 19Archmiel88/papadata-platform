# AGENTS.md — PapaData

## 1. Cel

To repozytorium rozwija PapaData jako platformę analityczno-decyzyjną dla e-commerce.

Traktuj dokumentację biznesową jako wymagany stan docelowy, a nie dowód istniejącej implementacji.

## 2. Źródła prawdy

Przed pracą odczytaj:
1. dokumentację biznesowo-produktową;
2. centralny rejestr decyzji;
3. kontrakt danych, stanów i KPI;
4. dokument integracji i gotowości operacyjnej;
5. dokument procesu właściwego dla zadania;
6. model komercyjny, jeżeli zadanie dotyczy billing/usage/entitlements;
7. bezpieczeństwo, prywatność i AI Governance;
8. właściwe ADR i kontrakty techniczne w repo.

Gdy źródła są sprzeczne:
- status decyzji ustala centralny rejestr decyzji;
- znaczenie biznesowe ustala dokument bazowy;
- szczegółową regułę domenową ustala dokument specjalistyczny;
- nie zgaduj — zgłoś sprzeczność.

## 3. Obowiązkowy workflow

Dla każdego zadania:
1. sprawdź aktywne instrukcje;
2. zbierz stan repo i właściwe pliki;
3. przedstaw plan;
4. wskaż pliki, zależności, ryzyka i testy;
5. czekaj na zatwierdzenie, gdy zadanie dodaje zależność, usuwa plik, zmienia architekturę albo rozszerza zakres;
6. wykonaj wyłącznie zatwierdzony zakres;
7. uruchom wymagane kontrole;
8. przedstaw diff i wynik.

Najpierw analiza bundle/repo, potem zmiana.

## 4. Operacje zakazane bez jawnej zgody

Nie wykonuj:
- `git commit`;
- `git push`;
- `git pull`;
- `git reset`;
- `git rebase`;
- `git checkout` zmieniającego branch;
- `git clean`;
- force push;
- usuwania plików;
- instalacji nowej zależności produkcyjnej;
- Terraform apply;
- zmian na GCP;
- migracji produkcyjnej;
- rotacji sekretów.

Nie używaj w dostarczanych skryptach:
- `set -e`;
- `set -u`;
- `set -o pipefail`;
- `set -euo pipefail`.

## 5. Granice tenantu

Organization jest granicą:
- własności;
- relacji handlowej;
- billingu;
- polityk nadrzędnych.

Workspace jest granicą:
- danych;
- autoryzacji operacyjnej;
- integracji;
- jobów;
- cache;
- audytu;
- eksportów;
- AI.

Reguły:
- używaj jawnie `organizationId` i `workspaceId`;
- nie wprowadzaj pola `tenantId`;
- każdy query, command, event, job, cache key, log, eksport i artefakt AI zachowuje oba właściwe zakresy;
- deny by default;
- UI nie jest źródłem decyzji bezpieczeństwa;
- każda zmiana dotycząca danych wymaga negatywnego testu obcego workspace.

## 6. Dane

- source data, normalized data, canonical data, ready dataset i ready KPI to różne stany;
- jeden fakt biznesowy zasila KPI jeden raz;
- brak danych nie jest zerem;
- dane transakcyjne i atrybucyjne są rozdzielone;
- definicje i reguły krytyczne są wersjonowane;
- nie usuwaj lineage;
- nie używaj AI do ustalania source authority, jakości, KPI ani uprawnień.

## 7. Integracje

Każda integracja musi uwzględniać:
- connect;
- scopes;
- verify;
- backfill;
- incremental sync;
- webhook, gdy provider go wspiera;
- checkpoint;
- idempotency;
- retry;
- rate limit;
- reconnect;
- disconnect;
- monitoring;
- audit;
- recovery;
- runbook;
- testy.

Nie pokazuj providera jako dostępnego bez przejścia wymaganych bram.

## 8. AI

- AI korzysta tylko z danych dopuszczonych przez readiness i uprawnienia;
- odpowiedź wskazuje evidence, ograniczenia i confidence;
- AI potrafi odmówić;
- istotne działania wymagają proposal, approval, revalidation, idempotency, audit i recovery;
- nie implementuj autonomicznych działań o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

## 9. UI i Storybook

- najpierw implementuj i weryfikuj UI w Storybooku;
- aplikacja produkcyjna używa tych samych komponentów;
- nazwy Storybooka są po polsku;
- przygotuj wszystkie wymagane stany: success, loading, empty, partial, error, cancelled, recovery;
- nie zmieniaj copy bez źródła;
- nie twórz atrap funkcjonalności;
- respektuj light i dark mode;
- testuj accessibility i krytyczne interakcje.

## 10. Kod

- TypeScript strict;
- małe, skupione zmiany;
- brak szerokiego refaktoru bez osobnego zadania;
- brak `any` bez uzasadnienia;
- brak niejawnego globalnego stanu;
- brak zależności między modułami omijających publiczny kontrakt;
- nie edytuj ręcznie plików generowanych;
- logi strukturalne i redaction danych wrażliwych;
- kwoty bez `number` dla obliczeń finansowych;
- czas w UTC, strefa IANA jawnie;
- każdy proces asynchroniczny jest idempotentny.

## 11. Testy

Po zmianie uruchom adekwatnie:
- format check;
- lint;
- typecheck;
- unit;
- integration;
- contract;
- tenant isolation;
- Storybook;
- E2E;
- build.

Nowa funkcja wymaga:
- happy path;
- błąd;
- brak uprawnienia;
- niewłaściwy workspace;
- retry/recovery, jeżeli dotyczy;
- audit, jeżeli dotyczy.

## 12. Zależności

Przed dodaniem zależności:
- wskaż problem;
- oceń alternatywę bez zależności;
- sprawdź utrzymanie, licencję, bezpieczeństwo i bundle/runtime cost;
- wskaż miejsce instalacji;
- uzyskaj zgodę.

Nie instaluj pakietów w root, jeżeli należą tylko do jednej aplikacji.

## 13. Dokumentacja

Aktualizuj:
- ADR przy decyzji technicznej;
- OpenAPI przy zmianie API;
- event schema przy zmianie zdarzenia;
- runbook przy zmianie operacyjnej;
- threat model przy zmianie granicy zaufania;
- Storybook przy zmianie stanu UI.

## 14. Raport końcowy

Podaj:
1. co zmieniono;
2. których plików dotyczy zmiana;
3. jakie testy uruchomiono;
4. wynik testów;
5. ryzyka;
6. elementy niewykonane;
7. czy dodano zależności;
8. czy wykonano operacje Git — domyślnie nie.
