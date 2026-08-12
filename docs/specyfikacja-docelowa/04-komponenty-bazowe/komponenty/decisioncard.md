---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: DecisionCard
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# DecisionCard

## Cel i odpowiedzialność
`DecisionCard` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
decisionId; title; status; impact; owner; dueAt.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/decisioncard.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `decisionId` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `title` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `status` | `'proposed' | 'approved' | 'rejected' | 'executing' | 'measured'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `impact` | `'low' | 'medium' | 'high'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `owner` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `dueAt` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `30.02` — Kolejka uwagi
- `30.11` — Rekomendacje AI — skrót
- `30.14` — Warianty Centrum Dowodzenia
- `31.05` — Budżet
- `31.07` — Rekomendacje — kontekst domenowy
- `34.02` — Segmenty
- `34.07` — Analiza wpływu
- `35.02` — Kanały
- `40.05` — Przebieg synchronizacji
- `50.01` — Panel kontekstowy Papa
- `50.03` — Tryby pracy
- `50.04` — Context basket
- `50.05` — Odpowiedź Papa
- `50.06` — Dowody
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
- `80.01` — Centrum decyzji
- `80.02` — Obserwacje
- `80.03` — Rekomendacje
- `80.04` — Rejestr decyzji
- `80.08` — Biblioteka działań
- `80.10` — Warianty decyzji i działań
- `85.01` — Strona główna pomocy
- `85.02` — Procedury
- `85.04` — Szczegóły procedury
- `85.06` — Warianty Centrum Pomocy

## Storybook i testy
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
