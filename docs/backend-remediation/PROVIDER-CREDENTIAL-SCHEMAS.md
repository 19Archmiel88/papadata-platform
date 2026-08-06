# Schematy sekretów providerów 7/7

> Ten dokument opisuje pola JSON przechowywane w Secret Manager. Kod nie zapisuje wartości sekretów w tabelach domenowych ani dokumentacji.

| Provider | Wymagane pola | Opcjonalne pola | Dostarczanie zmian |
|---|---|---|---|
| WooCommerce | `storeUrl`, `consumerKey`, `consumerSecret` | `webhookSecret` | webhook HMAC lub polling |
| Shopify | `shopDomain`, `accessToken`, `apiVersion` | `webhookSecret` | webhook HMAC + GraphQL incremental sync |
| BaseLinker | `token` | — | polling/checkpoint |
| Allegro | `refreshToken`, `clientId`, `clientSecret` lub aktywny `accessToken` | `tokenUri`, `expiresAt`, `apiBaseUrl`, `marketplaceId` | OAuth refresh + polling/checkpoint |
| Google Ads | `developerToken`, `customerId`, OAuth refresh albo aktywny `accessToken` | `loginCustomerId`, `tokenUri`, `expiresAt`, `apiVersion` | GAQL polling/checkpoint |
| Meta Ads | `accountId`, `accessToken` | `apiVersion`, `appSecret` | Graph API polling; webhook HMAC, gdy `appSecret` jest skonfigurowany |
| GA4 | `propertyId`, OAuth refresh albo aktywny `accessToken` | `tokenUri`, `expiresAt` | Data API polling/checkpoint |

## Zasady bezpieczeństwa

- Sekret jest rozwiązywany dopiero dla konkretnego `tenantId`, `workspaceId`, `connectionId` i providera.
- Metadata credentialu i wersja sekretu są audytowane.
- Rotacja utrzymuje aktywną i poprzednią wersję bez wbudowanych wartości fallback.
- Adaptery nie logują tokenów, kluczy, nagłówków autoryzacji ani pełnych payloadów błędów providera.
- Webhooki wymagają podpisu; duplikaty są blokowane w trwałym ledgerze replay.
- Odbiór produkcyjny wymaga testu connect, refresh, initial sync, incremental sync, backfill, retry, reconnect i revoke dla każdego providera.
