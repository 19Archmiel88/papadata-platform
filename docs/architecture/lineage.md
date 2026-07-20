# Lineage

Lineage Fali 3 odpowiada na ścieżkę:

```text
CanonicalOrder
-> LineageLink
-> SourceRecord
-> SourceBatch
-> SyncJob
-> IntegrationConnection
-> Provider
```

`LineageLink` zachowuje:

- tenant/workspace;
- typ i ID faktu kanonicznego;
- source record;
- contribution type: `PRIMARY`, `SUPPORTING`, `EXCLUDED`, `CONFLICTING`;
- reason code;
- wersje authority, mappingu i deduplikacji.

Brak lineage daje `INVALID` dla audytowalnego zakresu.
