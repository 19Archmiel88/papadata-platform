---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-017
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Ocena skutków dla ochrony danych — DPIA

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Metryka oceny

Nazwa procesu `[NAZWA]`; owner `[ROLA]`; data `[DATA]`; wersja `[X]`; uczestnicy Product, Security, Privacy/IOD, Legal i przedstawiciel użytkowników `[JEŚLI DOTYCZY]`; status `draft/approved/rejected/review_due`.

## 2. Opis i przepływ

Opisać cel, osoby, dane, źródła, systemy, providerów, odbiorców, regiony, częstotliwość, skalę, czas, AI/model, działania automatyczne i diagram przepływu. Wskazać, co jest nowatorskie i jakie rozsądne oczekiwania mają osoby.

## 3. Konieczność i proporcjonalność

Dla każdego celu: podstawa, minimalizacja, dokładność, retencja, transparentność, prawa, alternatywa mniej ingerująca i uzasadnienie zakresu. Potwierdzić, że dane innego tenanta i niegotowe źródła są blokowane.

## 4. Scenariusze ryzyka

| Scenariusz | Osoba/skutek | Prawdopodobieństwo | Dotkliwość | Ryzyko początkowe | Kontrole | Ryzyko resztkowe | Owner |
|---|---|---|---|---|---|---|---|
| cross-tenant exposure | utrata poufności | `[1-5]` | `[1-5]` | `[WYNIK]` | izolacja, tests, audit | `[WYNIK]` | Security |
| błędna rekomendacja AI | strata/nieuczciwe traktowanie | | | | evidence, human approval, limits | | AI Gov |
| provider LLM retention/training | utrata kontroli | | | | no-training, DPA, region, redaction | | Privacy |
| JIT support abuse | nieuprawniony dostęp | | | | approval, timebox, recording | | Security |
| profilowanie/anomaly detection | błędna inferencja | | | | transparency, correction, no sole decision | | Product |

## 5. Konsultacje

Zapisać opinie IOD, Security, osób/klientów, dostawcy i ewentualne konsultacje z organem. Odstępstwo od rekomendacji IOD wymaga pisemnego uzasadnienia zarządu.

## 6. Decyzja

`approve`, `approve_with_actions`, `reject`, `prior_consultation_required`. Działania mają ownera, termin i dowód. Produkcja jest blokowana, gdy ryzyko wysokie nie zostało zredukowane lub wymaga konsultacji.

## 7. Przegląd

Co `[12 MIESIĘCY]` oraz po zmianie celu, modelu, źródła, providera, skali, incydencie lub nowym prawie.
