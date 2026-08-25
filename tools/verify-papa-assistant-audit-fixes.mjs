import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
let failures = 0;

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function pass(label) {
  console.log(`PASS  ${label}`);
}

function fail(label, detail = '') {
  failures += 1;
  console.error(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
}

function expect(label, condition, detail = '') {
  condition ? pass(label) : fail(label, detail);
}

function contains(path, needle) {
  return read(path).includes(needle);
}

function notContains(path, needle) {
  return !contains(path, needle);
}

const papaScreen = 'apps/web/src/screens/papa/PapaScreen.tsx';
const sidecar = 'apps/web/src/shell/papa-assistant/PapaAssistantSidecar.tsx';
const runtime = 'apps/web/src/shell/papa-assistant/PapaAssistantRuntimeContext.tsx';
const panels = 'apps/web/src/screens/papa/PapaAssistantPanels.tsx';
const conversation = 'apps/web/src/screens/papa/PapaConversationWorkspace.tsx';
const workspace = 'apps/web/src/screens/papa/PapaWorkspace.tsx';
const pageHeader = 'apps/web/src/design-system/components/Domain/PageHeader/PageHeader.tsx';
const backend = 'apps/api/src/production/contract-runtime/papa-conversation.real-source.ts';
const service = 'apps/api/src/production/contract-runtime/contract-runtime.service.ts';
const database = 'packages/database/src/production.ts';
const migration = 'packages/database/migrations/0024_papa_conversation_integrity.sql';

expect(
  'runtime PapaScreen nie korzysta ze Storybook fixtures',
  notContains(papaScreen, 'createPapaStorybookData'),
);
expect(
  'sidecar nie korzysta ze Storybook fixtures',
  notContains(sidecar, 'createPapaStorybookData'),
);
expect(
  'runtime używa modelu danych z realnego kontekstu',
  contains(papaScreen, 'createPapaRuntimeData'),
);
expect(
  'localStorage jest scopeowany tenant/workspace/user',
  contains(runtime, 'papadata.papa-assistant-runtime.v4')
    && contains(runtime, 'scope.tenantId')
    && contains(runtime, 'scope.workspaceId')
    && contains(runtime, 'scope.userId'),
);
expect(
  'localStorage nie utrwala wiadomości/snapshotów/raportów',
  contains(runtime, 'type StoredPapaRuntimeState')
    && !/type StoredPapaRuntimeState[\s\S]*?readonly messages:/u.test(read(runtime))
    && !/type StoredPapaRuntimeState[\s\S]*?readonly reports:/u.test(read(runtime))
    && !/type StoredPapaRuntimeState[\s\S]*?readonly lastSnapshot:/u.test(read(runtime)),
);
expect(
  'capture błędu nie jest połykany',
  contains(runtime, 'throw error;') && contains(runtime, 'mainError: message'),
);
expect(
  'case thread jest jawnie tworzony przez capture z parentConversationId',
  contains(runtime, 'ensureCaseThread')
    && contains(runtime, 'parentConversationId: mainConversationId')
    && contains(runtime, 'caseElementId: elementId'),
);
expect(
  'case click wybiera właściwy element',
  contains(conversation, 'openCaseThread(thread.elementId)')
    && contains(conversation, 'initialElementId={selectedCaseElementId'),
);
expect(
  'wąski rail kontekstu nie używa DataTable',
  notContains(conversation, '<DataTable'),
);
expect(
  'główny runtime używa kompaktowego readiness strip',
  contains(workspace, 'PapaAssistantReadinessStrip')
    && notContains(workspace, '<PapaAssistantStatusPanel'),
);
expect(
  'rekomendacje nie zapisują fikcyjnej lokalnej akceptacji',
  notContains(panels, 'setFeedback')
    && contains(panels, 'trybie tylko do odczytu'),
);
expect(
  'Laboratorium nie renderuje pustego fikcyjnego wykresu eksperymentów',
  contains(panels, 'Brak utrwalonych eksperymentów')
    && contains(panels, "data.labExperiments.length === 0"),
);
expect(
  'fake browser PDF został usunięty',
  notContains(runtime, 'buildPdfBlob')
    && notContains(runtime, "normalize('NFD')")
    && contains(panels, 'PDF niedostępny')
    && contains(sidecar, 'PDF niedostępny'),
);
expect(
  'raport CSV korzysta z backend reports API',
  contains(runtime, 'bffClient.createPapaReport')
    && contains(runtime, 'bffClient.getPapaReportDownload'),
);
expect(
  'PageHeader korzysta z kanonicznego Breadcrumbs',
  contains(pageHeader, "from '../../Breadcrumbs'")
    && contains(pageHeader, '<Breadcrumbs'),
);
expect(
  'backend odpowiedzi ładuje snapshot do grounding',
  contains(backend, 'findLatestSnapshot')
    && contains(backend, 'buildGroundingContext')
    && contains(backend, 'buildSystemGroundingPrompt'),
);
expect(
  'backend przekazuje grounding + historię do providera',
  contains(backend, 'providerMessages')
    && contains(backend, 'historyRows')
    && contains(backend, 'role: "system"'),
);
expect(
  'backend odmawia odpowiedzi bez użytecznego grounding',
  contains(backend, 'EVIDENCE_UNAVAILABLE')
    && contains(backend, 'DATA_NOT_READY')
    && contains(backend, 'isGroundingUsable'),
);
expect(
  'Papa commands wymagają Idempotency-Key',
  contains(service, 'requireIdempotencyKey(request)')
    && (read(service).match(/requireIdempotencyKey\(request\)/gu)?.length ?? 0) >= 3,
);
expect(
  'repozytorium ma idempotentne thread/message/snapshot writes',
  contains(database, 'creation_idempotency_key')
    && contains(database, 'findMessageByIdempotencyKey')
    && contains(database, 'on conflict (tenant_id, workspace_id, assistant_thread_id, role, idempotency_key)')
    && contains(database, 'on conflict (tenant_id, workspace_id, assistant_thread_id, idempotency_key)'),
);
expect(
  'migracja dodaje scoped idempotency indexes',
  contains(migration, 'assistant_threads_scope_creation_idempotency_unique')
    && contains(migration, 'assistant_messages_scope_idempotency_unique')
    && contains(migration, 'assistant_context_snapshots_scope_idempotency_unique'),
);
expect(
  'migracja wymusza same-scope FK parent/message/snapshot/evidence',
  contains(migration, 'assistant_threads_parent_same_scope_fk')
    && contains(migration, 'assistant_messages_thread_same_scope_fk')
    && contains(migration, 'assistant_context_snapshots_thread_same_scope_fk')
    && contains(migration, 'assistant_evidence_message_same_scope_fk'),
);
expect(
  'external AI execute/rollback pozostają zidentyfikowane jako efekty zewnętrzne',
  contains(service, 'papa.ai.action.execute')
    && contains(service, 'papa.ai.action.rollback')
    && contains(service, 'isExternalAiEffect'),
);

if (failures > 0) {
  console.error(`\nPapa audit fix verifier: ${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log('\nPapa audit fix verifier: all checks passed.');
}
