---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-2AA10A23D49D
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Macierz ekran–rola–uprawnienie

Źródło: [CSV](../../../macierze/ekran-rola-uprawnienie.csv). Role są prezentacją administracyjną; backend egzekwuje capabilities.


## Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

## Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.
