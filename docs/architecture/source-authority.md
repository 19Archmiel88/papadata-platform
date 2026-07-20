# Source Authority

Referencyjna reguła source authority:

- fact type: `CanonicalOrder`;
- provider: `woocommerce`;
- stream: `orders`;
- version: `authority.woocommerce-orders.2026-07`;
- owner: `artur_wisniewski`;
- scope: tenant/workspace datasetu.

Reguły są wersjonowane i aktywowane audytowalnie. Zmiana authority wymaga
impact reportu oraz reprocessingu zależnego zakresu.

Fuzzy matching jest świadomie wyłączony w Fali 3:
`fuzzy.disabled.2026-07`.
