# Backend production acceptance smoke test

Test uruchamia się po deployu z sieci posiadającej dostęp do prywatnego API. Nie zastępuje testów domenowych ani testów izolacji tenantów.

```bash
BFF_BASE_URL="https://app.example.com" \
API_BASE_URL="https://private-api-url" \
API_IDENTITY_TOKEN="$(gcloud auth print-identity-token --audiences=https://private-api-url)" \
API_INFRA_TOKEN="..." \
node tests/backend-production-parity/smoke.mjs \
  > artifacts/backend-evidence/production-smoke.json
```

Minimalny wariant publiczny wymaga tylko `BFF_BASE_URL`, ale nie dowodzi bezpośredniego IAM API ani `/metrics`.

## restart-failure.mjs

Restart/failure/chaos test przeciw lokalnemu `compose.production-parity.yml` (wpięty w CI, `web-production-parity`). `--chaos` dodatkowo testuje kontrolowaną utratę Postgresa, Redisa i object storage (MinIO) -- w trakcie awarii (`/readyz` faktycznie zgłasza `ready:false` dla właściwej zależności, zależne serwisy zostają `running`, nie crash-loopują) i po recovery -- oraz osobno graceful shutdown (`docker compose stop -t 10` musi zakończyć się dużo poniżej 10s i exit code `0`/`143`, nie `137` które oznaczałoby force-kill po grace period) dla API/BFF/workera.

```bash
node tests/backend-production-parity/restart-failure.mjs --chaos
```

Uwaga: uruchamiać ten test **przed** `pnpm test:web-production-parity`, nie po -- restart bff-production/api-production zmienia ich adres IP w sieci Dockera, a `edge` (nginx) nie re-resolvuje DNS upstreamów dynamicznie, więc kolejne żądania przez edge dostają `502` aż do restartu `edge`. CI (`platform-production-foundation.yml`) już zachowuje tę kolejność celowo.

## worker-resilience-check.ts (`apps/worker/scripts/`)

Real-infra test (nie jednostkowy) idempotencji joba workera, connection poolingu i statement_timeout — przeciw prawdziwemu Postgresowi (`compose.production-parity.yml`) i prawdziwemu, samodzielnie hostowanemu sandboksowi WooCommerce (`compose.woocommerce-sandbox.yml`). Celowo **niewpięty w CI** — sandbox WooCommerce nie jest tam uruchamiany (osobny compose, wymaga instalacji WordPressa/wtyczki przy pierwszym starcie). Uruchamiać ręcznie po zmianach w `DurableIngestionPipeline`/`DurableIntegrationIngestionRepository`/`ProductionDatabase`.

```bash
docker compose -f compose.production-parity.yml --env-file .env.production-parity up -d
docker compose -f compose.woocommerce-sandbox.yml up -d --wait

# WooCommerce REST API keys nie da się odczytać po utworzeniu -- wygenerować nowe
# (wc_api_hash()/wc_rand_hash(), tak jak WooCommerce sam je generuje):
bash .runtime/wpcli.sh eval '
global $wpdb;
$consumer_key = "ck_" . wc_rand_hash();
$consumer_secret = "cs_" . wc_rand_hash();
$wpdb->insert($wpdb->prefix . "woocommerce_api_keys", array(
  "user_id" => 1, "description" => "manual-run", "permissions" => "read",
  "consumer_key" => wc_api_hash($consumer_key), "consumer_secret" => $consumer_secret,
  "truncated_key" => substr($consumer_key, -7),
), array("%d","%s","%s","%s","%s","%s"));
echo "KEY=$consumer_key\nSECRET=$consumer_secret\n";
'

WOOCOMMERCE_SANDBOX_CONSUMER_KEY="ck_..." \
WOOCOMMERCE_SANDBOX_CONSUMER_SECRET="cs_..." \
pnpm --filter @papadata/worker exec tsx scripts/worker-resilience-check.ts
```

## https-trust-real-browser.mjs (`tests/web-production-parity/`)

