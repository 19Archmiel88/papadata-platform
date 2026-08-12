# PapaData — specyfikacja docelowa 1.0

**Autor / twórca / owner:** Artur Wiśniewski  
**Wersja:** 1.0  
**Status:** final target specification / implementation input

Dokumentacja definiuje docelowe fundamenty, komponenty, ekrany, API, Auth, przepływy, security i aplikację mobilną oraz zamknięty pakiet P0: 58 metryk, parity local–GCP, pełne MVP, AI local, GUS/BIR, raporty, billing, KSeF i szablony prawne.

## Najważniejsze artefakty

- `docs/specyfikacja-docelowa/` — normatywna dokumentacja docelowa;
- `contracts/openapi-1.0.json` — kontrakt BFF OpenAPI 3.1;
- `contracts/api-schemas.ts` i `.json` — request/response/data DTO;
- `contracts/components/` — kanoniczne Props komponentów;
- `contracts/auth-fsm.json` — jedno źródło maszyny Auth;
- `contracts/screens/` — modele ekranów;
- `macierze/` i `rejestry/` — śledzalność wykonawcza;
- `fixtures/api`, `fixtures/e2e`, `fixtures/storybook` — przykłady kontraktowe i specyfikacyjne;
- `scripts/validate_all.py` — niezależna brama akceptacyjna;
- `install_docs_to_repo.py` — transakcyjny instalator;
- `docs/specyfikacja-docelowa/26-priorytety-p0/` — obowiązkowe decyzje P0;
- `docs/specyfikacja-docelowa/27-pakiet-prawny-i-organizacyjny/` — szablony go-live;
- `contracts/metric-catalog-58.json` — pełny katalog 58 metryk;
- `config/p0-integrations.env.example` — konfiguracja local/API/providerów.

## Walidacja

```bash
python3 scripts/validate_all.py .
npx tsc --project tsconfig.contracts.json --noEmit
pnpm typecheck
pnpm test
```

## Instalacja

```bash
python3 install_docs_to_repo.py /home/papadata/papadata-platform dry-run
python3 install_docs_to_repo.py /home/papadata/papadata-platform apply
python3 install_docs_to_repo.py /home/papadata/papadata-platform rollback
```
