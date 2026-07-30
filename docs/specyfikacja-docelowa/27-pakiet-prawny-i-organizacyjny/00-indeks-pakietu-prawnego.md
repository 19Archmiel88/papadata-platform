---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-000
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Indeks pakietu prawnego i organizacyjnego

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Cel pakietu

Pakiet porządkuje dokumenty wymagane do uruchomienia i utrzymywania PapaData jako usługi SaaS. Obejmuje dokumenty publikowane klientom, załączniki umowne, dokumenty prywatności oraz procedury wewnętrzne. PapaData jest projektowana przede wszystkim jako usługa B2B. Jeżeli zakup ma być dostępny także osobie fizycznej korzystającej z ochrony konsumenckiej lub przedsiębiorcy na prawach konsumenta, checkout i dokumenty muszą uruchamiać odpowiedni wariant prawny.

## 2. Rejestr dokumentów

| Dokument | Charakter | Publikacja / użycie | Właściciel zatwierdzenia |
|---|---|---|---|
| Regulamin SaaS | klientowski, normatywny | strona, checkout, konto | Legal + Product |
| Warunki subskrypcji | klientowski, normatywny | checkout i panel billingowy | Legal + Finance |
| Polityka prywatności | informacyjny | strona, rejestracja, aplikacja | IOD/DPO + Legal |
| Polityka cookies | informacyjny | CMP i strona | IOD/DPO + Marketing |
| DPA | umowny | B2B / enterprise | Legal + IOD/DPO |
| Lista podprocesorów | informacyjny / umowny | strona i DPA | Security + Legal |
| SLA | umowny | plan / Order Form | Operations + Legal |
| AUP | klientowski | regulamin | Security + Legal |
| Security/TOM Addendum | umowny | DPA / security portal | Security + IOD/DPO |
| Warunki AI | klientowski | regulamin i AI Actions | AI Governance + Legal |
| Regulamin mobile | klientowski | ustawienia i sklepy | Product + Legal |
| Reklamacje i odstąpienie | klientowski | pomoc / checkout | Support + Legal |
| Retencja | wewnętrzny / umowny | DPA i operacje | Data Governance |
| Incydenty i naruszenia | wewnętrzny | runbook | Security + IOD/DPO |
| DSAR | wewnętrzny | privacy operations | IOD/DPO |
| ROPA | wewnętrzny | rejestr RODO | IOD/DPO |
| DPIA | wewnętrzny | ocena wysokiego ryzyka | IOD/DPO + Security |
| Ocena dostawcy | wewnętrzny | procurement | Security + Legal |
| BCP/DR | wewnętrzny / enterprise | operacje / załącznik | Operations |
| Dostęp i role | wewnętrzny | security governance | Security |
| Faktury i KSeF | wewnętrzny / klientowski | billing | Finance + Legal |
| Wersjonowanie dokumentów | wewnętrzny | governance | Legal Operations |
| Order Form | umowny | sprzedaż | Sales + Legal |
| Opis usługi MVP | produktowo-umowny | Order Form / oferta | Product |
| Checklista go-live | kontrolny | przed produkcją | Program Owner |

## 3. Zasada publikacji i dowodu zgody

Każdy dokument publikowany klientowi ma numer wersji, datę obowiązywania, właściciela, historię zmian i trwały adres. System zapisuje wersję dokumentu zaakceptowaną przez użytkownika, czas, aktora, tenant, kontekst procesu, kanał i dowód doręczenia. Zmiana o istotnym wpływie wymaga komunikacji z odpowiednim wyprzedzeniem i — gdy jest to wymagane — ponownej akceptacji.

## 4. Minimalna brama wydania

Żaden dokument nie otrzymuje statusu `published` bez: uzupełnienia danych spółki, potwierdzenia modelu sprzedaży B2B/B2C, zgodności cennika i checkoutu, listy providerów, retencji, transferów, rzeczywistych środków bezpieczeństwa, zatwierdzenia właściciela i dowodu testu publikacji.
