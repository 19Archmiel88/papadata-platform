# 20 - Powłoka produktu i nawigacja

## Rola sekcji

Sekcja `20` jest właścicielem konstrukcji aplikacji, globalnej nawigacji i orkiestracji globalnych warstw. Nie jest właścicielem biznesowej zawartości modułów, komponentów bazowych ani wzorców przekrojowych.

Główna reguła: **shell składa system; shell nie tworzy drugiego design systemu.**

## 20.01 - AppShell

### Pokazuje

- jeden kanoniczny desktopowy AppShell light/dark;
- topbar + sidebar + main content + optional local navigation + data status region + assistant layer + OverlayRoot + toast region;
- jeden jawny właściciel scrolla;
- wariant szerokiej powierzchni analitycznej i kontrolowanej szerokości treści zadaniowej;
- zachowanie przy otwarciu warstwy Papa bez ściskania głównego contentu;
- stan route/workspace bez resetowania zawartości przy zmianie geometrii sidebara.

### Nie pokazuje ponownie

- katalogu przycisków, pól i badge;
- pełnych wzorców empty/error/loading z `18`;
- rodzin wykresów z `15`;
- pełnego Auth.

### Handoff

Promuje decyzję z `05.02 Tło aplikacji` do produkcyjnego kontraktu powłoki. Po akceptacji `20.01`, `05.02` jest decision record, a nie konkurencyjnym AppShellem.

---

## 20.02 - Topbar publiczny

### Pokazuje

- markę;
- publiczne wejścia do logowania/rejestracji;
- language/theme controls, jeśli należą do docelowego kontraktu;
- kontekst zaproszenia bez implementowania samego procesu zaproszenia;
- desktop + compact/mobile composition.

### Granica ownership

`20.02` jest właścicielem **chrome**, nie Auth. Formularz logowania, rejestracja, MFA i zaproszenia należą do `25`.

---

## 20.03 - Topbar zalogowany

### Pokazuje

- canonical order regionów: workspace, search, date/context, language, theme, notifications, profile;
- status otwarcia poszczególnych triggerów;
- sticky opaque topbar bez glass/blur/glow;
- state preservation po otwieraniu globalnych kontrolek.

### Nie dubluje

- pełnego Workspace Switchera (`20.06`);
- Command Palette (`20.07`);
- Notification Center (`20.08`).

W `20.03` te elementy są tylko triggerami i regionami kompozycji.

---

## 20.04 - Sidebar

### Pokazuje

- kanoniczną informację i hierarchię nawigacji;
- wszystkie docelowe pozycje główne i grupę administracyjną;
- current route;
- badge/status;
- no-access i plan-restricted jako stany nawigacji;
- długie nazwy, badge oraz aktywną pozycję;
- logiczne grupowanie pozycji.

### Jedyny ownership

`20.04` jest source of truth dla **treści i informacji nawigacyjnej**, nie dla mechaniki collapse/overlay.

---

## 20.05 - Sidebar - warianty

### Pokazuje wyłącznie mechanikę

- expanded pinned;
- collapsed pinned / rail;
- expanded temporary;
- overlay temporary;
- transition pomiędzy wariantami;
- preservation route/scroll/content state;
- zachowanie przy małej szerokości.

### Nie pokazuje ponownie

Pełnego katalogu nawigacji. Wystarczy reprezentatywny, skrócony zestaw pozycji korzystający z kontraktu `20.04`.

---

## 20.06 - Workspace switcher

### Pokazuje

- aktualny workspace;
- listę dostępnych workspace;
- wyszukiwanie tylko jeśli jest wymagane przy realnej liczbie elementów;
- loading/empty/error/no-access;
- zmianę workspace i zachowanie route/context;
- przypadek wielu tenantów, jeśli shell ma go prezentować.

### Granica ownership

- `20.06` = kontrolka i flow przełączenia w działającej aplikacji;
- `25.09` = rozwiązywanie kontekstu dostępu podczas wejścia/authentication.

Te dwa ekrany nie mogą być kopiami.

---

## 20.07 - Global search i Command Palette

### Pokazuje

- trigger global search;
- otwarcie Command Palette;
- kategorie wyników/komend;
- recent/recommended/empty/loading/error;
- komendy nawigacyjne i operacyjne jako rozdzielone semantycznie wyniki;
- zachowanie query po zmianie kategorii;
- zamknięcie i powrót do kontekstu.

### Nie redefiniuje

`SearchField`, `Listbox`, `Menu`, `Dialog`, `Overlay` ani zachowania bazowych kontrolek.

---

## 20.08 - Powiadomienia

### Pokazuje

- unread/read;
- filtry wszystkie / nieprzeczytane / krytyczne;
- kategorie: system, dane, AI, raporty, billing, wsparcie;
- reprezentatywne alerty danych, integracji, billing, AI, success/error;
- mark read i przejście do źródłowego obiektu;
- empty/loading/error.

### Granica ownership

Story jest właścicielem **centrum powiadomień jako elementu shell**, nie bazowego komponentu komunikatu/notice.

---

## 20.09 - Centrum operacji w tle

### Pokazuje

- aggregated queue z operacjami queued/running/retrying/succeeded/failed/cancelled/expired;
- synchronizację, eksport, raport, reprocessing;
- partial failure;
- retry/cancel tam, gdzie kontrakt domenowy na to pozwala;
- wygasający artefakt eksportu/raportu;
- powiązanie powiadomienia z wynikiem operacji.

### Granica ownership względem 18.03

- `18.03` = wzorzec pojedynczej operacji asynchronicznej i jej stanów;
- `20.09` = globalny shell-level aggregation center wielu operacji.

---

## 20.10 - OverlayRoot i system warstw

### Pokazuje

- jednego globalnego hosta warstw;
- modal stack policy;
- dialog;
- alert dialog;
- drawer;
- bottom sheet;
- popover/menu;
- command palette;
- spotlight tour;
- route-backed workspace/modal;
- scroll lock;
- Escape/close policy;
- poprawny powrót do kontekstu po zamknięciu.

### Kluczowa granica

`20.10` **nie jest katalogiem komponentów overlay**. Dialog/Drawer/Popover są implementacjami bazowymi/patternami. `20.10` jest właścicielem ich globalnej orkiestracji: stacking, host, kolejność, konflikt warstw, routing i scroll ownership.

---

## 20.11 - Powłoka mobilna

### Pokazuje

- mobile topbar;
- mobile navigation;
- sidebar jako drawer;
- safe areas;
- bottom sheet jako mobile adaptation właściwej warstwy;
- mobile reflow AppShell;
- zachowanie workspace/search/notifications na małej szerokości;
- brak poziomego scrolla shell-level.

### Nie pokazuje

Osobnych mobilnych wersji wszystkich komponentów. Jest to adaptacja **powłoki**, a nie drugi mobile design system.

---

# Krytyczne ryzyka sekcji 20

1. `20.04` i `20.05` łatwo zduplikować - należy pilnować rozdziału IA vs mechanika.
2. `20.09` nie może stać się kopią `18.03`.
3. `20.10` nie może przejąć ownership komponentów Dialog/Drawer/Popover.
4. `20.02` nie może kopiować ekranów Auth z `25`.
5. `20.06` nie może kopiować access-resolution z `25.09`.
6. `20.01` nie może kopiować laboratorium `05.02`; powinien być jego produkcyjnym handoffem.
7. Shell nie może wprowadzać własnych kolorów, shadow, radius, spacing ani lokalnych zamienników tokenów Fundamentów.
