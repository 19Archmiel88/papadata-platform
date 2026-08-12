---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-1DE5CBCD8E3E
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Menu, popovery i tooltipy

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.09 |
| Nazwa polska | Menu, popovery i tooltipy |
| Nazwa techniczna | menu-popovery-i-tooltipy |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Cel i decyzja docelowa

„Menu, popovery i tooltipy” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

## Stan obecny


## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | dialog informacyjny | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | alert dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | approval dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | destructive action | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | MFA step-up dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | reconnect dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | unsaved changes. | wymagany wariant lub stan | test Storybook + test interakcji |

## Anatomia

```text
menu-popovery-i-tooltipy
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
- ApprovalPanel
- AlertDialog

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

- Title: `10 Komponenty bazowe/Menu, popovery i tooltipy`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

## Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.
