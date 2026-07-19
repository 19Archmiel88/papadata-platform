# Manifest dokumentów

PAPADATA

Manifest dokumentów

Lista plików i zakres pakietu

Tabela:
- Wiersz 1: Kod dokumentu; MANIFEST
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zidentyfikować wszystkie artefakty i umożliwić kontrolę kompletności. [FAKT/ZAKRES]

Zakres: Lista DOCX/PDF, kody, wersje i zakres. [FAKT/ZAKRES]

Poza zakresem: Dowody wdrożenia i historia zmian źródłowych. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

Tabela:
- Wiersz 1: Kod; Dokument; Zakres; DOCX; PDF
- Wiersz 2: A00; Przewodnik; Sposób użycia i governance pakietu; Przewodnik po dokumentacji.docx; —
- Wiersz 3: A01; Architektura produktu; Nadrzędna synteza w 15 sekcjach; Architektura produktu i plan techniczny.docx; —
- Wiersz 4: A02; Mapa domen; Granice odpowiedzialności; Mapa domen i odpowiedzialności.docx; —
- Wiersz 5: A04B; Wspólny system Storybooka; Wspólne zasady historii, fixtures i kontekstu; Wspólny system Storybooka.docx; —
- Wiersz 6: A03; Architektura systemu; Moduły i topologia logiczna; Architektura systemu i modułów.docx; —
- Wiersz 7: A04; Frontend i Storybook; Struktura aplikacji, fixtures, testy UI; Architektura frontendowa i Storybook.docx; —
- Wiersz 8: A05; Backend i API; Warstwy, komendy, joby i kontrakty; Architektura backendu i API.docx; —
- Wiersz 9: A06; Model danych; Encje i relacje; Koncepcyjny model danych.docx; Koncepcyjny model danych.pdf
- Wiersz 10: A07; Dane, jakość i KPI; Pipeline, lineage i readiness; Architektura danych jakości i KPI.docx; Architektura danych jakości i KPI.pdf
- Wiersz 11: A08; Integracje; Connect, sync, retry i recovery; Architektura integracji i synchronizacji.docx; —
- Wiersz 12: A09; Identity i uprawnienia; Tenant, membership, capabilities; Tożsamość role i uprawnienia.docx; —
- Wiersz 13: A10; Bezpieczeństwo; Kontrole, privacy i audyt; Bezpieczeństwo prywatność i audyt techniczny.docx; —
- Wiersz 14: A11; AI; Evidence, governance i human oversight; Architektura AI i analityki decyzyjnej.docx; —
- Wiersz 15: A12; Macierz UI/API; Ekran -> dane -> API -> role; Macierz ekranów procesów danych i API.docx; —
- Wiersz 16: A13; Statusy i zdarzenia; Wspólne kontrakty systemowe; Katalog stanów błędów i zdarzeń.docx; —
- Wiersz 17: A14; MVP; Zakres, odroczenia i bramy; Zakres MVP i plan wydań.docx; —
- Wiersz 18: A15; Implementacja; Testy, CI/CD, operacje i go-live; Plan implementacji testów i operacji.docx; —

## Kontrola kompletności

17 dokumentów merytorycznych + manifest.

Każdy dokument jest dostępny w DOCX; dwa dokumenty danych mają także wersję PDF.

Wersja 1.0, data 18 lipca 2026.

Rozdzielenie faktów, założeń i rekomendacji.

Jeden ZIP, czytelna struktura folderów i tekstowy manifest SHA-256.
