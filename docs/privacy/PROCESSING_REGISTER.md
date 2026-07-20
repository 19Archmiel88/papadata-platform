# Processing Register

Status: draft.
Not legal advice. Wymaga przeglądu prawnego.

## Register

Purpose: prowadzenie konta i bezpieczeństwo.
Data: konto, sesje, MFA, audit.
Legal basis: DO USTALENIA Z PRAWNIKIEM.
Retention: patrz `RETENTION_MATRIX.md`.
Owner: DO USTALENIA Z OWNEREM.

Purpose: analityka e-commerce i KPI.
Data: zamówienia, produkty, zwroty, magazyn, koszty reklam, readiness.
Legal basis: DO USTALENIA Z PRAWNIKIEM.
Retention: DO USTALENIA Z OWNEREM.
Owner: DO USTALENIA Z OWNEREM.

Purpose: integracje providerów.
Data: metadata połączeń, checkpointy, statusy sync, błędy providerów.
Legal basis: DO USTALENIA Z PRAWNIKIEM.
Retention: DO USTALENIA Z OWNEREM.
Owner: DO USTALENIA Z OWNEREM.

Purpose: Papa Asystent.
Data: prompt, odpowiedź, evidence, ograniczenia, confidence, approvals.
Legal basis: DO USTALENIA Z PRAWNIKIEM.
Retention: DO USTALENIA Z OWNEREM.
Owner: DO USTALENIA Z OWNEREM.

Purpose: billing i self-service.
Data: plan, usage, entitlement, invoice metadata, payment status.
Legal basis: DO USTALENIA Z PRAWNIKIEM.
Retention: DO USTALENIA Z PRAWNIKIEM/OWNEREM.
Owner: DO USTALENIA Z OWNEREM.

Purpose: powiadomienia, raporty i eksporty.
Data: durable notifications, report metadata, generated files, audit.
Legal basis: DO USTALENIA Z PRAWNIKIEM.
Retention: DO USTALENIA Z OWNEREM.
Owner: DO USTALENIA Z OWNEREM.

## Controls

- Deny by default dla tenant/workspace.
- Log redaction dla sekretów i danych wrażliwych.
- Wersjonowane definicje KPI i source authority.
- Audit dla zmian bezpieczeństwa, dostępu, integracji, AI i billing.
