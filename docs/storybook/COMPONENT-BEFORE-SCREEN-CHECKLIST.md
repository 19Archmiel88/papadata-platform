# Checklist przed nowym komponentem

Ta checklista ogranicza ryzyko tworzenia lokalnych wyjątków, które później dublują design system.

- [ ] Sprawdzono, czy komponent nie istnieje już w `apps/web/src/design-system/components`.
- [ ] Sprawdzono `rejestry/runtime-component-api.csv` i `apps/web/src/design-system/component-system-v1.json`.
- [ ] Wskazano jedno źródło prawdy: komponent bazowy, komponent domenowy albo helper Storybooka.
- [ ] Zdefiniowano odpowiedzialność komponentu bez przejmowania odpowiedzialności ekranu.
- [ ] Zdefiniowano publiczne props bez przypadkowych `any`.
- [ ] Dodano warianty light/dark oraz desktop/tablet/mobile, jeżeli komponent ma wpływ na layout.
- [ ] Dodano keyboard/focus/error/empty/loading, jeżeli komponent przyjmuje interakcję lub dane.
- [ ] Dodano fixture albo jawnie uzasadniono, dlaczego fixture nie jest potrzebny.
- [ ] Dodano story w aktywnym katalogu Storybooka.
- [ ] Dodano wpis w rejestrze runtime API, jeżeli komponent jest publiczny.
- [ ] Użyto tokenów design systemu zamiast lokalnych palet i wartości magicznych.
- [ ] Sprawdzono brak duplikacji klas CSS poza jawną allowlistą.
