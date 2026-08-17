---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-89B266D16BC6
status: approved-target
updated_at: 2026-08-17T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Topbar zalogowany

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.03 |
| Nazwa polska | Topbar zalogowany |
| Nazwa techniczna | topbar-zalogowany |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Decyzja docelowa

Topbar zalogowany pokazuje globalny kontekst i kontrolki, nie akcje lokalnego modułu.

## Wymagania normatywne

- kolejność: brand/section context, global search, date, Papa, notifications, account
- workspace pozostaje globalnym kontekstem shella i jest zmieniany przez WorkspaceSwitcher poza Topbarem
- język i motyw należą do Account Panelu, nie do stałej anatomii authenticated Topbara
- brak stałego generatora raportu
- sticky Dark Crystal surface: ciemna, czytelna, z kontrolowaną przezroczystością, refrakcją i backdrop blur
- każdy overlay przywraca fokus
- aktualny workspace
- zakres dat
- global search
- powiadomienia
- user menu
- status danych
- dostęp do Papa
- mobile.

## Anatomia i odpowiedzialność

```text
Topbar zalogowany
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

## Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

## Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do paneli shella. Język i motyw pozostają osiągalne przez Account Panel; wyszukiwanie i profil zachowują stałe punkty wejścia. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

## Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

## Storybook i testy

Title: `20 Powłoka/Topbar zalogowany`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

## Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Topbar i shell-owned overlays stosują jeden Dark Crystal contract; blur/refrakcja są kontrolowane, a przypadkowy neonowy glow i lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

## Specyfikacja opisowa ekranu 1.0

### Cel użytkownika

**Topbar zalogowany** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


## Aktualizacja normatywna 2026-08-17 — authenticated Topbar i Account Panel

Ta decyzja **zastępuje** starszy zapis wymagający stałych kontrolek `language` i `theme` w authenticated Topbarze oraz starszy zakaz blur/glow dla powłoki.

Docelowa anatomia authenticated Topbara:

`brand + section context → global search → date range → Papa → notifications → account`.

- język i motyw należą do Account Panelu;
- Account Panel jest centrum preferencji i konta użytkownika, ale nie jest drugim Sidebarem;
- Account Panel zawiera: tożsamość/rolę, Konto i bezpieczeństwo, Sesje i urządzenia, Język, Motyw, Operacje w tle, Centrum Pomocy i Wyloguj;
- shell-owned Calendar, Notification Center i Account Panel zawsze używają Dark Crystal Shell również przy jasnym workspace;
- kontrolowana przezroczystość, blur, refrakcyjne obramowania i światło są dozwolone, jeśli zachowują czytelność i wspólny kontrakt tokenów;
- nie używamy przypadkowego neonowego glow ani lokalnych efektów nieposiadających właściciela w shellu;
- wszystkie warstwy zachowują minimum keyboard/focus/Escape/focus restore.

Kryterium akceptacji: authenticated Topbar nie pokazuje osobnych kontrolek języka i motywu, a obie funkcje są dostępne w Account Panelu bez utraty stanu aplikacji.
