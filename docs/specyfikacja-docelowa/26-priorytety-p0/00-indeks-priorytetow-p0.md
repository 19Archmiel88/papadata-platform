---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-000
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Indeks priorytetów P0

Ten katalog jest nadrzędnym pakietem wykonawczym dla ustaleń zatwierdzonych 30 lipca 2026. W razie konfliktu z wcześniejszym dokumentem pierwszeństwo ma niniejsza sekcja i rejestr decyzji docelowych.

| P0 | Obowiązkowy wynik |
|---|---|
| P0-01 | 58 metryk w jednym katalogu i jednym Metric Engine |
| P0-02 | Parity local/CI/dev/staging z produkcją GCP |
| P0-03 | Cała aplikacja w MVP; ograniczenie tylko do 7 integracji |
| P0-04 | AI lokalne oraz adapter zewnętrznego LLM |
| P0-05 | NIP przez GUS/BIR z ręcznym fallbackiem |
| P0-06 | Mobile owner-only, QR sklepów i QR parowania |
| P0-07 | Kreator raportów i eksport PDF/CSV/XLSX |
| P0-08 | Jeden conversationId Asystent–Laboratorium |
| P0-09 | Wątki spraw dla anomalii, ryzyk, wzrostów i rekomendacji |
| P0-10 | AI Actions z akceptacją człowieka i audytem |
| P0-11 | Billing miesięczny/roczny, karta/BLIK/przelewy |
| P0-12 | KSeF i pełny pakiet prawno-organizacyjny |

Brama odbioru znajduje się w `scripts/validate_all.py` jako kontrola `priority_p0`.
