---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-025
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Checklista prawna, organizacyjna i compliance przed go-live

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## A. Dane spółki i model sprzedaży

- [ ] pełna nazwa, adres, NIP, KRS/CEIDG i reprezentacja potwierdzone;
- [ ] model B2B oraz ewentualny B2C/prosumer zatwierdzony;
- [ ] kraje, waluty, VAT i podmiot fakturujący potwierdzone;
- [ ] znaki towarowe, domeny, prawa do kodu i umowy twórców uporządkowane.

## B. Regulaminy i checkout

- [ ] Regulamin, Warunki subskrypcji, Privacy, Cookies, AI, Mobile i AUP zatwierdzone;
- [ ] wersje, checksumy, daty i archiwum działają;
- [ ] checkout pokazuje pełną cenę, cykl, odnowienie, anulowanie i podatki;
- [ ] brak domyślnie zaznaczonych dodatkowych opłat;
- [ ] dowód zgody i trwały nośnik przetestowane;
- [ ] wariant odstąpienia konsumenckiego zatwierdzony, jeśli dotyczy.

## C. Płatności i billing

- [ ] karta, BLIK, BLIK recurring, szybki/tradycyjny przelew przetestowane end-to-end;
- [ ] SCA/3DS i mandaty providera działają;
- [ ] PapaData nie przechowuje PAN/CVV;
- [ ] webhook signing, idempotency, retry i reconciliation przetestowane;
- [ ] monthly/annual, proration, dunning, cancellation i refund działają;
- [ ] provider umownie i technicznie pokrywa rynek MVP.

## D. Faktury i KSeF

- [ ] dane firmy/GUS i VAT zatwierdzone;
- [ ] FA(3), aktualna wersja API, demo i production przetestowane;
- [ ] certyfikaty/uprawnienia w secret managerze;
- [ ] numer KSeF/UPO, korekty, QR, offline/awaria i retry przetestowane;
- [ ] accounting reconciliation i ustawowa retencja zatwierdzone.

## E. RODO i privacy

- [ ] ROPA kompletny; role controller/processor potwierdzone;
- [ ] DPA i TOM zatwierdzone;
- [ ] lista podprocesorów i transfery opublikowane;
- [ ] DPIA wykonana dla AI/anomaly/JIT, jeśli wymagana;
- [ ] DSAR, deletion, export i legal hold przetestowane;
- [ ] cookies scan i CMP blokują niekonieczne technologie przed zgodą;
- [ ] retencja i usunięcie u podprocesorów mają dowody.

## F. AI Governance

- [ ] provider, region, retencja i no-training potwierdzone;
- [ ] local deterministic provider działa bez sieci;
- [ ] 58 metryk tylko z Metric Engine;
- [ ] evidence/confidence/refusal i case threads przetestowane;
- [ ] AI Actions mają capability, diff, simulation, approval, readback, audit i rollback;
- [ ] treść potwierdzenia człowieka zatwierdzona prawnie.

## G. Security i operacje

- [ ] threat model, pentest, SAST/dependency/IaC scan bez otwartych P0;
- [ ] tenant isolation i negatywne testy;
- [ ] MFA, JIT, recertyfikacja i break-glass;
- [ ] backup restore, BCP/DR i incident tabletop;
- [ ] SLA, status page, on-call i komunikaty;
- [ ] secrets, logs, alerty, vulnerability SLA i patching.

## H. Mobile i sklepy

- [ ] owner-only ekran dystrybucji;
- [ ] QR sklepu oddzielony od pairing QR;
- [ ] App Store/Google Play listing, privacy labels/data safety zgodne z rzeczywistością;
- [ ] biometria, secure storage, push privacy, revoke urządzenia i offline TTL;
- [ ] regulamin i privacy dostępne w aplikacji i sklepach.

## I. Akceptacja

| Rola | Osoba | Decyzja | Data | Dowód |
|---|---|---|---|---|
| Product Owner | | | | |
| Legal | | | | |
| Finance/Tax | | | | |
| IOD/DPO | | | | |
| Security | | | | |
| Operations | | | | |
| Engineering | | | | |

Go-live jest zablokowany przy nierozwiązanym P0, braku wymaganej akceptacji lub rozbieżności dokument–runtime.
