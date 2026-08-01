---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-AF9CAA6272B3
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Powłoka mobilna

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.11 |
| Nazwa polska | Powłoka mobilna |
| Nazwa techniczna | powoka-mobilna |
| Typ dokumentu | kontrakt powłoki mobilnej |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Frontend Platform |
| Moduł | Powłoka produktu i nawigacja — M03 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Cel i decyzja docelowa

„Powłoka mobilna” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

## Stan obecny


## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | stan domyślny | wymagany wariant lub stan | test Storybook + test interakcji |

## Anatomia

```text
powoka-mobilna
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

Minimum WCAG 2.2 AA: semantyka, dostępna nazwa, focus-visible, target size, kontrast, reduced motion, live region dla wyników asynchronicznych, reflow i brak informacji zależnej wyłącznie od koloru.

## Storybook

- Title: `20 Powłoka produktu i nawigacja/Powłoka mobilna`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

## Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

## Specyfikacja opisowa ekranu 1.0

### Cel użytkownika

**Powłoka mobilna** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.
