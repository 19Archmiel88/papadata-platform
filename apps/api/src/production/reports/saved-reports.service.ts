import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationRepository, ProductionDatabase } from '@papadata/database';
import {
  applyReportCommand, parseReportCommand, parseReportsStore, reportConfigError,
  validReportConfig, validSnapshot,
  type ReportConfig, type ReportSnapshot, type ReportsStore, type SavedReport,
} from '@papadata/contracts/saved-reports';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { buildLiveReportSnapshot } from './saved-reports.snapshot.js';

@Injectable()
export class SavedReportsService {
  constructor(@Inject(ProductionDatabase) private readonly database: ProductionDatabase) {}

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

  async preview(principal: RequestPrincipal, value: unknown): Promise<ReportSnapshot> {
    if (!validReportConfig(value)) throw new BadRequestException('Nieprawidłowa konfiguracja raportu.');
    const error = reportConfigError(value);
    if (error) throw new BadRequestException(error);
    const snapshot = await buildLiveReportSnapshot(principal, value, new IntegrationRepository(this.database));
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
