# Bezpieczeństwo

## Wymagania podstawowe

- [ ] Izolacja tenantów.
- [ ] Izolacja workspace.
- [ ] Autoryzacja backendowa.
- [ ] MFA dla kont uprzywilejowanych.
- [ ] Rotacja refresh tokenów.
- [ ] Reuse detection.
- [ ] Sesje list/revoke.
- [ ] Jednorazowe zaproszenia.
- [ ] Wygasanie linków.
- [ ] Reauthentication dla operacji wrażliwych.
- [ ] Secrets poza kodem i bazą aplikacyjną.
- [ ] Append-only audit log.
- [ ] Tamper detection.
- [ ] Backup audytu.
- [x] Tenant-safe AI retrieval.

## Zdarzenia audytowe

- logowanie,
- nieudane logowanie,
- reset hasła,
- MFA,
- utworzenie workspace,
- zmiana workspace,
- zaproszenie,
- zmiana roli,
- usunięcie użytkownika,
- integracja connect/disconnect,
- błąd synchronizacji,
- reauthorization,
- eksport,
- raport,
- użycie AI,
- rekomendacja AI,
- wykonanie AI Action,
- próba nieuprawnionego dostępu.

## Implementacja Fali 5

AI Gateway egzekwuje:

- active membership;
- capability;
- entitlement;
- tenant/workspace scope;
- approved use case;
- Gate S3;
- readiness;
- retention;
- cost policy;
- prompt injection detection;
- secret redaction;
- evidence scope validation;
- audit.

Produkcyjne AI jest zablokowane do niezależnych ocen Gate S3.
