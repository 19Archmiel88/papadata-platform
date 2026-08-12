---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-PAPA
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Papa — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `papa.action-approval.read` | `query` | `GET` | `/api/v1/papa/ai-action-approval` | `/v1/papa/ai-action-approval` | `PapaActionApprovalReadRequest` | `PapaActionApprovalReadResponse` |
| `papa.actions.read` | `query` | `GET` | `/api/v1/papa/ai-actions` | `/v1/papa/ai-actions` | `PapaActionsReadRequest` | `PapaActionsReadResponse` |
| `papa.ai.action.approve` | `command` | `POST` | `/api/v1/papa/ai-actions/approve` | `/v1/papa/ai-actions/approve` | `PapaAiActionApproveRequest` | `PapaAiActionApproveResponse` |
| `papa.ai.action.execute` | `job` | `POST` | `/api/v1/papa/ai-actions/execute` | `/v1/papa/ai-actions/execute` | `PapaAiActionExecuteRequest` | `PapaAiActionExecuteResponse` |
| `papa.ai.action.reject` | `command` | `POST` | `/api/v1/papa/ai-actions/reject` | `/v1/papa/ai-actions/reject` | `PapaAiActionRejectRequest` | `PapaAiActionRejectResponse` |
| `papa.ai.action.rollback` | `command` | `POST` | `/api/v1/papa/ai-actions/rollback` | `/v1/papa/ai-actions/rollback` | `PapaAiActionRollbackRequest` | `PapaAiActionRollbackResponse` |
| `papa.ai.action.validate` | `command` | `POST` | `/api/v1/papa/ai-actions/validate` | `/v1/papa/ai-actions/validate` | `PapaAiActionValidateRequest` | `PapaAiActionValidateResponse` |
| `papa.answer.generate` | `command` | `POST` | `/api/v1/papa/answer` | `/v1/papa/answer` | `PapaAnswerGenerateRequest` | `PapaAnswerGenerateResponse` |
| `papa.answer.read` | `query` | `GET` | `/api/v1/papa/odpowiedz-papa` | `/v1/papa/odpowiedz-papa` | `PapaAnswerReadRequest` | `PapaAnswerReadResponse` |
| `papa.assistant-shell.read` | `query` | `GET` | `/api/v1/papa/assistantshell` | `/v1/papa/assistantshell` | `PapaAssistantShellReadRequest` | `PapaAssistantShellReadResponse` |
| `papa.context-basket.read` | `query` | `GET` | `/api/v1/papa/context-basket` | `/v1/papa/context-basket` | `PapaContextBasketReadRequest` | `PapaContextBasketReadResponse` |
| `papa.context-panel.read` | `query` | `GET` | `/api/v1/papa/panel-kontekstowy-papa` | `/v1/papa/panel-kontekstowy-papa` | `PapaContextPanelReadRequest` | `PapaContextPanelReadResponse` |
| `papa.context.capture` | `command` | `POST` | `/api/v1/papa/context/capture` | `/v1/papa/context/capture` | `PapaContextCaptureRequest` | `PapaContextCaptureResponse` |
| `papa.evidence.read` | `query` | `GET` | `/api/v1/papa/dowody` | `/v1/papa/dowody` | `PapaEvidenceReadRequest` | `PapaEvidenceReadResponse` |
| `papa.governance.read` | `query` | `GET` | `/api/v1/papa/ustawienia-ai-i-governance` | `/v1/papa/ustawienia-ai-i-governance` | `PapaGovernanceReadRequest` | `PapaGovernanceReadResponse` |
| `papa.history-memory.read` | `query` | `GET` | `/api/v1/papa/historia-i-pamiec-papa` | `/v1/papa/historia-i-pamiec-papa` | `PapaHistoryMemoryReadRequest` | `PapaHistoryMemoryReadResponse` |
| `papa.lab.read` | `query` | `GET` | `/api/v1/papa/laboratorium-ai` | `/v1/papa/laboratorium-ai` | `PapaLabReadRequest` | `PapaLabReadResponse` |
| `papa.observation.save` | `command` | `POST` | `/api/v1/papa/observations` | `/v1/papa/observations` | `PapaObservationSaveRequest` | `PapaObservationSaveResponse` |
| `papa.observations.read` | `query` | `GET` | `/api/v1/papa/obserwacje` | `/v1/papa/obserwacje` | `PapaObservationsReadRequest` | `PapaObservationsReadResponse` |
| `papa.proposals.read` | `query` | `GET` | `/api/v1/papa/propozycje-ai` | `/v1/papa/propozycje-ai` | `PapaProposalsReadRequest` | `PapaProposalsReadResponse` |
| `papa.read` | `query` | `GET` | `/api/v1/papa/read` | `/v1/papa/read` | `PapaReadRequest` | `PapaReadResponse` |
| `papa.write` | `command` | `POST` | `/api/v1/papa/write` | `/v1/papa/write` | `PapaWriteRequest` | `PapaWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `papa.action-approval.read` | `query` | `PapaActionApprovalReadRequest` | `PapaActionApprovalReadResponse` | `/api/v1/papa/ai-action-approval` | `/v1/papa/ai-action-approval` |
| `papa.actions.read` | `query` | `PapaActionsReadRequest` | `PapaActionsReadResponse` | `/api/v1/papa/ai-actions` | `/v1/papa/ai-actions` |
| `papa.ai.action.approve` | `command` | `PapaAiActionApproveRequest` | `PapaAiActionApproveResponse` | `/api/v1/papa/ai-actions/approve` | `/v1/papa/ai-actions/approve` |
| `papa.ai.action.execute` | `job` | `PapaAiActionExecuteRequest` | `PapaAiActionExecuteResponse` | `/api/v1/papa/ai-actions/execute` | `/v1/papa/ai-actions/execute` |
| `papa.ai.action.reject` | `command` | `PapaAiActionRejectRequest` | `PapaAiActionRejectResponse` | `/api/v1/papa/ai-actions/reject` | `/v1/papa/ai-actions/reject` |
| `papa.ai.action.rollback` | `command` | `PapaAiActionRollbackRequest` | `PapaAiActionRollbackResponse` | `/api/v1/papa/ai-actions/rollback` | `/v1/papa/ai-actions/rollback` |
| `papa.ai.action.validate` | `command` | `PapaAiActionValidateRequest` | `PapaAiActionValidateResponse` | `/api/v1/papa/ai-actions/validate` | `/v1/papa/ai-actions/validate` |
| `papa.answer.generate` | `command` | `PapaAnswerGenerateRequest` | `PapaAnswerGenerateResponse` | `/api/v1/papa/answer` | `/v1/papa/answer` |
| `papa.answer.read` | `query` | `PapaAnswerReadRequest` | `PapaAnswerReadResponse` | `/api/v1/papa/odpowiedz-papa` | `/v1/papa/odpowiedz-papa` |
| `papa.assistant-shell.read` | `query` | `PapaAssistantShellReadRequest` | `PapaAssistantShellReadResponse` | `/api/v1/papa/assistantshell` | `/v1/papa/assistantshell` |
| `papa.context-basket.read` | `query` | `PapaContextBasketReadRequest` | `PapaContextBasketReadResponse` | `/api/v1/papa/context-basket` | `/v1/papa/context-basket` |
| `papa.context-panel.read` | `query` | `PapaContextPanelReadRequest` | `PapaContextPanelReadResponse` | `/api/v1/papa/panel-kontekstowy-papa` | `/v1/papa/panel-kontekstowy-papa` |
| `papa.context.capture` | `command` | `PapaContextCaptureRequest` | `PapaContextCaptureResponse` | `/api/v1/papa/context/capture` | `/v1/papa/context/capture` |
| `papa.evidence.read` | `query` | `PapaEvidenceReadRequest` | `PapaEvidenceReadResponse` | `/api/v1/papa/dowody` | `/v1/papa/dowody` |
| `papa.governance.read` | `query` | `PapaGovernanceReadRequest` | `PapaGovernanceReadResponse` | `/api/v1/papa/ustawienia-ai-i-governance` | `/v1/papa/ustawienia-ai-i-governance` |
| `papa.history-memory.read` | `query` | `PapaHistoryMemoryReadRequest` | `PapaHistoryMemoryReadResponse` | `/api/v1/papa/historia-i-pamiec-papa` | `/v1/papa/historia-i-pamiec-papa` |
| `papa.lab.read` | `query` | `PapaLabReadRequest` | `PapaLabReadResponse` | `/api/v1/papa/laboratorium-ai` | `/v1/papa/laboratorium-ai` |
| `papa.observation.save` | `command` | `PapaObservationSaveRequest` | `PapaObservationSaveResponse` | `/api/v1/papa/observations` | `/v1/papa/observations` |
| `papa.observations.read` | `query` | `PapaObservationsReadRequest` | `PapaObservationsReadResponse` | `/api/v1/papa/obserwacje` | `/v1/papa/obserwacje` |
| `papa.proposals.read` | `query` | `PapaProposalsReadRequest` | `PapaProposalsReadResponse` | `/api/v1/papa/propozycje-ai` | `/v1/papa/propozycje-ai` |
| `papa.read` | `query` | `PapaReadRequest` | `PapaReadResponse` | `/api/v1/papa/read` | `/v1/papa/read` |
| `papa.write` | `command` | `PapaWriteRequest` | `PapaWriteResponse` | `/api/v1/papa/write` | `/v1/papa/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
