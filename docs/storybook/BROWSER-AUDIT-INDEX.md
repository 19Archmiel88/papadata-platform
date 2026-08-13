# Browser audit index dla Storybooka 30/31

Data aktualizacji: 2026-08-12.

Ten indeks rozdziela trzy fakty, które wcześniej były mieszane w jednym statusie:

1. implementacja ekranów produkcyjnych `30.01-30.13` oraz `31.01-31.06`,
2. techniczna możliwość uruchomienia browser audit dla tych ekranów,
3. właścicielska akceptacja UI, która nie wynika automatycznie z testów.

## Zakres ekranów

| ID | Storybook title | Story export | Runtime route | Evidence status |
| --- | --- | --- | --- | --- |
| 30.01 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Overview Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.02 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Attention Queue Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.03 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Kpi Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.04 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Plan Performance Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.05 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Drivers Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.06 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Sales Sources Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.07 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Traffic Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.08 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Products Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.09 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Customers Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.10 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Funnel Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.11 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Recommendations Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.12 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Sales Signals Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 30.13 | 30 Centrum Dowodzenia/Ekrany produkcyjne | Command Center Waterfall Story | `/app/command-center` | wymaga świeżego przebiegu browser audit |
| 31.01 | 31 Kampanie płatne/Ekrany produkcyjne | Campaigns Overview Story | `/app/campaigns` | wymaga świeżego przebiegu browser audit |
| 31.02 | 31 Kampanie płatne/Ekrany produkcyjne | Campaigns List Story | `/app/campaigns` | wymaga świeżego przebiegu browser audit |
| 31.03 | 31 Kampanie płatne/Ekrany produkcyjne | Campaigns Detail Story | `/app/campaigns` | wymaga świeżego przebiegu browser audit |
| 31.04 | 31 Kampanie płatne/Ekrany produkcyjne | Campaigns Attribution Story | `/app/campaigns` | wymaga świeżego przebiegu browser audit |
| 31.05 | 31 Kampanie płatne/Ekrany produkcyjne | Campaigns Budget Story | `/app/campaigns` | wymaga świeżego przebiegu browser audit |
| 31.06 | 31 Kampanie płatne/Ekrany produkcyjne | Campaigns Diagnostics Story | `/app/campaigns` | wymaga świeżego przebiegu browser audit |

## Komenda audytu

Po przebudowie Storybooka uruchom:

```bash
pnpm --filter @papadata/web build-storybook
STORYBOOK_URL="http://127.0.0.1:6010" pnpm --filter @papadata/web audit-storybook-business-screens
```

Wynik należy zapisać jako świeży artefakt w `artifacts/storybook-business-screens-YYYYMMDD/browser-audit.json`.

## Kryterium techniczne

Przebieg można uznać za technicznie poprawny tylko wtedy, gdy dla wszystkich ekranów `30/31` wynik ma:

- `consoleErrors=0`,
- `pageErrors=0`,
- brak poważnych lub krytycznych naruszeń axe,
- brak poziomego overflow na viewportach responsywnych,
- brak błędów play scan.

## Ograniczenie

Ten plik nie zastępuje właścicielskiej akceptacji UI. Browser audit potwierdza tylko brak wykrytych problemów technicznych w przeglądarce.
