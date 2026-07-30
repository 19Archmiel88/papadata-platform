---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-020
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Polityka dostępu, ról i uprawnień

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zasady

Least privilege, need-to-know, separation of duties, deny by default, backend enforcement, tenant/workspace scope, MFA i pełny audyt. Nazwa roli nie zastępuje capability check.

## 2. Role minimalne

Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security i Internal Support/Operations JIT. Macierz zawiera capability, data scope, możliwość eksportu, AI Action, billing, mobile QR i admin.

## 3. Cykl życia

Request → approval → provision → verify → periodic review → change → revoke. Źródłem zatrudnienia/tożsamości: `[SYSTEM]`. Offboarding uprzywilejowanej roli: natychmiast; standardowej: `[SLA]`.

## 4. Uprzywilejowany i support access

Brak stałego dostępu do danych Klienta. JIT wymaga ticketu, powodu, tenant scope, czasu, approval i reauthentication; sesja jest logowana i — gdy możliwe — nagrywana. Klient może widzieć support access log.

## 5. Serwisowe tożsamości i sekrety

Każda ma ownera, cel, minimalny scope, rotację, expiry i monitoring. Brak sekretów osobistych w automatyzacji. Break-glass jest ograniczony, alertowany i przeglądany po użyciu.

## 6. Recertyfikacja

Co kwartał dla uprzywilejowanych i co `[OKRES]` dla pozostałych. Owner potwierdza użytkownika, rolę i scope. Brak odpowiedzi powoduje eskalację lub revoke.

## 7. Kontrole szczególne

Mobile distribution QR tylko Tenant Owner. Billing/KSeF tylko Owner/Billing. Zmiana budżetu przez AI wymaga właściwej capability i approval. Eksport danych oraz DPA/DSAR mają oddzielne capabilities.
