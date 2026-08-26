# PapaData — lokalne seedy Command Center / integracje

Baseline audytu: `main` repozytorium `19Archmiel88/papadata-platform`, SHA `710c6e3e37086e725e5e55e1945051723ae2a423` (2026-08-26).

## Cel

Paczka tworzy cztery idempotentne scenariusze lokalne oparte o ten sam trwały model danych, z którego czyta produkcyjny Command Center. Seed nie wpisuje gotowych KPI do `metric_snapshots`. Wypełnia połączenia, credentiale, joby/checkpointy, `source_records`, `normalized_records` i `integration_canonical_records`; wartości KPI wynikają z canonical facts.

Dane historyczne obejmują 200 dni. Dzięki temu zakresy 1 / 7 / 30 / 90 dni mają również pełny poprzedni okres porównawczy dla benchmarków i zmian period-over-period.

## Scenariusze

| Scenariusz | Połączenia | Dane | Użytkownicy / cel |
| --- | --- | --- | --- |
| `full-integrations` | 7/7 aktywnych | pełne commerce + ads + GA4 | właściciel, pełny RBAC |
| `rbac-owner-employee` | 7/7 aktywnych | jak full | Tenant Owner + ograniczony Analyst |
| `new-registration-onboarding` | 7/7 aktywnych | jak full, 200 dni backfill | świeża rejestracja, zweryfikowany e-mail, pełny onboarding, potem 7 integracji |
| `partial-integrations` | 4/7 aktywne | fakty tylko z aktywnych źródeł | WooCommerce + BaseLinker + Allegro + Google Ads aktywne; Shopify + Meta Ads + GA4 odłączone |

W pełnym wariancie seed zasila wszystkie siedem providerów: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads i GA4. GA4 dostaje wszystkie zadeklarowane trwałe strumienie `traffic`, `events`, `conversions`.

## Konta lokalne

Wszystkie konta używają hasła: `LocalTest123!`.

| Scenariusz | Login | Rola | Scope |
| --- | --- | --- | --- |
| full | `full.owner@local.papadata.test` | Tenant Owner | tenant |
| RBAC owner | `rbac.owner@local.papadata.test` | Tenant Owner | tenant |
| RBAC employee | `rbac.analyst@local.papadata.test` | Analyst | assigned_workspace |
| new registration | `new.owner@local.papadata.test` | Tenant Owner | tenant |
| partial | `partial.owner@local.papadata.test` | Tenant Owner | tenant |

Analyst może czytać Command Center, metryki, katalog/połączenia integracji i joby, ale nie dostaje `integrations.connection.manage`, `integrations.credentials.manage`, `integrations.sync.run` ani `integrations.jobs.manage`.

## Uruchomienie

Po skopiowaniu plików do root repozytorium:

```bash
chmod +x tools/seed-local-dashboard.sh tools/verify-local-dashboard-seeds.sh

# Wszystkie cztery scenariusze i automatyczna weryfikacja:
./tools/seed-local-dashboard.sh all

# Albo pojedynczy scenariusz:
./tools/seed-local-dashboard.sh full-integrations
./tools/seed-local-dashboard.sh rbac-owner-employee
./tools/seed-local-dashboard.sh new-registration-onboarding
./tools/seed-local-dashboard.sh partial-integrations

# Sama ponowna weryfikacja bez seedowania:
./tools/verify-local-dashboard-seeds.sh all
```

Jeżeli lokalny compose ma korzystać z konkretnego pliku środowiskowego:

```bash
PAPADATA_ENV_FILE=.env.local ./tools/seed-local-dashboard.sh all
```

Runner uruchamia Postgresa, wykonuje wszystkie migracje (w tym `0037_ga4_stream_compatibility.sql`), seeduje i uruchamia gate SQL dla 1/7/30/90 dni.

## Jak dokładnie liczone są wartości seedów

Dzienne wartości mają deterministyczną zmienność `k = day_offset % 7`; dzięki temu sparklines i analizy zależności nie są płaskie. Każdego dnia jest też duże anulowane zamówienie WooCommerce o wartości 9999 PLN. Jest to rekord kontrolny i **nie może** wejść do revenue/orders/AOV/product/customer KPI.

W pełnym wariancie na dzień:

- kwalifikowany gross order value = `390 + 8k`
- liczba kwalifikowanych zamówień = `4`
- refundy = `20 + 3k`
- revenue after refunds = `370 + 5k`
- units = `6`
- znany koszt produktów = `155`
- ad spend = `60 + 3k`
- attributed conversions = `3`
- attributed revenue = `4 × ad spend`
- CPC = `0.50`, CPM = `10`, CTR = `2%`, ROAS = `4`
- checkout GA4 = `20 + 4k`, purchases = `5 + k`, więc cart conversion = `25%`
- completeness GA4 = `100%`

W częściowym wariancie na dzień:

- kwalifikowany gross order value = `270 + 5k`
- liczba kwalifikowanych zamówień = `3`
- refundy = `14 + 2k`
- revenue after refunds = `256 + 3k`
- units = `4`
- znany koszt produktów = `105`
- ad spend = `40 + 2k`
- attributed conversions = `2`
- attributed revenue = `4 × ad spend`
- CPC = `0.50`, CPM = `10`, CTR = `2%`, ROAS = `4`
- GA4 jest odłączony, więc cart conversion / GA4 completeness mają być `unavailable`, a nie `0`

## Oczekiwane KPI — pełne 7/7 integracji

