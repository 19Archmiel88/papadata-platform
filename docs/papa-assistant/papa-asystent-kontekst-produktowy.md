Poniżej masz **kompletny kontekst Papa Asystenta** jako modułu. Bez skakania. To jest opis docelowy: **co to jest, jak działa, jak wygląda, jakie ma funkcje, statusy, raporty, evidence, AI actions, bezpieczeństwo i wymagane informacje AI**.

# [x] 1. Czym jest Papa Asystent

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

**Papa Asystent to kontekstowa warstwa analityczna AI nad całym panelem PapaData.** Nie jest zwykłym czatem, nie jest osobnym chatbotem i nie jest źródłem prawdy. Źródłem prawdy pozostają dane, kontrakty, backend, integracje, tenant/workspace i uprawnienia. Dokumentacja mówi wprost: Papa Asystent jest modułem zaawansowanej analityki biznesowej i współpracy z AI, a nie tylko czatem.

Najkrócej:

```text
Papa Asystent = AI do analizy, decyzji, rekomendacji, raportów i akcji wymagających zatwierdzenia.
```

Nie powinien mówić: „zrobiłem”, jeśli realnie tylko przygotował propozycję. Nie powinien wykonywać działań biznesowych bez procesu AI Action.

---

# [x] 2. Główne zasady działania

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Każde zapytanie do Papa Asystenta musi mieć jawny kontekst:

* tenant,
* workspace,
* aktywny ekran,
* zakres dat,
* aktywne filtry,
* wybrane KPI,
* wykresy,
* tabele,
* źródła danych i ich jakość,
* uprawnienia użytkownika,
* dozwolone narzędzia.

Czyli Asystent nie odpowiada „ogólnie”. On odpowiada na podstawie **konkretnego workspace, konkretnego okresu, konkretnych danych i konkretnych uprawnień**.

---

# [x] 3. Gdzie użytkownik go uruchamia

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent powinien być dostępny z kilku punktów:

* pływający launcher,
* przycisk na KPI,
* akcja wykresu,
* akcja tabeli,
* rekomendacja,
* globalna wyszukiwarka,
* Centrum Pomocy,
* Laboratorium.

W praktyce: użytkownik może zapytać o cały ekran, konkretny KPI, konkretny wykres, konkretną tabelę, rekomendację, problem integracji albo raport.

---

# [x] 4. Jak wygląda Papa Asystent

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

# [x] 4.1. Globalny panel

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Na desktopie:

* szerokość standardowa: **420–480 px**,
* szerokość rozszerzona: **560–720 px**,
* panel może być resizable,
* zapamiętuje preferencję użytkownika,
* może działać jako overlay albo panel przypięty.

Na mobile:

* bottom sheet albo pełny ekran,
* composer pozostaje dostępny,
* artefakty otwierają się jako pełny widok.

# [x] 4.2. Struktura AssistantShell

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Docelowa anatomia:

```text
AssistantShell
├── Header
├── ContextSummary
├── ModeSwitcher
├── Conversation
├── ToolActivity
├── EvidencePanel
├── ArtifactRegion
├── Composer
└── OperationStatus
```

To jest rdzeń UI Papa Asystenta.

Widoki wewnętrzne:

```text
conversation
sources
artifact
report
execution
history
```

Ważne: te widoki **nie mogą tworzyć kolejnych modalnych drawerów nad panelem**.

---

# [x] 5. Formy pracy Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

# [x] 5.1. Panel kontekstowy

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

* dostępny z każdego ekranu,
* stała szerokość,
* nie zasłania głównej treści,
* zachowuje kontekst ekranu, filtrów i okresu,
* można go rozszerzyć.

# [x] 5.2. Widok podzielony

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

* Asystent i dane są jednocześnie widoczne,
* Asystent może wskazać wykres, tabelę albo pole,
* może przewinąć do elementu i podświetlić go.

# [x] 5.3. Pełna sekcja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Pełny widok Papa Asystenta obejmuje:

* rozmowy,
* analizy,
* rekomendacje,
* symulacje,
* historię decyzji,
* raporty,
* bibliotekę raportów,
* kontynuację rozmowy rozpoczętej w panelu.

# [x] 5.4. Inline Assistant

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Działa na konkretnym KPI, wykresie albo tabeli:

