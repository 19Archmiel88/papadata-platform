import { projectBusinessReport, projectOrdersReport, projectProductsReport, commerceOrderTotals, commerceProductTotals } from '@papadata/contracts';
import { CommerceService } from '../commerce/commerce.service.js';
import { BusinessOverviewService } from '../commerce/business-overview.service.js';
import { DecisionsService } from '../decisions/decisions.service.js';
import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationRepository, ProductionDatabase } from '@papadata/database';
import {
  applyReportCommand, parseReportCommand, parseReportsStore, reportConfigError,
  validReportConfig, validSnapshot,
  type ReportConfig, type ReportContext, type ReportSnapshot, type ReportsStore, type SavedReport,
} from '@papadata/contracts/saved-reports';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { buildLiveReportSnapshot } from './saved-reports.snapshot.js';

@Injectable()
export class SavedReportsService {
  constructor(@Inject(ProductionDatabase) private readonly database: ProductionDatabase) {}

  private async validateContext(principal:RequestPrincipal,context:ReportContext|null|undefined):Promise<void>{
    if(!context)return;
    await this.database.withTenantWorkspace(principal.tenantId,principal.workspaceId,async client=>{
      for(const key of ['conversationId','caseThreadId'] as const){
        const id=context[key];if(!id)continue;
        if(!/^[a-f0-9-]{36}$/i.test(id))throw new BadRequestException('Invalid conversation identifier.');
        const rows=await client.query('SELECT assistant_thread_id FROM app.assistant_threads WHERE tenant_id=$1 AND workspace_id=$2 AND assistant_thread_id=$3 AND ($4::text<>\'caseThreadId\' OR thread_kind=\'case\')',[principal.tenantId,principal.workspaceId,id,key]);
        if(!rows.rowCount)throw new NotFoundException('Conversation/case is not available in this workspace.');
      }
      if(context.budgetPlanId){
        if(!/^[a-f0-9-]{36}$/i.test(context.budgetPlanId))throw new BadRequestException('Invalid plan identifier.');
        const rows=await client.query('SELECT plan_id FROM app.campaign_budget_plans WHERE tenant_id=$1 AND workspace_id=$2 AND plan_id=$3',[principal.tenantId,principal.workspaceId,context.budgetPlanId]);
        if(!rows.rowCount)throw new NotFoundException('Plan is not available in this workspace.');
      }
      if(context.decisionId){
        const rows=await client.query('SELECT 1 FROM app.decision_registries r CROSS JOIN LATERAL jsonb_array_elements(r.document->\'decisions\') d WHERE r.tenant_id=$1 AND r.workspace_id=$2 AND d->>\'id\'=$3',[principal.tenantId,principal.workspaceId,context.decisionId]);
        if(!rows.rowCount)throw new NotFoundException('Decision is not available in this workspace.');
      }
    });
  }
  async read(principal: RequestPrincipal): Promise<ReportsStore> {
    return this.database.withTenantWorkspace(principal.tenantId, principal.workspaceId, async (client) => {
      const rows = await client.query<{ document: SavedReport; favorite: boolean }>(
        `SELECT r.document, EXISTS (SELECT 1 FROM app.saved_report_favorites f
           WHERE f.tenant_id=r.tenant_id AND f.workspace_id=r.workspace_id
             AND f.report_id=r.report_id AND f.user_id=$3) AS favorite
         FROM app.saved_reports r WHERE r.tenant_id=$1 AND r.workspace_id=$2
         ORDER BY r.updated_at DESC, r.report_id`,
        [principal.tenantId, principal.workspaceId, principal.userId],
      );
      return { schema: 1, workspace: principal.workspaceId, reports: rows.rows.map(r => ({ ...r.document, favorite: r.favorite })) };
    });
  }

