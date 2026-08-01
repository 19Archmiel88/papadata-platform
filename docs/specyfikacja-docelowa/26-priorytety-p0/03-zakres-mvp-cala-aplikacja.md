---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-003
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Zakres MVP — cała aplikacja

MVP obejmuje całą aplikację, wszystkie moduły, wszystkie usługi i wszystkie procesy end-to-end opisane w dokumentacji: Auth, onboarding, dashboard, kampanie, zamówienia, produkty, klienci, ruch i lejek, jakość danych, AI, raporty, ustawienia, billing, bezpieczeństwo, pomoc i aplikację mobilną.

Jedynym ograniczeniem zakresu funkcjonalnego jest liczba aktywnych integracji:

1. WooCommerce
2. Shopify
3. BaseLinker
4. Allegro
5. Google Ads
6. Meta Ads
7. Google Analytics 4

Każda z siedmiu integracji musi mieć pełny connect, scopes, sync początkowy i przyrostowy, backfill, webhooki gdy dostępne, retry, limity, reconnect, disconnect, monitoring, audyt, recovery i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Nie wolno oznaczać jako „po MVP” funkcji należących do opisanej aplikacji. Dopuszczalne są jedynie ograniczenia skali, liczby rynków, wariantów konfiguracji i providerów.
