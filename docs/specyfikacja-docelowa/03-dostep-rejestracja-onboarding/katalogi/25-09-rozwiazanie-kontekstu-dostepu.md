---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-BE1385151A2D
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Rozwiązanie kontekstu dostępu — katalog procesu

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.09 |
| Nazwa polska | Rozwiązanie kontekstu dostępu |
| Nazwa techniczna | rozwiazanie-kontekstu-dostepu |
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

Dokument grupuje powierzchnie należące do procesu „Rozwiązanie kontekstu dostępu”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

## Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Rozwiązanie dostępu | [Rozwiązanie dostępu](../powierzchnie-auth/auth-21-rozwiazanie-dostepu.md) | osobny kontrakt powierzchni |
| Wybór organizacji lub tenanta | [Wybór organizacji lub tenanta](../powierzchnie-auth/auth-22-wybor-organizacji-lub-tenanta.md) | osobny kontrakt powierzchni |
| Wybór obszaru roboczego | [Wybór obszaru roboczego](../powierzchnie-auth/auth-23-wybor-obszaru-roboczego.md) | osobny kontrakt powierzchni |
| Ponowne uwierzytelnienie | [Ponowne uwierzytelnienie](../powierzchnie-auth/auth-24-ponowne-uwierzytelnienie.md) | osobny kontrakt powierzchni |
| Dostęp zablokowany | [Dostęp zablokowany](../powierzchnie-auth/auth-28-dostep-zablokowany.md) | osobny kontrakt powierzchni |

## Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

## Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.
