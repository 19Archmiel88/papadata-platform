# Przebudowa ekranów — checklista prac, 8 września 2026

Aktualny zakres uwzględnia wskazanie użytkownika: Atrybucja, Kreacje i Budżet Kampanii; Klienci; Ruch; Dane i integracje; Ustawienia; Rozliczenia; Pomoc; logowanie i rejestracja; cały Papa Asystent. **Wszystkie te obszary pozostają do przebudowy i odbioru.** Wspólna powłoka, tokeny, tabele czy działający scenariusz demonstracyjny są wykonanym fundamentem, ale nie oznaczają zakończenia modułu.

Checklista powstała na podstawie przeglądu dokumentacji docelowej i wybranych miejsc bieżącego kodu. Nie jest nowym audytem przeglądarkowym ani potwierdzeniem działania API. `[ ]` oznacza pracę do wykonania lub zweryfikowania przed odbiorem; nie oznacza, że cała opisana funkcja nie istnieje. `[x]` dotyczy wyłącznie rozpoznanego fundamentu. Przy zamykaniu zadania należy dopisać datę i dowód weryfikacji.

[Poprzedni audyt i historia wdrożeń](stan-przebudowy-ekranow-2026-09-08-historia.md) zachowują wcześniejsze wyniki testów i ograniczenia. Ich oceny „domknięte UI” nie są aktualnym odbiorem zakresu poniżej. Aktualizacja dotyczy dokumentacji, bez zmian produktu.

## 0. Fundament do wykorzystania i przygotowanie prac

- [x] Wspólne tokeny, powłoka produktu oraz komponenty sekcji są dostępne w kodzie.
- [x] Klienci i Ruch wykorzystują `ExplorerTable` oraz współdzielone nakładki; Ustawienia mają cztery modale na `Dialog`.
- [x] Ustawienia i Pomoc wykorzystują `ProductSectionFrame`/`ProductSectionTopbar` i mają gałęzie `/app`.
- [x] Raporty i Integracje mają strony wywołujące klienta API; nie jest to potwierdzenie pełnego przepływu na żywym backendzie.
- [ ] Dla każdego modułu zestawić docelowe sekcje i akcje z aktualnym UI: zachować, przebudować, dodać lub usunąć duplikat.
- [ ] Opracować docelową kompozycję każdego wskazanego ekranu: hierarchię informacji, gęstość, nawigację, tabele, wykresy, formularze i szczegóły; ocenić ją wizualnie przed zamknięciem modułu.
- [ ] Rozdzielić w zadaniach modułu odbiór UI, podłączenie danych i odbiór operacji produkcyjnych.
- [ ] Uzgodnić mapę tras, sekcji i linków kontekstowych; dokumenty wariantów nie muszą oznaczać osobnych stron.
- [ ] Zaktualizować rozbieżności specyfikacji z produktem, w szczególności relację Papa Asystent–Laboratorium–Zapisane raporty–Decyzje. Historyczne oznaczenia `[x]` w dokumentacji nie są dowodem aktualnej implementacji.

## 1. Kampanie płatne — Atrybucja, Kreacje i Budżet

Podstawa: [Atrybucja i sprzedaż](../../specyfikacja-docelowa/08-kampanie-platne/31-04-atrybucja-i-sprzedaz.md), [Budżet](../../specyfikacja-docelowa/08-kampanie-platne/31-05-budzet.md), [kontrakty Kampanii](../../specyfikacja-docelowa/25-kontrakty-domenowe-i-api/campaigns.md). Kreacje są jawnym zakresem użytkownika; wymagają doprecyzowania mapowania do specyfikacji i API.

- [ ] Przebudować Atrybucję: porównanie źródeł sprzedaży, modeli i okien atrybucji, różnice wyników oraz wyjaśnienie ograniczeń.
- [ ] Pokazać źródła, świeżość, kompletność i dowody; nie przedstawiać sprzedaży raportowanej przez platformy reklamowe jako automatycznie równej zamówieniom sklepu.
- [ ] Przebudować Kreacje: lista/galeria, podgląd, powiązanie z kampanią, porównanie wyników i szczegóły kreacji.
- [ ] Zdefiniować metryki i filtry Kreacji oraz stany niedostępnego materiału, braku danych i małej próbki.
- [ ] Przebudować Budżet: plan, wykorzystanie, tempo wydatków, prognoza końca okresu i odchylenia.
- [ ] Rozdzielić symulację/rekomendację budżetu od zapisu zmiany; przygotować podgląd różnic, zatwierdzenie, wynik i błędy operacji.
- [ ] Powiązać trzy obszary z datami, kanałem i kampanią; zachować kontekst po przejściu do szczegółów i odświeżeniu URL.
- [ ] Podłączyć nowe widoki do `/app` i rzeczywistych kontraktów, zachowując gotową główną analizę.
- [ ] Dodać scenariusze Atrybucji, Kreacji i Budżetu obejmujące filtry, szczegóły, braki danych i dozwolone akcje.

