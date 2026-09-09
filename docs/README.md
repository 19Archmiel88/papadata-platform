# Dokumentacja PapaData

Repozytorium utrzymuje wyłącznie dokumentację kanoniczną i operacyjną. Dated audits, jednorazowe raporty odbiorowe i logi walidacji nie są przechowywane w `docs/`.

## Kanoniczne źródła

- [`specyfikacja-docelowa/`](specyfikacja-docelowa/) — produkt, UI/UX, ekrany, przepływy, API, security, mobile i dokumenty prawne;
- [`engineering/architecture-runtime.md`](engineering/architecture-runtime.md) — architektura runtime i parytet środowisk;
- [`engineering/backend-operations.md`](engineering/backend-operations.md) — operacje backendowe, bezpieczeństwo, migracje, observability i release;
- [`engineering/storybook.md`](engineering/storybook.md) — zasady implementacji Storybooka i ownership.

## Zasada anty-bloat

Nowy plik Markdown powstaje tylko wtedy, gdy ma niezależny kontrakt, ownera, cykl akceptacji albo jest bezpośrednio wskazywany przez rejestr/validator. W pozostałych przypadkach treść trafia do istniejącego dokumentu domenowego. Audyty generujemy poza repo lub jako artefakty CI.
