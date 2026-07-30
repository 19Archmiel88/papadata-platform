---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-007
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Kreator raportów i eksport

Laboratorium AI umożliwia tworzenie, edycję, duplikowanie i wersjonowanie własnych raportów.

Raport zapisuje: nazwę, opis, właściciela, widoczność, zestaw metryk, `snapshotId`, filtry, okres, segmentacje, układ sekcji, typ każdego wykresu, kolejność, tabelę danych, komentarze i harmonogram.

Użytkownik może wybrać wykres kołowy, liniowy, słupkowy, area, waterfall, tabelę lub kartę KPI. Wybrany typ pozostaje zapisany po ponownym otwarciu. System ostrzega, gdy typ wykresu jest niewłaściwy dla danych, ale nie zmienia go bez zgody.

Eksporty: PDF zachowujący układ wizualny, CSV dla danych każdej sekcji oraz XLSX z arkuszami. Każdy eksport zawiera definicje metryk, okres, filtry, freshness i identyfikator snapshotu.