## 2. Klienci

Podstawa: [specyfikacja Klientów](../../specyfikacja-docelowa/11-klienci). Istnieją wspólne sekcje, cztery tabele i trzy nakładki; KPI i trend korzystają z modelu demonstracyjnego.

- [ ] Przebudować i odebrać kompozycję całego ekranu: wynik, KPI, trend, segmenty, kohorty, wartość klientów i działania retencyjne.
- [ ] Dopracować Eksplorator: wyszukiwanie, segmenty, sortowanie, szczegóły klienta i eksport z zachowaniem filtrów.
- [ ] Przebudować kohorty i retencję: definicja kohorty, okres obserwacji, porównania, mała próba i niepełne kohorty.
- [ ] Zdefiniować RFM, LTV, klientów unikalnych i klientów w ryzyku na rzeczywistych danych; zastąpić kalibrowane formuły demonstracyjne.
- [ ] Dopracować jakość pozyskania, Pareto i powinowactwo produktowe z jawnym okresem lub datą stanu.
- [ ] Uwzględnić pseudonimizowane szczegóły, konflikty tożsamości, prywatność i analizę wpływu zgodnie ze specyfikacją.
- [ ] Zamienić lokalne „zaplanowano” retencji w trwałą operację lub jawne przejście do Decyzji z kontekstem.
- [ ] Podłączyć nowy ekran do `/app` i API; zachować semantykę portfela „na dzień” bez usuwania klientów nieaktywnych.
- [ ] Zweryfikować odznaki, kontrast, puste segmenty, klawiaturę oraz scenariusze dat i szczegółów.

## 3. Ruch na stronie

Podstawa: [Ruch i lejek](../../specyfikacja-docelowa/12-ruch-i-lejek). Istnieją trzy `ExplorerTable` i wspólny Drawer; odświeżenie obecnie zmienia lokalny znacznik czasu.

- [ ] Przebudować i odebrać pełny układ: KPI, trend, kanały, strony wejścia, urządzenia, geografia, lejek i jakość pomiaru.
- [ ] Ujednolicić daty i filtry kanału/urządzenia; wybór daty nie zastępuje filtrowania urządzeń.
- [ ] Przebudować lejek, szczegóły kroku i definicje zdarzeń; pokazać odpływ i ograniczenia porównania.
- [ ] Dodać spójne porównanie GA4 z zamówieniami oraz wyjaśnienie rozbieżności.
- [ ] Powiązać urządzenia, geografię i strony wejścia z modelem okresowym zamiast stałych przykładów.
- [ ] Dopracować jakość zdarzeń i backlog napraw wraz z przejściem do Integracji/Pomocy/Decyzji.
- [ ] Podłączyć ekran do `/app`, rzeczywistych danych i faktycznego odświeżania; czas synchronizacji pobierać ze źródła.
- [ ] Dopasować CSV do widocznego zakresu i uprawnień; zweryfikować plik, a nie tylko komunikat.
- [ ] Sprawdzić kontrast, szczegóły strony wejścia, filtry, porównanie okresów i stany brakujących danych.

## 4. Dane i integracje

Podstawa: [Integracje i synchronizacja](../../specyfikacja-docelowa/13-integracje-i-synchronizacja), [Jakość danych i integralność](../../specyfikacja-docelowa/14-jakosc-danych-i-integralnosc). Istniejące podłączenie API zachować jako fundament.

- [ ] Przebudować i odebrać obszary Źródła, Katalog i Jakość danych: hierarchię statusów, akcje, nawigację i szczegóły.
- [ ] Dopracować kreator połączenia: wybór dostawcy, konfiguracja, test, zakres uprawnień i wynik połączenia.
- [ ] Przebudować szczegóły integracji, historię i przebieg synchronizacji: postęp, błędy, ponowienie oraz uzupełnianie historii.
- [ ] Domknąć ponowne połączenie, wygaśnięcie autoryzacji, odłączenie i awarię dostawcy; poprawić kontrast „Połącz ponownie”.
- [ ] Zdefiniować i wdrożyć API zmiany zakresu synchronizacji przed udostępnieniem tej akcji produkcyjnie.
- [ ] Uwzględnić szczegóły zbioru danych, pochodzenie, nakładanie źródeł, nadrzędność źródła i konflikty.
- [ ] Przygotować przegląd ręczny, rekoncyliację i ponowne przetwarzanie z wynikiem i historią operacji.
- [ ] Zweryfikować odpowiedzi API, MFA, uprawnienia, powtórzenia operacji i ponowny odczyt po zapisie na środowisku testowym.
- [ ] Odebrać scenariusze od połączenia źródła do danych gotowych do analizy, także przy częściowej synchronizacji.

