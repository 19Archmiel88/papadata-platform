# Source Contract

Source layer korzysta z wyniku Fali 2 i został rozszerzony pod Falę 3:

- `SourceBatch` ma `correlationId` i liczniki `fetched`, `accepted`,
  `duplicated`, `quarantined`, `failed`;
- `SourceRecord` ma `classification` oraz `retentionClass`;
- payload jest dostępny przez `payloadRef`, a pipeline czyta go przez
  scope-checkowany helper `getSourcePayloadForPipeline`;
- checkpoint przesuwa się dopiero po zapisie source.

Source zachowuje semantykę providera i nie wykonuje canonicalization, readiness
ani KPI.
