# Zasady usuwania plików historycznych

## Co można usuwać

Można usuwać wyłącznie artefakty, które nie są aktywnym źródłem prawdy i nie są wymagane przez walidację:

- lokalne archiwa robocze,
- kopie zapasowe z jednorazowej pracy,
- raporty historyczne nieużywane jako aktualny gate,
- katalogi tymczasowe po wdrożeniu paczki,
- diagnostykę wygenerowaną tylko do bieżącej analizy.

## Czego nie usuwać bez weryfikacji

Nie wolno usuwać bez sprawdzenia referencji:

- dokumentów specyfikacji docelowej,
- rejestrów i macierzy,
- kontraktów API i komponentów,
- fixtures API, Storybook i E2E,
- aktywnych artefaktów evidence,
- plików generowanych, które są importowane przez runtime lub checki.

## Kontrola

Po cleanupie należy wykonać:

```bash
git status
git diff --stat
git diff --check
pnpm check:dead-artifact-references
python scripts/validate_all.py .
```
