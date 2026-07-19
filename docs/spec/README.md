# PapaData — dokumentacja wykonawcza

Wersja: 2.0
Data obowiązywania: 2026-07-18

## Materiały źródłowe

Pełna dokumentacja źródłowa znajduje się na Google Drive:

https://drive.google.com/drive/folders/1jgwAszV2d6Te29bBmDz4fQETGfvoI-rD?usp=drive_link

Dokumenty na Drive są materiałami rozszerzonymi. Pliki w tym katalogu są
wykonawczym źródłem prawdy dla implementacji.

Skonwertowany pakiet dokumentacji źródłowej z plików Word znajduje się w
[`docs/source-materials/papadata-dokumentacja`](../source-materials/papadata-dokumentacja/README.md).
Pakiet ten zachowuje pełną strukturę materiałów biznesowych, architektonicznych,
bezpieczeństwa oraz UI/UX i służy jako rozszerzony kontekst analityczny.

## Zasady dla Codexa

1. Najpierw przeanalizuj strukturę repozytorium.
2. Następnie przedstaw plan zmian.
3. Dopiero po zaakceptowaniu planu rozpocznij implementację.
4. Nie rozszerzaj samodzielnie zakresu MVP.
5. Nie zgaduj brakujących decyzji.
6. Nie hardcoduj danych biznesowych w komponentach.
7. Uwzględniaj role, uprawnienia, light/dark mode, błędy i brak danych.
8. Operacje chronione wymagają autoryzacji backendowej.
9. AI nie może być traktowane jako zwykły chat.
10. Dokumentacja nie jest dowodem istnienia implementacji.

## Hierarchia źródeł

1. `decisions.md` — decyzje i statusy.
2. `source-of-truth.md` — zasady interpretacji.
3. `domain-contracts.md` — kontrakty domenowe, statusy i błędy.
4. `data-and-kpi.md` — dane, readiness i KPI.
5. `integrations.md` — integracje i synchronizacja.
6. `security.md` — bezpieczeństwo i audyt.
7. `ai.md` — warstwa AI.
8. `ui-and-storybook.md` — UI i Storybook.
9. `implementation-plan.md` — kolejność wdrożenia.

W razie konfliktu implementację należy zatrzymać i zgłosić konflikt.
