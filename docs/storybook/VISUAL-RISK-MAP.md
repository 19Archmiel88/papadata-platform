# Mapa ryzyk wizualnych

| Ryzyko | Objaw | Kontrola |
| --- | --- | --- |
| Lokalna paleta | Hex poza fundamentami | `pnpm check:css-local-hex` |
| Duplikacja klas | Ten sam selektor w wielu właścicielach bez allowlisty | `pnpm check:css-duplicate-classes` |
| Reflow mobile | Poziomy overflow na 390 px | browser audit Storybooka |
| Niejednolity spacing | Lokalne wartości zamiast tokenów | przegląd CSS i Storybook |
| Niespójne CTA | Link udaje komendę albo button udaje link | runtime API registry |
| Zbyt ciężki ekran | Duży chunk i brak lazy loadingu | build web i analiza chunków |
| Fałszywy status wizualny | PASS techniczny opisany jak akceptacja UI | `OWNER-APPROVAL-CRITERIA.md` |
