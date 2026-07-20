# ADR 0006: PostgreSQL i pg bez ORM

## Status

Zaakceptowano.

## Kontekst

PapaData wymaga jawnej izolacji tenantów i workspace, kontrolowanych migracji,
transakcyjnego outbox, audytu oraz spójnych kontraktów Local, CI i GCP.
Rekomendowany stack wskazywał wcześniej Drizzle ORM, ale aktualna decyzja
architektoniczna wymaga SQL oraz `pg` bez ORM.

## Decyzja

Warstwa persistence uzywa PostgreSQL oraz biblioteki `pg`.

Nie używamy ORM. Zapytania są jawne, z parametrami i opakowane w repozytoria
domenowe. Migracje są plikami SQL uruchamianymi przez osobny proces `migrate`
oraz osobną rolę migracyjną. Runtime aplikacyjny używa osobnej roli o
minimalnych uprawnieniach.

PostgreSQL lokalnie ma zachować tę samą główną wersję co planowany Cloud SQL.
Te same migracje obowiązują w Local, CI i GCP.

## Konsekwencje

- Nie instalujemy Drizzle ORM ani Drizzle Kit.
- Każde zapytanie musi zachować `tenantId` oraz, dla zasobów workspace,
  `workspaceId`.
- Zmiany schematu wymagają testów migracji, kompatybilności i rollback
  evidence.
- Pakiet `packages/database` pozostaje właścicielem kontraktu persistence, ale
  nie ukrywa reguły domenowej w SQL.
