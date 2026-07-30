---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
title: Storybook target backlog 1.0
type: storybook-backlog
status: approved-target
---

# Storybook target backlog 1.0

W paczce nie ma już 129 identycznych scaffoldów `.stories.tsx`. Poprzednie pliki były markerami planu, a nie prawdziwymi stories ekranów. Obecny kontrakt zachowuje targety w `macierze/ekran-storybook-test.csv` jako backlog.

Warunek utworzenia story:

1. istnieje komponent lub kompozycja ekranu;
2. istnieje fixture danych;
3. story importuje realny element albo mock screen shell;
4. story zawiera stany: ready, loading, empty, partial, error, restricted;
5. story ma `play` test dla ścieżki klawiatury i głównej akcji;
6. story przechodzi a11y/viewport/light/dark.
