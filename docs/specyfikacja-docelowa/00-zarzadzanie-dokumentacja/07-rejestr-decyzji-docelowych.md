---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-C81FB4C6622A
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Rejestr decyzji docelowych

| ID | Decyzja |
| --- | --- |
| DEC-001 | Nowa dokumentacja format legacy jest kontraktem docelowym; kod/snapshot jest dowodem stanu obecnego. |
| DEC-002 | Tenant jest granicą izolacji; workspace granicą operacyjną wewnątrz tenanta. |
| DEC-003 | Przeglądarka wywołuje BFF `/api/v1`; operation IDs są źródłem śledzalności ekran–API. |
| DEC-004 | Nie istnieją runtime endpointy `/storybook/*` ani `/flows/*`. |
| DEC-005 | Inter i JetBrains Mono pozostają stanem docelowym do osobnej decyzji migracyjnej. |
| DEC-006 | Jakość danych jest dostępna w grupie „Dane i integracje”, z deep linków statusu i bezpośrednio dla Data Steward. |
| DEC-007 | Każdy ekran jest kompozycją kontraktów komponentów; lokalny duplikat wymaga ADR. |
| DEC-008 | Security i mobile zachowują pełne pakiety źródłowe, nie skrócone streszczenia. |
| DEC-009 | Wszystkie 58 metryk należą do MVP i jednego backendowego Metric Engine. |
| DEC-010 | Local/CI/dev/staging zachowują logiczny parytet z produkcją GCP. |
| DEC-011 | MVP obejmuje całą aplikację; jedynym ograniczeniem są 7 integracji. |
| DEC-012 | AI działa lokalnie i przez wymienny adapter zewnętrznego LLM. |
| DEC-013 | NIP jest wyszukiwany przez backendowy adapter GUS/BIR z ręcznym fallbackiem. |
| DEC-014 | Mobile distribution jest owner-only; QR sklepów i parowania są oddzielne. |
| DEC-015 | Raporty są edytowalne, zachowują wizualizacje i eksportują PDF/CSV/XLSX. |
| DEC-016 | Papa Asystent i Laboratorium używają jednego conversationId. |
| DEC-017 | AI Cases obsługują anomalie, wzrosty, ryzyka i rekomendacje. |
| DEC-018 | AI Actions wymagają jawnej akceptacji człowieka, audytu i rollbacku/kompensacji. |
| DEC-019 | Billing MVP obejmuje cykle miesięczny/roczny, kartę, BLIK i przelewy. |
| DEC-020 | Faktury są integrowane z KSeF; pakiet prawny jest częścią gotowości go-live. |


## Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

## Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.
