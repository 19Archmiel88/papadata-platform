---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-BILL-712
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Katalog metod płatności MVP

| Metoda | Tryb | Wymaganie |
|---|---|---|
| Karta | jednorazowa i cykliczna | hosted fields, tokenizacja, SCA/3DS, brak PAN/CVV w PapaData |
| BLIK | jednorazowy | kod i potwierdzenie bankowe |
| BLIK powtarzalny | cykliczny | zgoda mandatu, status, anulowanie i bankowa dostępność |
| Szybki przelew | jednorazowy | pay-by-link, callback/webhook i reconciliation |
| Przelew tradycyjny | jednorazowy/abonament B2B | unikalny tytuł/rachunek, reconciliation i termin płatności |
| Apple Pay / Google Pay | jednorazowy/cykliczny zależnie od providera | włączone, gdy provider i urządzenie je wspierają |

UI pokazuje wyłącznie metody faktycznie dostępne dla kraju, waluty, banku i providera, ale provider wybrany dla MVP musi pokrywać kartę, BLIK i przelewy.
