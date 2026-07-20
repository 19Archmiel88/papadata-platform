# Retention Matrix

Status: draft.
Not legal advice. Wymaga decyzji prawnej i produktowej.

## Matrix

Data: auth sessions.
Default retention: DO USTALENIA Z PRAWNIKIEM/OWNEREM.
Deletion trigger: logout, revoke, expiry, account deletion.

Data: audit events.
Default retention: DO USTALENIA Z PRAWNIKIEM/OWNEREM.
Deletion trigger: retention expiry, legal hold exception.

Data: integration credentials.
Default retention: only while connection is active.
Deletion trigger: disconnect, tenant deletion, credential rotation.

Data: source and normalized records.
Default retention: DO USTALENIA Z OWNEREM.
Deletion trigger: tenant deletion, retention expiry, reprocessing policy.

Data: canonical facts and lineage.
Default retention: DO USTALENIA Z OWNEREM.
Deletion trigger: tenant deletion, retention expiry. Do not delete lineage
independently from related facts without recovery plan.

Data: AI threads, evidence and approvals.
Default retention: DO USTALENIA Z PRAWNIKIEM/OWNEREM.
Deletion trigger: user deletion, tenant deletion, retention expiry,
AI deletion request.

Data: reports and exports.
Default retention: DO USTALENIA Z OWNEREM.
Deletion trigger: expiry, manual delete, tenant deletion.

Data: billing metadata.
Default retention: DO USTALENIA Z PRAWNIKIEM.
Deletion trigger: legal/accounting retention expiry.

## Rules

- Brak danych nie oznacza zera.
- Retention musi obejmować backupy i eksporty.
- Usunięcie musi zachować audit deletion request bez danych wrażliwych.
- Restore backupu wymaga ponownego wykonania retencji i walidacji tenantów.
