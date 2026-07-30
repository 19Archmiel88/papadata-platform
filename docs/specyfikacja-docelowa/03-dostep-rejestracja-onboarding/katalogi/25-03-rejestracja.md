---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-DCD2E55C0EA2
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Rejestracja — katalog procesu

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.03 |
| Nazwa polska | Rejestracja |
| Nazwa techniczna | rejestracja |
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

Dokument grupuje powierzchnie należące do procesu „Rejestracja”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

## Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Wejście do rejestracji | [Wejście do rejestracji](../powierzchnie-auth/auth-03-wejscie-do-rejestracji.md) | osobny kontrakt powierzchni |
| Rejestracja adresem e-mail | [Rejestracja adresem e-mail](../powierzchnie-auth/auth-04-rejestracja-adresem-e-mail.md) | osobny kontrakt powierzchni |
| Rejestracja przez OAuth | [Rejestracja przez OAuth](../powierzchnie-auth/auth-05-rejestracja-przez-oauth.md) | osobny kontrakt powierzchni |
| Zgody rejestracyjne | [Zgody rejestracyjne](../powierzchnie-auth/auth-12-zgody-rejestracyjne.md) | osobny kontrakt powierzchni |
| Przetwarzanie rejestracji | [Przetwarzanie rejestracji](../powierzchnie-auth/auth-13-przetwarzanie-rejestracji.md) | osobny kontrakt powierzchni |
| Rejestracja zakończona | [Rejestracja zakończona](../powierzchnie-auth/auth-14-rejestracja-zakonczona.md) | osobny kontrakt powierzchni |

## Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

## Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.
