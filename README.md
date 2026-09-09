# PapaData Platform

PapaData to platforma analityczna SaaS dla e-commerce, łącząca dane sprzedażowe, marketingowe i operacyjne z warstwą rekomendacji oraz automatyzacji AI.

## Dokumentacja

- [`docs/README.md`](docs/README.md) — wejście do dokumentacji;
- [`docs/specyfikacja-docelowa/README.md`](docs/specyfikacja-docelowa/README.md) — kanoniczna specyfikacja produktu 1.0;
- `contracts/` — kontrakty API, DTO, komponentów i Auth;
- `rejestry/` — rejestry tras, operacji, komponentów i Storybooka;
- `macierze/` — powiązania ekranów, komponentów, API, ról, Auth i E2E;
- `fixtures/` — fixture kontraktowe i scenariuszowe.

Dokumentacja historyczna, audyty paczek i jednorazowe raporty walidacyjne nie są częścią kanonicznego repozytorium.

## Walidacja

```bash
python3 scripts/validate_all.py .
npx tsc --project tsconfig.contracts.json --noEmit
pnpm typecheck
pnpm test
```

## Instalacja pakietu dokumentacyjnego

```bash
python3 install_docs_to_repo.py /home/papadata/papadata-platform dry-run
python3 install_docs_to_repo.py /home/papadata/papadata-platform apply
python3 install_docs_to_repo.py /home/papadata/papadata-platform rollback
```