## 5. Ustawienia

Podstawa: [Ustawienia, zespół i bezpieczeństwo](../../specyfikacja-docelowa/16-ustawienia-zespol-bezpieczenstwo). Osiem wspólnych sekcji i cztery `Dialog` nie zamykają przebudowy zawartości.

- [ ] Przebudować i odebrać formularze, hierarchię i akcje wszystkich sekcji: konto, bezpieczeństwo, firma, zespół, analityka, Papa AI, powiadomienia i prywatność.
- [ ] Rozdzielić ustawienia osobiste, organizacji i workspace'u; pokazać zakres zmiany oraz wymagane uprawnienia.
- [ ] Domknąć członkostwa, zaproszenia, role, zmianę uprawnień i usunięcie dostępu.
- [ ] Domknąć MFA, odzyskiwanie dostępu, listę sesji i unieważnianie sesji z wymaganym ponownym uwierzytelnieniem.
- [ ] Uporządkować audyt i dostęp wsparcia; rozstrzygnąć miejsce osieroconego `SettingsAuditP0` w docelowej nawigacji.
- [ ] Dopracować cele biznesowe, preferencje analityczne, powiadomienia i ustawienia AI/governance.
- [ ] Domknąć prywatność, eksport i usuwanie danych wraz ze stanami realizacji.
- [ ] Zinwentaryzować API dla każdej akcji i zastąpić lokalny stan trwałym zapisem; brak API zapisać jako konkretne zadanie.
- [ ] Dodać walidację formularzy, niezapisane zmiany, reset po anulowaniu, błędy zapisu i potwierdzenie po odświeżeniu.
- [ ] Zweryfikować na żywej sesji trasy `/app/settings/*`, linki do sekcji i scenariusze różnych ról.

**Postęp 2026-09-08 (częściowy, dotyczy wyłącznie sekcji Zespół w punkcie 83):** przed tą zmianą `/app/settings/*` renderował `SettingsGovernanceScreen` bez żadnych propsów — cały ekran, łącznie z sekcją Zespół, działał wyłącznie na lokalnym stanie z danymi demo (`settingsGovernanceDemoSeed.ts`), mimo że backend (`settings.memberships.read`, `invitation.request`, `invitation.reject`) był już realny i zweryfikowany od 2026-08-22 (zob. wcześniejszy audyt zaproszeń). To dokładnie przypadek opisany w sekcji 0: `[x]` w starszej dokumentacji nie było dowodem aktualnego stanu.
  - Zrobione: nowy `apps/web/src/app/settings/SettingsPage.tsx` + `settingsRuntimeAdapter.ts` pobierają realną listę członków/zaproszeń (`GET /api/v1/settings/czlonkostwa`) i wołają realne `inviteMember`/`revokeInvitation` z przekierowaniem do ponownego uwierzytelnienia przy `requiredAuthLevel: step_up` (ten sam mechanizm co Integracje/Raporty). `SettingsGovernanceScreen` przyjął opcjonalny prop `membershipsRuntime` — Storybook i wszystkie 5 story'ów `38-settings-governance` dalej działają na starych danych demo bez zmian.
  - Zweryfikowane na żywym stosie (docker compose: postgres+api+bff+worker, świeża rejestracja konta, bez seeda): `GET /api/v1/settings/czlonkostwa` zwraca kształt zgodny z `bffClient.readSettingsMemberships()` (rola `"Tenant Owner"`, status `"active"`), a `POST /api/v1/auth/invitations/request` bez step-up poprawnie zwraca `403` z `requiredAuthLevel: "step_up"` (7/7 sprawdzeń, skrypt tymczasowy, usunięty po weryfikacji). Storybook (`build-storybook`, driver Playwright) i `vitest`/`tsc -b` — czyste, zero regresji.
  - Nadal lokalne/fikcyjne (brak API): zmiana roli istniejącego członka, ponowne wysłanie zaproszenia, usunięcie dostępu aktywnego członka — UI jawnie to sygnalizuje ("Zmiana roli: wkrótce", brak przycisku ponowienia) zamiast udawać działanie. Wszystkie pozostałe 7 sekcji ekranu (konto, firma, analityka, Papa AI, powiadomienia, prywatność) i punkty 81, 82, 84, 86, 87, 89, 90 pozostają nietknięte — bez zmian.
  - `SettingsAuditP0` (punkt 85): pozostaje wyłącznie w Storybooku, celowo nie trafia do nawigacji produkcyjnej — jego treść to sfabrykowany raport "GROUND TRUTH OK" na fikcyjnych danych (`settingsP0AuditItems`), a dzisiejsze ustalenie (fałszywa persystencja w Zespole) pokazuje, że taki niezweryfikowany raport byłby mylący w produkcie.

