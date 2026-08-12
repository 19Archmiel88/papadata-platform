---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-P0-004
updated_at: 2026-07-30T15:05:00+02:00
status: approved-target
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# AI lokalne i adaptery providerów

AI musi działać lokalnie bez klucza do płatnego API. Tryb local używa deterministycznego mocka lub lokalnego modelu, który zachowuje ten sam kontrakt odpowiedzi, evidence, confidence, refusal, tool calls i approval flow.

## Adapter

`AiProvider` zawiera: `complete`, `stream`, `embed`, `health`, `estimateCost`, `cancel`. Implementacje: `LocalDeterministicProvider`, opcjonalny `LocalModelProvider` oraz `ExternalLlmProvider`.

## Pliki wymagane

- `config/p0-integrations.env.example`;
- factory providera;
- walidacja konfiguracji przy starcie;
- fixture odpowiedzi i tool calls;
- test zgodności providerów;
- retry, timeout, circuit breaker, limit kosztu i redakcja sekretów;
- telemetry bez treści wrażliwych.

Kod domenowy nie importuje SDK konkretnego LLM. SDK jest zamknięte w adapterze.
