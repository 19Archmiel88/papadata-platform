# Papa Lab Runtime Operations Contract

Version: `papa-lab-runtime-operations.v1`

## Policy

- `papa.*` operations must not fall through to generic `ProductDomainRepository`.
- `papa.ai.action.execute` and `papa.ai.action.rollback` remain blocked external effects.
- Commands require idempotency.
- Queries are tenant/workspace scoped.

## Operations

| Operation | Kind | Idempotency | Effect |
| --- | --- | --- | --- |
| `papa.context.capture` | `command` | `true` | `internal_write` |
| `papa.answer.generate` | `command` | `true` | `provider_read` |
| `papa.answer.read` | `query` | `false` | `read` |
| `papa.context-panel.read` | `query` | `false` | `read` |
| `papa.assistant-shell.read` | `query` | `false` | `read` |
| `papa.observations.read` | `query` | `false` | `read` |
| `papa.observation.save` | `command` | `true` | `internal_write` |
| `papa.history-memory.read` | `query` | `false` | `read` |
| `papa.context-basket.read` | `query` | `false` | `read` |
| `papa.evidence.read` | `query` | `false` | `read` |
| `papa.lab.read` | `query` | `false` | `read` |
| `papa.proposals.read` | `query` | `false` | `read` |
| `papa.governance.read` | `query` | `false` | `read` |
| `papa.actions.read` | `query` | `false` | `read` |
| `papa.action-approval.read` | `query` | `false` | `read` |
| `papa.ai.action.validate` | `command` | `true` | `internal_write` |
| `papa.ai.action.approve` | `command` | `true` | `internal_write` |
| `papa.ai.action.reject` | `command` | `true` | `internal_write` |
| `papa.ai.action.execute` | `blocked` | `true` | `external_effect_blocked` |
| `papa.ai.action.rollback` | `blocked` | `true` | `external_effect_blocked` |
| `papa.ai.notifications.read` | `query` | `false` | `read` |
| `papa.ai.notification.mark-read` | `command` | `true` | `internal_write` |
| `papa.ai.notification.snooze` | `command` | `true` | `internal_write` |
| `papa.ai.notification.unsnooze` | `command` | `true` | `internal_write` |
| `papa.metric-provenance.read` | `query` | `false` | `read` |
| `papa.answer-contract.read` | `query` | `false` | `read` |
| `papa.provider-governance.read` | `query` | `false` | `read` |
| `papa.privacy-redaction.read` | `query` | `false` | `read` |
