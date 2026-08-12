---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-BILL-713
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Integracja faktur z KSeF

Adapter KSeF jest oddzielony od domeny billingowej. Obsługuje środowisko integracyjne/demo i produkcję, certyfikaty/uprawnienia, FA(3), wysłanie faktury, pobranie numeru KSeF/UPO, status, korekty, QR, tryby offline i awarii, retry, limity oraz reconciliation.

Faktura lokalna ma statusy: `draft`, `ready_for_ksef`, `submitted`, `accepted`, `rejected`, `offline_pending`, `correction_required`, `cancelled_where_legally_allowed`. Oryginalny payload, odpowiedź i identyfikatory są objęte audytem i retencją księgową.

Konfiguracja: `KSEF_ENV`, `KSEF_BASE_URL`, `KSEF_AUTH_MODE`, `KSEF_CERTIFICATE_REF`, `KSEF_NIP_CONTEXT`, `KSEF_TIMEOUT_MS`, `KSEF_RETRY_POLICY`.
