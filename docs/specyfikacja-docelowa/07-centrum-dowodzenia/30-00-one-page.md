---
version: 1.3
author: Artur Wisniewski
creator: Artur Wisniewski
owner: Artur Wisniewski
status: visual-work-in-progress
document_type: runtime-screen
screen_id: 30.00
runtime_surface: yes
---
# Centrum Dowodzenia - landing page

Centrum Dowodzenia jest jednym landing page w trakcie stabilizacji produkcyjnej. Aktywny runtime składa trzy kanoniczne zakresy danych: KPI (`30.03`), Plan vs Benchmark (`30.04`) oraz Drivery wyniku (`30.05`). Numer `30.00` opisuje wyłącznie kompozycję landing page i nie zastępuje identyfikatorów ekranów kanonicznych.

## Aktywny zakres

- Route główny: `/app/command-center`.
- Aktywne kotwice runtime: `#command-section-kpi`, `#command-section-plan`, `#command-section-drivers`.
- Historia pełnej strony: `30 Centrum Dowodzenia/Landing page` -> `30.00 Cały landing page`.
- Historie sekcyjne nie otrzymują nowych identyfikatorów `30.xx`; ich nazwy to `KPI`, `Plan vs Benchmark`, `Drivery wyniku`.
- Kanoniczne identyfikatory pozostają jednoznaczne: `30.01 Widok główny`, `30.02 Kolejka uwagi`, `30.03 KPI`, `30.04 Plan vs wynik`, `30.05 Drivery wyniku`.
- Aktywne komponenty treści: `CommandCenterKpiSection`, `CommandCenterPlanExecutionSection`, `CommandCenterPlanTrajectoryChart`, `CommandCenterDriversSection`.

## Kontrakt danych runtime

- Runtime nie używa fixture'ów ani generatorów demonstracyjnych. Dane demonstracyjne są dozwolone wyłącznie w Storybooku.
- KPI czyta kanoniczne rekordy integracji przez Metric Engine. Brak źródła oznacza stan `unavailable`, a nie wartość zastępczą.
- Zakres dat jest liczony jako lokalny zakres kalendarzowy w timezone przekazanym przez shell.
- `business_time` rekordów kanonicznych wynika z `canonical_payload.occurredAt`; czas synchronizacji jest wyłącznie fallbackiem dla rekordów bez czasu biznesowego.
- Plan vs Benchmark nie udaje zatwierdzonego planu finansowego. Benchmark to średni dzienny przychód z bezpośrednio poprzedniego, równoważnego okresu pomnożony przez `1,08`.
- Prognoza jest jawnie oznaczona jako `linear-run-rate` i wynika z bieżącego tempa realnych obserwacji.
- Drivery przychodu używają dekompozycji `Orders x AOV`. Drivery marketingowe korelują koszt mediów z przypisanym przychodem. Współczynnik i wykres zawsze używają dokładnie tego samego zestawu sparowanych punktów. Przy niewystarczającej próbie nie jest generowany zastępczy współczynnik.
- Landing pobiera trzy jawne kontrakty (`30.03`, `30.04`, `30.05`) i składa je po stronie orkiestracji UI; pojedynczy endpoint nie deklaruje pól spoza własnego schematu.

## Założenia UI i dostępność

- KPI, Plan vs Benchmark i Drivery są sekcjami tego samego landing page.
- Nawigacja po sekcjach korzysta z jednego źródła `commandCenterOnePageSectionIds`.
- `MetricCard` jest konfigurowany wyłącznie przez publiczne props/API; ekran nie styluje jego prywatnych klas potomnych.
- Wykres Planu jest wizualizacją `role=img`; komplet tych samych danych jest dostępny w tabeli rozwijanej przyciskiem.
- Legenda serii pozostaje sterowalna klawiaturą i respektuje `prefers-reduced-motion`.
- Testy a11y Storybooka pozostają włączone; historie landing page nie mogą lokalnie wyłączać test runnera.

## Poza aktywnym zakresem 30.00

- Attention / sygnały decyzyjne.
- Decision Workspace.
- Struktura sprzedaży oraz osobne widoki źródeł, klientów, produktów i lejka.
- Rekomendacje AI bez realnego silnika rekomendacyjnego.
- Waterfall bez realnego modelu wkładów.

Elementy poza zakresem nie mogą wracać do runtime jako hardcoded dane wyglądające na produkcyjne.
