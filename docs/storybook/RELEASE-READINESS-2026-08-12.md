# Release readiness 2026-08-12

## Zakres techniczny

Branch `fix/p0-audy-12082026-kompleksowo` zawiera implementację techniczną shell `20`, aktywnych powierzchni Auth `25`, ekranów `30.01-30.13` oraz `31.01-31.06`.

## Co jest technicznie spięte

- runtime routes dla `/app`, `/app/command-center` i `/app/campaigns`,
- Storybook entries i fixtures dla zakresu `20/25/30/31`,
- BFF-backed screens przez `bffClient`,
- typy matcherów Storybooka dla typecheck,
- manual chunking w Vite z jawnym typem parametru,
- guardy dokumentacyjne i CSS dla P2.

## Co wymaga potwierdzenia przed merge

- pełny przebieg walidacji na lokalnym WSL po wdrożeniu paczki,
- browser audit dla ekranów `30/31` zgodnie z `BROWSER-AUDIT-INDEX.md`,
- właścicielska akceptacja UI ekranów domenowych,
- końcowa akceptacja użytkownika przed commitem i synchronizacją z `main`.
