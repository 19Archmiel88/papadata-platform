---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-006
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Aplikacja mobilna — owner, sklepy i QR

Sekcja `Ustawienia → Aplikacja mobilna` jest dostępna tylko dla `Tenant Owner` lub jawnego capability `mobile.distribution.manage`.

Ekran zawiera trzy niezależne mechanizmy:

- smart QR do pobrania aplikacji, kierujący urządzenie do App Store albo Google Play;
- jawne przyciski App Store i Google Play dla desktopu;
- jednorazowy QR parowania istniejącego konta z urządzeniem.

QR sklepu nie zawiera tokenu konta. QR parowania jest krótkotrwały, jednorazowy, przypisany do tenant/workspace i wymaga potwierdzenia użytkownika. Owner widzi listę sparowanych urządzeń i może je odwołać.