* desktop: panel boczny,
* mobile: bottom sheet,
* zachowuje zakres i filtr,
* pokazuje nazwę obiektu kontekstu,
* pozwala przejść do głównego panelu bez utraty rozmowy.

---

# [x] 6. Context basket

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Użytkownik może wrzucić do kontekstu Asystenta:

* KPI,
* wykres,
* zaznaczony zakres wykresu,
* wiersze tabeli,
* rekomendację,
* plik,
* raport,
* procedurę pomocy.

Każdy element context basket musi pokazywać:

* źródło,
* zakres,
* świeżość,
* możliwość usunięcia.

---

# [x] 7. Tryby pracy Papa Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Docelowe tryby:

# [x] Szybki brief

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Podsumowuje aktywny ekran.

# [x] Interpretacja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Wyjaśnia zmianę i drivery.

# [x] Diagnoza

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Szuka przyczyn, ograniczeń i brakujących danych.

# [x] Decyzja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Przygotowuje rekomendacje i warianty.

# [x] Raport

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Tworzy draft raportu albo uruchamia report job po jawnej akcji użytkownika.

# [x] Plan działań

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Tworzy zadania, właścicieli i terminy. Nie wykonuje zmian biznesowych bez AI Action.

Dla Laboratorium są też tryby robocze:

* decyzja,
* diagnoza,
* raport,
* plan działań.

---

# [x] 8. Jak wygląda odpowiedź Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Każda odpowiedź powinna mieć logiczną strukturę:

```text
facts
interpretations
hypotheses
recommendations
limitations
suggestedNextSteps
```

Czyli nie sam tekst „ładnie napisany”, tylko konkretna struktura: fakty, interpretacja, hipotezy, rekomendacje, ograniczenia i następne kroki.

Streaming odpowiedzi ma być stabilny. Czytnik ekranu nie może dostawać chaotycznej aktualizacji każdego tokenu.

---

# [x] 9. EvidencePanel i zaufanie

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent musi pokazywać evidence, czyli dowody i ograniczenia odpowiedzi.

EvidencePanel pokazuje:

* źródła,
* dataset i snapshot,
* zakres dat,
* filtry,
* świeżość,
* kompletność,
* estymacje,
* ograniczenia,
* lineage,
* audyt.

Poziomy confidence:

```text
wysoka
ograniczona
niewystarczająca
```

Nie używa się swobodnie wygenerowanego procentu typu `87%`, jeśli nie ma realnej metodologii.

---

# [x] 10. Odmowy i zabezpieczenia

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Asystent odmawia albo ogranicza odpowiedź, gdy:

* brakuje evidence,
* dane są niewystarczające,
* żądanie przekracza data scope,
* użytkownik nie ma capability,
* wykryto prompt injection,
* żądanie dotyczy zabronionej operacji,
* koszt albo limit został przekroczony.

Kluczowe decyzje finansowe i operacyjne wymagają weryfikacji człowieka.

---

# [x] 11. Źródła analizy

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Widok `sources` pozwala dodać:

* pliki,
* zapisane analizy,
* źródła integracyjne,
* artefakty biblioteki.

Dodanie źródła nie zmienia data authority. Źródło ma klasyfikację, zakres i retencję. Czyli plik albo artefakt może pomóc w analizie, ale nie staje się automatycznie oficjalnym źródłem prawdy.

---

# [x] 12. Artefakty

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent tworzy artefakty:

* podsumowanie,
* lista,
* tabela,
* wykres,
* briefing,
* draft raportu,
* plan działań.

Tabela artefaktu powinna mieć:

* search,
* sortowanie,
* widoczność kolumn,
* CSV,
* zapis widoku.

Rozbudowany artefakt nie powinien być małym modalem. Ma być route-backed workspace albo widokiem Asystenta.

---

# [x] 13. Rekomendacja i symulacja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Przed akceptacją rekomendacji użytkownik widzi:

* stan obecny,
* przewidywany stan bez działania,
* przewidywany stan po wdrożeniu,
* różnicę liczbową i wizualną,
* założenia,
* źródła danych,
* poziom pewności,
* oznaczenie, że to prognoza AI.

To jest ważne UX-owo: rekomendacja AI nie może być tylko tekstem. Ma pokazywać **before / after / no action**.

