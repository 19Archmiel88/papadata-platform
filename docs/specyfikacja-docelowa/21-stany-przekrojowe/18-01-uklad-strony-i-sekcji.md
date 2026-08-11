---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: accepted
updated_at: 2026-08-11T12:00:00+02:00
---

# Układ strony i sekcji

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.01 |
| Nazwa polska | Układ strony i sekcji |
| Nazwa techniczna | uklad-strony-i-sekcji |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P0 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Układ strony i sekcji` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje nagłówek strony, nagłówek sekcji, region treści, podział treści i relację lista-szczegół jako otwarty układ oparty o semantyczne regiony, typografię, rytm i separatory.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
uklad-strony-i-sekcji
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- StoryPresentationPage
- StoryPresentationSection
- StoryPresentationMeta
- InlineNotice
- SectionNavigation
- StatusBadge
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Nagłówek strony | Nagłówek strony ustawia kontekst, status i akcję bez osobnego kontenera. | Storybook + fixture |
| 2 | Region treści | Regiony są nazwane i dostępne jako semantyczne sekcje. | Storybook + fixture |
| 3 | Podział treści | Treść i region poboczny są rozdzielone rytmem oraz linią, nie kartami. | Storybook + fixture |
| 4 | Relacja lista-szczegół | Wybór w SectionNavigation zmienia szczegół bez przeładowania strony i oznacza aktywną pozycję przez `aria-current`. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, SectionNavigation, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Układ strony i sekcji`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/PageSectionLayout.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

## Testy i kryteria akceptacji

1. Play test sprawdza heading, main landmark, nazwane regiony, `aria-current` w SectionNavigation i zmianę szczegółu.
2. Audyt Storybook obejmuje 1440, 768, 390 oraz zoom 200%.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
