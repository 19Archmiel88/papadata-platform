# Sekcja 15 — zasada warstw canvasu i powierzchni danych

Status: obowiązujące dla całej sekcji 15.

## Decyzja właściciela produktu

Wszystkie story sekcji 15 rozdzielają powierzchnię danych od warstw pomocniczych i interpretacyjnych. Obszar wykresu / powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: header danych, źródło, zakres, świeżość, status danych, wykres oraz właściwą legendę wykresu. Legenda jest ostatnim elementem figury wykresu.

Podpowiedzi, wnioski, rekomendacje, insighty, panele decyzyjne, sidecary, toasty, overlaye, komentarze interpretacyjne, następne kroki, ostrzeżenia biznesowe, opisy skutku decyzji, listy obserwacji, opisy legend, horyzonty, pewność zapytania, jakość predykcji i scenariusze są osobnymi warstwami na głównym canvasie. Nie mogą być renderowane jako część geometrii wykresu ani jako dolny panel tej samej ramy wykresu.

Tabela danych jest wyjątkiem operacyjnym: rozwija się płasko pod wykresem, bez dodatkowej powierzchni karty i bez wpływu na wysokość Papa Asystenta ani panelu rekomendacji.

## Wymaganie wizualne

Warstwy interpretacyjne muszą mieć własną głębię i status: border statusowy, powierzchnię pomocniczą, cień warstwy oraz jasną rolę semantyczną.

## Konsekwencja dla audytu

Story 15 nie może zostać zaakceptowane wizualnie, jeżeli podpowiedź, wniosek, rekomendacja, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji znajdują się wewnątrz obszaru wykresu. Tabela danych może rozwinąć się pod wykresem tylko jako płaska alternatywa danych.

## Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Na desktopie domyślnym układem jest prawa szyna canvasu o czytelnej szerokości. Na tablet/mobile warstwa może przejść pod powierzchnię danych, ale nadal pozostaje osobną powierzchnią, a nie dolnym panelem tej samej ramy wykresu. Tabela danych pozostaje płaskim rozwinięciem pod wykresem.
