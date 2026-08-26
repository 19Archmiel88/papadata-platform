# Audyt dokumentacji, Storybooka, komponentów i frontendu - 2026-08-12

## Status po bieżącym cyklu

Zakres bieżącego cyklu: P0 i P1 zostały wdrożone technicznie oraz uzupełnione o korekty walidacyjne. P2 i P3 zostały przekształcone w jawne guardy, indeksy evidence oraz dokumenty operacyjne. Commit, push, synchronizacja z `main`, usunięcie brancha i notatka końcowa w Google Docs pozostają poza tym krokiem do czasu pełnej walidacji lokalnej i końcowej akceptacji.

Potwierdzenie oznaczeń: wszystkie dokumenty w `docs/specyfikacja-docelowa/` mają w frontmatter wpis `work_prerequisite`, który mówi, że przed wykonaniem prac trzeba zapoznać się z danym dokumentem i jego powiązaniami. Stan po weryfikacji: `470/470` plików `.md`.

Usunięto niepotrzebne artefakty robocze z poprzedniego cyklu oraz dodano guard martwych referencji, żeby usunięte archiwa, backupy i raporty historyczne nie wracały jako aktywny gate.

Poprawiono ryzyka P2: dodano guard placeholderów dokumentacyjnych, guard lokalnych kolorów hex, guard duplikacji klas CSS, guard martwych referencji do artefaktów, indeks browser audit dla `30/31`, rozdzielenie technicznego PASS od właścicielskiej akceptacji UI oraz dokumenty operacyjne P3.

Domknięto P1 technicznie: wdrożono komponenty domenowe `Combobox`, `DateRangePicker`, `PageHeader`, `Panel`, `DataStatusBanner`, `EvidencePanel`, `RecommendationCard`, `DecisionQueue`, `MorningBrief`, `AssistantComposer`, `ResultDrivers`, `SalesSources`, `FunnelStep`, `FunnelChart`, `WaterfallChart`, `BudgetPacing`, `AttributionComparison` i `PlanPerformance`; spięto produkcyjne ekrany `30.01-30.13` oraz `31.01-31.06` z BFF przez `bffClient`, routing runtime, Storybook, fixtures, rejestry i katalog.

Browser audit dla P1 `30/31`: dodano jawny tryb `audit-storybook-business-screens` i indeks wymaganych story. Świeży artefakt browser audit musi zostać wygenerowany na lokalnym WSL po wdrożeniu paczki; sam wpis `accepted` ani techniczna implementacja nie zastępują właścicielskiej akceptacji UI.

Korekty walidacyjne P0/P1: dodano typy matcherów `storybook/test` dla TypeScript oraz jawny typ parametru `manualChunks(id: string)` w `vite.config.ts`.

Kontrole wykonane w odtworzonym środowisku ZIP: `python scripts/validate_all.py .` PASS, dedykowane guardy Storybook/design-system PASS, nowe guardy P2 PASS, `git diff --check` PASS, bezpośredni `tsc -b` dla `@papadata/web` PASS. Pełne komendy `pnpm`, build Storybooka, build web, testy i browser audit muszą zostać powtórzone po wdrożeniu paczki w lokalnym WSL.

Optymalizacja bundla po P1: routing ładuje ciężkie ekrany lazy-loaded, a `vite.config.ts` rozdziela `vendor-react` i `vendor-charts`; produkcyjny build web wymaga rewalidacji lokalnej po wdrożeniu paczki.

## Aktualne konflikty i ryzyka

- `accepted` w Storybooku nie oznacza automatycznie gotowego ekranu produkcyjnego.
- Produkcyjne ekrany domenowe `30.01-30.13` oraz `31.01-31.06` są wdrożone technicznie, ale wymagają osobnej akceptacji właścicielskiej UI przed komunikowaniem pełnej gotowości biznesowej.
- Pakiet prawny ma status `legal-template`; nie wolno traktować go jako podpisanego lub gotowego produkcyjnie dokumentu.
- `MANIFEST.json` został oczyszczony z usuniętych plików historycznych i potwierdzony przez końcowe `validate_all.py`.

## Moment startu prawdziwych ekranów produkcyjnych

