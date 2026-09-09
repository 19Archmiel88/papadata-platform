import { createHash, randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { IntegrationRepository, ProductionDatabase } from '@papadata/database';
import { growthCampaignKey, growthDayCount, type GrowthBudgetAudit, type GrowthBudgetCommand, type GrowthBudgetPlan, type GrowthPortfolio, type GrowthRange, } from '@papadata/contracts/campaign-growth';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { readGrowthPortfolio, type GrowthFilters } from './campaign-growth.source.js';
const isRecord = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
function string(value: unknown, name: string, max = 300): string | null {
    if (value == null || value === '')
        return null;
    if (typeof value !== 'string' || value.length > max || /[\x00-\x1f]/.test(value))
        throw new BadRequestException(`Invalid ${name}.`);
    return value;
}
function validDay(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function growthRange(value: Record<string, unknown>, allowFuture = false): GrowthRange {
    const from = string(value.from, 'from'), to = string(value.to, 'to'), timezone = string(value.timezone, 'timezone', 100) ?? 'Europe/Warsaw';
    if (!from || !to || !validDay(from) || !validDay(to) || from > to || growthDayCount(from, to) > 366)
        throw new BadRequestException('Select a valid range of at most 366 days.');
    let today: string;
    try {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(p => [p.type, p.value]));
        today = `${parts.year}-${parts.month}-${parts.day}`;
    }
    catch {
        throw new BadRequestException('Invalid timezone.');
    }
    if (!allowFuture && to > today)
        throw new BadRequestException('Future observations are unavailable.');
    if (Number(from.slice(0, 4)) < 2000 || Number(to.slice(0, 4)) > 2100)
        throw new BadRequestException('Invalid reporting year.');
    return { from, to, timezone };
}
export function growthFilters(query: Record<string, unknown>): GrowthFilters {
    const provider = string(query.channel ?? query.provider, 'provider');
    const campaignKey = string(query.campaignId, 'campaignId', 500), currency = string(query.currency, 'currency', 3);
    if (provider && provider !== 'all' && provider !== 'google_ads' && provider !== 'meta_ads')
        throw new BadRequestException('Unsupported advertising provider.');
    if (currency && !/^[A-Z]{3}$/.test(currency))
        throw new BadRequestException('Invalid currency.');
    return { provider: provider === 'google_ads' || provider === 'meta_ads' ? provider : null, campaignKey, currency };
}
function budgetCommand(value: unknown): GrowthBudgetCommand {
    if (!isRecord(value))
        throw new BadRequestException('Invalid budget command.');
    const range = growthRange(value, true), campaignKey = string(value.campaignKey, 'campaignKey', 500), reason = string(value.reason, 'reason', 2000)?.trim();
    const currency = string(value.currency, 'currency', 3);
    if (!uuid(value.requestId) || !campaignKey || !currency || !/^[A-Z]{3}$/.test(currency) || currency === 'XXX'
        || typeof value.amount !== 'number' || !Number.isFinite(value.amount) || Math.round(value.amount * 100) <= 0 || value.amount > 1e9
        || !Number.isSafeInteger(value.expectedVersion) || Number(value.expectedVersion) < 0
        || !reason || reason.length < 10 || value.acknowledgedInternalPlan !== true)
        throw new BadRequestException('A valid amount, version, reason and explicit internal-plan acknowledgement are required.');
    return { requestId: value.requestId, campaignKey, from: range.from, to: range.to, currency,
        amount: Math.round(value.amount * 100) / 100, expectedVersion: Number(value.expectedVersion), reason, acknowledgedInternalPlan: true };
}
@Injectable()
export class CampaignGrowthService {
    private readonly source: IntegrationRepository;
    constructor(
    @Inject(ProductionDatabase)
    private readonly database: ProductionDatabase) { this.source = new IntegrationRepository(database); }
    async read(principal: RequestPrincipal, query: Record<string, unknown>): Promise<GrowthPortfolio> {
        const range = growthRange(query, query.planning === 'true'), filters = growthFilters(query);
        const { plans, history, catalog } = await this.database.withTenantWorkspace(principal.tenantId, principal.workspaceId, async (client) => {
            const plans = await client.query<{
                document: GrowthBudgetPlan;
            }>(`SELECT document FROM app.campaign_budget_plans WHERE tenant_id=$1 AND workspace_id=$2 AND period_from <= $4::date AND period_to >= $3::date ORDER BY updated_at DESC`, [principal.tenantId, principal.workspaceId, range.from, range.to]);
            const history = await client.query<{
                document: GrowthBudgetAudit;
            }>(`SELECT a.document FROM app.campaign_budget_plan_events a JOIN app.campaign_budget_plans p USING(tenant_id,workspace_id,plan_id) WHERE a.tenant_id=$1 AND a.workspace_id=$2 AND p.period_from <= $4::date AND p.period_to >= $3::date ORDER BY a.created_at DESC LIMIT 500`, [principal.tenantId, principal.workspaceId, range.from, range.to]);
            const facts = await client.query<{
                connection_id: string;
                provider_id: 'google_ads' | 'meta_ads';
                campaign_id: string;
                name: string;
                currency: string;
            }>(`SELECT DISTINCT ON (r.connection_id,r.canonical_payload->'entity'->>'campaignId',r.canonical_payload->'entity'->>'currency') r.connection_id,r.provider_id,
        r.canonical_payload->'entity'->>'campaignId' AS campaign_id, COALESCE(r.canonical_payload->'entity'->>'campaignName',r.canonical_payload->'entity'->>'campaignId') AS name,
        COALESCE(r.canonical_payload->'entity'->>'currency','XXX') AS currency
        FROM app.integration_canonical_records r JOIN app.integration_connections c USING(tenant_id,workspace_id,connection_id)
        WHERE r.tenant_id=$1 AND r.workspace_id=$2 AND r.stream='ad_spend' AND r.provider_id IN('google_ads','meta_ads')
        AND r.canonical_payload->'entity'->>'campaignId' IS NOT NULL AND c.deleted_at IS NULL
        ORDER BY r.connection_id,r.canonical_payload->'entity'->>'campaignId',r.canonical_payload->'entity'->>'currency',r.updated_at DESC LIMIT 5000`, [principal.tenantId, principal.workspaceId]);
            const catalog = facts.rows.map(row => ({ id: growthCampaignKey(row.connection_id, row.campaign_id, row.currency), name: row.name, provider: row.provider_id, currency: row.currency }));
            return { plans: plans.rows.map(r => r.document), history: history.rows.map(r => r.document), catalog };
        });
        try {
            return await readGrowthPortfolio({ dataSource: this.source, tenantId: principal.tenantId, workspaceId: principal.workspaceId,
                range, filters, generatedAt: new Date().toISOString(), plans, history, catalog,
                canManagePlans: principal.capabilities.includes('workspace.manage') });
        }
        catch (error) {
            if (error instanceof Error && error.message === 'GROWTH_RANGE_TOO_LARGE')
                throw new PayloadTooLargeException('Reporting range exceeds 100000 records. Narrow the period.');
            throw error;
        }
    }
    async savePlan(principal: RequestPrincipal, value: unknown): Promise<{
        plan: GrowthBudgetPlan;
        event: GrowthBudgetAudit;
        externalChange: false;
    }> {
        const command = budgetCommand(value);
        const hash = createHash('sha256').update(JSON.stringify({ actor: principal.userId, command })).digest('hex');
        return this.database.withTenantWorkspace(principal.tenantId, principal.workspaceId, async (client) => {
            const scope = [principal.tenantId, principal.workspaceId];
            // Serialize the whole workspace plan registry so request replay and overlap checks are atomic.
            await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`campaign-plan:${scope.join(':')}`]);
            const replay = await client.query<{
                request_hash: string;
                response: {
                    plan: GrowthBudgetPlan;
                    event: GrowthBudgetAudit;
                    externalChange: false;
                };
            }>(`SELECT request_hash,response FROM app.campaign_budget_plan_events WHERE tenant_id=$1 AND workspace_id=$2 AND event_id=$3`, [...scope, command.requestId]);
            if (replay.rows[0]) {
                if (replay.rows[0].request_hash !== hash)
                    throw new ConflictException('This request ID was used with different content.');
                return replay.rows[0].response;
            }
            const [connectionId, encodedCampaignId, encodedCurrency, ...rest] = command.campaignKey.split(':');
            let campaignId: string;
            try {
                campaignId = decodeURIComponent(encodedCampaignId ?? '');
            }
            catch {
                throw new BadRequestException('Invalid campaign key.');
            }
            if (!connectionId || !/^[a-f0-9-]{36}$/i.test(connectionId) || !campaignId || rest.length || encodedCurrency !== command.currency
                || growthCampaignKey(connectionId, campaignId, command.currency) !== command.campaignKey)
                throw new BadRequestException('Invalid campaign key.');
            // Membership of the campaign in this workspace is verified from imported facts, not trusted from the browser.
            const campaign = await client.query(`SELECT r.canonical_record_id FROM app.integration_canonical_records r JOIN app.integration_connections c USING(tenant_id,workspace_id,connection_id)
        WHERE r.tenant_id=$1 AND r.workspace_id=$2 AND r.connection_id=$3::uuid AND r.provider_id IN('google_ads','meta_ads') AND r.stream='ad_spend'
        AND r.canonical_payload->'entity'->>'campaignId'=$4 AND r.canonical_payload->'entity'->>'currency'=$5 AND c.deleted_at IS NULL LIMIT 1`, [...scope, connectionId, campaignId, command.currency]);
            if (!campaign.rows.length)
                throw new NotFoundException('No imported campaign in this workspace/currency. Refresh the campaign list.');
            const existing = await client.query<{
                plan_id: string;
                document: GrowthBudgetPlan;
            }>(`SELECT plan_id,document FROM app.campaign_budget_plans WHERE tenant_id=$1 AND workspace_id=$2 AND campaign_key=$3 AND currency=$4 AND period_from <= $6::date AND period_to >= $5::date FOR UPDATE`, [...scope, command.campaignKey, command.currency, command.from, command.to]);
            const current = existing.rows[0]?.document;
            if (existing.rows.length > 1 || current && (current.from !== command.from || current.to !== command.to))
                throw new ConflictException('This period overlaps an existing campaign plan. Edit that plan instead.');
            if ((current?.version ?? 0) !== command.expectedVersion)
                throw new ConflictException('The budget plan changed. Refresh and review the new values.');
            const at = new Date().toISOString(), id = current?.id ?? randomUUID();
            const plan: GrowthBudgetPlan = { id, campaignKey: command.campaignKey, from: command.from, to: command.to,
                currency: command.currency, amount: command.amount, version: (current?.version ?? 0) + 1,
                reason: command.reason, updatedAt: at, updatedBy: principal.userId, target: 'internal_plan' };
            const event: GrowthBudgetAudit = { id: command.requestId, planId: id, at, actor: principal.userId,
                before: current?.amount ?? null, after: plan.amount, version: plan.version, reason: command.reason };
            const response = { plan, event, externalChange: false as const };
            await client.query(`INSERT INTO app.campaign_budget_plans(tenant_id,workspace_id,plan_id,campaign_key,currency,period_from,period_to,version,document,updated_at)
        VALUES($1,$2,$3,$4,$5,$6::date,$7::date,$8,$9::jsonb,$10::timestamptz)
        ON CONFLICT(tenant_id,workspace_id,plan_id) DO UPDATE SET version=EXCLUDED.version,document=EXCLUDED.document,updated_at=EXCLUDED.updated_at`, [...scope, id, plan.campaignKey, plan.currency, plan.from, plan.to, plan.version, JSON.stringify(plan), at]);
            await client.query(`INSERT INTO app.campaign_budget_plan_events(tenant_id,workspace_id,event_id,plan_id,request_hash,document,response) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)`, [...scope, command.requestId, id, hash, JSON.stringify(event), JSON.stringify(response)]);
            // No provider credential is loaded and no remote advertising operation is called here.
            return response;
        });
    }
}