Te same wartości obowiązują dla `full-integrations`, `rbac-owner-employee` i `new-registration-onboarding`.

| Zakres | Przychód po refundach | Zamówienia | AOV | Refundy | Ad spend | ROAS | CPA dashboard | Marża brutto | Cart conv. |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 d | 370 PLN | 4 | 97.50 PLN | 20 PLN | 60 PLN | 4.00 | 20.00 PLN | 60.2564% | 25% |
| 7 d | 2,695 PLN | 28 | 103.50 PLN | 203 PLN | 483 PLN | 4.00 | 23.00 PLN | 62.5604% | 25% |
| 30 d | 11,525 PLN | 120 | 103.1667 PLN | 855 PLN | 2,055 PLN | 4.00 | 22.8333 PLN | 62.4394% | 25% |
| 90 d | 34,635 PLN | 360 | 103.4333 PLN | 2,601 PLN | 6,201 PLN | 4.00 | 22.9667 PLN | 62.5363% | 25% |

## Oczekiwane KPI — częściowe 4/7 aktywnych

| Zakres | Przychód po refundach | Zamówienia | AOV | Refundy | Ad spend | ROAS | CPA dashboard | Marża brutto | Cart conv. |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 d | 256 PLN | 3 | 90.00 PLN | 14 PLN | 40 PLN | 4.00 | 20.00 PLN | 61.1111% | unavailable |
| 7 d | 1,855 PLN | 21 | 95.00 PLN | 140 PLN | 322 PLN | 4.00 | 23.00 PLN | 63.1579% | unavailable |
| 30 d | 7,935 PLN | 90 | 94.7222 PLN | 590 PLN | 1,370 PLN | 4.00 | 22.8333 PLN | 63.0499% | unavailable |
| 90 d | 23,841 PLN | 270 | 94.9444 PLN | 1,794 PLN | 4,134 PLN | 4.00 | 22.9667 PLN | 63.1363% | unavailable |

`CPA dashboard` jest zgodne z aktualnym Command Center i oznacza `ad_spend / platform_attributed_conversions`, a nie `ad_spend / liczba zamówień sklepu`.

## Co weryfikuje gate

`verify-local-dashboard-scenarios.sql` przerywa wykonanie przy dowolnej rozbieżności. Sprawdza strukturę integracji i credentials, primary inventory source, ukończony onboarding, Tenant Owner, ograniczonego Analysta, brak otwartych data issues, checkpointy < 36 h, passed reconciliation, canonical coverage per provider, brak danych od odłączonych providerów oraz wartości 1/7/30/90 dla gross revenue, refundów, revenue after refunds, orders, units, product costs, AOV, gross margin, inventory/stock value, ad spend, conversions, attributed revenue, ROAS, CPA, CPC, CPM, CTR i GA4 cart conversion/completeness. Dodatkowo wymaga niepustego batcha dla każdego aktywnego streamu i kompletnej linii `source -> normalized -> canonical`.

## Ważne ustalenia z audytu runtime

1. Aktualny produktowy katalog ma 7 providerów, ale historyczne constrainty streamów w durable ingestion nie dopuszczają GA4 `traffic/events/conversions`. Dlatego paczka zawiera migrację `0037_ga4_stream_compatibility.sql`; bez niej nie da się poprawnie przeprowadzić GA4 przez `source_records -> normalized_records -> integration_canonical_records`.
2. Command Center czyta `integration_canonical_records` i sam uruchamia metric engine; seed celowo nie wpisuje gotowych KPI do `metric_snapshots`.
3. `Przychód netto` na aktualnym ekranie jest technicznie `revenue_after_refunds`; AOV jest liczone z gross kwalifikowanych zamówień przed refundami.
4. `CPA` na Command Center to koszt mediów / platform-attributed conversions. W samym metric engine istnieje osobne `cost_per_order` o innej semantyce.
5. `Konwersja koszyka` to `purchaseCount / checkoutStartCount` z GA4, nie orders/sessions.
6. KPI nazwane `Świeżość eventów GA4` jest obecnie liczone z pola `completeness`; to semantycznie kompletność danych, nie wiek ostatniego syncu.
7. Real-data adapter pozostawia `canonicalCustomerReturns` puste. Dlatego metryki oparte o zwrócone sztuki nie mogą być uczciwie doprowadzone do `ready` samym seedem refundów; to ograniczenie aktualnego runtime, nie brak danych seedowych.
8. Mapper checkpointów Command Center nadal przepuszcza provider ID według starszej listy sandboxowej. Shopify/BaseLinker/GA4 mogą przez to nie uczestniczyć poprawnie w per-provider `lastSuccessfulSyncAt`, mimo że ich canonical facts są obsługiwane. Seed nie maskuje tego problemu.

## Deterministyczne workspace IDs

| Scenariusz | Tenant | Workspace |
| --- | --- | --- |
| full | `1ab2b50f-e4c5-4fc8-8e65-90341855b56d` | `9da616f0-7b96-4e3e-8b3c-8cbf958ee568` |
| RBAC | `6d7603dd-2d32-4355-8894-aa1bdf4e6859` | `1ec4d8fa-cd7b-4d72-849d-edab6acf4c0d` |
| new registration | `ea79d557-2450-47ea-8d0d-4d40d4aa73c3` | `51819c47-5c4e-4f9a-8278-e84f98f92d2d` |
| partial | `289eea5e-eb9a-4da5-846b-3090a652aef4` | `8b36dfc9-7745-43f9-8868-858008a25b6c` |
