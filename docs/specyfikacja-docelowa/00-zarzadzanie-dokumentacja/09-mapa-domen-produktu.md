---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-56C5E5F6F852
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Mapa domen produktu

| Moduł | ID | Właściciel |
| --- | --- | --- |
| Centrum Dowodzenia | M04 | Decision Intelligence |
| Kampanie płatne | M05 | Paid Media |
| Zamówienia | M06 | Commerce Operations |
| Produkty | M07 | Catalog & Merchandising |
| Klienci | M08 | Customer Intelligence |
| Ruch na stronie i lejek sprzedażowy | M09 | Web Analytics |
| Integracje i synchronizacja | M10 | Data Integrations |
| Jakość danych i integralność | M11 | Data Platform |
| Papa Asystent i Laboratorium AI | M12 | AI Platform |
| Ustawienia, zespół i bezpieczeństwo | M13 | Platform Administration |
| Subskrypcja i płatności | M14 | Billing |
| Wsparcie marketingowe, decyzje i działania | M15 | Decision Operations |
| Centrum Pomocy | M15 | Customer Support |


## Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

## Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.
