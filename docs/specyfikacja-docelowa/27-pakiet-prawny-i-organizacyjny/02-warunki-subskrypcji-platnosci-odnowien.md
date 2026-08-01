---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-002
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Warunki subskrypcji, płatności i odnowień

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zakres i dane sprzedawcy

Dokument stanowi część Regulaminu SaaS i opisuje warunki komercyjne. Sprzedawca: `[SPÓŁKA, ADRES, NIP, KRS]`. Provider płatności: `[NAZWA I ROLA]`. Waluta bazowa: `[PLN/EUR]`. Ceny są prezentowane jako `[NETTO/BRUTTO]` wraz z należnym podatkiem.

## 2. Plany i cykle

1. Dostępne cykle: `monthly` i `annual`.
2. Przed zakupem wyświetlane są: nazwa Planu, zakres i limity, pełna kwota za okres, kwota podatku, efektywna cena miesięczna planu rocznego, data rozpoczęcia, data następnego obciążenia, automatyczne odnowienie, minimalny okres i sposób rezygnacji.
3. Źródłem ceny jest wersjonowany `priceId`; checkout zapisuje jej snapshot wraz z wersją dokumentów.

## 3. Zawarcie i aktywacja

Subskrypcja zaczyna się po potwierdzeniu płatności, zatwierdzeniu przelewu odroczonego albo dacie wskazanej w Order Form. Stan płatności nie jest utożsamiany ze stanem subskrypcji; system obsługuje osobno `pending`, `authorized`, `paid`, `failed`, `refunded`, `disputed` oraz `active`, `trialing`, `past_due`, `restricted`, `cancel_at_period_end`, `cancelled`.

## 4. Metody płatności MVP

- karta płatnicza — jednorazowo i cyklicznie przez tokenizację/hosted fields;
- BLIK jednorazowy;
- BLIK powtarzalny — po ustanowieniu mandatu, jeżeli wspiera go bank i provider;
- szybki przelew bankowy / pay-by-link;
- przelew tradycyjny z identyfikatorem płatności i automatyczną rekoncyliacją;
- Apple Pay i Google Pay, gdy provider i urządzenie je udostępniają.

PapaData nie przechowuje PAN ani CVV. Pierwsze ustanowienie lub istotna zmiana serii płatności cyklicznych podlega uwierzytelnieniu wymaganym przez providera i właściwe przepisy.

## 5. Automatyczne odnowienie

Jeżeli Klient wybiera odnowienie, subskrypcja odnawia się na kolejny taki sam okres. Data i szacowana kwota są widoczne w panelu. Przypomnienie dla planu rocznego wysyłane jest `[LICZBA DNI]` przed obciążeniem. Odnowienie można wyłączyć samodzielnie; wyłączenie nie odbiera dostępu do końca opłaconego okresu.

## 6. Zmiana Planu i proration

Upgrade może wejść natychmiast, a downgrade od kolejnego okresu — zgodnie z UI. Przed potwierdzeniem system pokazuje: kwotę dopłaty lub kredytu, nowy limit, datę wejścia i wpływ na integracje. Algorytm proration i zaokrągleń: `[OPIS]`. Każda kalkulacja jest przechowywana jako audytowalny snapshot.

## 7. Rabaty, trial i pilot

Kupon lub rabat ma identyfikator, czas obowiązywania i warunki. UI nie przedstawia ceny promocyjnej bez ceny po promocji. Trial/pilot określa zakres, czas, limity, sposób przejścia na płatny Plan i wymóg osobnej akceptacji płatności, jeżeli nie została wcześniej udzielona.

## 8. Nieudana płatność i dunning

Proces: `failed → retrying → grace_period → restricted → cancelled`. Harmonogram prób: `[HARMONOGRAM]`. Komunikaty zawierają powód możliwy do ujawnienia, kwotę, termin, aktualizację metody i kontakt. Retry jest idempotentny. Ograniczenie usługi nie może usuwać danych ani blokować eksportu wymaganego prawem lub umową.

## 9. Anulowanie i zwroty

Anulowanie jest dostępne w panelu dla uprawnionej roli. Skutek: `[KONIEC OKRESU / NATYCHMIAST]`. Zwroty i korekty wynikają z prawa, Order Form, gwarancji handlowej lub potwierdzonego błędu płatności. Podwójne obciążenie jest automatycznie wykrywane i korygowane. Wariant konsumencki zawiera procedurę odstąpienia.

## 10. Faktury i KSeF

Faktura jest wystawiana zgodnie z danymi billingowymi i dostarczana w panelu. Dla podmiotów objętych KSeF system przekazuje dokument przez adapter, przechowuje numer KSeF/UPO/status i obsługuje korekty oraz tryby offline/awaryjne. Faktura lokalna nie jest oznaczana jako zaakceptowana przez KSeF przed otrzymaniem potwierdzenia.

## 11. Podatki i dane firmy

Klient odpowiada za aktualność nazwy, adresu, NIP/VAT ID i kraju. PapaData może weryfikować NIP przez GUS/BIR oraz VAT przez `[VIES/PROVIDER]`. Zmiana danych po wystawieniu dokumentu może wymagać korekty, a nie edycji faktury.

## 12. Zgoda i dowód

Checkout nie stosuje domyślnie zaznaczonych zgód na dodatkowe opłaty. System zapisuje aktora, tenant, plan, cykl, cenę, walutę, podatki, auto-renew, metodę, wersję dokumentów, czas, kanał i identyfikator transakcji. Klient otrzymuje potwierdzenie na trwałym nośniku.

## 13. Zmiany cen

Zmiana ceny istniejącej subskrypcji wymaga podstawy umownej, komunikacji `[OKRES]`, jasnego wskazania nowej kwoty i daty oraz prawa do rezygnacji, jeżeli wynika z prawa lub umowy. Cena nie zmienia się wstecznie.

## 14. Reklamacje płatnicze

Reklamacja zawiera invoice/payment ID, kwotę, datę, metodę i opis. PapaData współpracuje z providerem, ale nie żąda pełnych danych karty ani kodu BLIK. Termin odpowiedzi: `[TERMIN]`. Chargeback/dispute jest rejestrowany oddzielnie od reklamacji usługi.