## 6. Rozliczenia — Subskrypcja i płatności

Podstawa: [Subskrypcja i płatności](../../specyfikacja-docelowa/17-subskrypcja-i-platnosci). Obecna strona produkcyjna przekazuje odczyt i odświeżanie; callbacki operacji wymagają podłączenia.

- [ ] Przebudować i odebrać układ subskrypcji, planów, użycia/limitów, faktur i metod płatności.
- [ ] Przygotować wybór planu i okresu miesięcznego/rocznego z ceną, terminem wejścia zmiany i jej skutkami.
- [ ] Domknąć przejście z pilota do abonamentu, odnowienie, zmianę i anulowanie subskrypcji.
- [ ] Podłączyć dodanie/zmianę metody płatności oraz obsługę metod przewidzianych w katalogu dostawcy.
- [ ] Obsłużyć zaległość, nieudaną płatność, ponowienie i ograniczenie dostępu.
- [ ] Domknąć listę/szczegóły/pobieranie faktur, korekty i statusy KSeF według kontraktów produktu.
- [ ] Zmapować akcje UI na API i dostawcę; sam webhook Stripe nie potwierdza obsługi całego procesu.
- [ ] Zweryfikować uprawnienia Owner/Billing, duplikaty callbacków i zgodność stanu po powrocie od dostawcy.
- [ ] Dodać osobne stories interakcji oraz testowy przepływ płatności bez rzeczywistych obciążeń.

## 7. Pomoc i konsultacje

Podstawa: [Centrum Pomocy](../../specyfikacja-docelowa/19-centrum-pomocy). Wspólne ramki sekcji pozostają; zawartość i przepływy wymagają dalszego odbioru.

- [ ] Przebudować i odebrać stronę główną, wyszukiwarkę, wyniki, bazę wiedzy, procedury i kontekst problemu.
- [ ] Uporządkować Truth Engine, roadmapę i eskalację, aby każda sekcja miała jasne zadanie oraz działające przejścia.
- [ ] Przenieść procedurę i formularz eskalacji na `Dialog`; panel Copilota ujednolicić ze wspólnym systemem nakładek i docelowym Papa Asystentem.
- [ ] Zachować fokus, Escape, powrót fokusu i reset formularzy; zaktualizować selektory stories dla portali.
- [ ] Wdrożyć wysłanie zgłoszenia z numerem sprawy, stanem oczekiwania, błędem i możliwością ponowienia.
- [ ] Zdefiniować i wdrożyć ścieżkę konsultacji: wybór tematu, dostępność/umówienie oraz potwierdzenie zgodnie z docelową usługą.
- [ ] Pokazać, jaki kontekst i dane są dołączane do zgłoszenia; umożliwić ich przegląd przed wysłaniem.
- [ ] Powiązać pomoc kontekstową z problemami Integracji i analiz, zachowując źródłowy ekran i filtry.
- [ ] Zweryfikować `/app/help/*`, wyszukiwanie, brak wyników, procedurę, zgłoszenie i kontrast w obu motywach.

## 8. Logowanie, rejestracja i powiązane ekrany dostępu

Podstawa: [Auth statechart — 29 powierzchni](../../specyfikacja-docelowa/03-dostep-rejestracja-onboarding/auth-statechart-1.0.md), [wykonawcza maszyna stanów](../../specyfikacja-docelowa/03-dostep-rejestracja-onboarding/auth-fsm-wykonawczy.md), [onboarding](../../specyfikacja-docelowa/03-dostep-rejestracja-onboarding/procesy/onboarding-do-pierwszej-wartosci.md). Bazą kodu jest `runtime/features/auth/AuthSurface.tsx`; istniejących przejść nie należy zastępować samą makietą.