Prawdziwe ekrany produkcyjne można tworzyć dopiero po domknięciu tej sekwencji:

1. `00 Fundamenty` i publiczne komponenty bazowe mają accepted Storybook, runtime API registry i testy.
2. `20.01-20.11` daje zaakceptowaną powłokę aplikacji: AppShell, topbar, sidebar, mobile shell, OverlayRoot i globalne operacje.
3. `25.01-25.10` daje produkcyjny Auth/onboarding, sesję, routing chroniony, błędy formularzy i stany dostępu.
4. Dopiero wtedy rozpoczyna się produkcyjna budowa ekranów domenowych `30+`.

Praktyczny start ekranów produkcyjnych: po P0.01-P0.20 z poniższej listy. W tej gałęzi P0.01-P0.20 ma status TECH technicznie: powłoka `20`, Auth `25.01/25.02/25.03/25.07/25.08`, publiczne runtime API oraz routing `/app` i `/app/command-center` są spięte z kontraktem, fixtures i rejestrami. Od tego momentu tworzone są prawdziwe ekrany domenowe `30+`. W P1 wdrożono produkcyjnie `30.01-30.13` oraz `31.01-31.06`; pozycje `30.14`, `31.07` i `31.08` pozostają poza tym cyklem.

## Komponenty do przygotowania w Storybooku

Najpierw muszą być kompletne komponenty bazowe: `Button`, `IconButton`, `TextAction`, `LinkAction`, `TextField`, `PasswordField`, `Textarea`, `Select`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `DateRangePicker`, `SearchField`, `FilterBar`, `SortControl`, `DataTable`, `ColumnPicker`, `BulkActionBar`, `Pagination`, `Tabs`, `Menu`, `Popover`, `Tooltip`, `Dialog`, `AlertDialog`, `Drawer`, `OverlayRoot`, `BottomSheet`, `InlineNotice`, `Toast`, `StatusBadge`, `EmptyState`, `ErrorState`, `Skeleton`, `Spinner`, `ProgressIndicator`, `BackgroundOperationItem`, `PageHeader`, `SectionNavigation`, `Breadcrumbs`.

Następnie komponenty analityczne i domenowe: `ChartFrame`, `MetricCard`, `TrendChart`, `ComparisonChart`, `CorrelationChart`, `ForecastChart`, `ShareChart`, `ChartDataState`, `ChartInteractionLayer`, `DataStatusBanner`, `EvidencePanel`, `RecommendationCard`, `DecisionQueue`, `BudgetPacing`, `AttributionComparison`, `ReconciliationPanel`, `SyncTimeline`, `LineageGraph`, `CohortMatrix`, `CustomerSegments`, `SalesFunnel`, `FunnelStep`, `MorningBrief`, `AssistantComposer`, `PairingFlow`.

Każdy element Storybooka ma mieć: PL/EN, light/dark, desktop/tablet/mobile, keyboard/focus, podstawową dostępność `Contrast`, `Keyboard`, `Focus`, `Forms`, `Semantics`, `ARIA`, `Alt text`, `Error states`, fixture, play test i jawny status w rejestrze.

## Kolejne etapy pracy

### P0 - 20 pozycji

