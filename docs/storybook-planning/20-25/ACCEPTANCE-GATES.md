# Acceptance gates - 20 i 25

## Zasada

Podstawowy gate dostępności dla Storybooka i ekranów produkcyjnych obejmuje tylko: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

## Gate wspólny

Każde story przed `accepted` musi spełniać:

- light i dark bez dwóch różnych geometrii;
- desktop oraz wymagany reflow/compact/mobile zgodnie z zakresem story;
- brak lokalnych tokenów omijających Fundamenty bez udokumentowanej decyzji;
- brak lokalnych kopii komponentów z `10`;
- brak lokalnych kopii patterns z `18`;
- brak martwych buttonów/linków/triggers;
- podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states;
- widoczny stan loading/error/empty/no-access tam, gdzie kontrakt przewiduje taki wynik;
- TypeScript/typecheck;
- Storybook build;
- katalog/architecture/taxonomy/ownership guards;
- `git diff --check`;
- brak nowych błędów konsoli;
- screenshot light/dark oraz viewportów wymaganych przez story;
- dokumentacja i fixtures zsynchronizowane w tej samej zmianie.

## Gate 20 - Powłoka

Sekcja 20 nie może zostać accepted, jeżeli:

- AppShell nadal konkuruje z `05.02` jako drugi eksperymentalny shell;
- Sidebar ma dwa katalogi treści w `20.04` i `20.05`;
- Workspace Switcher miesza się z access-resolution;
- Command Palette ma własne prymitywy listbox/menu zamiast komponentów bazowych;
- Notification Center tworzy lokalny notice/status system;
- Background Operation Center redefiniuje stan operacji z `18`;
- OverlayRoot redefiniuje Dialog/Drawer/Popover zamiast nimi zarządzać;
- mobile shell jest osobnym design systemem;
- otwarcie/zwinięcie sidebara lub overlay resetuje route, scroll albo stan contentu.

## Gate 25 - Auth/Access

Sekcja 25 nie może zostać accepted, jeżeli:

- flow nie ma jawnego mapowania do `auth-01...auth-29`;
- story wymyśla operationId lub backend behavior;
- formularze są kopiami komponentów z `10`;
- stany zostały przepisane z `05.01` zamiast wynikać z prawdziwego FSM;
- access resolution jest kopią `20.06 Workspace Switcher`;
- public topbar jest lokalną wersją chrome;
- przejście `auth-29 -> AppShell` nie jest reprezentowane;
- zmiana theme/language/viewport kasuje dane w formularzu bez uzasadnienia domenowego;
- widoczne CTA nie ma rzeczywistego lokalnego działania demonstracyjnego lub jawnego reason-disabled;
- onboarding tworzy własny step/progress/notice/button system zamiast konsumować istniejące elementy.

## Gate governance

Status `accepted` oznacza jednocześnie:

1. story istnieje;
2. wymagania w `storybook-contract.json` odpowiadają implementacji;
3. dokumentacja opisuje rzeczywisty ownership;
4. registry nie pokazuje innego statusu niż story;
5. nie istnieje drugi aktywny source of truth dla tego samego wzorca;
6. testy/guardy wymagane dla danego story są rzeczywiście uruchamialne w repo.
