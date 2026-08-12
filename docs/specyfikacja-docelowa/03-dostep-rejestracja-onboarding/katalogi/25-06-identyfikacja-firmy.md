---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-EC70F07DD0D4
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Identyfikacja firmy — katalog procesu

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.06 |
| Nazwa polska | Identyfikacja firmy |
| Nazwa techniczna | identyfikacja-firmy |
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

Dokument grupuje powierzchnie należące do procesu „Identyfikacja firmy”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

## Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Identyfikacja firmy | [Identyfikacja firmy](../powierzchnie-auth/auth-07-identyfikacja-firmy.md) | osobny kontrakt powierzchni |
| Wyszukiwanie firmy | [Wyszukiwanie firmy](../powierzchnie-auth/auth-08-wyszukiwanie-firmy.md) | osobny kontrakt powierzchni |
| Sprawdzenie i edycja danych firmy | [Sprawdzenie i edycja danych firmy](../powierzchnie-auth/auth-09-sprawdzenie-i-edycja-danych-firmy.md) | osobny kontrakt powierzchni |
| Ręczne wprowadzenie firmy | [Ręczne wprowadzenie firmy](../powierzchnie-auth/auth-10-reczne-wprowadzenie-firmy.md) | osobny kontrakt powierzchni |
| Firma już zarejestrowana | [Firma już zarejestrowana](../powierzchnie-auth/auth-11-firma-juz-zarejestrowana.md) | osobny kontrakt powierzchni |

## Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

## Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.
