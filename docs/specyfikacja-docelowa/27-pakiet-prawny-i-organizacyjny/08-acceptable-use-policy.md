---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-008
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Polityka dopuszczalnego użycia — AUP

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Cel

AUP chroni PapaData, Klientów, providerów i osoby, których dane są analizowane. Obowiązuje każdego Użytkownika, integrację, API key i automatyzację.

## 2. Zakazane działania

Zabronione jest: naruszanie prawa i praw osób trzecich; przetwarzanie danych bez podstawy; malware, phishing, spam i oszustwa; próby dostępu do innego tenanta; obchodzenie limitów, MFA, capabilities i rate limitów; nieautoryzowane skanowanie; reverse engineering poza dozwolonym zakresem; przeciążanie usługi; wprowadzanie sekretów do miejsc do tego nieprzeznaczonych; używanie AI do nielegalnej dyskryminacji, manipulacji, decyzji wysokiego ryzyka bez wymaganych zabezpieczeń lub do wykonania działania bez uprawnienia.

## 3. Bezpieczeństwo konta

Klient utrzymuje listę Użytkowników, usuwa nieaktywne konta, stosuje MFA dla ról wymaganych, nie współdzieli kont i ogranicza tokeny. Podejrzenie przejęcia zgłasza niezwłocznie.

## 4. Dane szczególne i treści

Wprowadzanie szczególnych kategorii danych, danych dzieci, danych medycznych lub innych danych regulowanych jest `[ZAKAZANE / DOZWOLONE PO DODATKU]`. Klient nie może przesyłać treści, których nie ma prawa przetwarzać. PapaData może technicznie blokować znane typy sekretów i złośliwe pliki.

## 5. Limity i automatyzacje

API, eksporty, AI i synchronizacje podlegają limitom Planu i ochronie fair use. Automatyzacja musi używać idempotency keys, wspieranych endpointów i oficjalnych integracji. Zabronione jest omijanie limitów przez wiele tenantów lub kont.

## 6. Reakcja

W razie naruszenia PapaData może ostrzec, ograniczyć funkcję, unieważnić token, odizolować dane lub zawiesić konto w zakresie koniecznym. Gdy to możliwe, Klient otrzymuje uzasadnienie i możliwość naprawy. Poważne lub bezprawne zdarzenie może skutkować rozwiązaniem i zgłoszeniem właściwym organom.

## 7. Zgłaszanie nadużyć

Kanał: `[EMAIL/FORMULARZ]`. Zgłoszenie powinno zawierać tenant, czas, dowód i opis. Zgłaszający nie powinien dołączać niepotrzebnych danych osobowych ani sekretów.
