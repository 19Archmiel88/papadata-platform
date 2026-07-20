# Test Vectors Fali 4

## Order Count READY

Wejście:

- 2 canonical orders;
- statusy kwalifikujące;
- dataset `READY`;
- source authority active.

Oczekiwany wynik:

- `metricCode`: `order_count`;
- value: `2`;
- readiness: `READY`;
- blocked decision types: none.

## Order Count PARTIAL

Wejście:

- jeden source order z nieznanym statusem;
- dataset Fali 3 `PARTIAL`.

Oczekiwany wynik:

- `metricCode`: `order_count`;
- readiness: `PARTIAL`;
- value może być użyta tylko z ograniczeniem.

## Order Count INVALID

Wejście:

- naruszenie typu pola finansowego i nieobsługiwana waluta;
- dataset Fali 3 `INVALID`.

Oczekiwany wynik:

- `metricCode`: `order_count`;
- readiness: `INVALID`;
- value: `null`;
- `missingData.confirmedZero`: `false`.

## Gross Revenue READY

Wejście:

- gross `420.00`;
- gross `730.00`;
- waluta `PLN`.

Oczekiwany wynik:

- value: `1150.00`;
- readiness: `READY`.
