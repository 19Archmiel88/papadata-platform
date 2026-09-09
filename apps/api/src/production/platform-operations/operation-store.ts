import { createHash } from 'node:crypto';
import { ConflictException } from '@nestjs/common';
import type { ProductionDatabase } from '@papadata/database';
import type { RequestPrincipal } from '../auth/request-principal.js';
export type OperationClient = Parameters<
 Parameters<ProductionDatabase['withTenantWorkspace']>[2]
>[0];

/** Caller supplies a transaction; business write + replay receipt commit together. */
export async function operation<T>(client: OperationClient, p: RequestPrincipal, id: string, name: string, input: unknown, execute: () => Promise<T>): Promise<T> {
 const hash = createHash('sha256').update(JSON.stringify({actor:p.userId,name,input})).digest('hex');
 await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`platform-op:${p.tenantId}:${p.workspaceId}:${id}`]);
 const prior = await client.query<{ request_hash:string; response:T }>('SELECT request_hash,response FROM app.platform_operation_receipts WHERE tenant_id=$1 AND workspace_id=$2 AND request_id=$3',[p.tenantId,p.workspaceId,id]);
 if (prior.rows[0]) { if(prior.rows[0].request_hash!==hash) throw new ConflictException('Request identifier belongs to a different operation.'); return prior.rows[0].response; }
 const response = await execute();
 await client.query('INSERT INTO app.platform_operation_receipts(tenant_id,workspace_id,request_id,actor_id,operation,request_hash,response) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb)',[p.tenantId,p.workspaceId,id,p.userId,name,hash,JSON.stringify(response)]);
 return response;
}
