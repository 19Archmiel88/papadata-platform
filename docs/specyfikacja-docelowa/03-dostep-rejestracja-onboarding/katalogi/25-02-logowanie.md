---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-13FA40CFE33F
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Logowanie — katalog procesu

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.02 |
| Nazwa polska | Logowanie |
| Nazwa techniczna | logowanie |
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

Dokument grupuje powierzchnie należące do procesu „Logowanie”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

## Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Logowanie | [Logowanie](../powierzchnie-auth/auth-02-logowanie.md) | osobny kontrakt powierzchni |
| Przetwarzanie wylogowania | [Przetwarzanie wylogowania](../powierzchnie-auth/auth-25-przetwarzanie-wylogowania.md) | osobny kontrakt powierzchni |
| Ekran po wylogowaniu | [Ekran po wylogowaniu](../powierzchnie-auth/auth-26-ekran-po-wylogowaniu.md) | osobny kontrakt powierzchni |
| Usługa Auth niedostępna | [Usługa Auth niedostępna](../powierzchnie-auth/auth-27-usluga-auth-niedostepna.md) | osobny kontrakt powierzchni |
| Dostęp zablokowany | [Dostęp zablokowany](../powierzchnie-auth/auth-28-dostep-zablokowany.md) | osobny kontrakt powierzchni |
| Zakończenie procesu i wejście do aplikacji | [Zakończenie procesu i wejście do aplikacji](../powierzchnie-auth/auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji.md) | osobny kontrakt powierzchni |

## Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

## Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.
