---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-007
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Kreator raportów i eksport

Laboratorium AI umożliwia tworzenie, edycję, duplikowanie i wersjonowanie własnych raportów.

Raport zapisuje: nazwę, opis, właściciela, widoczność, zestaw metryk, `snapshotId`, filtry, okres, segmentacje, układ sekcji, typ każdego wykresu, kolejność, tabelę danych, komentarze i harmonogram.

Użytkownik może wybrać wykres kołowy, liniowy, słupkowy, area, waterfall, tabelę lub kartę KPI. Wybrany typ pozostaje zapisany po ponownym otwarciu. System ostrzega, gdy typ wykresu jest niewłaściwy dla danych, ale nie zmienia go bez zgody.

Eksporty: PDF zachowujący układ wizualny, CSV dla danych każdej sekcji oraz XLSX z arkuszami. Każdy eksport zawiera definicje metryk, okres, filtry, freshness i identyfikator snapshotu.

## Eksport raportu, sekcji i tabeli

Dokumentacja rozróżnia trzy zakresy eksportu:

- eksport całego raportu
- eksport sekcji raportu
- eksport pojedynczej tabeli

Eksport pojedynczej tabeli obsługuje formaty PDF, CSV i XLSX. Dostępne są dwie jawne opcje:

- „Eksportuj widoczne kolumny”
- „Eksportuj wszystkie kolumny”

Opcją domyślną i rekomendowaną jest „Eksportuj widoczne kolumny”. Uwzględnia ona kolumny aktualnie widoczne, ich aktualną kolejność prezentacji, aktywne filtry, aktualne sortowanie, zakres dat, źródło, świeżość oraz identyfikator snapshotu, jeżeli dotyczy.

Ponieważ zmiana kolejności kolumn nie jest obecnie zatwierdzona, aktualna kolejność prezentacji oznacza kolejność wynikającą z istniejącej konfiguracji tabeli. Ukryte kolumny są pomijane tylko przy opcji „Eksportuj widoczne kolumny”.

Opcja „Eksportuj wszystkie kolumny” obejmuje także kolumny aktualnie ukryte, ale wyłącznie w bezpiecznym zakresie: wszystkie dozwolone i eksportowalne kolumny należące do aktualnego zestawu danych tabeli, dostępne dla aktualnego użytkownika oraz dopuszczone do prezentacji i eksportu przez capability oraz politykę danych. Nie obejmuje pól technicznych backendu, kolumn niedostępnych dla użytkownika ani danych wyłączonych z eksportu. PII, sekrety i dane chronione są wykluczone, jeśli nie zostały jawnie dopuszczone do eksportu; dane osobowe mogą trafić do eksportu tylko wtedy, gdy należą do aktualnego zestawu danych tabeli, użytkownik ma właściwe capability, a polityka danych jawnie pozwala na eksport. Opcja nie zmienia konfiguracji widoku użytkownika.

Ukrycie kolumny nie zmienia modelu danych, schematu, danych źródłowych ani uprawnień. Wpływa wyłącznie na aktualny widok oraz eksport widocznych kolumn.
