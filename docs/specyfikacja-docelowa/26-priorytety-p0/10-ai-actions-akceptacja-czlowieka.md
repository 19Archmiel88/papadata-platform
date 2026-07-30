---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-010
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# AI Actions i obowiązkowa akceptacja człowieka

AI może przygotować zmianę budżetu, statusu kampanii, stawki, harmonogramu lub ustawienia zewnętrznej integracji, lecz nie wykonuje działania o skutku finansowym, operacyjnym, prawnym lub dostępowym bez zatwierdzenia człowieka.

Proces: propozycja → podgląd różnicy → źródła i pewność → symulacja skutku → walidacja aktualnego stanu → sprawdzenie capability i limitów → jawne potwierdzenie → wykonanie z idempotency key → odczyt potwierdzający → audyt → monitoring → rollback lub kompensacja.

Potwierdzenie zapisuje actor, czas, dokładną zmianę, provider, target, przewidywany skutek, ostrzeżenia i treść zgody. Komunikat informuje, że AI przedstawia rekomendację, a użytkownik świadomie zleca wykonanie po zapoznaniu się z ryzykiem. Nie wyłącza to odpowiedzialności PapaData za bezpieczeństwo i poprawne wykonanie usługi.
