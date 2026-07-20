# DSAR Procedure

Status: draft.
Not legal advice. Wymaga przeglądu prawnego.

## Scope

DSAR obejmuje żądania dostępu, sprostowania, usunięcia, ograniczenia,
przeniesienia oraz sprzeciwu dotyczące danych osobowych.

## Procedure

1. Zweryfikować tożsamość osoby składającej żądanie.
2. Ustalić tenantId, workspaceId i role osoby.
3. Zarejestrować DSAR ID i termin odpowiedzi.
4. Wyszukać dane w systemach produkcyjnych, backupach i eksportach.
5. Odfiltrować dane innych osób, tenantów i workspace.
6. Przygotować odpowiedź lub odmowę z podstawą: DO USTALENIA Z PRAWNIKIEM.
7. Wykonać deletion/rectification, jeśli dotyczy.
8. Zapisać audit bez nadmiarowych danych osobowych.

## Systems To Check

- users and memberships;
- sessions and audit events;
- integration metadata;
- source, normalized and canonical data;
- AI threads, messages, evidence and approvals;
- reports and exports;
- billing metadata;
- notifications.

## Open Items

- DSAR owner: DO USTALENIA Z OWNEREM.
- Response SLA: DO USTALENIA Z PRAWNIKIEM.
- Identity verification method: DO USTALENIA Z PRAWNIKIEM/OWNEREM.
- Export format: DO USTALENIA Z OWNEREM.