  private async buildSnapshot(principal:RequestPrincipal,config:ReportConfig):Promise<ReportSnapshot> {
    if(!['overview','orders','products','inventory'].includes(config.template))return buildLiveReportSnapshot(principal,config,new IntegrationRepository(this.database));
    const origin=new URL(config.context?.sourcePath??'/app','https://context.invalid').searchParams;
    const query:Record<string,unknown>={from:config.from,to:config.to,timezone:config.timezone??'Europe/Warsaw',sourceId:origin.get('sourceId'),currency:origin.get('currency')};
    const commerce=new CommerceService(this.database);
    if(config.template==='overview') {
      const data=await new BusinessOverviewService(commerce,this.database,new DecisionsService(this.database)).read(principal,{...query,compare:origin.get('compare')??'previous'});
      if(!data.meta.sourceId||!data.meta.currency)throw new BadRequestException('Wybierz zrodlo i walute w Centrum Dowodzenia, a nastepnie przygotuj raport.');
      return projectBusinessReport(data,config);
    }
    if(config.template==='orders') {
      if(config.filter!=='all')query.provider=config.filter==='WooCommerce'?'woocommerce':config.filter==='BaseLinker'?'baselinker':config.filter;
      Object.assign(query,{search:origin.get('orderSearch'),queue:origin.get('orderQueue'),sortBy:origin.get('orderSort'),direction:origin.get('orderDirection')});
      let data=await commerce.orders(principal,query);
      if(!data.meta.sourceId||!data.meta.currency)throw new BadRequestException('Wybierz jedno zrodlo i walute w Zamowieniach.');
      const id=origin.get('orderId');
      if(id){const records=data.records.filter(row=>row.id===id);if(!records.length)throw new BadRequestException('Wybrane zamowienie nie jest dostepne w zakresie raportu.');data={...data,records,totals:commerceOrderTotals(records,data.refunds,data.meta.currency)};}
      return projectOrdersReport(data,config);
    }
    Object.assign(query,{inventoryAsOf:origin.get('inventoryAsOf')??config.to,search:origin.get('productSearch'),category:config.filter==='all'?origin.get('productCategory'):config.filter,
      filter:origin.get('productFilter'),sortBy:origin.get('productSort'),direction:origin.get('productDirection')});
    let data=await commerce.products(principal,query);
    if(!data.meta.sourceId||(config.template!=='inventory'&&!data.meta.currency))throw new BadRequestException('Wybierz zrodlo i walute w Produktach.');
    if(config.filter!=='all'&&!data.categories.includes(config.filter))throw new BadRequestException('Wybrana kategoria nie istnieje w zrodle. Ustaw ja w analizie Produktow.');
    const id=origin.get('productId');
    if(id){const records=data.records.filter(row=>row.id===id);if(!records.length)throw new BadRequestException('Wybrany produkt jest niedostepny.');data={...data,records,totals:commerceProductTotals(records,data.meta.currency)};}
    return projectProductsReport(data,config);
  }

  async preview(principal: RequestPrincipal, value: unknown): Promise<ReportSnapshot> {
    if (!validReportConfig(value)) throw new BadRequestException('Nieprawidłowa konfiguracja raportu.');
    const error = reportConfigError(value);
    if (error) throw new BadRequestException(error);
    await this.validateContext(principal,value.context);
    const snapshot = await this.buildSnapshot(principal,value);
    if (!validSnapshot(snapshot)) throw new BadRequestException('Wynik przekracza dopuszczalny rozmiar raportu. Zawęź okres.');
    const previewId = randomUUID();
    await this.database.withTenantWorkspace(principal.tenantId, principal.workspaceId, async client => {
      await client.query('DELETE FROM app.saved_report_previews WHERE tenant_id=$1 AND workspace_id=$2 AND expires_at < now()', [principal.tenantId, principal.workspaceId]);
      await client.query(`INSERT INTO app.saved_report_previews (tenant_id, workspace_id, preview_id, user_id, config, snapshot, expires_at)
        VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,now()+interval '30 minutes')`,
      [principal.tenantId, principal.workspaceId, previewId, principal.userId, JSON.stringify(value), JSON.stringify(snapshot)]);
    });
    return { ...snapshot, previewId };
  }

