---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-005
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Adapter GUS/BIR do wyszukiwania firmy po NIP

Rejestracja polskiej firmy korzysta z backendowego adaptera GUS/BIR. UI nigdy nie wywołuje GUS bezpośrednio.

## Przepływ

1. Walidacja sumy kontrolnej NIP.
2. `company.lookup` wywołuje adapter rejestru.
3. Adapter zwraca oryginalny payload, dane znormalizowane, źródło i `retrievedAt`.
4. Użytkownik może poprawić dane, ale oryginalna odpowiedź pozostaje w audycie.
5. Timeout, limit, brak rekordu lub awaria uruchamia ręczny fallback.
6. Cache ma jawny TTL i nie ukrywa źródła danych.

## Konfiguracja

`GUS_BIR_BASE_URL`, `GUS_BIR_API_KEY`, `GUS_BIR_TIMEOUT_MS`, `GUS_BIR_CACHE_TTL_SECONDS`, `GUS_BIR_MODE=mock|test|production`.
