---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-BILL-714
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Adapter providera płatności

Domena używa interfejsu `PaymentProvider`: createCheckout, createMandate, charge, refund, cancelMandate, getPayment, listMethods, verifyWebhook i reconcile. Provider SDK nie może przenikać do kontrolerów ani modeli domenowych.

Wymagane są idempotency keys, podpis webhooków, deduplikacja, stan pośredni, timeout, retry bez podwójnego obciążenia, ledger i codzienna rekoncyliacja. Sekrety znajdują się w secret managerze, a lokalnie w niecommitowanym `.env.local`.
