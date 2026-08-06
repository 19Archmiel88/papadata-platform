# Changelog migracji backendu

## 2026-08-06

- ustabilizowano typecheck API/BFF/worker/integrations;
- dodano branded constructors dla idempotency i ISO date-time;
- poprawiono DTO i jawne mapowanie requestów integracji;
- wprowadzono jawne Nest DI w kontrolerach, usługach i generatorze;
- dodano test-memory queue driver ograniczony do `NODE_ENV=test`;
- utrzymano secure webhook route z `connectionId`;
- dodano migrated domain policies do `@papadata/contracts`;
- podłączono semantyczne handlery access/billing/data-quality/command-center;
- dodano canonical provider record v2 i testy;
- podłączono normalizację do durable worker/database pipeline;
- zaktualizowano generowany release scope i dokumentację capabilities;
- dołączono bezpiecznie wybrany donor code ze starego backendu, bez sekretów.
