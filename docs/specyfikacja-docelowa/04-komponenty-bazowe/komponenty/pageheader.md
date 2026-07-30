---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: PageHeader
---
# PageHeader

## Cel i odpowiedzialność
`PageHeader` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
title; subtitle; breadcrumbs; primaryActionId; secondaryActionIds.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/pageheader.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `title` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `subtitle` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `breadcrumbs` | `Array<{ label: string; href: string | null }>` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `primaryActionId` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `secondaryActionIds` | `string[]` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `20.01` — Powłoka aplikacji
- `30.01` — Widok główny
- `30.02` — Kolejka uwagi
- `30.03` — KPI
- `30.04` — Plan vs wynik
- `30.05` — Drivery wyniku
- `30.06` — Źródła sprzedaży
- `30.07` — Ruch
- `30.08` — Produkty
- `30.09` — Klienci
- `30.10` — Lejek
- `30.11` — Rekomendacje AI — skrót
- `30.12` — Sygnały sprzedażowe
- `30.13` — Waterfall
- `30.14` — Warianty Centrum Dowodzenia
- `31.01` — Przegląd
- `31.02` — Lista kampanii
- `31.03` — Szczegóły kampanii
- `31.04` — Atrybucja i sprzedaż
- `31.05` — Budżet
- `31.06` — Diagnostyka
- `31.07` — Rekomendacje — kontekst domenowy
- `31.08` — Warianty kampanii
- `32.01` — Przegląd
- `32.02` — Lista
- `32.03` — Szczegóły
- `32.04` — Oś zdarzeń
- `32.05` — Porównanie źródeł
- `32.06` — Rekoncyliacja — skrót
- `32.07` — Eksport
- `32.08` — Warianty zamówień
- `33.01` — Przegląd
- `33.02` — Katalog
- `33.03` — Szczegóły
- `33.04` — Mapowanie
- `33.05` — Oferty
- `33.06` — Wydajność
- `33.07` — Kolejka braków
- `33.08` — Analiza wpływu
- `33.09` — Warianty produktów
- `34.01` — Przegląd
- `34.02` — Segmenty
- `34.03` — Kohorty
- `34.04` — Szczegóły pseudonimizowane
- `34.05` — Konflikty tożsamości
- `34.06` — Prywatność
- `34.07` — Analiza wpływu
- `34.08` — Warianty klientów
- `35.01` — Przegląd ruchu
- `35.02` — Kanały
- `35.03` — Lejek — widok
- `35.04` — Lejek — szczegóły kroku
- `35.05` — Definicje lejka
- `35.06` — GA4 vs zamówienia
- `35.07` — Jakość zdarzeń
- `35.08` — Strony wejścia
- `35.09` — Warianty ruchu
- `40.01` — Katalog integracji
- `40.02` — Kreator połączenia
- `40.03` — Szczegóły integracji
- `40.04` — Historia synchronizacji
- `40.05` — Przebieg synchronizacji
- `40.06` — Zakres synchronizacji
- `40.07` — Ponowne połączenie
- `40.08` — Odłączenie
- `40.09` — Awaria providera
- `40.10` — Warianty integracji
- `41.01` — Centrum jakości
- `41.02` — Zbiór danych
- `41.03` — Pochodzenie danych
- `41.04` — Nakładanie źródeł
- `41.05` — Nadrzędność źródła
- `41.06` — Konflikty
- `41.07` — Przegląd ręczny
- `41.08` — Ponowne przetwarzanie
- `41.09` — Rekoncyliacja
- `41.10` — Warianty jakości danych
- `50.01` — Panel kontekstowy Papa
- `50.02` — AssistantShell
- `50.03` — Tryby pracy
- `50.04` — Context basket
- `50.05` — Odpowiedź Papa
- `50.06` — Dowody
- `50.07` — Confidence
- `50.08` — Laboratorium AI
- `50.09` — Obserwacje
- `50.10` — Rekomendacje i warianty
- `50.11` — Propozycje AI
- `50.12` — AI Action Approval
- `50.13` — AI Actions
- `50.14` — Zablokowane działania AI
- `50.15` — Historia i pamięć Papa
- `50.16` — Ustawienia AI i Governance
- `50.17` — Warianty Papa
- `60.01` — Organizacja
- `60.02` — Workspace
- `60.03` — Członkostwa
- `60.04` — Role i uprawnienia
- `60.05` — Bezpieczeństwo konta
- `60.06` — Sesje
- `60.07` — Audyt
- `60.08` — Prywatność
- `60.09` — Dostęp wsparcia
- `60.10` — Warianty ustawień
- `70.01` — Subskrypcja
- `70.02` — Użycie i limity
- `70.03` — Plany
- `70.04` — Faktury
- `70.05` — Płatności
- `70.06` — Zaległa płatność
- `70.07` — Korekty
- `70.08` — Zmiana i anulowanie
- `70.09` — Pilot do abonamentu
- `70.10` — Warianty billingowe
- `80.01` — Centrum decyzji
- `80.02` — Obserwacje
- `80.03` — Rekomendacje
- `80.04` — Rejestr decyzji
- `80.05` — Brief działania
- `80.06` — Szczegóły działania
- `80.07` — Pomiar
- `80.08` — Biblioteka działań
- `80.09` — Powiązania z modułami i sprawami
- `80.10` — Warianty decyzji i działań
- `85.01` — Strona główna pomocy
- `85.02` — Procedury
- `85.03` — Lista wyników
- `85.04` — Szczegóły procedury
- `85.05` — Zgłoszenie wsparcia
- `85.06` — Warianty Centrum Pomocy

## Storybook i testy
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
