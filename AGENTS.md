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

## 3. Workflow pracy Codexa

Dla każdego zadania:

1. odczytaj właściwe instrukcje i dokumentację;
2. sprawdź kod bezpośrednio związany z zadaniem;
3. dla większej zmiany przedstaw plan maksymalnie w 6 punktach;
4. skup się na implementacji, a nie na długich raportach;
5. uruchom właściwe testy, lint, typecheck i pozostałe kontrole;
6. po zielonej weryfikacji opublikuj zmianę zgodnie z sekcją 4.

Nie opisuj każdej komendy ani każdej zmienionej linii.
Raport końcowy ma być krótki.

Jawnego zatwierdzenia nadal wymagają:

- instalacja nowej zależności produkcyjnej;
- zmiana przyjętej architektury;
- rozszerzenie zakresu MVP;
- operacje na GCP lub Terraform;
- migracje danych;
- rotacja sekretów;
- usunięcie pliku, którego przeznaczenie nie jest jednoznaczne.
## 4. Git, commit i push

Po zakończeniu zadania, gdy wszystkie wymagane kontrole są zielone, Codex bez
dodatkowego pytania:

1. sprawdza `git status`, `git diff` oraz `git diff --check`;
2. upewnia się, że zmiany dotyczą wyłącznie bieżącego zadania;
3. dodaje właściwe pliki do indeksu;
4. tworzy jeden krótki commit w języku polskim;
5. wykonuje `git fetch origin main`;
6. sprawdza, czy publikacja będzie zwykłym fast-forward;
7. wykonuje `git push origin HEAD:main`.

Format commita:

`typ(zakres): krótki opis wykonanej pracy`

Przykłady:

- `feat(auth): dodaj obsługę sesji`
- `fix(ui): popraw renderowanie dashboardu`
- `refactor(repo): uporządkuj strukturę projektu`
- `docs(codex): uprość zasady pracy agenta`
- `chore(tooling): dodaj kontrolę dokumentacji`

Commit musi jednoznacznie wskazywać wykonany zakres. Nie używaj opisów takich
jak `zmiany`, `poprawki` albo `update`.

Jeżeli `origin/main` nie jest przodkiem bieżącego `HEAD`, zatrzymaj publikację
i zgłoś problem. Nie rozwiązuj tego przez przepisywanie historii.

Zawsze zabronione:

- force push;
- `git reset --hard`;
- `git clean`;
- przepisywanie historii;
- commitowanie sekretów;
- commitowanie `node_modules`, buildów, cache, logów i wyników testów;
- zmiana lub usuwanie plików niezwiązanych z zadaniem;
- używanie `set -e`, `set -u`, `set -o pipefail` albo `exit` w poleceniach dla użytkownika.
## 5. Granice tenanta

Google Cloud Organization `papadata.pl` jest wyłącznie korzeniem infrastruktury
GCP operatora platformy. Jej identyfikator nie jest identyfikatorem klienta i
nie może być używany w kontraktach domenowych aplikacji.

Tenant jest granicą klienta PapaData:

- każdy klient posiada osobny `tenantId`;
- tenant jest granicą własności danych;
- tenant jest granicą relacji handlowej i billingu;
- tenant jest granicą użytkowników, członkostw i polityk nadrzędnych;
- tenant jest granicą integracji, audytu, eksportów i operacji AI.

Workspace jest granicą operacyjną wewnątrz tenanta:

- jeden tenant może posiadać jeden lub wiele workspace;
- każdy workspace posiada własny `workspaceId`;
- workspace należy dokładnie do jednego `tenantId`;
- dane, autoryzacja operacyjna, joby i cache zachowują oba identyfikatory.

Reguły:

- używaj jawnie `tenantId` i `workspaceId`;
- nie używaj identyfikatora organizacji GCP jako identyfikatora domenowego;
- każdy query, command, event, job, cache key, log, eksport i artefakt AI
  zachowuje właściwy `tenantId` oraz `workspaceId`;
- deny by default;
- UI nie jest źródłem decyzji bezpieczeństwa;
- każda operacja na danych wymaga walidacji zgodności `workspaceId` z `tenantId`;
- każda zmiana dotycząca danych wymaga negatywnego testu obcego tenanta i
  obcego workspace;
- projekt GCP klienta, jeżeli istnieje, jest szczegółem deploymentu i nie
  zastępuje aplikacyjnego `tenantId`.
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

Raport końcowy ma być krótki i zawierać:

1. zakres wykonanej zmiany;
2. wynik wymaganych kontroli;
3. komunikat i identyfikator commita;
4. wynik publikacji do `origin/main`;
5. blocker lub ryzyko tylko wtedy, gdy faktycznie występuje.

Nie powtarzaj planu ani szczegółowego przebiegu pracy.

## 15. Reguły wykonawcze

- `docs/spec` jest wykonawczym źródłem prawdy dla produktu.
- Nie rozszerzaj zakresu MVP bez jawnej decyzji.
- Nie zgaduj brakujących decyzji biznesowych ani architektonicznych.
- Nie hardcoduj danych biznesowych w komponentach.
- Używaj typowanych fixtures.
- Uwzględniaj role, uprawnienia, motyw jasny i ciemny oraz stany błędne.
- Backend ponownie waliduje dostęp niezależnie od UI.
- AI nie może być implementowane jako generyczny chat bez kontraktu domenowego.
- Nie oznaczaj wymagania jako wdrożonego bez dowodu w kodzie i testach.
