# PapaData Web

React, TypeScript, Vite i jeden Storybook korzystający z komponentów aplikacji.

## Podgląd na żywo

Z katalogu głównego repozytorium uruchom w osobnych terminalach:

```bash
pnpm dev:web
pnpm storybook
```

- Aplikacja: http://localhost:5173/preview/command-center
- Kampanie: http://localhost:5173/preview/campaigns
- Zamówienia: http://localhost:5173/preview/orders
- Produkty: http://localhost:5173/preview/products
- Decyzje: http://localhost:5173/preview/decisions/centrum-decyzji
- Decyzje w Storybooku: http://localhost:6010/?path=/story/decyzje-centrum-decyzji-całość--overview
- Storybook: http://localhost:6010/?path=/story/analiza-centrum-dowodzenia-całość--overview

Przy zdalnym IDE przekieruj porty 5173 i 6010. Zmiany kodu aktualizują podgląd automatycznie. Główne `pnpm dev` uruchamia usługi backendowe.

Trasy `/preview/*` są dostępne wyłącznie w trybie deweloperskim. Używają rzeczywistych ekranów i wspólnej powłoki z oznaczonymi danymi demonstracyjnymi. Nie tworzą sesji logowania ani połączeń ze źródłami. Routing `/app/*` nadal korzysta z uwierzytelnienia i BFF; integracja danych produkcyjnych pozostaje osobnym zadaniem.

## Jeden kierunek wizualny

Paleta wiśnia–pistacja–porcelana ma wariant jasny i ciemny. Wspólne tokeny znajdują się w `src/design-system/foundations/tokens.css`. Powłoka produktu i nawigacja są w `src/runtime/shell`; Storybook importuje te same ekrany i style. Nie ma osobnej skórki ani mechanizmu ukrywającego fragmenty DOM na potrzeby katalogu.

Przegląd, główna analiza kampanii, kolejka realizacji zamówień i Produkty mają przebudowane układy, wspólny zakres dat oraz stany danych. W kampaniach kanał, daty i porównanie obejmują KPI, trend i tabelę. Atrybucja, kreacje i analizy historyczne zachowują jawnie podany okres przykładowy. W zamówieniach wybór daty złożenia i źródła obejmuje KPI oraz kolejkę. Filtry problemów i wyszukiwanie zawężają tabelę; eksportuje ona widoczne rekordy. Szczegóły korzystają ze wspólnego Drawer, bez fikcyjnej marży i czasu wysyłki. Próbka sześciu rekordów nie reprezentuje pełnej sprzedaży sklepu. Płatności, zwroty, lejek i wnioski pozostają osobnym, oznaczonym przykładem miesięcznym.

Produkty mają zyskowność, zapasy, ABC/XYZ, promocje i koszyk, symulator zestawów, cykl życia oraz wnioski ze szczegółami SKU. Daty i kategoria obejmują sprzedaż, koszt, klasyfikację oraz dzienne zestawienia promocji i koszyków. Magazyn ma osobną datę stanu: 31 sierpnia 2026; jego pokrycie korzysta z poprzednich 30 dni. Brak kosztu wyłącza marżę i ABC, a mniej niż 14 dni historii wyłącza XYZ i ocenę pokrycia. Symulator liczy cenę i marżę netto zestawu; nie prognozuje popytu ani nie zmienia cen w sklepie.

Decyzje mają wspólną kolejkę priorytetów, panel dowodów, warianty planu, właściciela i termin, odnotowanie wykonania, pomiar oraz rejestr uzasadnień. Akceptacja zapisuje plan; wykonanie i pomiar są kolejnymi etapami. Brak danych blokuje zależną decyzję. Przy tworzeniu propozycji określa się metrykę, jednostkę, kierunek, opcjonalną bazę i okno pomiaru. Wynik przed/po nie jest traktowany jako dowód przyczynowości.

Demonstracyjne Decyzje zapisują dziennik zdarzeń w `papadata.decisions.demo.commerce.v1` w localStorage danego pochodzenia. Aplikacja i Storybook mają osobne zapisy ze względu na porty. Zapis odtwarza stan po odświeżeniu, synchronizuje kolejne zmiany pomiędzy kartami tego samego pochodzenia i raportuje uszkodzenie lub brak miejsca. Rejestr z bieżących filtrów można pobrać jako JSON. To lokalna demonstracja, bez wspólnego rejestru serwerowego, egzekwowania uprawnień na backendzie ani wykonania działań w sklepie. Stories interakcji są izolowane i nie zapisują demonstracji użytkownika. Okres dowodów każdej decyzji pozostaje stały; link do źródła odtwarza ten okres i właściwe filtry niezależnie od globalnych dat.

Pozostałe domeny korzystają ze wspólnej powłoki i palety, a ich układy oczekują na kolejne etapy migracji.

Pełne widoki służą do spokojnego oglądania produktu. Stories interakcji sprawdzają konkretne przepływy, a stories stanów pokazują wczytywanie, błąd, pusty i niepełny okres.

## Weryfikacja

```bash
pnpm --filter @papadata/web typecheck
pnpm --filter @papadata/web test
pnpm --filter @papadata/web build
pnpm build-storybook
```