| ID | Status | Zadanie | Wynik oczekiwany |
| --- | --- | --- | --- |
| P0.01 | TECH | Domknąć `20.01 AppShell` w Storybooku | Accepted, testy, desktop/tablet/mobile |
| P0.02 | TECH | Domknąć `20.02 Topbar publiczny` | Gotowy wariant dla Auth i publicznych tras |
| P0.03 | TECH | Domknąć `20.03 Topbar zalogowany` | Gotowy wariant dla aplikacji chronionej |
| P0.04 | TECH | Domknąć `20.04 Sidebar` | Nawigacja, focus, aktywny stan, role |
| P0.05 | TECH | Domknąć `20.05 Sidebar warianty` | Collapsed, dense, error-safe |
| P0.06 | TECH | Domknąć `20.06 Workspace switcher` | Role, uprawnienia, empty/error |
| P0.07 | TECH | Domknąć `20.07 Global search / command palette` | Keyboard, focus trap, wyniki puste |
| P0.08 | TECH | Domknąć `20.08 Powiadomienia` | Toast/lista/empty/error |
| P0.09 | TECH | Domknąć `20.09 Operacje w tle` | Progress, retry, cancel, status |
| P0.10 | TECH | Domknąć `20.10 OverlayRoot` | Dialog/Drawer/Popover bez konfliktów warstw |
| P0.11 | TECH | Domknąć `20.11 Powłoka mobilna` | Mobile shell bez poziomego overflow |
| P0.12 | TECH | Domknąć publiczne runtime API `Button/IconButton/TextAction` | Accepted w registry i Storybooku |
| P0.13 | TECH | Domknąć publiczne runtime API formularzy | TextField, PasswordField, Select, Checkbox, RadioGroup |
| P0.14 | TECH | Domknąć publiczne runtime API overlayów | Dialog, AlertDialog, Drawer, Popover, Tooltip |
| P0.15 | TECH | Domknąć publiczne runtime API feedbacku | InlineNotice, Toast, EmptyState, ErrorState, StatusBadge |
| P0.16 | TECH | Domknąć `25.01 Wejście do Auth` | Pierwszy ekran produkcyjny Auth może startować |
| P0.17 | TECH | Domknąć `25.02 Logowanie` | Formularz, błędy, loading, session handoff |
| P0.18 | TECH | Domknąć `25.03 Rejestracja` | Walidacja, zgody, error states |
| P0.19 | TECH | Domknąć `25.07 MFA` i `25.08 Odzyskiwanie dostępu` | Step-up, reset, rate limit |
| P0.20 | TECH | Domknąć routing chroniony `/app` i `/app/command-center` | Start prawdziwych ekranów domenowych |

### P1 - 20 pozycji

| ID | Status | Zadanie | Wynik oczekiwany |
| --- | --- | --- | --- |
| P1.01 | TECH | Zbudować produkcyjny `CommandCenter` shell | Ekran bez danych fikcyjnych |
| P1.02 | TECH | Przygotować `30.01 Widok główny` w Storybooku | Accepted przed runtime |
| P1.03 | TECH | Przygotować `30.02 Kolejka uwagi` | DecisionQueue i stany danych |
| P1.04 | TECH | Przygotować `30.03 KPI` | MetricCard, ChartFrame, źródła |
| P1.05 | TECH | Przygotować `30.04 Plan vs wynik` | Trend/Comparison bez lokalnych stylów |
| P1.06 | TECH | Przygotować `30.05 Drivery wyniku` | EvidencePanel, RecommendationCard |
| P1.07 | TECH | Przygotować `30.06 Źródła sprzedaży` | ShareChart i tabela alternatywna |
| P1.08 | TECH | Przygotować `30.07 Ruch` | Traffic summary i error states |
| P1.09 | TECH | Przygotować `30.08 Produkty` | DataTable, pagination, filters |
| P1.10 | TECH | Przygotować `30.09 Klienci` | Privacy, masking, no-access |
| P1.11 | TECH | Przygotować `30.10 Lejek` | FunnelStep/FunnelChart |
| P1.12 | TECH | Przygotować `30.11 Rekomendacje AI` | Human approval i confidence |
| P1.13 | TECH | Przygotować `30.12 Sygnały sprzedażowe` | Statusy, priorytety, ownership |
| P1.14 | TECH | Przygotować `30.13 Waterfall` | ChartFrame, źródła, alt table |
| P1.15 | TECH | Przygotować `31.01-31.03 Kampanie` | Lista i szczegół kampanii |
| P1.16 | TECH | Przygotować `31.04 Atrybucja` | AttributionComparison |
| P1.17 | TECH | Przygotować `31.05 Budżet` | BudgetPacing |
| P1.18 | TECH | Przygotować `31.06 Diagnostyka` | Error/readiness matrix |
| P1.19 | TECH | Przygotować fixtures domenowe dla `30/31` | Bez placeholderów i danych sprzecznych |
| P1.20 | TECH | Uruchomić browser audit dla `30/31` | Desktop/mobile, no overflow, no console errors |

### P2 - 20 pozycji

