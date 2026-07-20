# Canonicalization

Fala 3 implementuje `CanonicalOrder`.

Canonicalization:

- używa exact matching po `tenantId`, `workspaceId` i `orderNumber`;
- wybiera jeden PRIMARY contribution zgodnie z source authority;
- oznacza duplikaty jako `EXCLUDED` z reason code;
- zapisuje wersje authority, mappingu, deduplikacji i schematu kanonicznego;
- nie zastępuje braku danych zerem.

Ten sam `externalId` w dwóch workspace pozostaje odrębnym zakresem.