Proves the local HTTPS edge's certificate passes a real, unmodified Chromium's TLS handshake -- not a client told to ignore certificate errors (`playwright.production-parity.config.ts` sets `ignoreHTTPSErrors: true`) and not Node's `fetch` with `NODE_EXTRA_CA_CERTS` (`tests/web-production-parity/smoke.mjs`). Runs a throwaway Microsoft Playwright Docker container (root by default, so no host sudo needed) to attempt installing the local CA into the OS trust store, and separately pins the real server certificate's SPKI hash via Chromium's own `--ignore-certificate-errors-spki-list` flag since Chromium's Linux build does not consult the OS store for arbitrary CAs. That flag is an SPKI pin / selective certificate exception -- a real, still-validating TLS handshake against one specific pinned key, not a blanket bypass -- but it is also **not** proof of full OS/browser trust-store trust: an ordinary user's browser, without that flag, would still warn on this certificate until the CA is installed in a real trust store (which this host cannot do -- no passwordless sudo). Report field is named `spki_pin_accepted`/`spki_pin_rejected`, deliberately not "trusted", for exactly this reason.

```bash
pnpm test:web-production-parity:https-trust
```

## woocommerce-reconciliation.ts (`apps/worker/scripts/`)

Real-infra reconciliation: dla realnych `orders`/`products`/`refunds`/`inventory` (każdy jako osobny job, `inventory` dosłownie jako `streams: ["inventory"]`) porównuje canonical records w Postgresie z tym samym sandboksem WooCommerce odpytanym bezpośrednio przez REST API. Wymaga tego samego setupu co `worker-resilience-check.ts` powyżej. Pisze trwały raport JSON (nie usuwa go po sobie).

```bash
WOOCOMMERCE_SANDBOX_CONSUMER_KEY="ck_..." \
WOOCOMMERCE_SANDBOX_CONSUMER_SECRET="cs_..." \
pnpm --filter @papadata/worker exec tsx scripts/woocommerce-reconciliation.ts
# Raport: .runtime/reports/production-parity-audit-<data>/woocommerce-reconciliation.json
```

## seed-demo-account.ts (`apps/worker/scripts/`)

Tworzy jedno realne, logowalne konto PapaData (`papadata-demo@papadata.test`) przez prawdziwy HTTP endpoint rejestracji (`POST /api/v1/auth/register/email` -- prawdziwy argon2 hash, nie placeholder), podpina mu połączenie WooCommerce do tego samego sandboksu co powyżej i odpala prawdziwy `DurableIngestionPipeline` (backfill od 2020-01-01) dla `orders`/`products`/`refunds`/`inventory`, po czym weryfikuje niezależnym logowaniem + realnym odczytem `GET /api/v1/command-center/kpi`, że dashboard zwraca policzone metryki. Idempotentny -- bezpieczny do ponownego uruchomienia (rejestracja na 409 przechodzi w login, connection/credential mają stałe idempotency keys).

Node'owy global `fetch` (undici) po cichu odrzuca własny nagłówek `Host` (traktuje go jak "forbidden header" ze specyfikacji fetch) -- wywołania do BFF idą więc przez `node:http` bezpośrednio na `127.0.0.1:53001` (host-mapped port `bff-production`, patrz `compose.production-parity.yml`), z jawnym `Host: papadata.localhost:53001` (drugi wpis w `BFF_PUBLIC_HOSTS` w `.env.production-parity`, dokładnie dla tego przypadku) i `Origin: https://papadata.localhost`. Node'owy resolver DNS też nie rozpoznaje `*.localhost` tak jak curl/Chromium (patrz `https-trust-real-browser.mjs` wyżej), więc `papadata.localhost` per se nie rozwiąże się z tego skryptu -- login przez prawdziwy edge (`https://papadata.localhost`) trzeba zweryfikować osobno, np. curlem.

```bash
WOOCOMMERCE_SANDBOX_CONSUMER_KEY="ck_..." \
WOOCOMMERCE_SANDBOX_CONSUMER_SECRET="cs_..." \
pnpm --filter @papadata/worker exec tsx scripts/seed-demo-account.ts
```