---

# [x] 14. Wykonanie zmiany przez AI

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent może przygotować i wykonać zmianę w integracji dopiero po świadomym zatwierdzeniu klienta.

Przed zatwierdzeniem system pokazuje:

* konto,
* integrację,
* dokładny zakres,
* termin,
* możliwość cofnięcia,
* ryzyka,
* skutki uboczne,
* poziom ryzyka,
* kto może zatwierdzić.

Zasada:

```text
AI może przygotować propozycję.
AI nie wykonuje zmiany bez świadomego approval.
```

Zmiany finansowe, masowe albo trudne do cofnięcia wymagają dwóch kroków i wpisania frazy. Polityka workspace może wymagać zgody drugiej osoby.

---

# [x] 15. Wykonanie częściowe

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Zasady partial execution:

* bezpieczne niezależne zmiany mogą zakończyć się częściowo,
* finansowe, masowe i krytyczne działają według zasady wszystko albo nic,
* klient widzi wykonane, niewykonane, cofnięte i oczekujące elementy,
* system proponuje najbezpieczniejsze dalsze działanie,
* ważne ponowienie wymaga zgody klienta.

---

# [x] 16. Historia decyzji i działań

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Historia Papa Asystenta ma pełną oś czasu:

* rekomendacja,
* symulacja,
* decyzja,
* zatwierdzenia,
* harmonogram,
* wykonanie,
* błędy i ponowienia,
* wynik,
* porównanie prognozy z rzeczywistością.

Historia ma mieć:

* filtrowanie,
* wyszukiwanie,
* eksport.

---

# [x] 17. Raporty

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Asystent tworzy:

* raport PDF,
* raport CSV,
* raport analityczny z wykresami, tabelami, źródłami, filtrami i rekomendacjami.

Raport można:

* podejrzeć w sekcji Papa Asystenta,
* zapisać w bibliotece,
* wersjonować,
* kontynuować rozmowę na jego podstawie.

Przycisk raportu ma być dostępny w kontekście Asystenta, Laboratorium albo analizy. Nie globalnie w topbarze.

Statusy report job:

```text
queued
generating
ready
failed
expired
```

Postęp jest trwały, a zakończenie trafia do powiadomień.

---

# [x] 18. Laboratorium jako część Papa Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Laboratorium jest pełnym miejscem pracy z AI, a nie tylko czatem.

Sygnały wejściowe Laboratorium:

* zakres danych,
* liczba rekomendacji,
* biblioteka,
* jakość danych.

Główna część Laboratorium:

* tryb decyzja,
* tryb diagnoza,
* tryb raport,
* tryb plan działań,
* panel szczegółów danych: źródła, pokrycie, świeżość, kompletność, poziom zaufania.

Sekcje Laboratorium:

* Zapytaj,
* Rekomendacje,
* Biblioteka,
* Briefingi,
* Eksport i MCP.

---

# [x] 19. Rekomendacje w Laboratorium

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Karta rekomendacji pokazuje:

* co zrobić,
* dlaczego,
* evidence,
* wpływ,
* ryzyko,
* właściciela,
* horyzont,
* status.

Statusy rekomendacji:

* nowa,
* do decyzji,
* w planie,
* odłożona,
* zrealizowana,
* odrzucona.

---

# [x] 20. Biblioteka

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Biblioteka przechowuje:

* artefakty,
* wersje,
* zakres,
* autora,
* źródła,
* status.

Typy artefaktów w bibliotece:

* tabela,
* wykres,
* decyzja,
* brief,
* alert,
* raport.

Metadane:

* nazwa,
* typ,
* autor,
* data,
* zakres,
* źródła,
* wersja,
* status,
* link do analizy.

---

# [x] 21. Briefingi i analizy

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Briefingi i analizy:

* uruchamiają report jobs,
* monitorują kolejkę,
* eksportują wyniki.

Briefing zawiera:

* temat,
* cel,
* kontekst,
* oczekiwany wynik,
* obszar,
* kanał,
* priorytet,
* termin,
* właściciela,
* załączniki,
* kontekst Asystenta.

---

# [x] 22. DecisionQueue

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Statusy DecisionQueue:

```text
proposed
needsReview
approved
rejected
deferred
expired
invalidated
executing
succeeded
failed
partiallySucceeded
compensated
```



