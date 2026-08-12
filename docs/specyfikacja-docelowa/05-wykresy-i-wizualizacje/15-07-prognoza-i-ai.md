---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-1AE868FB7130
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Prognoza i AI

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.07 |
| Nazwa polska | Prognoza i AI |
| Nazwa techniczna | prognoza-i-ai |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/02 Rodziny wykresów/Prognoza i AI`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

## Cel i decyzja docelowa

„Prognoza i AI” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

## Stan obecny


## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | wynik rzeczywisty | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | prognoza | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | confidence jako poziom opisowy | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | ograniczenia danych | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | scenariusze | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | rekomendacja. | wymagany wariant lub stan | test Storybook + test interakcji |

## Anatomia

```text
prognoza-i-ai
├── semantic root
├── header or accessible label
├── primary content
├── status / validation region
├── primary action
└── optional secondary actions or metadata
```

## Komponenty składowe

- PageHeader
- DataStatusBanner
- InlineNotice
- Button
- ForecastChart
- EvidencePanel
- RecommendationCard
- DecisionCard

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

## Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.

## Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

## Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

## Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

## Storybook

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Prognoza i AI`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: implemented, visible, accepted.

## Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

## Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.
