---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-015
updated_at: 2026-07-30T15:05:00+02:00
status: legal-template
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Procedura realizacji praw osób — DSAR

> **Status dokumentu:** `legal-template`, nie `accepted-production`. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Kanały i rejestr

Wnioski wpływają przez `[EMAIL/FORMULARZ/SUPPORT]` i są rejestrowane z datą, rodzajem prawa, rolą PapaData, terminem i ownerem. Pracownik rozpoznający wniosek w innym kanale przekazuje go do Privacy.

## 2. Weryfikacja tożsamości

Weryfikacja jest proporcjonalna i nie zbiera więcej danych niż potrzeba. Dla zalogowanego użytkownika preferowane jest reauthentication. Dla danych Klienta PapaData potwierdza z administratorem tenanta, czy działa jako procesor.

## 3. Triage

Ustala się prawo: dostęp, kopia, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw, cofnięcie zgody lub informacja o automatyzacji. Sprawdza się wyjątki, legal hold, prawa innych osób i zakres systemów/podprocesorów.

## 4. Wyszukanie i realizacja

Mapa systemów obejmuje IAM, tenant DB, object storage, logs, support, billing/KSeF, AI conversations/vector stores, analytics, email i podprocesorów. Eksport jest bezpieczny, zrozumiały i przekazywany zweryfikowanym kanałem. Redakcja chroni prawa innych.

## 5. Terminy i komunikacja

Termin i możliwość przedłużenia wynikają z właściwego prawa. System przypomina na `[DNI]`. Odpowiedź wskazuje wykonane działania, podstawę ewentualnego ograniczenia i możliwość skargi. Odmowa wymaga zatwierdzenia Legal/Privacy.

## 6. Dowody

Rejestr przechowuje zakres zapytań, systemy, decyzje, daty, odbiór i potwierdzenia podprocesorów, bez zachowywania nadmiernej kopii danych osoby.
