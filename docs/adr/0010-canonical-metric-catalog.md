# ADR 0010: Kanoniczny katalog metryk

## Status

Zaakceptowano.

## Kontekst

Audyt metryk wykazał równoległe definicje:

- oficjalny katalog analityczny `2026-05-analytics-v1`;
- osobny słownik KPI dashboardu;
- agregaty Centrum Dowodzenia liczone bezpośrednio dla ekranu.

Warstwy różnią się definicjami `net_revenue`, `CAC`, `AOV`,
`conversion_rate`, `ROAS`, `MER`, częstotliwości zakupów i wartości rabatów.
Bez jednego katalogu nadrzędnego backend L2 ryzykuje publikację sprzecznych
snapshotów i niespójne prezentowanie procentów.

## Decyzja

Nadrzędnym katalogiem dla backendu L2 jest `2026-05-analytics-v1`.

Kontrakt współdzielony w `packages/contracts` zawiera:

- 55 metryk objętych audytem;
- 3 dodatkowe metryki techniczne GA4 oznaczone jako `supplemental`;
- listę statusów kalkulacji;
- klucze konfliktowe wymagające mapowania przed dashboard API.

Dashboard, Business Summary i przyszły Metric Engine nie mogą definiować
alternatywnych wzorów dla tego samego klucza. Mogą wystawiać projekcje, ale
projekcja musi wskazywać kanoniczny `metricKey`, wersję katalogu, jednostkę,
skalę i ewentualne ograniczenia.

## Konsekwencje

- Zadanie 7 backendu musi zacząć od mapowania istniejących KPI dashboardu do
  katalogu `2026-05-analytics-v1`.
- `MER` nie jest kanoniczną metryką katalogu i nie może udawać odrębnej
  matematyki, dopóki nie ma zatwierdzonej definicji.
- Marża, contribution i wartość magazynu pozostają zablokowane bez kosztów oraz
  source authority.
- Rozbieżności definicji są blokadami, a nie detalem UI.