| ID | Status | Zadanie | Wynik oczekiwany | Artefakt |
| --- | --- | --- | --- | --- |
| P2.01 | TECH | Dokończyć PL/EN dla wszystkich aktywnych stories | Brak twardych długich treści PL-only | aktywne stories + `OWNER-APPROVAL-CRITERIA.md` |
| P2.02 | TECH | Dodać guard na placeholdery w dokumentacji | Brak artefaktów generatora w docs | `scripts/check-doc-placeholders.mjs` |
| P2.03 | TECH | Dodać guard na duplikaty klas CSS | Wyjątki tylko dla fundamentów i wariantów runtime | `scripts/check-css-duplicate-classes.mjs` |
| P2.04 | TECH | Dodać guard na lokalne hex kolory poza tokenami | Brak lokalnych palet w stories | `scripts/check-css-local-hex.mjs` |
| P2.05 | TECH | Uporządkować raporty root | Tylko aktualne raporty, bez historycznych PASS jako gate | `docs/audits/2026-08/raport-walidacji-2026-08-14.md`, `docs/audits/2026-08/raport-kompletnosci-i-jakosci-2026-08-14.md` |
| P2.06 | TECH | Zaktualizować `docs/audits/2026-08/raport-walidacji-2026-08-14.md` po finalnym checku | Liczby zgodne z repo | `docs/audits/2026-08/raport-walidacji-2026-08-14.md` |
| P2.07 | TECH | Zaktualizować `docs/audits/2026-08/raport-kompletnosci-i-jakosci-2026-08-14.md` | Bez nieaktualnych ostrzeżeń | `docs/audits/2026-08/raport-kompletnosci-i-jakosci-2026-08-14.md` |
| P2.08 | TECH | Rozdzielić raport techniczny od akceptacji właścicielskiej | Brak mylenia PASS z owner approval | `OWNER-APPROVAL-CRITERIA.md` |
| P2.09 | TECH | Dodać indeks artefaktów browser audit | Łatwe śledzenie screenshotów i JSON | `BROWSER-AUDIT-INDEX.md` |
| P2.10 | TECH | Znormalizować statusy `legal-template` w raportach | Brak sugestii produkcyjnego prawa | raporty root |
| P2.11 | TECH | Dodać kontrolę linków do usuniętych archiwów | Brak martwych referencji | `scripts/check-dead-artifact-references.mjs` |
| P2.12 | TECH | Uporządkować fixtures Storybooka według ID | Jednoznaczna mapa story-fixture | `STORYBOOK-FIXTURES-INDEX.md` |
| P2.13 | TECH | Dodać opis zasad dla `apps/web/src/storybook-next/docs/` | Brak drugiego source of truth | `STORYBOOK-GENERATED-CATALOG-RULES.md` |
| P2.14 | TECH | Sprawdzić wszystkie `*.md` pod kątem ortografii | Minimum: polskie znaki i literówki | przegląd zakresu + guard placeholderów |
| P2.15 | TECH | Dopisać słownik wyjątków dla nazw plików bez znaków PL | Brak fałszywych poprawek slugów | `P2-P3-HARDENING-INDEX.md` |
| P2.16 | TECH | Uzupełnić evidence dla sekcji `18` | Browser audit jak dla sekcji `15` | `AUDIT-REPLAY-INSTRUCTIONS.md` |
| P2.17 | TECH | Uzupełnić evidence dla sekcji `05` | Decision records bez dwuznaczności | `HISTORICAL-FILES-CLEANUP-RULES.md` |
| P2.18 | TECH | Dodać matrix komponent -> ekran produkcyjny | Blokada ekranów bez komponentu | `COMPONENT-SCREEN-MATRIX.md` |
| P2.19 | TECH | Dodać matrix story -> runtime route | Brak fałszywego productionStatus | `STORY-RUNTIME-ROUTE-MATRIX.md` |
| P2.20 | TECH | Utrzymać czysty manifest po usunięciach | Brak `MANIFEST_MISSING` | `MANIFEST.json` |

### P3 - 20 pozycji

