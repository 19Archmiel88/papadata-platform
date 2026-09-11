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
pnpm verify:repository-integrity
pnpm typecheck
pnpm build
pnpm test
```

`verify:repository-integrity` jest kanoniczną bramą integralności repozytorium. Składa aktualne kontrole dokumentacji i rejestrów, stan Storybooka oraz bramy kodowe P0, P1 i P2/P3. `scripts/validate_all.py` jest celowo deprecjonowany i kończy się błędem; historyczny walidator pakietu specyfikacyjnego znajduje się wyłącznie w `scripts/validate_specification_archive.py`.

Stan runtime Storybooka odświeża `pnpm refresh:storybook-runtime-state`, a zgodność pochodnego rejestru sprawdza `pnpm verify:storybook-runtime-state`.

## Instalacja pakietu dokumentacyjnego

```bash
python3 install_docs_to_repo.py /home/papadata/papadata-platform dry-run
python3 install_docs_to_repo.py /home/papadata/papadata-platform apply
python3 install_docs_to_repo.py /home/papadata/papadata-platform rollback
```


## Production acceptance

P0/P1 code readiness is intentionally separate from production acceptance. The latter requires evidence bound to an immutable release commit.

```bash
pnpm verify:p0-release
pnpm verify:p1-release
```

P1 browser/IaC acceptance commands are documented in `docs/engineering/architecture-runtime.md`.
