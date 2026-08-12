---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-007
updated_at: 2026-07-30T15:05:00+02:00
status: legal-template
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Umowa poziomu świadczenia usług — SLA

> **Status dokumentu:** `legal-template`, nie `accepted-production`. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zakres i okres pomiaru

SLA dotyczy produkcyjnego API, aplikacji webowej, krytycznych jobów synchronizacji i usług wskazanych w Order Form. Okres pomiaru: miesiąc kalendarzowy. Źródłem jest monitoring PapaData z możliwością weryfikacji przez status page i logi incydentów.

## 2. Dostępność

Docelowa dostępność: `[99,9% / WARTOŚĆ PLANU]`. Wzór: `(całkowity czas okresu − niedostępność kwalifikowana) / całkowity czas okresu × 100%`. Wyłączenia muszą być ograniczone i jawne: zaplanowane prace w oknie, siła wyższa, awaria providera poza kontrolą przy wdrożonych środkach recovery, działanie Klienta, zawieszenie zgodne z umową i funkcje beta wyraźnie wyłączone z SLA.

## 3. Priorytety i reakcja

| Priorytet | Przykład | Potwierdzenie | Aktualizacje | Cel obejścia/naprawy |
|---|---|---|---|---|
| P1 Critical | cała usługa niedostępna, naruszenie izolacji | `[15–30 min]` | `[30 min]` | `[4 h / uzgodnione]` |
| P2 High | kluczowy moduł niedostępny | `[1 h]` | `[2 h]` | `[1 dzień]` |
| P3 Medium | istotne ograniczenie z obejściem | `[1 dzień]` | `[DZIEŃ]` | `[SPRINT/TERMIN]` |
| P4 Low | kosmetyka / pytanie | `[2 dni]` | wg potrzeby | backlog |

Czasy są godzinami `[24/7 / BUSINESS HOURS]` zgodnie z Planem.

## 4. Synchronizacja i świeżość

Dla integracji definiuje się osobne SLO: opóźnienie ingestu, czas initial sync, retry i freshness. Awaria zewnętrznego API nie jest przedstawiana jako poprawne zero; UI pokazuje `partial`, `stale` lub `provider_error`.

## 5. Maintenance

Planowane prace są komunikowane co najmniej `[DNI/GODZINY]` wcześniej, poza pilną poprawką bezpieczeństwa. Okna i przewidywany wpływ są publikowane na `[STATUS PAGE]`.

## 6. Service credits

| Dostępność | Credit |
|---|---|
| poniżej celu do `[PRÓG]` | `[X%]` miesięcznej opłaty |
| poniżej `[PRÓG]` | `[Y%]` |
| poniżej `[PRÓG]` | `[Z%]` |

Wniosek w terminie `[DNI]`; credit jest zaliczeniem na przyszłe opłaty, chyba że prawo/Order Form stanowi inaczej. Łączny limit: `[LIMIT]`.

## 7. RTO/RPO i komunikacja

RTO/RPO dla klas danych wynikają z BCP/DR. P1 obejmuje kanał kryzysowy, właściciela incydentu, raport po incydencie i działania zapobiegawcze. Incydent bezpieczeństwa podlega odrębnej procedurze.
