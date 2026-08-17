---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-15DCD8C788C7
status: approved-target
updated_at: 2026-08-17T11:15:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Sidebar

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.04 |
| Nazwa polska | Sidebar |
| Nazwa techniczna | sidebar |
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

Sidebar zawiera główną nawigację i workspace switcher, nie filtruje pojedynczego modułu.

## Wymagania normatywne

- 12 jawnych pozycji i grupa administracyjna
- aktywny route oraz badge nie tylko kolorem
- brak dostępu i ograniczenie planu mają opis
- rail ma tooltipy i accessible names
- Centrum Dowodzenia
- Kampanie płatne
- Zamówienia
- Produkty
- Klienci
- Ruch na stronie
- Laboratorium Papa Asystenta
- Integracje
- Ustawienia
- Subskrypcja i płatności
- Wsparcie w marketingu
- Centrum Pomocy.

## Anatomia i odpowiedzialność

```text
Sidebar
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

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

## Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

## Storybook i testy

Title: `20 Powłoka/Sidebar`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

## Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

## Specyfikacja opisowa ekranu 1.0

### Cel użytkownika

**Sidebar** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

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


## Aktualizacja normatywna 2026-08-17 — Sidebar bez scrolla

Desktopowy Sidebar nie posiada własnego pionowego scrolla. `overflow-y: auto` nie jest dopuszczalnym sposobem ratowania układu na małej wysokości.

Kolejność adaptacji wysokości:

1. expanded / comfortable,
2. expanded / compact density,
3. collapsed rail dla niskiego viewportu,
4. mobile Drawer zgodnie z kontraktem mobile.

Zmiana density lub rail nie zmienia IA, kolejności ani dostępności funkcji. Aktywny route pozostaje jednoznaczny, a collapsed rail zachowuje dostępne nazwy elementów.

## Dolna strefa sidebara

W desktopowym AppShell nawigacja zajmuje przewijalny obszar główny, a kontekst runtime jest przypięty do dołu kolumny. Dolna strefa utrzymuje kolejno status danych z bieżącą lokalną datą i godziną, aktywny workspace oraz kontrolkę `Zwiń` / `Rozwiń`. Kontrolka zwijania nie należy do listy nawigacyjnej `Sidebar`; jej właścicielem jest powłoka produktu.

W wariancie collapsed dolna strefa redukuje copy, ale zachowuje dostępne nazwy i stan przez semantykę kontrolek. Układ nie może wymuszać poziomego scrolla.