Znaczenie:

* `proposed` — AI przygotowało propozycję,
* `needsReview` — człowiek musi przejrzeć,
* `approved` — zatwierdzone,
* `rejected` — odrzucone,
* `deferred` — odłożone,
* `expired` — zatwierdzenie wygasło,
* `invalidated` — dane/kontekst się zmieniły,
* `executing` — wykonanie trwa,
* `succeeded` — wykonane,
* `failed` — nieudane,
* `partiallySucceeded` — częściowo wykonane,
* `compensated` — cofnięte/naprawione kompensacją.

---

# [x] 23. Eksport i MCP

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Eksporty:

* PDF,
* CSV,
* brief zespołu,
* biblioteka,
* workflow zewnętrzny,
* MCP.

Statusy eksportu/MCP:

```text
ready
generating
expired
error
no access
```



W praktyce: wynik Asystenta może zostać zamieniony w PDF, CSV, brief, zapis do biblioteki albo przepięty do zewnętrznego workflow/MCP.

---

# [x] 24. Dostępność

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent musi mieć:

* pełną obsługę klawiatury,
* stabilny focus podczas streamingu,
* komunikowany status generowania,
* stop generation,
* poprawny live region,
* źródła i ograniczenia dostępne tekstowo,
* confidence/readiness nieoparte wyłącznie na kolorze.

---

# [x] 25. Storybook

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Docelowe stories:

```text
40 Laboratorium Papa Asystenta/AssistantShell
40 Laboratorium Papa Asystenta/InlineAssistant
40 Laboratorium Papa Asystenta/ContextBasket
40 Laboratorium Papa Asystenta/EvidencePanel
40 Laboratorium Papa Asystenta/ArtifactTable
40 Laboratorium Papa Asystenta/Recommendation
40 Laboratorium Papa Asystenta/DecisionQueue
90 Przepływy/AssistantContext
90 Przepływy/ReportJob
90 Przepływy/AIRefusal
```



---

# [x] 26. Kryteria akceptacji

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent jest poprawnie zaprojektowany dopiero wtedy, gdy:

* zawsze ma jawny kontekst,
* evidence i ograniczenia są widoczne,
* nie ma fałszywej precyzji confidence,
* źródła i artefakty nie tworzą zagnieżdżonych modali,
* report job jest asynchroniczny,
* DecisionQueue ma wszystkie stany,
* rekomendacja nie wykonuje działania bez AI Action,
* testy izolacji tenant/workspace i prompt injection przechodzą.

---

# [x] 27. Obowiązkowe informacje AI w UI

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Zgodnie z AI Act, użytkownik powinien być poinformowany, że wchodzi w interakcję z systemem AI, gdy system jest przeznaczony do bezpośredniej interakcji z osobami; obowiązki transparentności Article 50 dotyczą m.in. interaktywnych systemów AI i treści AI, a Komisja wskazuje, że reguły transparentności pomagają rozpoznawać interakcję z AI lub ekspozycję na treść AI. ([Eur-Lex][1]) ([Cyfrowa Strategia Europy][2])

Dla Papa Asystenta dodaj stały blok transparentności:

```text
Odpowiada Papa Asystent AI.
Wynik jest generowany automatycznie na podstawie danych workspace, aktywnych filtrów i dostępnych źródeł.
Sprawdź evidence, aktualność danych i ograniczenia przed podjęciem decyzji.
```

Dla rekomendacji:

```text
Rekomendacja wygenerowana przez AI.
Wdrożenie wymaga zatwierdzenia użytkownika i ponownej walidacji danych.
```

Dla raportów/briefów:

```text
Raport wygenerowany przez Papa Asystenta AI.
Zawiera dane, wnioski i rekomendacje z określonego zakresu.
Przed użyciem operacyjnym sprawdź źródła, kompletność danych i poziom pewności.
```

Dla odmowy:

```text
Papa Asystent nie może przygotować odpowiedzi, ponieważ dostępne dane, uprawnienia albo evidence są niewystarczające.
```

Jeżeli Asystent generuje treść używaną dalej poza aplikacją — raport, brief, alert, publiczny opis, mail, eksport — oznacz ją jako **wygenerowaną przez AI**. Komisja opisuje też Code of Practice i ikony jako narzędzia wspierające oznaczanie treści AI. ([Cyfrowa Strategia Europy][3])

