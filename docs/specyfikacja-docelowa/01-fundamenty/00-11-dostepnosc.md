---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.11"
story_title: "Dostępność"
decision_status: "accepted"
prototype_status: "implemented"
production_status: "not_started"
test_status: "passing"
applies_to:
  - desktop
  - light
  - dark
  - pl
  - comfortable
  - full_motion
approved_commit: "421da5ab58a6a26fdf952a41841cb2679ce6222d"
approved_evidence: "foundation-evidence/manifest.json"
owner: Artur Wiśniewski
updated_at: 2026-08-03
status: stage-01-accepted
---

# Dostępność

## Decyzja

Baseline Etapu 01 wymaga praktycznej dostępności desktopowej: semantyki HTML, obsługi klawiatury, widocznego focus-visible, tekstowych statusów i reduced motion. Formalne drobne odchylenia kontrastu w produkcie B2B są rekomendacją, jeśli nie blokują użycia.

## Macierz stanów interakcji

| Stan | Znaczenie | Minimum |
|---|---|---|
| default | stan bazowy | czytelna etykieta i rola |
| hover | wskazanie kursorem | nie zmienia układu |
| focus-visible | fokus klawiatury | widoczny ring lub linia fokusu |
| active | akcja w trakcie naciśnięcia | krótkie potwierdzenie |
| pressed | przełącznik wciśnięty | `aria-pressed` tam, gdzie dotyczy |
| selected | element wybrany | tekst/ARIA poza kolorem |
| disabled | akcja istnieje, czasowo niedostępna | brak focusu, czytelny powód w kontekście |
| read-only | wartość widoczna, nieedytowalna | semantyka readonly |
| invalid | dane wymagają korekty | opis błędu tekstem |
| loading | operacja trwa | stan nie usuwa etykiety |
| unavailable | funkcja niedostępna w kontekście | nie udaje disabled |

## Zakres komponentów

- przyciski, linki, pola formularza, checkboxy, radio, switche, segment controls, sortowalne nagłówki, elementy tabel i komponenty read-only
- stan nie może być komunikowany wyłącznie kolorem
- `disabled` nie jest uniwersalnym zamiennikiem `unavailable`, `read-only`, `loading` ani `invalid`
- WCAG blokuje etap tylko przy realnej utracie funkcji lub czytelności

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "candidate"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
