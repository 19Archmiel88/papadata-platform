# Reconciliation

Reconciliation Fali 3 porównuje source totals i canonical totals dla datasetu
`orders`.

Raport zawiera:

- source, normalized i canonical counts;
- source totals i canonical totals;
- excluded record count;
- duplicate count;
- overlap count;
- unresolved overlap count;
- tolerance;
- currency;
- period;
- provider i connection;
- rule versions;
- readiness result;
- evidence hash.

Różnica poza tolerancją daje `FAIL`; taki raport nie jest dowodem bramy.
