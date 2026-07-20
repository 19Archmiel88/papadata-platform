# Incident And Breach Procedure

Status: draft.
Not legal advice. Wymaga przeglądu prawnego i security ownera.

## Severity Intake

Critical:

- wyciek sekretu produkcyjnego;
- cross-tenant data exposure;
- kompromitacja konta uprzywilejowanego;
- utrata integralności audit logu;
- nieautoryzowane działanie AI po approval.

High:

- provider credential exposure;
- brak izolacji workspace;
- istotna luka auth/session;
- utrata raportów lub eksportów klientów.

Medium/Low:

- nieprodukcyjny sekret testowy;
- błędna konfiguracja headers w środowisku nieprodukcyjnym;
- zależność podatna bez ścieżki exploita.

## Procedure

1. Przyjąć zgłoszenie i nadać incident ID.
2. Zabezpieczyć dowody bez drukowania sekretów w logach.
3. Ustalić tenantId, workspaceId, zakres danych i czas ekspozycji.
4. Ograniczyć wpływ: revoke sesji, rotacja sekretów, disable integracji lub AI.
5. Ocenić obowiązek notyfikacji: DO USTALENIA Z PRAWNIKIEM.
6. Przygotować komunikację do klientów: DO USTALENIA Z OWNEREM.
7. Wykonać root cause analysis i działania korekcyjne.
8. Zaktualizować runbooki, testy i dokumentację.

## Evidence

Dowody muszą zawierać:

- timeline UTC;
- correlation IDs;
- affected tenant/workspace;
- impacted systems;
- actions taken;
- recovery validation;
- decision owner.
