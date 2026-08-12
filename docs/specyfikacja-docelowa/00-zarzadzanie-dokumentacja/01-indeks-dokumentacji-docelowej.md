---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-15B90B55403E
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Indeks dokumentacji docelowej

## Zakres

Dokumentacja rozdziela fundamenty, komponenty, wzorce, powierzchnie Auth, ekrany domenowe, przepływy, kontrakty API, security i mobile. Indeks plikowy znajduje się również w `MANIFEST.json`.

## Główne sekcje

- [00-zarzadzanie-dokumentacja](../00-zarzadzanie-dokumentacja/)
- [01-fundamenty](../01-fundamenty/)
- [02-tla-i-powierzchnie](../02-tla-i-powierzchnie/)
- [03-dostep-rejestracja-onboarding](../03-dostep-rejestracja-onboarding/)
- [04-komponenty-bazowe](../04-komponenty-bazowe/)
- [05-wykresy-i-wizualizacje](../05-wykresy-i-wizualizacje/)
- [06-powloka-produktu-i-nawigacja](../06-powloka-produktu-i-nawigacja/)
- [07-centrum-dowodzenia](../07-centrum-dowodzenia/)
- [08-kampanie-platne](../08-kampanie-platne/)
- [09-zamowienia](../09-zamowienia/)
- [10-produkty](../10-produkty/)
- [11-klienci](../11-klienci/)
- [12-ruch-i-lejek](../12-ruch-i-lejek/)
- [13-integracje-i-synchronizacja](../13-integracje-i-synchronizacja/)
- [14-jakosc-danych-i-integralnosc](../14-jakosc-danych-i-integralnosc/)
- [15-papa-asystent-i-laboratorium-ai](../15-papa-asystent-i-laboratorium-ai/)
- [16-ustawienia-zespol-bezpieczenstwo](../16-ustawienia-zespol-bezpieczenstwo/)
- [17-subskrypcja-i-platnosci](../17-subskrypcja-i-platnosci/)
- [18-wsparcie-marketingowe-decyzje-dzialania](../18-wsparcie-marketingowe-decyzje-dzialania/)
- [19-centrum-pomocy](../19-centrum-pomocy/)
- [20-przeplywy-e2e](../20-przeplywy-e2e/)
- [21-stany-przekrojowe](../21-stany-przekrojowe/)
- [22-mapy-i-indeksy](../22-mapy-i-indeksy/)
- [23-bezpieczenstwo-platformy](../23-bezpieczenstwo-platformy/)
- [24-aplikacja-mobilna](../24-aplikacja-mobilna/)
- [25-kontrakty-domenowe-i-api](../25-kontrakty-domenowe-i-api/)
- [26-priorytety-p0](../26-priorytety-p0/)
- [27-pakiet-prawny-i-organizacyjny](../27-pakiet-prawny-i-organizacyjny/)

## Macierze

- [Ekrany](../../../macierze/ekrany.csv)
- [Ekran–komponent](../../../macierze/ekran-komponent.csv)
- [Ekran–dane–API](../../../macierze/ekran-dane-api.csv)
- [Ekran–rola–uprawnienie](../../../macierze/ekran-rola-uprawnienie.csv)
- [Ekran–Storybook–test](../../../macierze/ekran-storybook-test.csv)


## Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

## Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.
