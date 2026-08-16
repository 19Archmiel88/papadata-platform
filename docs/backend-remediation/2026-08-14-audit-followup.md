# Backend audit follow-up — 14.08.2026

Ten dokument rozdziela poprawki możliwe do wykonania w kodzie od odbioru wymagającego środowiska. Nie podnosi statusu produkcyjnego backendu ponad faktycznie potwierdzony zakres.

## Poprawki objęte paczką

- BFF stosuje ten sam mechanizm nagłówków CORS dla tras auth, CSRF, public contract i proxy.
- Preflight dla `/auth/*` przechodzi przez wspólny `BffSecurityService.applyCorsHeaders()`.
- `CsrfGuard` używa nazw cookie i headera z `BFF_CONFIG`, zamiast lokalnego stałego `x-csrf-token`.
- Skrypt paczki audytowej wyklucza środowiskowe sekrety, runtime certyfikaty, klucze i artefakty odtwarzalne.
- Compatibility runtime pozostaje jawnie zakwalifikowany jako warstwa zgodności kontraktowej, nie jako pełna semantyka domenowa dla wszystkich operacji.

## Rzeczy pozostające poza paczką źródłową

- Live test migracji PostgreSQL, ról, grantów i izolacji RLS.
- Live acceptance providerów: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads i GA4.
- Migracja wszystkich operacji compatibility runtime do natywnych serwisów domenowych.
- Potwierdzenie security controls wymagających CI, staging, Secret Manager, Cloud Armor, Redis TLS, storage, log redaction i restore drill.

## Reguła interpretacji PASS

Statyczne `PASS` oznacza, że repozytorium spełnia sprawdzalny kontrakt źródłowy. Nie oznacza odbioru produkcyjnego, jeżeli dana kontrola wymaga środowiska, zewnętrznego providera, bazy danych albo podpisanego evidence powiązanego z SHA wydania.
