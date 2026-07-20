# Data Inventory

Status: draft.
Not legal advice. Wymaga przeglądu prawnego i właścicielskiego.

## Scope

Inwentarz opisuje planowane kategorie danych PapaData. Nie potwierdza jeszcze
produkcyjnego przetwarzania.

## Data Categories

- Dane konta: e-mail, imię, nazwisko, role, membership, tenantId, workspaceId.
- Dane auth: sesje, MFA status, recovery status, audyt logowania.
- Dane firmy: profil organizacji, profil biznesowy, ustawienia workspace.
- Dane integracji: metadata połączeń, status synchronizacji, checkpointy.
- Dane e-commerce: zamówienia, produkty, zwroty, płatności, magazyn.
- Dane marketingowe: koszty reklam, kampanie, konwersje atrybucyjne.
- Dane jakości: lineage, data issues, readiness, reconciliation.
- Dane AI: wątki, wiadomości, evidence, confidence, refusal, approvals.
- Dane billingowe: plan, subskrypcja, faktury, usage, entitlements.
- Dane powiadomień i raportów: status, pliki eksportów, audit trail.

## Sensitive Data Policy

- Hasła, OTP, refresh tokeny i recovery codes nie mogą być logowane.
- Provider tokens muszą być przechowywane jako sekret backendowy, nie w browser
  storage.
- AI nie może używać danych bez readiness i uprawnień.
- Brak danych nie jest zerem.

## Open Items

- Administrator danych: DO USTALENIA Z PRAWNIKIEM/OWNEREM.
- Podstawa prawna per kategoria: DO USTALENIA Z PRAWNIKIEM.
- Kraje transferu: DO USTALENIA Z PRAWNIKIEM.
- DPA/subprocessors: DO USTALENIA Z PRAWNIKIEM.