---

# [x] 28. Statusy, które powinieneś mieć w modelu

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

# [x] Status danych

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
ready
partial
stale
restricted
empty
error
no access
```

# [x] Confidence

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
wysoka
ograniczona
niewystarczająca
```

# [x] Report job

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
queued
generating
ready
failed
expired
```

# [x] DecisionQueue

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
proposed
needsReview
approved
rejected
deferred
expired
invalidated
executing
succeeded
failed
partiallySucceeded
compensated
```

# [x] Eksport / MCP

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
ready
generating
expired
error
no access
```

# [x] Odmowa AI

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
insufficient_evidence
insufficient_data
out_of_scope
missing_capability
prompt_injection_detected
forbidden_operation
cost_or_limit_exceeded
approval_required
```

---

# [x] 29. Minimalny przebieg użytkownika

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
Użytkownik otwiera ekran
→ Papa Asystent dostaje kontekst ekranu
→ użytkownik zadaje pytanie albo wybiera tryb
→ Asystent analizuje dane
→ pokazuje odpowiedź z facts / interpretations / hypotheses / recommendations / limitations / next steps
→ pokazuje evidence i confidence
→ generuje artefakt
→ użytkownik zapisuje do biblioteki / tworzy raport / tworzy briefing
→ jeśli jest akcja biznesowa, powstaje proposal
→ użytkownik zatwierdza
→ system robi revalidation
→ dopiero potem execution
→ wynik trafia do historii, audytu i recovery
```

---

# [x] 30. Co musi być na ekranie Papa Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Minimum UI:

1. **Header**

   * nazwa: Papa Asystent,
   * status AI,
   * informacja, że odpowiada AI.

2. **ContextSummary**

   * workspace,
   * ekran,
   * zakres dat,
   * filtry,
   * źródła,
   * jakość danych,
   * capability.

3. **ModeSwitcher**

   * szybki brief,
   * interpretacja,
   * diagnoza,
   * decyzja,
   * raport,
   * plan działań.

4. **Conversation**

   * pytania,
   * odpowiedzi,
   * streaming,
   * stop generation.

5. **EvidencePanel**

   * źródła,
   * zakres,
   * świeżość,
   * kompletność,
   * ograniczenia,
   * confidence.

6. **ArtifactRegion**

   * tabela,
   * wykres,
   * lista,
   * briefing,
   * draft raportu,
   * plan działań.

7. **ToolActivity**

   * co Asystent sprawdza,
   * jakie źródła czyta,
   * czy są braki,
   * czy akcja wymaga approval.

8. **OperationStatus**

   * queued,
   * generating,
   * needsReview,
   * executing,
   * succeeded,
   * failed,
   * recovery.

9. **Composer**

   * pole pytania,
   * gotowe prompty,
   * wybór trybu,
   * załącz kontekst,
   * wyślij.

---

# [x] 31. Najkrótsza definicja produktu

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
Papa Asystent to kontekstowy analityk AI w PapaData.
Czyta dane workspace, ekran, filtry, KPI, wykresy, tabele i uprawnienia.
Odpowiada z evidence, confidence i ograniczeniami.
Tworzy rekomendacje, symulacje, artefakty, raporty i briefingi.
Nie jest źródłem prawdy i nie wykonuje działań bez approval.
Każda akcja idzie przez proposal, approval, revalidation, execution, audit i recovery.
```

To jest punkt wyjścia. Następny logiczny krok: rozpisać to samo **jako checklistę implementacyjną P0/P1 dla Papa Asystenta** — pliki, komponenty, stany, kontrakty, testy, Storybook.

[1]: https://eur-lex.europa.eu/legal-content/EN/TXT/?qid=1747442914146&uri=CELEX%3A02024R1689-20260727&utm_source=chatgpt.com "EUR-Lex - 02024R1689-20260727 - PL - EUR-Lex"
[2]: https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems?utm_source=chatgpt.com "Quick Facts: Transparency rules for AI systems | Shaping Europe’s digital future"
[3]: https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content?utm_source=chatgpt.com "Code of Practice on Transparency of AI-generated Content | Shaping Europe’s digital future"
