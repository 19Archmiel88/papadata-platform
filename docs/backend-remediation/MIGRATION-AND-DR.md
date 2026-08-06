# Migracje, rollback i disaster recovery

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/12-dr-bcp-backup.md:L17-L37`
- `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L13-L34`
- `README.md:L26-L32`

## Jeden runner

Local i production-parity używają `packages/database/scripts/migrate.sh` oraz ledgeru `app.schema_migrations`. `infra/postgres/apply-migrations.sh` jest wyłącznie wrapperem kompatybilności i nie posiada własnego ledgeru.

## Polityka zmian

Migracje są forward-only i muszą stosować expand/contract:

1. expand bez usuwania kontraktu N-1;
2. deploy kodu czytającego obie wersje;
3. backfill z mierzalnym postępem;
4. przełączenie odczytu;
5. contract w osobnym wydaniu po okresie kompatybilności.

Przed migracją ryzykowną wymagany jest backup/PITR checkpoint, plan roll-forward oraz rollback aplikacji. Nie należy dodawać automatycznego `down`, który może utracić dane.

## Testy

```bash
sh tools/verify-migration-parity.sh
pnpm test:migrations
```

`pnpm test:migrations` tworzy czystą bazę testową, uruchamia kanoniczny runner, sprawdza klasyfikację tabel, `FORCE RLS`, rozdzielenie roli aplikacyjnej i platformowej oraz wykonuje rzeczywistą próbę odczytu, modyfikacji i zapisu cross-tenant z `packages/database/tests/rls-isolation.sql`.

Profil lokalny z produkcyjnymi entrypointami i Redis TLS przygotowuje się poleceniem:

```bash
pnpm prepare:production-parity
pnpm start:production-parity
```

Sekrety i certyfikaty trafiają wyłącznie do ignorowanych plików `.env.production-parity` i `.runtime/backend-production-parity`. Rotacja wymaga usunięcia wolumenów parity oraz `PAPADATA_REGENERATE_PARITY=1`.

Restore drill:

```bash
PAPADATA_DR_SOURCE_DATABASE_URL="..." \
PAPADATA_DR_TARGET_DATABASE_URL="..." \
PAPADATA_RPO_TARGET_MINUTES=15 \
PAPADATA_RTO_TARGET_MINUTES=60 \
sh tools/restore-drill.sh
```

Drill musi być wykonywany na izolowanym celu. Wynik bez zweryfikowania integralności domenowej i czasu od ostatniego odtwarzalnego punktu nie potwierdza RPO.
