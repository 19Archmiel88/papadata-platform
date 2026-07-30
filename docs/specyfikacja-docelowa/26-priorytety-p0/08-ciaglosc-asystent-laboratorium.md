---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-008
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
---

# Ciągłość Papa Asystent i Laboratorium AI

Panel Papa Asystenta i Laboratorium AI są dwiema prezentacjami tego samego wątku, a nie osobnymi czatami.

- przejście do Laboratorium zachowuje `conversationId`;
- zachowane są wiadomości, context basket, tenant/workspace, ekran źródłowy, filtry, daty, metryki, snapshoty, pliki i evidence;
- odpowiedź rozpoczęta w panelu może być kontynuowana w Laboratorium;
- powrót do panelu pokazuje tę samą historię;
- nowy wątek powstaje wyłącznie po jawnej akcji użytkownika;
- odgałęzienie tworzy `parentConversationId`, nie ukryty nowy chat.