  async command(principal: RequestPrincipal, value: unknown): Promise<ReportsStore> {
    let command;
    try { command = parseReportCommand(value); }
    catch (error) { throw new BadRequestException((error as Error).message); }
    const c = command;
    if('config' in c)await this.validateContext(principal,c.config.context);
    await this.database.withTenantWorkspace(principal.tenantId, principal.workspaceId, async client => {
      // Serializes mutations within a workspace, including creation and the library size limit.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`saved-reports:${principal.tenantId}:${principal.workspaceId}`]);
      const rows = await client.query<{ document: SavedReport }>('SELECT document FROM app.saved_reports WHERE tenant_id=$1 AND workspace_id=$2 FOR UPDATE', [principal.tenantId, principal.workspaceId]);
      const store: ReportsStore = { schema: 1, workspace: principal.workspaceId, reports: rows.rows.map(r => r.document) };
      const target = 'id' in c ? store.reports.find(r => r.id === c.id) : undefined;
      if (c.type !== 'create' && c.type !== 'import' && !target) throw new NotFoundException('Raport nie jest dostępny.');
      if ('expectedRevision' in c && target?.revision !== c.expectedRevision)
        throw new ConflictException('Raport zmieniono w innej karcie. Wczytaj aktualny zapis lub zachowaj swoją kopię.');
      if (c.type === 'favorite') {
        // Favorites belong to the current user and do not change shared report revisions.
        const removed = await client.query('DELETE FROM app.saved_report_favorites WHERE tenant_id=$1 AND workspace_id=$2 AND report_id=$3 AND user_id=$4 RETURNING report_id', [principal.tenantId, principal.workspaceId, c.id, principal.userId]);
        if (!removed.rowCount) await client.query('INSERT INTO app.saved_report_favorites (tenant_id,workspace_id,report_id,user_id) VALUES ($1,$2,$3,$4)', [principal.tenantId, principal.workspaceId, c.id, principal.userId]);
        return;
      }
      if (c.type === 'publish') {
        if (!c.snapshot.previewId || !/^[a-f0-9-]{36}$/.test(c.snapshot.previewId)) throw new BadRequestException('Przelicz podgląd przed zapisaniem wersji.');
        const preview = await client.query<{ config: ReportConfig; snapshot: ReportSnapshot }>(
          `DELETE FROM app.saved_report_previews WHERE tenant_id=$1 AND workspace_id=$2 AND preview_id=$3 AND user_id=$4
             AND expires_at > now() AND config=$5::jsonb RETURNING config,snapshot`,
          [principal.tenantId, principal.workspaceId, c.snapshot.previewId, principal.userId, JSON.stringify(c.config)],
        );
        if (!preview.rows[0]) throw new ConflictException('Podgląd wygasł lub konfiguracja się zmieniła. Przelicz raport ponownie.');
        // Never persist a caller-supplied metric value as a live result.
        c.snapshot = preview.rows[0].snapshot;
      }
      if (c.type === 'import') {
        c.report = structuredClone(c.report);
        if(c.report.draft)c.report.draft.config.context=null;
        c.report.versions=c.report.versions.map(version=>({...version,config:{...version.config,context:null}}));
        c.report.versions = c.report.versions.map(v => ({ ...v, snapshot: {
          ...v.snapshot, previewId: undefined, mode: 'imported',
          limitations: ['Wynik z importowanego pliku. PapaData nie zweryfikowała jego wartości.', ...v.snapshot.limitations].slice(0,30),
        } }));
      }
      let next: ReportsStore;
      try {
        next = applyReportCommand(store, c, { id: principal.userId, name: principal.userId }, new Date().toISOString());
        parseReportsStore(JSON.stringify(next), principal.workspaceId);
      } catch (error) { throw new BadRequestException((error as Error).message); }
      for (const report of next.reports) {
        const previous = store.reports.find(r => r.id === report.id);
        if (previous && previous.revision === report.revision) continue;
        await client.query(`INSERT INTO app.saved_reports (tenant_id,workspace_id,report_id,document)
          VALUES ($1,$2,$3,$4::jsonb) ON CONFLICT (tenant_id,workspace_id,report_id)
          DO UPDATE SET document=excluded.document,updated_at=now()`,
        [principal.tenantId, principal.workspaceId, report.id, JSON.stringify({ ...report, favorite: false })]);
      }
      if (target && !next.reports.some(r => r.id === target.id))
        await client.query('DELETE FROM app.saved_reports WHERE tenant_id=$1 AND workspace_id=$2 AND report_id=$3', [principal.tenantId, principal.workspaceId, target.id]);
    });
    return this.read(principal);
  }
}
