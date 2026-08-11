# 18 - Wzorce i stany przekrojowe

Storybook display title: `Wzorce interfejsu`

Story class: `pattern`

Owner: `Product UI`

## Cel sekcji

Sekcja pokazuje jak istniejace komponenty skladaja sie w powtarzalne zachowania produktu. Nie tworzy nowych prymitywow wizualnych, jesli istnieja juz w sekcji 00 lub 15.

Kazdy wzorzec musi miec jednego ownera i byc niezalezny od konkretnej domeny biznesowej.

## 18.01 - Uklad strony i sekcji

Wlasciciel struktury typowego workspace/page content, ale NIE AppShell.

Powinien pokazac:
- page header;
- kontekst i metadata;
- primary/secondary actions;
- sekcje tresci;
- lokalne tabs/filters;
- wariant jedna kolumna / dwie kolumny;
- gestosc comfortable/compact;
- zachowanie na waskim viewport.

Nie zawiera topbara ani sidebara aplikacji - to nalezy do 20.

## 18.02 - Routing feedbacku

Wlasciciel koncowych stanow uzytkownika i recovery.

Osobne warianty:
- first-use empty;
- filtered empty;
- no results;
- recoverable error;
- terminal error;
- offline/unavailable;
- permission denied;
- plan restricted;
- deleted/not found.

Kazdy wariant powinien miec jednoznaczny powod, skutek i dostepna akcje naprawcza, jezeli recovery jest mozliwe.

## 18.03 - Ladowanie danych i operacje w tle

Wlasciciel stanow CZASOWYCH, a nie finalnych bledow.

Zakres:
- initial loading;
- inline loading;
- processing;
- retrying;
- background operation;
- queued;
- progress known/unknown;
- success transition;
- cancellation, jezeli operacja to wspiera.

Rozdziela page loading od lokalnego loadingu komponentu.

## 18.04 - Tabela z filtrami i akcjami

To PATTERN kompozycyjny, nie nowy DataTable.

Konsumuje:
- runtime DataTable;
- akcje, pola i kontrolki zgodne z 00;
- Pagination;
- selection;
- bulk actions;
- DetailPanel.

Powinien pokazac:
- filtracje;
- sortowanie;
- selection;
- akcje pojedyncze i bulk;
- reset filtrow;
- empty after filter;
- detail handoff;
- responsive reflow bez kopiowania implementacji tabeli.

## 18.05 - Potwierdzenia i operacje destrukcyjne

Wlasciciel wzorca confirmation.

Zakres:
- zwykle potwierdzenie;
- destructive confirmation;
- typed confirmation tylko dla wysokiego ryzyka;
- processing;
- failure i retry;
- success/close;
- nieodwracalna operacja;
- operacja z konsekwencja dla danych/integracji.

Konsumuje AlertDialog/Dialog i Button. Nie tworzy nowego dialog componentu.

## 18.06 - Approval, step-up i ochrona zmian

Inny problem niz 18.05.

18.05 odpowiada: `czy na pewno chcesz wykonac te operacje?`

18.06 odpowiada: `czy masz wymagany poziom uprawnien/uwierzytelnienia/akceptacji, aby ja wykonac?`

Zakres:
- approval required;
- second approver;
- step-up authentication;
- protected setting change;
- expired approval;
- rejected approval;
- read-only while awaiting approval.

## 18.07 - Panele szczegolow, dowodow i rekomendacji

Wlasciciel sposobu OTWIERANIA i SKLADANIA warstwy szczegolu.

Konsumuje komponenty domenowe:
- DetailPanel;
- EvidencePanel;
- RecommendationCard;
- DecisionCard.

Powinien pokazac:
- handoff z tabeli/wykresu/KPI;
- focus/return context;
- nested detail tylko wtedy, gdy jest kontrolowany;
- porownanie detail vs evidence vs recommendation;
- miejsce primary action;
- zachowanie mobile jako warstwa/pelny ekran.

Nie definiuje ponownie wygladu EvidencePanel/RecommendationCard.

## 18.08 - Readiness operacyjny

Wlasciciel komunikacji gotowosci danych na poziomie WIDOKU lub WORKFLOW.

Zakres:
- ready;
- partial;
- stale;
- syncing;
- conflict;
- provider problem;
- processing/rebuild;
- unavailable;
- blocked by missing integration.

Granica z 15.08:
- `15.08` okresla rendering analitycznego komponentu;
- `18.08` okresla gotowość operacyjną procesu/widoku przez użycie `StatusBadge` i `InlineNotice` z 00; nie tworzy drugiego słownika statusów.

## 18.09 - Formularze zlozone i kreatory

Wlasciciel kompozycji wieloetapowych formularzy.

Zakres:
- sectioned form;
- multi-step wizard;
- validation summary;
- server validation;
- save draft;
- dirty state;
- back/next;
- final review;
- submit processing;
- partial failure;
- resume flow.

Konsumuje pola i kontrolki zgodne z 00.15. Nie implementuje nowych inputow.

## 18.10 - Macierz stanow przekrojowych

To story REFERENCYJNA, nie kolejny komponent.

Powinna byc jedna tabela/mapa pokazujaca, ktory wzorzec jest wlascicielem stanu:
- loading;
- processing;
- empty;
- no results;
- partial;
- stale;
- error;
- no access;
- plan restricted;
- offline;
- approval pending;
- destructive confirmation;
- success;
- background operation.

Jej glowna rola: zapobiegac tworzeniu kolejnych lokalnych wariantow tych samych stanow w ekranach domenowych.

## Czego sekcja 18 nie powinna zawierac

- nowych Button/Input/Select/Dialog;
- AppShell/sidebar/topbar;
- pelnych ekranow domenowych;
- duplikatu DataTable;
- duplikatu ChartFrame/MetricCard;
- implementacji logiki auth lub AI;
- ozdobnych laboratoriów wizualnych.
