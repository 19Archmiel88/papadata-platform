---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-016
updated_at: 2026-07-30T15:05:00+02:00
status: legal-template
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Rejestr czynności przetwarzania — ROPA

> **Status dokumentu:** `legal-template`, nie `accepted-production`. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Instrukcja

Każdy proces ma osobny wpis. Rejestr rozdziela czynności administratora od kategorii przetwarzania wykonywanych jako procesor. Aktualizacja jest wymagana przed uruchomieniem nowej integracji, providera AI, celu telemetry lub zmiany retencji.

## 2. Tabela administratora

| ID | Proces/cel | Kategorie osób | Dane | Podstawa | Odbiorcy | Transfer | Retencja | Systemy | Owner | TOM | DPIA | Data przeglądu |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ROPA-C-001 | konta i umowa | użytkownicy Klienta | kontakt, role, logi | `[PODSTAWA]` | `[ODBIORCY]` | `[MECHANIZM]` | `[OKRES]` | IAM/API | Product | TOM-01 | `[TAK/NIE]` | `[DATA]` |
| ROPA-C-002 | billing i KSeF | płatnicy | firma, płatność, faktura | `[PODSTAWA]` | provider/księgowość/KSeF | `[MECHANIZM]` | ustawowa | Billing | Finance | TOM-02 | nie | `[DATA]` |

## 3. Tabela procesora

| ID | Kategoria usług | Administratorzy | Osoby/dane | Operacje | Podprocesorzy | Transfer | Retencja/usunięcie | TOM |
|---|---|---|---|---|---|---|---|---|
| ROPA-P-001 | analityka e-commerce | Klienci | klienci końcowi, zamówienia, marketing | ingest, normalize, metric, report, AI | `[LISTA]` | `[MECHANIZM]` | wg DPA | TOM |

## 4. Governance

Owner potwierdza wpis co najmniej raz w roku i po zmianie. Privacy sprawdza spójność z polityką prywatności, DPA, podprocesorami i retention schedule. Historia zmian jest zachowana.