- [ ] Przebudować wspólną powierzchnię Auth: kompozycję, markę, formularze, komunikaty, responsywność, motyw i język przed zalogowaniem.
- [ ] Odebrać wejście do dostępu i logowanie (`auth-01–02`): walidacja, wysyłanie, niepoprawne dane i poprawny powrót do celu.
- [ ] Odebrać wybór rejestracji, e-mail i OAuth (`auth-03–05`), w tym anulowany lub błędny callback.
- [ ] Odebrać weryfikację e-mail (`auth-06`), ponowną wysyłkę i wygasły/wykorzystany link.
- [ ] Przebudować identyfikację firmy (`auth-07–11`): NIP, wyszukiwanie, przegląd/edycja danych, wpis ręczny i firma już zarejestrowana.
- [ ] Odebrać zgody, przetwarzanie i zakończenie rejestracji (`auth-12–14`), zachowując dane przy błędzie.
- [ ] Odebrać zaproszenie (`auth-15`): poprawne, wygasłe, wykorzystane i konto niezgodne z zaproszeniem.
- [ ] Odebrać weryfikację i konfigurację MFA (`auth-16–17`) oraz błędny kod i odzyskiwanie dostępu.
- [ ] Przebudować odzyskiwanie hasła, potwierdzenie wysyłki i nowe hasło (`auth-18–20`).
- [ ] Odebrać rozwiązywanie dostępu, wybór organizacji i workspace'u (`auth-21–23`).
- [ ] Odebrać ponowne uwierzytelnienie (`auth-24`) z bezpiecznym wznowieniem operacji.
- [ ] Odebrać wylogowanie i stan po wylogowaniu (`auth-25–26`), niedostępność usługi i blokadę (`auth-27–28`).
- [ ] Odebrać wejście do aplikacji (`auth-29`) i dalszy onboarding do pierwszego źródła oraz pierwszego wyniku.
- [ ] Sprawdzić autofill, menedżery haseł, wklejanie kodów, klawiaturę ekranową i komunikaty czytnika ekranu.
- [ ] Pokryć wszystkie 29 powierzchni w katalogu i zweryfikować kluczowe przejścia z prawdziwym API, także po odświeżeniu oraz wygaśnięciu sesji.

## 9. Cały Papa Asystent

Podstawa: [kontekst produktowy Papa](../../papa-assistant/papa-asystent-kontekst-produktowy.md), [specyfikacja modułu](../../specyfikacja-docelowa/15-papa-asystent-i-laboratorium-ai), [ciągłość rozmowy](../../specyfikacja-docelowa/26-priorytety-p0/08-ciaglosc-asystent-laboratorium.md). Oznaczenia wykonania i stare ścieżki plików w tych dokumentach wymagają ponownego sprawdzenia.

- [x] Zestawić aktualny sidecar, runtime rozmowy i kontekst ekranu z pełnym zakresem dokumentacji; wskazać funkcje do zachowania i brakujące. **(2026-09-08, dowód: pełne zestawienie poniżej + przegląd `PapaAssistantExperience.tsx`, `PapaAssistantRuntimeContext.tsx`, `assistantModel.ts`, `assistantGateway.ts`, `papa-conversation.real-source.ts`.)**
- [ ] Ustalić docelowe miejsce pełnego widoku/Laboratorium, Raportów i Decyzji. Usunięcie dawnego Laboratorium nie zamyka zakresu Papa Asystenta.
- [ ] Naprawić rozjazd routingu: sidecar odsyła do `/app/papa/panel-kontekstowy-papa`, a obecna gałąź `/app/papa/*` renderuje Zapisane raporty. **(zweryfikowano 2026-09-08: to zdanie jest już nieaktualne — `isAssistantPath` w `assistantModel.ts:50-54` poprawnie kwalifikuje zarówno `/app/assistant`, jak i `/app/papa/*` poza `/app/papa/raporty`; sidecar (`PapaAssistantSidecar.tsx:12`) faktycznie odsyła do `/app/assistant`, nie do `panel-kontekstowy-papa`, ale obie ścieżki dziś renderują Asystenta poprawnie — funkcjonalnie działa. Pozostaje kosmetyczna niespójność nazewnictwa: martwy, nieużywany kod (`PapaDecisionWorkspace` w `OperationalDomainWorkspaces.tsx:1143`, nieimportowany nigdzie) i dokumentacja/kontrakty nadal odwołują się do `/app/papa/panel-kontekstowy-papa` jako kanonicznej ścieżki 50.01, podczas gdy żywy kod i Storybook (`storybookNavigation.ts:53`) używają `/app/assistant`. Do ujednolicenia przy porządkowaniu, nie blokuje funkcji.)**
- [ ] Przebudować `AssistantShell`: nagłówek, kontekst, tryby, rozmowa, aktywność narzędzi, dowody, artefakty, composer i status operacji.
- [ ] Przygotować panel kontekstowy, widok przypięty/podzielony, pełny widok i wariant mobilny; zachować dostęp do composera.
- [ ] Ujednolicić uruchamianie z launchera, KPI, wykresów, tabel, rekomendacji, wyszukiwarki i Pomocy.
- [ ] Wdrożyć pełny koszyk kontekstu: ekran, daty, filtry, wybrane elementy, źródła, snapshoty i pliki; umożliwić przegląd i usuwanie elementów.
- [ ] Zachować `conversationId`, historię i kontekst między panelem a pełnym widokiem; nowa rozmowa wyłącznie po jawnej akcji, odgałęzienie z powiązaniem nadrzędnym.
- [ ] Domknąć tryby: szybki brief, interpretacja, diagnoza, decyzja, raport i plan działań.
- [ ] Przebudować odpowiedź: fakty, interpretacje, hipotezy, rekomendacje, ograniczenia i kolejne kroki; pokazać pochodzenie danych i poziom pewności.
- [ ] Domknąć streaming, przerwanie, ponowienie, błąd narzędzia i częściową odpowiedź bez utraty rozmowy.
- [ ] Przygotować widoki źródeł, dowodów i artefaktów wewnątrz Asystenta, bez stosu kolejnych modalnych paneli.
- [ ] Domknąć raporty: draft, zadanie generowania, postęp, błąd, podgląd, zapis do biblioteki i eksport PDF/CSV/XLSX według kontraktów.
- [ ] Domknąć bibliotekę, briefingi, obserwacje, rekomendacje, warianty i symulację; powiązać je z Decyzjami bez duplikowania rejestru.
- [ ] Domknąć wątki spraw `caseThreadId`, historię decyzji, pamięć i powrót do źródłowych dowodów.
- [ ] Przebudować zatwierdzanie AI Actions: cel, diff, dowody, symulacja, uprawnienia, limity i jawna akceptacja człowieka.
- [ ] Obsłużyć wykonanie, ponowny odczyt wyniku, częściowy sukces, błąd, audyt i rollback/kompensację zgodnie z kontraktem akcji.
- [ ] Pokazać blokady: brak danych/dowodów, brak uprawnień, przekroczony zakres, limit lub niedozwolone narzędzie; nie udawać wykonania operacji.
- [ ] Domknąć ustawienia AI/governance: pamięć, retencja, dostępne narzędzia, limity i informacje o przetwarzaniu.
- [ ] Uzgodnić i odebrać eksport/MCP z dokumentacji: zakres danych, uprawnienia i status wykonania.
- [ ] Zweryfikować izolację workspace'ów i dostępność streamingu; zmiana workspace'u nie może ujawniać poprzedniego kontekstu.
- [ ] Dodać scenariusz całościowy: pytanie o KPI → dowody → pełny widok → raport lub propozycja → zatwierdzenie → wynik → powrót do tej samej rozmowy.

