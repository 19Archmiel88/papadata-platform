# Backend remediation program

Dokumentacja w tym katalogu implementuje rozdzielenie stanów wymagane przez `AUD-027`:

- target — dokument docelowy;
- implemented — kontrola obecna w kodzie;
- verified — dowód testu powiązany z SHA;
- accepted-risk — jawny wyjątek z ownerem i datą wygaśnięcia.

Źródłem maszynowym jest `config/backend-security-controls.json`. Każde `AUD-001–AUD-030` ma ownera, ścieżkę implementacji i rodzaj odbioru. Status wymagający środowiska nie może zostać automatycznie podniesiony do `verified` przez statyczny skrypt.

## Walidacja lokalna

```bash
pnpm verify:backend
pnpm evidence:backend
pnpm prepare:production-parity
pnpm test:migrations
```

Profil parity używa produkcyjnych entrypointów, odrębnej roli platformowej i lokalnego Redis TLS. Nie zastępuje dowodu z GCP, Cloud Armor, IAM, Secret Manager, backup restore ani podpisanego obrazu.
