# Security Headers

Status: draft techniczny.
Not legal advice. Wymaga dopasowania do hostingu produkcyjnego.

## Goal

Ten dokument opisuje starter dla nagłówków bezpieczeństwa PapaData. Nie należy
wdrażać CSP bez testu w `Content-Security-Policy-Report-Only`, ponieważ
Storybook, fonty, analityka, integracje i potencjalny streaming AI mogą wymagać
świadomie dopuszczonych źródeł.

## Baseline Headers

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

## CSP Starter

```http
Content-Security-Policy:
  default-src 'self';
  base-uri 'self';
  object-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self';
  worker-src 'self';
  manifest-src 'self';
  upgrade-insecure-requests;
```

`style-src 'unsafe-inline'` jest akceptowane tylko jako starter dla Vite/CSS i
musi zostać ponownie ocenione po wyborze hostingu oraz strategii nonce/hash.

## Sourcemaps

Frontend build ma `build.sourcemap=false`. Jeżeli sourcemapy będą potrzebne dla
observability, muszą być prywatnym artefaktem CI, nie publicznym plikiem
serwowanym z hostingu.

## Hosting Requirements

- CSP najpierw w trybie report-only.
- Raporty CSP nie mogą zawierać sekretów, tokenów ani pełnych payloadów.
- Produkcja nie może serwować `storybook-static`.
- Produkcja nie może mieć włączonego MSW ani mock runtime.
- Nagłówki muszą być testowane automatycznie po wyborze hostingu.

## Owners

- Security owner: DO USTALENIA Z OWNEREM.
- Hosting owner: DO USTALENIA Z OWNEREM.
- Legal/privacy reviewer: DO USTALENIA Z PRAWNIKIEM.