**Postęp 2026-09-08 (dotyczy punktu "Backend ma ~29 operacji papa.*..." poniżej):** dobudowano UI dla trzech z ~20 dotąd niepodłączonych operacji backendu — nowe zakładki **Laboratorium** (`papa.lab.read`: sprawy, rekomendacje, decyzje, wyniki, warianty eksperymentów — realizuje też dawny punkt "Warianty Papa" 50.17, którego dane żyją w polu `experiments[].variantConfig` tej samej operacji, nie w osobnym endponcie), **Propozycje** (`papa.proposals.read`, osobny model rekomendacji niż zatwierdzanie działań AI w zakładce Działania) i **Obserwacje** (`papa.observations.read` + zapis przez `papa.observation.save`, z formularzem). Kod: `assistantModel.ts` (parsery `parseLab`/`parseProposals`/`parseObservations`), `PapaAssistantExperience.tsx` (3 nowe komponenty widoku), `assistantGateway.ts`/`bffClient.ts` (`savePapaObservation`).
- **Realny błąd backendu znaleziony i naprawiony**: migracja `0025_papa_lab_case_observation_domain.sql` nigdy nie nadała roli `papadata_app`/`papadata_test` uprawnień do `app.assistant_cases` i `app.assistant_observations` (w przeciwieństwie do sąsiednich tabel Laboratorium z migracji 0026/0027) — oba nowe odczyty kończyły się `500 permission denied`. Niewykryte wcześniej, bo żaden frontend nigdy nie wywoływał `papa.lab.read`/`papa.observations.read`/`papa.observation.save`. Naprawione w `0052_papa_lab_case_observation_grants.sql`.
- Zweryfikowane na żywym stosie (docker compose, świeże konto, bez seeda): `GET /v1/papa/laboratorium-ai`, `GET /v1/papa/propozycje-ai`, `POST /v1/papa/observations` → `GET /v1/papa/obserwacje` (round-trip zapis/odczyt) — 10/10 sprawdzeń po migracji. Storybook (`build-storybook`, live w przeglądarce) i `vitest` (132/132) — czyste.
- Nadal bez UI: pozostałe ~17 operacji (`papa.answer-contract.read`, `papa.provider-governance.read`, `papa.metric-provenance.read`, `papa.ai.notifications.*`, `papa.privacy-redaction.read`, `papa.evidence.read` jako dedykowany widok) — do dalszej pracy w kolejnej iteracji.
- Uwaga: `apps/web/src/runtime/shell/papa-assistant/assistantModel.test.ts` i `apps/web/src/storybook-next/stories/41-papa-assistant/PapaAssistant.stories.tsx` mają dziś błędy `tsc` (brakujące pole `timezone` w `DateRange`, nieznana opcja `exact` w `ByRoleOptions`) niezwiązane z tą pracą — to pliki nieśledzone przez git (`??`), najwyraźniej z równoległej, niedokończonej zmiany typu `DateRange` gdzie indziej w repo; testy w nich mimo to przechodzą w `vitest` (błąd jest tylko na poziomie typów). Nie naprawiono w tej sesji — poza zakresem tego zadania i ryzykowne bez znajomości intencji tamtej zmiany.

