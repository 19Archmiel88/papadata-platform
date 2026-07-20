# Analytics Modules

Moduły są projekcjami Query Service, a nie osobnymi obliczeniami w UI.

Status Fali 4:

| Moduł | Status | Uzasadnienie |
| --- | --- | --- |
| Command Center | IMPLEMENTED | Korzysta z MetricSnapshot i readiness. |
| Orders | IMPLEMENTED | Korzysta z canonical orders Fali 3. |
| D2C | IMPLEMENTED | WooCommerce orders jako kwalifikujące źródło. |
| Data Trust | IMPLEMENTED | Korzysta z quality, lineage i reconciliation. |
| Alerts | IMPLEMENTED | Alerty produktowe analytics. |
| Tasks | IMPLEMENTED | Zadania wynikające z readiness. |
| Products | GATED | Brak canonical product dataset i KPI produktu. |
| Customers | GATED | Brak zatwierdzonej definicji LTV/retencji. |
| Traffic | GATED | GA4 bez adaptera runtime local/CI. |
| Paid Campaigns | GATED | Google Ads i Meta Ads bez adaptera runtime local/CI. |
| Marketplace | GATED | BaseLinker/Allegro bez active adapter i fees dataset. |
| Marketing Attribution | GATED | Brak aktywnego modelu atrybucji. |
| Profitability | BLOCKED | Brak potwierdzonego kosztu produktu. |

Moduł gated nie jest martwym linkiem. Pokazuje warunek bramy, właściciela
zakresu i następny krok.
