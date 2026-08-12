---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-4069F322CFEE
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Zaproszenie — katalog procesu

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.04 |
| Nazwa polska | Zaproszenie |
| Nazwa techniczna | zaproszenie |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Zaproszenie”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

## Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Przegląd zaproszenia | [Przegląd zaproszenia](../powierzchnie-auth/auth-15-przeglad-zaproszenia.md) | osobny kontrakt powierzchni |

## Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

## Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.
