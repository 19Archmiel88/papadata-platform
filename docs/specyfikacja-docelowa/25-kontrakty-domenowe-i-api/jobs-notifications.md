---
version: 1.1
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-JOBS-NOTIFICATIONS
status: approved-target
updated_at: 2026-08-17T05:00:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Jobs Notifications — kontrakt domenowy API

## Cel

Dokument definiuje kanoniczny runtime trwałych powiadomień shella. Źródłem prawdy jest dedykowany model `app.notifications`, a nie ogólny `product_domain_records`.

## Operacje

| operationId | kind | method | BFF route | service route | capability | request | response |
|---|---|---|---|---|---|---|---|
| `notifications.list` | query | GET | `/api/v1/notifications` | `/v1/notifications` | `workspace.read` | `NotificationsListRequest` | `NotificationsListResponse` |
| `notifications.mark-read` | command | POST | `/api/v1/notifications/{id}/read` | `/v1/notifications/{id}/read` | `workspace.read` | `NotificationMutationRequest` | `NotificationMutationResponse` |
| `notifications.mark-unread` | command | POST | `/api/v1/notifications/{id}/unread` | `/v1/notifications/{id}/unread` | `workspace.read` | `NotificationMutationRequest` | `NotificationMutationResponse` |
| `notifications.mark-all-read` | command | POST | `/api/v1/notifications/read-all` | `/v1/notifications/read-all` | `workspace.read` | `NotificationMutationRequest` | `NotificationsMarkAllReadResponse` |
| `notifications.snooze` | command | POST | `/api/v1/notifications/{id}/snooze` | `/v1/notifications/{id}/snooze` | `workspace.read` | `NotificationSnoozeRequest` | `NotificationMutationResponse` |
| `notifications.unsnooze` | command | POST | `/api/v1/notifications/{id}/unsnooze` | `/v1/notifications/{id}/unsnooze` | `workspace.read` | `NotificationMutationRequest` | `NotificationMutationResponse` |

## Model trwały

Powiadomienie jest scopingowane jednocześnie przez:

- `recipient_user_id`,
- `tenant_id`,
- `workspace_id`.

Stan `read/unread` i `snoozed_until` są ortogonalne. Snooze nie kasuje historii odczytu i nie tworzy kopii powiadomienia.

Aktywny inbox pomija rekordy z `snoozed_until > now()`. Widok `snoozed` pokazuje wyłącznie takie rekordy. Po upływie terminu rekord automatycznie wraca do aktywnego inboxa bez dodatkowego joba in-app.

## Reguły

- wszystkie commandy wymagają CSRF i idempotency key na granicy BFF/API;
- backend ponownie weryfikuje recipienta, tenant i workspace, niezależnie od UI;
- unread count obejmuje wyłącznie aktywne, nieodłożone rekordy `unread`;
- `mark-all-read` dotyczy aktywnego inboxa i nie zmienia odłożonych rekordów;
- `snooze` akceptuje czas od 30 sekund do 90 dni w przyszłość;
- krytyczne powiadomienia nie mogą zostać odłożone; backend egzekwuje tę politykę;
- odłożenie można anulować przez `unsnooze`;
- endpointy nie zwracają danych innych użytkowników i dla cudzego/nieistniejącego ID zachowują bezpieczny outcome;
- brak provider response nie uruchamia fixtures ani lokalnych danych demonstracyjnych;
- email/push reminder jest osobnym kanałem i może w przyszłości wymagać joba; samo in-app snooze nie wymaga schedulera.

## Powiązania

- `06-powloka-produktu-i-nawigacja/20-08-powiadomienia.md`
- `06-powloka-produktu-i-nawigacja/20-10-overlayroot-i-system-warstw.md`
- `21-wzorce-przekrojowe/18-03-ladowanie-danych-i-operacje-w-tle.md`
- `rejestry/api-operations.csv`
- `contracts/openapi-1.0.json`
