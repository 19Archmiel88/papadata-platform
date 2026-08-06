# Runtime integracji 7/7

> Plik generowany automatycznie z manifestu i kodu. Nie edytować ręcznie.

| Provider | Adapter | Dostarczanie zmian | Pipeline |
|---|---|---|---|
| woocommerce | implementation present; live acceptance pending | podpisany webhook + replay protection | durable ingestion + canonical v2 |
| shopify | implementation present; live acceptance pending | podpisany webhook + replay protection | durable ingestion + canonical v2 |
| baselinker | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |
| allegro | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |
| google_ads | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |
| meta_ads | implementation present; live acceptance pending | podpisany webhook + replay protection | durable ingestion + canonical v2 |
| ga4 | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |

Webhooki są aktywne tylko dla providerów posiadających zweryfikowany model podpisanego callbacku. Pozostałe integracje korzystają z checkpointowanego pollingu i są pełnoprawnymi adapterami runtime. Pełne uznanie produkcyjne wymaga testów live z rzeczywistymi kontami providerów.
