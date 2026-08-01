---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-023
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Order Form — szablon zamówienia

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Strony

Dostawca: `[SPÓŁKA, ADRES, NIP, KRS, REPREZENTANT]`. Klient: `[NAZWA, ADRES, NIP/VAT, KRS, REPREZENTANT]`. Effective Date: `[DATA]`. Tenant: `[NAZWA/ID PO UTWORZENIU]`.

## 2. Zamówiona usługa

| Pole | Wartość |
|---|---|
| Plan | `[PLAN]` |
| Cykl | `monthly / annual` |
| Okres początkowy | `[OKRES]` |
| Automatyczne odnowienie | `[TAK/NIE + ZASADY]` |
| Użytkownicy/workspaces | `[LIMITY]` |
| Integracje | `[WYBRANE Z 7 MVP]` |
| AI/raporty/eksporty | `[LIMITY]` |
| Support/SLA | `[WARIANT]` |
| Region danych | `[REGION]` |

## 3. Cena i rozliczenie

Cena netto `[KWOTA]`, VAT `[STAWKA/KWOTA]`, brutto `[KWOTA]`, waluta `[PLN/EUR]`, termin płatności `[DNI]`, metoda `[KARTA/BLIK/PRZELEW]`, data pierwszej/rocznej płatności `[DATA]`. Rabat `[ID, PROCENT, OKRES]`; cena po rabacie `[KWOTA]`. Proration `[ZASADA]`.

## 4. Wdrożenie i kryteria odbioru

Start `[DATA]`; onboarding `[ZAKRES]`; ownerzy; migracja `[ZAKRES]`; kryteria: tenant, role, siedem integracji w zakresie wybranym, first sync, dashboard, raport, AI, billing i test recovery. Elementy niestandardowe są wymienione, nie domniemane.

## 5. Dokumenty umowne i kolejność

1. Order Form i podpisane dodatki szczególne.
2. DPA/SLA/Security Addendum.
3. Regulamin SaaS i Warunki subskrypcji.
4. Opis usługi MVP, AUP i polityki.

Wskazać wersję i URL/checksum każdego dokumentu.

## 6. Dane i bezpieczeństwo

Rola privacy, DPA, podprocesorzy, region, wyjątkowa retencja, SSO/MFA, support JIT, wymagania audytowe i transfery: `[USTALENIA]`.

## 7. Warunki szczególne

Custom SLA, odpowiedzialność, data residency, procurement, DPA modifications, limit AI, zakaz treningu, KSeF i fakturowanie: `[TREŚĆ]`. Brak wpisu oznacza brak odstępstwa.

## 8. Podpis / akceptacja

Imię, rola, podstawa reprezentacji, data i podpis elektroniczny obu stron. Dla self-service odpowiednikiem jest zapis checkoutu z dowodem wersji i zgody.
