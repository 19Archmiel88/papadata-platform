# Retention And Deletion

Fala 3 dodaje data inventory dla warstw:

- source;
- normalized;
- canonical;
- datasets;
- assessments;
- issues;
- lineage;
- reports;
- cache;
- queues;
- exports;
- backups;
- security.

Każda pozycja ma classification, purpose, system/location, recipients,
retention class, deletion method, legal hold i evidence owner.

Deletion ledger obejmuje source, normalized, canonical, reports, storage,
cache, indeksy, kolejki, DLQ, replay stores, eksporty i backupy. Restore musi
respektować wpisy ledgeru ze statusem `VERIFIED`.
