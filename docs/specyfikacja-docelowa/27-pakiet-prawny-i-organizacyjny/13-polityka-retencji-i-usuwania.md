---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-013
updated_at: 2026-07-30T15:05:00+02:00
status: legal-template
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Polityka retencji, eksportu i usuwania danych

> **Status dokumentu:** `legal-template`, nie `accepted-production`. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zasady

Retencja jest oparta na celu, umowie, prawie, bezpieczeństwie i minimalizacji. Każda klasa ma ownera, system źródłowy, okres aktywny, okres po umowie, backup TTL, legal hold i metodę usunięcia. Brak wartości nie oznacza retencji bezterminowej.

## 2. Macierz do uzupełnienia

| Klasa | Przykład | Aktywna retencja | Po zakończeniu | Backup | Podstawa/owner |
|---|---|---|---|---|---|
| konto i membership | user, role | okres umowy | `[X]` | `[X]` | Product/Legal |
| dane integracji | orders, ads, GA4 | wg Planu | okno eksportu + `[X]` | `[X]` | Data Owner |
| snapshoty metryk | KPI/evidence | `[X]` | `[X]` | `[X]` | Analytics |
| rozmowy AI | messages/cases | ustawienie `[X]` | `[X]` | `[X]` | AI Governance |
| audyt bezpieczeństwa | access/actions | `[X]` | `[X]` | `[X]` | Security |
| billing/KSeF | faktury/UPO | okres prawny | okres prawny | `[X]` | Finance |
| support | tickets/files | `[X]` | `[X]` | `[X]` | Support |

## 3. Zakończenie umowy

Po rozwiązaniu status tenanta przechodzi do `export_window`. Owner może pobrać eksport przez `[DNI]`. Po terminie uruchamiany jest job usunięcia i lista wyjątków. Potwierdzenie zawiera zakres, czas, systemy, backup expiry i nierozwiązane legal hold.

## 4. Legal hold

Uprawniona rola może wstrzymać usunięcie wyłącznie na udokumentowanej podstawie, z zakresem i datą przeglądu. Dane są ograniczone, a dostęp audytowany. Hold nie rozszerza użycia danych.

## 5. Usunięcie i anonimizacja

Usunięcie obejmuje dane aktywne, indeksy, cache, wyszukiwarki, pliki, wektory i podprocesorów. Anonimizacja musi być nieodwracalna w rozsądnie przewidywalnych warunkach. Soft delete nie jest końcowym usunięciem.

## 6. Testy

Kwartalny test obejmuje losowy tenant testowy, śledzenie przez lineage, backup expiry i dowód providera. Odchylenia trafiają do remediation.
