# ADR 0004: NestJS jako framework backendu

## Status

Zaakceptowano.

## Kontekst

Backend PapaData musi utrzymać spójne kontrakty HTTP, walidacje, policy,
audyt, obserwowalność oraz oddzielne procesy BFF, API, workerów i jobów.
Dokumentacja architektury wymaga, aby zaufane decyzje były wykonywane po
stronie backendu, a nie w UI.

## Decyzja

Procesy BFF, API i worker będą budowane na NestJS. Transport HTTP używa
adaptera Fastify. NestJS odpowiada za podział modułowy, dependency injection,
interceptory odpowiedzi, guardy policy, walidacje żądań, integracje
OpenTelemetry oraz wspólne standardy błędów.

Kontrakty z `packages/contracts` są nadrzędne wobec implementacji frameworka.
NestJS nie może wprowadzać typu odpowiedzi ani błędu poza tym standardem.

## Konsekwencje

- Kazdy endpoint backendu uzywa kontraktu `/v1` z `packages/contracts`.
- Logika domenowa nie zależy bezpośrednio od kontrolerów NestJS.
- BFF, API i worker mogą dzielić moduły aplikacyjne, ale zachowują osobne
  granice procesu.
- Instalacja pakietów NestJS nastąpi dopiero w zadaniu lokalnego runtime.
