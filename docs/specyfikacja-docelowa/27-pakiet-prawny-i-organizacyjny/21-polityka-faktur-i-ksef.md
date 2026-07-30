---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-021
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Polityka faktur, korekt i KSeF

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zakres i odpowiedzialność

Finance jest właścicielem poprawności podatkowej, numeracji i KSeF. Engineering odpowiada za adapter, bezpieczeństwo, idempotencję, monitoring i audyt. Legal/Tax zatwierdza warianty faktur. Klient odpowiada za aktualne dane firmy.

## 2. Cykl dokumentu

`draft → validated → ready_for_ksef → submitted → accepted` albo `rejected/offline_pending/correction_required`. Wystawienie lokalne, wysłanie i przyjęcie przez KSeF są odrębnymi zdarzeniami. Numer KSeF/UPO i czas są zachowywane.

## 3. Adapter KSeF

Używa oficjalnego, wersjonowanego OpenAPI i rozdziela demo/integration/production. Obsługuje FA(3), certyfikaty/uprawnienia, kontekst NIP, sesje, wysłanie, status, pobranie UPO, korekty, QR i tryby offline/awaryjne. Wersja API/schema jest pinowana, monitorowana i aktualizowana po testach kontraktowych.

## 4. Bezpieczeństwo

Certyfikat/token nie trafia do repo ani logów; jest w secret managerze, ma ownera, rotację, revocation i alert użycia. Operacja jest idempotentna; retry nie tworzy duplikatu. Dostęp mają wyłącznie Finance i serwisowa tożsamość o minimalnym scope.

## 5. Walidacja danych

Nazwa, NIP, adres, waluta, stawka, pozycje, daty, numeracja, płatność i powiązanie z subskrypcją. Dane z GUS/BIR są propozycją/referencją; Klient potwierdza dane billingowe. Po wystawieniu zmiana wymaga właściwego dokumentu korygującego.

## 6. Tryb offline i awaria

System rozpoznaje właściwy tryb, oznacza dokument, generuje wymagany QR i termin wysłania po przywróceniu. Kolejka ma priorytet, retry i alert przed upływem terminu. Nie ukrywa się opóźnienia przed Finance/Klientem.

## 7. Reconciliation

Codziennie porównuje ledger, provider płatności, lokalne faktury, KSeF i księgowość. Rozbieżność tworzy case z ownerem. Nie wolno ręcznie zmieniać statusu `accepted` bez dowodu KSeF.

## 8. Retencja i dostęp Klienta

Faktury, korekty i potwierdzenia są dostępne w panelu przez okres umowny/prawny. Retencję zatwierdza Tax/Legal. Eksport zawiera PDF/wizualizację, dane strukturalne tam, gdzie dozwolone, numer KSeF i status.
