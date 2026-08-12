---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-009
updated_at: 2026-07-30T15:05:00+02:00
status: legal-template
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Załącznik bezpieczeństwa i środki techniczne oraz organizacyjne — TOM

> **Status dokumentu:** `legal-template`, nie `accepted-production`. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Governance i odpowiedzialność

PapaData utrzymuje właścicieli bezpieczeństwa, polityki, rejestr ryzyk, cykl przeglądów, szkolenia, segregację obowiązków i procedurę wyjątków. Kontrole mają dowód, ownera, częstotliwość i status.

## 2. Tożsamość i dostęp

MFA dla uprzywilejowanych ról, least privilege, role/capabilities/data scope, JIT dla supportu, kwartalne recertyfikacje, automatyczny offboarding, polityka sesji i urządzeń, brak współdzielonych kont administracyjnych.

## 3. Izolacja i dane

Tenant i Workspace są odrębnymi granicami domenowymi. Każde zapytanie i job przenosi kontekst. Testy negatywne blokują cross-tenant access. Dane są klasyfikowane, minimalizowane, szyfrowane w tranzycie i spoczynku; klucze mają rotację i ograniczony dostęp.

## 4. Sekrety i kryptografia

Produkcja używa secret managera; sekrety nie trafiają do repo, logów ani klienta. Lokalnie stosuje się `.env.local` poza VCS. Certyfikaty KSeF, webhook secrets i tokeny OAuth mają ownera, rotację, revocation i monitoring użycia.

## 5. SDLC i podatności

Code review, protected branches, SAST, dependency/container/IaC scanning, testy autoryzacji, walidacja wejścia, SBOM, aktualizacje i śledzenie CVE. Krytyczne podatności mają SLA `[CZAS]`. Test penetracyjny odbywa się `[CZĘSTOTLIWOŚĆ]` i po istotnej zmianie.

## 6. Logging i monitoring

Audyt obejmuje logowanie, zmiany ról, integracje, eksporty, AI Actions, billing i KSeF. Logi są odporne na manipulację, pseudonimizowane i objęte retencją. Alerty obejmują anomalie dostępu, błędy izolacji, sekrety, płatności, nieudane webhooki i exfiltration patterns.

## 7. Backup, BCP i DR

Kopie są szyfrowane, rozdzielone, testowane przez restore i objęte RPO/RTO. Procedury failover, komunikacji i powrotu są ćwiczone. Lokalny development nie używa danych produkcyjnych bez zatwierdzonej anonimizacji.

## 8. Incident response

Zespół ma klasyfikację, on-call, containment, evidence, komunikację i postmortem. Naruszenia danych są obsługiwane według procedury 14. Łańcuch dowodowy i decyzje są rejestrowane.

## 9. Providerzy i transfery

Każdy provider przechodzi ocenę bezpieczeństwa, DPA i transferu. Konfiguracja ogranicza retencję i trening danych. Usunięcie providera obejmuje revocation i potwierdzenie usunięcia.

## 10. Fizyczne i osobowe

Bezpieczeństwo fizyczne chmury wynika z dostawcy; urządzenia personelu mają szyfrowanie, ekran blokady, MDM `[JEŚLI DOTYCZY]` i procedurę utraty. Personel podlega weryfikacji adekwatnej do roli i poufności.

## 11. Macierz dowodów

Do uzupełnienia: kontrola, dowód, system źródłowy, owner, częstotliwość, ostatni test, wyjątek, termin naprawy.
