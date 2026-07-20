# Security Policy

Status: draft lokalny.
Not legal advice.

## Supported Code

Aktualnie wspierany jest wyłącznie kod z gałęzi `main` repozytorium PapaData.
Projekt jest w fazie rozwoju, więc produkcyjny proces zgłaszania podatności
wymaga jeszcze ustalenia właściciela i kanału.

## Reporting A Vulnerability

Do ustalenia przed produkcją:

- adres e-mail bezpieczeństwa: DO USTALENIA Z OWNEREM;
- SLA potwierdzenia zgłoszenia: DO USTALENIA Z OWNEREM;
- PGP/security contact: DO USTALENIA Z OWNEREM.

Nie zgłaszaj sekretów ani danych klientów przez publiczne issue.

## Baseline Expectations

- Nie commitować sekretów, tokenów, kluczy prywatnych ani plików credential.
- `VITE_*` traktować jako publiczne po buildzie.
- Dane tenant/workspace są izolowane i ponownie walidowane po stronie backendu.
- AI nie może ujawniać sekretów ani omijać readiness/uprawnień.
- Produkcja nie może mieć włączonego MSW ani danych fixture.

## Production Readiness Gates

Przed produkcją wymagane są co najmniej:

- dependency scan;
- secret scan;
- SAST;
- SBOM;
- container scan;
- testy authz i izolacji tenant/workspace;
- testy backup/restore i recovery;
- finalne nagłówki bezpieczeństwa hostingu;
- przegląd prawny dokumentów prywatności i regulaminów.
