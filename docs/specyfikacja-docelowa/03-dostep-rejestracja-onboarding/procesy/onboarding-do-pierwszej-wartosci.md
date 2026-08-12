---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-55837609554E
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Onboarding do pierwszej wartości — kontrakt procesu

## Status

Zatwierdzony kontrakt docelowy 1.0. Proces jest odrębny od pojedynczego ekranu Auth i kończy się dopiero po uzyskaniu pierwszego wiarygodnego KPI lub insightu.

## Cel

Użytkownik ma przejść od potwierdzonej tożsamości i kontekstu firmy do pierwszej wartości biznesowej bez utraty postępu, bez wymuszania konfiguracji niepotrzebnej dla jego roli i bez prezentowania danych częściowych jako gotowych.

## Etapy

1. Potwierdzenie kontekstu tenanta i workspace.
2. Profil działalności, waluta, strefa czasowa i podstawowe cele.
3. Wybór pierwszego źródła danych.
4. Połączenie integracji i potwierdzenie zakresu.
5. Pierwsza synchronizacja z widocznym statusem etapów.
6. Ocena readiness, kompletności i świeżości.
7. Pierwszy KPI, insight albo jednoznaczna informacja, co blokuje wartość.
8. Zaproszenie zespołu jako krok opcjonalny, zależny od roli.
9. Wejście do Centrum Dowodzenia z zachowanym kontekstem.

## Wznowienie

Postęp jest utrwalany po każdym bezpiecznym kroku. OAuth, synchronizacja i operacje asynchroniczne mają osobny status; odświeżenie strony nie powtarza mutacji. Użytkownik wraca do pierwszego niezakończonego etapu, chyba że jego uprawnienia lub readiness uległy zmianie.

## Komponenty

`ProgressIndicator`, `DataStatusBanner`, `PairingFlow` lub kreator integracji, `SyncTimeline`, `MetricCard`, `InlineNotice`, `Button`, `Dialog` dla przerwania procesu.

## Dane i API

Proces korzysta z operacji `auth.access.resolve`, `settings.workspace.profile.update`, `integrations.connection.create`, `integrations.sync.start`, `readiness.workspace.read` i `commandCenter.firstValue.read`. Dokładne ścieżki HTTP należą do kontraktów domenowych.

## Kryteria akceptacji

- proces można przerwać i wznowić;
- częściowe dane mają jawne ograniczenia;
- każda mutacja jest idempotentna;
- użytkownik bez capability nie widzi aktywnej akcji;
- zakończenie jest mierzone zdarzeniem `onboarding_first_value_reached`;
- test E2E obejmuje OAuth przerwany, provider unavailable, dane partial, zmianę workspace i wygasłą sesję.

## Powiązany przepływ E2E

[Od onboardingu do pierwszej wartości](../../20-przeplywy-e2e/90-02-onboarding-do-pierwszej-wartosci.md).
