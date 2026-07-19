# Zakres MVP i plan wydań

PAPADATA

Zakres MVP i plan wydań

Pełna aplikacja, ograniczony katalog integracji i bramy

Tabela:
- Wiersz 1: Kod dokumentu; A14
- Wiersz 2: Wersja; 2.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Dostarczyć pełną funkcjonalność aplikacji w kontrolowanym katalogu integracji, wariantów, rynków i skali. [FAKT/ZAKRES]

Zakres: MVP/pilot, etap 2, później, criteria, odroczenia i dependencies. [FAKT/ZAKRES]

Poza zakresem: Daty release i budżet. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

## Podstawa źródłowa

Tabela:
- Wiersz 1: Kod; Dokument; Rola w architekturze
- Wiersz 2: D1; Dokumentacja produktu; Nadrzędna dokumentacja biznesowo-produktowa.
- Wiersz 3: D2; Rejestr decyzji i wymagań biznesowych; Jedyne źródło prawdy dla statusu i wersji decyzji.
- Wiersz 4: D3; Kontrakt danych, stanów i KPI; Źródło prawdy dla warstw danych, canonicalization, deduplikacji i readiness.
- Wiersz 5: D4; Integracje i gotowość operacyjna; Źródło prawdy dla providerów, bram, synchronizacji, retry i recovery.
- Wiersz 6: D5; Pierwszy pion produktowy i płatny pilotaż; Proces pierwszej mierzalnej wartości i kryteria pilotażu.
- Wiersz 7: D6; Model komercyjny i unit economics; Plany, limity, koszty, marża i bramy skalowania.
- Wiersz 8: D7; Bezpieczeństwo, Prywatność i AI Governance; Kontrole bezpieczeństwa, prywatności, ciągłości i AI.
- Wiersz 9: M01-M15; Specyfikacje architektury UI/UX; Ekrany, flow, stany, formularze, Storybook i priorytety.

Hierarchia: D2 ustala status decyzji; D3 semantykę danych/KPI; D4 gotowość integracji; D7 bezpieczeństwo i AI. M01-M15 opisują wymagania UI, ale nie dowodzą implementacji. [FAKT]

## Zasada MVP

Kryterium: Element wchodzi do MVP, gdy jest niezbędny do pełnego przepływu wartości albo jest kontrolą bezpieczeństwa/operacyjności konieczną dla danych klienta. [REKOMENDACJA]

Tabela:
- Wiersz 1: Etap; Zakres; Uzasadnienie
- Wiersz 2: MVP / płatny pilotaż; Pełne moduły aplikacji; katalog providerów MVP; pełny lifecycle sync; dane, readiness i KPI; Command Center; raporty; AI; decyzje i actions; billing; administracja; audit; monitoring i support; Kompletny przepływ wartości bez pozornej szerokości.
- Wiersz 3: Etap 2; Kolejne integracje, warianty providerów, rynki, regiony, wyższe limity i większa skala; Rozszerza pokrycie po potwierdzeniu jakości i kosztu.
- Wiersz 4: Później; Pełny omnichannel, multi-market/currency, enterprise SSO variants, automatyczne actions, modele predykcyjne; Wymaga skali, governance i dowodów.

## Pion referencyjny MVP

Płatny klient i uzgodniony scope.

Workspace, Owner/Admin/Analyst/Viewer, invitations i MFA.

Zamknięty katalog providerów MVP, z których każdy przechodzi readiness gates.

Connect, initial/incremental sync, reconnect i monitoring.

Source -> normalized -> canonical dla wszystkich faktów wymaganych przez funkcje MVP.

Quality/readiness i DataIssue.

Pełny katalog KPI wymagany przez moduły MVP, wersjonowany i oceniany przez readiness.

Command Center i drill-down z evidence.

AI interpretation z refusal/limitations.

Recommendation, human decision, AI Actions oraz pełny lifecycle outcome.

Audit, support, backup/restore i incident runbook.

Pełne usage, entitlements, billing i self-service dla wariantu MVP.

## Elementy odroczone

Tabela:
- Wiersz 1: Element; Dlaczego; Warunek powrotu
- Wiersz 2: Integracje spoza katalogu MVP; koszt i brak potrzeby pionu; potwierdzona wartość/readiness
- Wiersz 3: Pełny omnichannel; najwyższe overlap/dedupe risk; authority/reconciliation evidence
- Wiersz 4: Customer identity/LTV; privacy i resolution complexity; approved model/data
- Wiersz 5: Niekontrolowane autonomous AI actions; excessive agency; action platform + safety eval
- Wiersz 6: Własny model ML; brak uzasadnienia; benchmark/cost/data
- Wiersz 7: Dodatkowi providerzy i metody płatności; nie rdzeń wartości; powtarzalna sprzedaż
- Wiersz 8: Multi-region; duża złożoność; enterprise SLA
- Wiersz 9: Microservice per domain; ops cost; workload/team evidence

## Bramy wejścia do pilotażu

Klient, owner i scope zatwierdzone.

Provider przechodzi environment, connection, sync i recovery gates.

Umowy/privacy/security review dla zakresu.

Sandbox/test data przechodzi canonicalization i KPI vectors.

Monitoring, alerts, runbook i support owner.

Restore i tenant isolation evidence.

Storybook pokrywa errors/partial.

AI ma approved use case i kill switch.

## Mierniki sukcesu

Tabela:
- Wiersz 1: Wymiar; Miernik
- Wiersz 2: Wartość; co najmniej jeden KPI uznany za wiarygodny/użyteczny
- Wiersz 3: Jakość; reconciliation w tolerancji i jawne exclusions
- Wiersz 4: Time-to-value; od readiness klienta do first useful result
- Wiersz 5: Operacje; manual interventions i support time
- Wiersz 6: Stabilność; sync success/lag, brak P0 security
- Wiersz 7: AI; evidence/refusal correctness, reviewed decisions
- Wiersz 8: Komercja; cost-to-serve i usage vs margin assumptions
- Wiersz 9: Kontynuacja; subscription/extension/exit z reason

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
