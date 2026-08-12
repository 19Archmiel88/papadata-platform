---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-159AD85F2009
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Zależności i korelacje

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.06 |
| Nazwa polska | Zależności i korelacje |
| Nazwa techniczna | zaleznosci-i-korelacje |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/02 Rodziny wykresów/Zależności i korelacje`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

## Cel i decyzja docelowa

„Zależności i korelacje” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

## Stan obecny


## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | koszt vs przychód | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | ROAS vs budżet | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | ruch vs zamówienia | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | AOV vs segment | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | marża vs promocja. | wymagany wariant lub stan | test Storybook + test interakcji |

## Anatomia

```text
zaleznosci-i-korelacje
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
- MetricCard
- ChartFrame
- TrendChart
- ShareChart
- ComparisonChart
- DetailPanel
- Tabs

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

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Zależności i korelacje`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: implemented, visible, accepted.

## Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

## Doprecyzowanie po kontroli wizualnej — długie etykiety

Wykres korelacji nie może renderować długich nazw kampanii bezpośrednio jako wielowierszowych etykiet w polu wykresu. Długie etykiety mają być przeniesione do listy obserwacji, tabeli albo panelu szczegółów jako osobnej warstwy canvasu poza powierzchnią danych. Pole wykresu może używać krótkich znaczników numerycznych lub krótkich kodów, które jednoznacznie mapują punkt do pełnego opisu w osobnej warstwie canvasu poza polem wykresu.

Ten wzorzec jest obowiązkowy dla regresji długiego tekstu, trybu mobilnego i 200% zoom. Czytelność danych jest ważniejsza niż próba pokazania pełnej nazwy przy każdym punkcie.

## Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.
