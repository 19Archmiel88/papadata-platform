import { cleanProductContextPath, productContextKeys } from '@papadata/contracts';
import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductionDatabase } from '@papadata/database';
import { applyDecisionEvent, decisionLocalDay, validDecisionDate, type DecisionContext, type DecisionMutation, type DecisionStore, type DecisionsRegistry } from '@papadata/contracts/decisions';
import { meetsAuthenticationLevel, type RequestPrincipal } from '../auth/request-principal.js';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
function workspaceTimezone(value:string|undefined):string{
  try { if(value){new Intl.DateTimeFormat('en',{timeZone:value}).format();return value;} } catch { /* Invalid legacy profile: documented fallback. */ }
  return 'Europe/Warsaw';
}
function context(value: unknown): DecisionContext | null {
  if (value == null) return null;
  if (!object(value) || typeof value.sourcePath !== 'string' || value.sourcePath.length > 4000) throw new BadRequestException('Nieprawidłowy kontekst decyzji.');
  const sourcePath=cleanProductContextPath(value.sourcePath);
  if(!sourcePath)throw new BadRequestException('Invalid application context.');
  const result:DecisionContext={sourcePath};
  if(value.reportId!=null){if(typeof value.reportId!=='string'||!/^[A-Za-z0-9_.:-]{1,160}$/.test(value.reportId))throw new BadRequestException('Invalid report identifier.');result.reportId=value.reportId;}
  if(value.reportVersion!=null){if(!Number.isSafeInteger(value.reportVersion)||Number(value.reportVersion)<1)throw new BadRequestException('Invalid report version.');result.reportVersion=Number(value.reportVersion);}
  if(value.budgetPlanId!=null){if(typeof value.budgetPlanId!=='string'||!uuid.test(value.budgetPlanId))throw new BadRequestException('Invalid plan identifier.');result.budgetPlanId=value.budgetPlanId;}
  for (const key of ['conversationId','caseThreadId'] as const) {
    if (value[key] != null && (typeof value[key] !== 'string' || !uuid.test(value[key]))) throw new BadRequestException('Nieprawidłowy identyfikator rozmowy/sprawy.');
    result[key] = value[key] as string | null | undefined;
  }
  for (const key of ['from','to'] as const) {
    if (value[key] != null && !validDecisionDate(value[key])) throw new BadRequestException('Nieprawidłowa data kontekstu.');
    result[key] = value[key] as string | null | undefined;
  }
  if (result.from && result.to && result.from > result.to) throw new BadRequestException('Nieprawidłowy zakres dat.');
  if (value.timezone != null) {
    if (typeof value.timezone !== 'string' || value.timezone.length > 100) throw new BadRequestException('Nieprawidłowa strefa czasu.');
    try { new Intl.DateTimeFormat('en', {timeZone: value.timezone}).format(); } catch { throw new BadRequestException('Nieprawidłowa strefa czasu.'); }
    result.timezone = value.timezone;
  }
  if (value.filters != null) {
    if (!object(value.filters)) throw new BadRequestException('Nieprawidłowe filtry.');
    result.filters = {};
    for (const key of productContextKeys) {
      const v = value.filters[key];
      if (typeof v === 'string' && v.length <= 300) result.filters[key] = v;
    }
  }
  return result;
}
function parseMutation(value: unknown): DecisionMutation {
  if (!object(value) || !Number.isSafeInteger(value.expectedVersion) || (value.expectedVersion as number) < 0 || typeof value.decisionId !== 'string' || !uuid.test(value.decisionId) || !object(value.command)) throw new BadRequestException('Nieprawidłowa operacja decyzji.');
  if (JSON.stringify(value).length > 24000) throw new BadRequestException('Operacja przekracza dopuszczalny rozmiar.');
  if (!['create','approve','block','reject','reopen','comment','execute','measure'].includes(String(value.command.type))) throw new BadRequestException('Nieznana operacja decyzji.');
  return { expectedVersion: value.expectedVersion as number, decisionId: value.decisionId, command: value.command as unknown as DecisionMutation['command'], context: context(value.context) };
}
@Injectable()
export class DecisionsService {
  constructor(@Inject(ProductionDatabase) private readonly database: ProductionDatabase) {}
  private registry(principal: RequestPrincipal, store: DecisionStore, version: number, timezone: string): DecisionsRegistry {
    return { ...store, id: `${principal.tenantId}:${principal.workspaceId}`, version, mode: 'server', timezone, sourceDate: decisionLocalDay(new Date(), timezone) };
  }
  async read(principal: RequestPrincipal): Promise<DecisionsRegistry> {
    return this.database.withTenantWorkspace(principal.tenantId, principal.workspaceId, async client => {
      const records = await client.query<{ document: DecisionStore; version: number }>('SELECT document,version FROM app.decision_registries WHERE tenant_id=$1 AND workspace_id=$2', [principal.tenantId, principal.workspaceId]);
      const row = records.rows[0];
      const profile=await client.query<{timezone:string}>('SELECT timezone FROM app.business_profiles WHERE tenant_id=$1 AND workspace_id=$2',[principal.tenantId,principal.workspaceId]);
      const timezone=workspaceTimezone(profile.rows[0]?.timezone);
      return this.registry(principal, row?.document ?? {decisions:[],activity:[]}, row?.version ?? 0, timezone);
    });
  }
  async command(principal: RequestPrincipal, value: unknown): Promise<DecisionsRegistry> {
    const input = parseMutation(value);
    if (['approve','reject','execute','reopen'].includes(input.command.type)) {
      if (!principal.capabilities.includes('ai.action_proposal.approve')) throw new ForbiddenException('Brak uprawnienia ai.action_proposal.approve.');
      if (!meetsAuthenticationLevel(principal, 'step_up', new Date())) throw new ForbiddenException({message:'Potwierdź tożsamość przed zatwierdzeniem lub odnotowaniem wykonania.',requiredAuthLevel:'step_up'});
    }
    // This is a manual decision registry. "execute" records a human-confirmed fact;
    // it cannot authorize or invoke advertising, billing, or any other provider tool.
    return this.database.withTenantWorkspace(principal.tenantId, principal.workspaceId, async client => {
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`decisions:${principal.tenantId}:${principal.workspaceId}`]);
      const records = await client.query<{document: DecisionStore; version: number}>('SELECT document,version FROM app.decision_registries WHERE tenant_id=$1 AND workspace_id=$2 FOR UPDATE', [principal.tenantId, principal.workspaceId]);
      const row = records.rows[0];
      if ((row?.version ?? 0) !== input.expectedVersion) throw new ConflictException('Rejestr zmienił się w innej sesji. Odśwież dane i ponownie oceń operację.');
      const store = row?.document ?? {decisions:[],activity:[]};
      if (input.command.type !== 'create' && !store.decisions.some(d => d.id === input.decisionId)) throw new NotFoundException('Decyzja nie jest dostępna w tym workspace.');
      if (input.command.type === 'create' && store.decisions.length >= 1000) throw new ConflictException('Limit rejestru: 1000 decyzji. Nie zapisano nowej pozycji. Wymagana archiwizacja serwerowa.');
      if (store.activity.length >= 10000) throw new ConflictException('Limit historii rejestru: 10000 zdarzeń. Nie usunięto historii; wymagana archiwizacja serwerowa.');
      if (input.context && input.command.type !== 'create') throw new BadRequestException('Kontekst jest niezmienny po utworzeniu decyzji.');
      for (const key of ['conversationId','caseThreadId'] as const) {
        const id = input.context?.[key];
        if (!id) continue;
        const linked = await client.query<{assistant_thread_id: string}>('SELECT assistant_thread_id FROM app.assistant_threads WHERE tenant_id=$1 AND workspace_id=$2 AND assistant_thread_id=$3 AND ($4::text <> \'caseThreadId\' OR thread_kind=\'case\')', [principal.tenantId, principal.workspaceId, id, key]);
        if (!linked.rowCount) throw new NotFoundException('Rozmowa lub sprawa nie jest dostępna w tym workspace.');
      }
      if(input.context?.reportId){
        const report=await client.query<{document:{versions:{number:number}[]}}>('SELECT document FROM app.saved_reports WHERE tenant_id=$1 AND workspace_id=$2 AND report_id=$3',[principal.tenantId,principal.workspaceId,input.context.reportId]);
        if(!report.rows[0]||input.context.reportVersion&&!report.rows[0].document.versions.some(v=>v.number===input.context!.reportVersion))throw new NotFoundException('Report/version is not available in this workspace.');
      }
      if(input.context?.budgetPlanId){
        const plan=await client.query('SELECT plan_id FROM app.campaign_budget_plans WHERE tenant_id=$1 AND workspace_id=$2 AND plan_id=$3',[principal.tenantId,principal.workspaceId,input.context.budgetPlanId]);
        if(!plan.rowCount)throw new NotFoundException('Plan is not available in this workspace.');
      }
      const profile=await client.query<{timezone:string}>('SELECT timezone FROM app.business_profiles WHERE tenant_id=$1 AND workspace_id=$2',[principal.tenantId,principal.workspaceId]);
      const timezone=workspaceTimezone(profile.rows[0]?.timezone);
      const applied = applyDecisionEvent(store, {id:randomUUID(),decisionId:input.decisionId,command:input.command,context:input.context,actor:principal.userId,at:new Date().toISOString()}, true, timezone);
      if (applied.error) throw new BadRequestException(applied.error);
      const json = JSON.stringify(applied.store);
      if (Buffer.byteLength(json, 'utf8') > 8 * 1024 * 1024) throw new ConflictException('Rejestr przekracza 8 MiB. Nie usunięto danych; wymagana archiwizacja.');
      const nextVersion = (row?.version ?? 0) + 1;
      await client.query(`INSERT INTO app.decision_registries(tenant_id,workspace_id,document,version) VALUES($1,$2,$3::jsonb,$4)
        ON CONFLICT(tenant_id,workspace_id) DO UPDATE SET document=excluded.document,version=excluded.version,updated_at=now()`, [principal.tenantId,principal.workspaceId,json,nextVersion]);
      return this.registry(principal, applied.store, nextVersion, timezone);
    });
  }
}
