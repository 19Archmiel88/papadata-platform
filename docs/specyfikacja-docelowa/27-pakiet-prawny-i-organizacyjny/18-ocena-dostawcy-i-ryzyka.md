---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-018
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Ocena dostawcy, podprocesora i ryzyka

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Dane dostawcy

Nazwa, entity, kraj, usługa, owner biznesowy, krytyczność, dane, region, dostęp supportu, podprocesorzy, data i plan wyjścia.

## 2. Due diligence

| Obszar | Pytania/dowód | Ocena | Działanie |
|---|---|---|---|
| security | certyfikaty, pentest, IAM, encryption, incident SLA | `[RAG]` | `[AKCJA]` |
| privacy | DPA, role, retention, DSAR, subprocessors | | |
| transfer | lokalizacja, SCC/adequacy, TIA | | |
| AI | trening, log retention, model isolation, abuse monitoring | | |
| resilience | SLA, RTO/RPO, status, backup, exit/export | | |
| legal/commercial | liability, audit, termination, data return | | |
| integration | auth/scopes, webhooks, idempotency, rate limits | | |

## 3. Klasyfikacja ryzyka

Prawdopodobieństwo × wpływ dla poufności, integralności, dostępności, zgodności, finansów i lock-in. Dostawca krytyczny wymaga Security, Privacy i Legal approval oraz planu alternatywnego.

## 4. Warunki wejścia

Brak produkcji bez umowy/DPA, konfiguracji regionu/retencji, secret management, minimal scopes, testu awarii, monitoringu i wpisu w rejestrze. Wyjątek jest czasowy, zatwierdzony i ma termin.

## 5. Monitoring i wyjście

Przegląd co `[OKRES]`, po incydencie i zmianie warunków. Exit plan obejmuje eksport, migrację, revocation, usunięcie danych, zmianę DNS/secrets i komunikację Klientom.
