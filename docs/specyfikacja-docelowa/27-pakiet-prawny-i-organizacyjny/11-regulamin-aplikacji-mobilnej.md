---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-011
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Regulamin aplikacji mobilnej PapaData

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zakres

Aplikacja mobilna jest częścią usługi PapaData, dostępna na iOS i Android. Dostęp do sekcji dystrybucji w ustawieniach ma wyłącznie Tenant Owner. Ekran pokazuje zweryfikowane linki App Store/Google Play oraz smart QR. Osobny, krótkotrwały pairing QR służy do powiązania urządzenia i nigdy nie pełni funkcji linku sklepowego.

## 2. Instalacja i wymagania

Wspierane systemy: `[WERSJE]`. Aplikację należy instalować wyłącznie z oficjalnych sklepów lub zatwierdzonego kanału enterprise. Wymagane są konto PapaData, wspierane urządzenie, sieć oraz — dla wybranych funkcji — push i biometria. Opłaty operatora sieci ponosi użytkownik.

## 3. Pairing i bezpieczeństwo

Kod pairing jest jednorazowy, wygasa po `[MINUTY]`, jest związany z tenantem, użytkownikiem i urządzeniem oraz wymaga ponownego uwierzytelnienia ownera. Tokeny są przechowywane w Keychain/Keystore. Root/jailbreak, utrata urządzenia lub anomalia mogą wymusić blokadę i revoke.

## 4. Funkcje i offline

Zakres mobilny obejmuje `[LISTA]`. Dane offline są minimalizowane, szyfrowane i mają TTL. Działania wymagające aktualnego stanu, w szczególności AI Actions i zmiany finansowe, nie są wykonywane offline. Kolejka synchronizacji pokazuje status i konflikt.

## 5. Powiadomienia

Push może informować o anomalii, płatności, synchronizacji lub approval. Treść na ekranie blokady nie zawiera wrażliwych danych, chyba że użytkownik świadomie zmieni ustawienie. Preferencje można zmienić w systemie i aplikacji.

## 6. Sklepy i aktualizacje

Warunki Apple/Google mogą mieć zastosowanie do dystrybucji. Subskrypcja PapaData jest rozliczana zgodnie z checkoutem webowym lub zatwierdzonym kanałem, a nie automatycznie przez sklep, chyba że produkt wyraźnie to wdroży. Krytyczna aktualizacja bezpieczeństwa może być wymagana do dalszego użycia.

## 7. Prywatność i support

Aplikacja przetwarza identyfikator instalacji, token push, logi, dane konta i wybrane dane workspace. Szczegóły zawiera Polityka prywatności. Kontakt: `[MOBILE SUPPORT]`. Usunięcie aplikacji nie usuwa konta ani danych tenanta.