| ID | Status | Zadanie | Wynik oczekiwany | Artefakt |
| --- | --- | --- | --- | --- |
| P3.01 | TECH | Uporządkować nazwy story w sidebarze | Jednolity język i kolejność | katalog Storybooka |
| P3.02 | TECH | Dodać krótkie opisy ownerów sekcji | Szybszy onboarding | `COMPONENT-SCREEN-MATRIX.md` |
| P3.03 | TECH | Dodać checklistę przed nowym komponentem | Mniej lokalnych wyjątków | `COMPONENT-BEFORE-SCREEN-CHECKLIST.md` |
| P3.04 | TECH | Dodać checklistę przed nowym ekranem | Component-before-screen jako praktyka | `SCREEN-BEFORE-RUNTIME-CHECKLIST.md` |
| P3.05 | TECH | Ujednolicić etykiety statusów `review/accepted` | Bez mieszania PL/EN | `OWNER-APPROVAL-CRITERIA.md` |
| P3.06 | TECH | Dodać indeks fixtures API/Storybook/E2E | Szybsze wyszukiwanie | `STORYBOOK-FIXTURES-INDEX.md` |
| P3.07 | TECH | Dodać przykłady dobrych commitów PL | Spójny changelog | `COMMIT-MESSAGE-EXAMPLES-PL.md` |
| P3.08 | TECH | Uporządkować nazwy artefaktów screenshotów | Data, sekcja, viewport | `BROWSER-AUDIT-INDEX.md` |
| P3.09 | TECH | Dodać mapę ryzyk wizualnych | Kolor, spacing, reflow, overflow | `VISUAL-RISK-MAP.md` |
| P3.10 | TECH | Dodać mapę ryzyk dostępności podstawowej | Contrast, keyboard, focus, forms | `ACCESSIBILITY-RISK-MAP.md` |
| P3.11 | TECH | Dodać mapę ryzyk danych testowych | Brak danych osobowych i placeholderów | `FIXTURE-DATA-RISK-MAP.md` |
| P3.12 | TECH | Dodać konwencję dla lokalnych helpers Storybooka | Kiedy helper, kiedy komponent | `STORYBOOK-HELPERS-CONVENTION.md` |
| P3.13 | TECH | Uporządkować stare komentarze techniczne | Tylko aktualne notatki z właścicielem | guard dokumentacyjny |
| P3.14 | TECH | Znormalizować style tabel w dokumentach | Czytelny markdown | nowe dokumenty P2/P3 |
| P3.15 | TECH | Dodać krótką instrukcję odtwarzania audytu | Komendy i kolejność | `AUDIT-REPLAY-INSTRUCTIONS.md` |
| P3.16 | TECH | Dodać kryteria akceptacji wizualnej właściciela | Oddzielone od testów technicznych | `OWNER-APPROVAL-CRITERIA.md` |
| P3.17 | TECH | Dodać zasady dla generowanych katalogów | Kiedy regenerować, kiedy nie | `STORYBOOK-GENERATED-CATALOG-RULES.md` |
| P3.18 | TECH | Dodać zasady dla usuwania plików historycznych | Bez utraty aktywnego gate | `HISTORICAL-FILES-CLEANUP-RULES.md` |
| P3.19 | TECH | Dodać mapę zależności `20 -> 25 -> 30+` | Widoczna kolejność produkcji | `PRODUCT-SCREEN-DEPENDENCY-MAP.md` |
| P3.20 | TECH | Dodać krótką notatkę release readiness | Co jest technicznie zielone, co wymaga ownera | `RELEASE-READINESS-2026-08-12.md` |

## Kontrole do wykonania na końcu

- `python scripts/validate_all.py .`
- `pnpm check:foundation-system`
- `pnpm check-component-system`
- `pnpm check:storybook-catalog`
- `pnpm check:analytics-system`
- `pnpm check:cross-cutting-patterns`
- `pnpm check:storybook-presentation`
- `pnpm --filter @papadata/web typecheck`
- `pnpm typecheck`
- `pnpm --filter @papadata/web build-storybook`
- `pnpm --filter @papadata/web build`
- `pnpm test`
- `pnpm check:documentation-hardening`
- `STORYBOOK_URL="http://127.0.0.1:6010" pnpm --filter @papadata/web audit-storybook-business-screens`
- `git diff --check`