**Zestawienie stanu rzeczywistego 2026-09-08** (wykonane w ramach pierwszego punktu powyżej; koryguje wcześniejsze założenie audytu, że Papa Asystent jest w większości niezbudowany — jest znacznie dalej niż sugerowały same `[ ]`, ale ma też realne, nienazwane wcześniej luki):

*Rzeczywiście działa dziś (`PapaAssistantExperience.tsx`, jeden komponent dla trybu skróconego w sidecar i pełnego na `/app/assistant`):*
- Realna rozmowa z serwerem (`papa.context.capture`, `papa.answer.generate`, `papa.answer.read` w `contract-runtime.service.ts`), realny koszyk kontekstu (metryki/wykresy/tabele/rekomendacje/dowody/elementy) z możliwością wyłączania elementów i dopytywania o pojedynczy element — pokrywa punkt 7 poza jawnie niedostępnym dołączaniem plików.
- 6 trybów (brief/interpretacja/diagnoza/decyzja/raport/plan) — punkt 9 zrealizowany.
- `conversationId`/`parentConversationId` trwałe w localStorage, historia po stronie serwera, `RequestEpoch` chroni przed nadpisaniem przez spóźnioną odpowiedź, gałąź `pinned`/`wide`/pełny widok współdzielą ten sam kontekst — punkt 8 w dużej mierze zrealizowany.
- Realne dowody (evidence) przypięte do odpowiedzi serwera, realne raporty: szkic, biblioteka, zadania generowania, pobieranie — punkty 12 i 13 w większości zrealizowane (poza PDF/XLSX w trybie demo, co jest jawnie zakomunikowane w UI).
- Realne zatwierdzanie propozycji AI Actions: `validate`/`approve`/`reject` przez `commandPapaAction`, z celem/diff/dowodami/symulacją/limitami i wymaganym uzasadnieniem + zgodą — pierwsza połowa punktu 16 zrealizowana.
- Historia workspace'u i lista wątków `context-basket` z możliwością przywrócenia innej rozmowy (`restoreConversation`) — częściowe pokrycie punktu 15 (brak jednak dedykowanego UI dla `caseThreadId` jako pojęcia odrębnego od `conversationId`).
- Odczyt zasad AI/governance z serwera (`papa.ustawienia-ai-i-governance`) — połowa punktu 19 (odczyt), zapis i retencja jawnie niepodłączone.

*Realne, nienazwane wcześniej luki:*
- **Brak wykonania i cofania AI Actions** — kod jawnie komunikuje to w UI ("Wykonanie i cofanie zmian zewnętrznych nie są jeszcze dostępne"). To odrębny, wrażliwy bezpieczeństwo punkt 17 — wymaga realnych adapterów wykonania per-integracja, audytu i kompensacji; nie do zrobienia bez osobnej decyzji produktowej/bezpieczeństwa o zakresie pierwszej integracji.
- **Brak streamingu** — `PapaMessageThread.tsx` wprost odnotowuje brak realnego strumienia tokenów; przerwanie to lokalny `AbortController`, ponowienie to ponowne wysłanie. Punkt 11 otwarty.
- **Backend ma ~29 operacji `papa.*`, frontend woła 9** — reszta (lab, obserwacje, propozycje jako osobny widok, warianty, powiadomienia, metric-provenance, provider-governance) nie ma żadnego wywołania z UI. Dawne Laboratorium (ekrany 50.02–50.17 w `papaData.ts`) nie ma następcy jako osobne miejsce — funkcje częściowo wchłonęły zakładki (Kontekst/Dowody/Działania/Historia), ale Lab, Obserwacje, Warianty i osobny widok Propozycji nie mają żadnego UI. Punkty 2, 3 i 14 pozostają otwarte i wymagają decyzji: dobudować UI do istniejących operacji, czy uznać je za przestarzałe i wyczyścić.
- **Zapisane raporty i Decyzje są w pełni osobnymi systemami** — brak wspólnego `conversationId`/koszyka kontekstu; jedyne powiązanie to jednokierunkowy `navigate('/app/papa')` z zakładki Raporty. `DecisionsScreen` trzyma stan lokalnie w `localStorage` bez żadnego odniesienia do `papa.ai.action.*`. Punkt 14 (część "powiązać z Decyzjami") otwarty.
- **Eksport/MCP i zapis ustawień pamięci AI** — jawnie brak podłączonej operacji (nota w komponencie `Governance()`). Punkt 20 otwarty.
- Martwy kod: `PapaDecisionWorkspace` (`OperationalDomainWorkspaces.tsx:1143`, nieużywany) i pusty katalog `storybook-next/stories/40-papa-assistant/` — nieuprzątnięte po usunięciu dawnego Laboratorium; nie usunięto w tej sesji ze względu na rozmiar pliku współdzielonego z innymi, wciąż używanymi eksportami (wymaga osobnej analizy zależności przed usunięciem).
- Izolacja workspace'ów (punkt 21) i pełny scenariusz end-to-end (punkt 22) nie zostały dziś zweryfikowane na żywej sesji — wymagają osobnego przebiegu testowego.

## 10. Pozostałe otwarte zadania z wcześniejszego audytu

Te zadania pozostają w planie, choć nie oznaczają ponownej przebudowy całego gotowego układu danego ekranu.

- [ ] Command Center: odebrać nowy ekran na rzeczywistych danych.
- [ ] Produkty: podłączyć nowy ekran do produkcyjnej ścieżki analitycznej; zachować osobną datę stanu magazynu.
- [ ] Zamówienia: podłączyć nowy ekran do `/app`; domknąć płatności, zwroty, lejek i wnioski na właściwym modelu danych.
- [ ] Decyzje: dodać routing, trwały rejestr serwerowy, uprawnienia i powiązanie z Papa Asystentem.
- [ ] Zapisane raporty: sprawdzić zapis/publikację/podgląd, ograniczenia roli i MFA na żywym backendzie.
- [ ] Rozdzielić adresy Raportów i pełnego Papa Asystenta oraz zapewnić działające linki i zachowanie kontekstu.

## 11. Wspólna checklista odbioru — obowiązuje każdy moduł

- [ ] Odebrać docelowy wygląd i treść wszystkich sekcji, szczegółów, formularzy i nakładek; sama podmiana powłoki nie zamyka zadania.
- [ ] Użyć wspólnego design systemu i usunąć zbędne lokalne odpowiedniki oraz martwy CSS.
- [ ] Obsłużyć adekwatne stany: ready, loading, empty, partial, stale, error, forbidden i offline; brak danych nie może wyglądać jak wynik zerowy.
- [ ] Odtwarzać daty, filtry, wybrany rekord i kontekst powrotu z URL tam, gdzie przewiduje to przepływ.
- [ ] Każdą akcję sklasyfikować jako lokalną akcję UI lub operację z kontraktem API; potwierdzać sukces po wyniku operacji.
- [ ] Zweryfikować uprawnienia po stronie serwera, zmianę workspace'u, MFA oraz trwałość zapisu po odświeżeniu.
- [ ] Sprawdzić 1440/768/390 px, light/dark, PL/EN, zoom i reduced motion, także z otwartymi nakładkami.
- [ ] Sprawdzić Tab/Shift+Tab, Escape, fokus początkowy i powrót fokusu, etykiety formularzy oraz alternatywy tabelaryczne wykresów.
- [ ] Powtórzyć Axe dla przebudowanych stanów i naprawić potwierdzone naruszenia; zapisać zakres oraz wyniki zamiast odziedziczonych liczb.
- [ ] Uruchomić właściwe testy logiki, kontraktów i interakcji; wynik stories potwierdzić jako PASS, nie sam brak błędów konsoli.
- [ ] Uruchomić typecheck, testy właściwych pakietów, build, build-storybook i kontrolę diffu.
- [ ] Uzupełnić README, mapę tras i niniejszą checklistę o daty, dowody oraz konkretne ograniczenia.

## Proponowana kolejność realizacji

1. Ustalić kompozycje modułów i mapę Papa/Raportów; przygotować wspólne elementy wymagające zmiany.
2. Przebudować Atrybucję, Kreacje i Budżet, następnie Klientów oraz Ruch.
3. Przebudować Dane i integracje, Ustawienia, Rozliczenia oraz Pomoc.
4. Przebudować pełny zestaw Auth i onboardingu.
5. Domknąć cały Papa Asystent; jego kontrakt kontekstu i routing ustalić już w kroku 1, aby pozostałe ekrany mogły go poprawnie zasilać.
6. Zamknąć pozostałe podłączenia i przeprowadzić odbiór całości.

Podłączenie danych i weryfikację należy wykonywać w ramach każdego modułu, bez odkładania wszystkich integracji na koniec. Lista opisuje prace do wykonania; nie stanowi deklaracji ich wdrożenia.
