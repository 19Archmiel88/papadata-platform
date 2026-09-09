import { cleanProductContextPath, productContextFilters } from '@papadata/contracts';
import { useRef, useState } from 'react';
import type { DecisionCommand, DecisionContext, DecisionMutation, DecisionDomain } from '@papadata/contracts/decisions';
import { DecisionsScreen } from '../../screens/decisions/DecisionsScreen';
import { ProductDataState } from '../../screens/shared/ProductDataState';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { safeReturnTo } from '../../runtime/app/routing/navigation';
import { safeRandomUUID } from '../../runtime/shared/id/safeRandomUUID';
export function DecisionsPage() {
  const runtime = useAuthSessionRuntimeContext();
  const {params, location} = useProductQuery();
  const session = runtime.session;
  const key = `${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
  const activeKey = useRef(key); activeKey.current = key;
  const resource = useRemoteResource(key, signal => bffClient.readDecisions(signal));
  const retry = useRef<{signature:string; key:string} | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const sourcePath = params.get('returnTo');
  const sourceParams = new URL(safeReturnTo(sourcePath), window.location.origin).searchParams;
  const contextValue = (key: string) => params.get(key) ?? sourceParams.get(key);
  const context: DecisionContext | null = sourcePath ? {
    sourcePath: cleanProductContextPath(safeReturnTo(sourcePath))??'/app',
    reportId:contextValue('reportId'), reportVersion:contextValue('reportVersion')?Number(contextValue('reportVersion')):null,budgetPlanId:contextValue('budgetPlanId'),
    conversationId:contextValue('conversationId'),caseThreadId:contextValue('caseThreadId'),
    from:contextValue('from'),to:contextValue('to'),timezone:contextValue('timezone'),
    filters:{...productContextFilters(sourceParams),...productContextFilters(params)},
  } : null;
  const candidate = params.get('domain');
  const domain = ['products','campaigns','orders','customers','data','traffic'].includes(candidate ?? '') ? candidate as DecisionDomain : undefined;
  const initialDraft = context ? {source:context.sourcePath.slice(0,300),period:[context.from, context.to].filter(Boolean).join(' - '), ...(domain ? {domain}:{}), ...(params.get('title') ? {title:params.get('title')!.slice(0,160)}:{})} : undefined;
  const command = async (decisionId: string, command: DecisionCommand, context?: DecisionContext | null) => {
    if (!resource.data) throw new Error('Wczytaj rejestr przed zmianą.');
    const input: DecisionMutation = {decisionId,command,expectedVersion:resource.data.version,context};
    const signature = JSON.stringify(input);
    if (retry.current?.signature !== signature) retry.current = {signature,key:safeRandomUUID()};
    const confirmed = await runtime.runAuthenticatedCommand(() => bffClient.commandDecision(input,retry.current!.key), location);
    if (activeKey.current !== key) throw new Error('Workspace zmienił się podczas zapisu.');
    resource.replace(confirmed);
    retry.current = null;
    // A command response confirms persistence. Re-read additionally reconciles concurrent writes.
    try {
      const fresh = await bffClient.readDecisions();
      if (activeKey.current !== key) throw new Error('Workspace zmienił się podczas odczytu.');
      resource.replace(fresh); setWarning(null); return fresh;
    } catch {
      if (activeKey.current !== key) throw new Error('Workspace zmienił się podczas odczytu.');
      setWarning('Serwer potwierdził zapis, lecz ponowny odczyt się nie powiódł. Nie wysyłaj tej operacji ponownie; odśwież rejestr.');
      return confirmed;
    }
  };
  return <>
    {warning && <p role="alert">{warning}</p>}
    <ProductDataState state={resource.state} problem={resource.problem} onRetry={() => void resource.reload()}>
      <DecisionsScreen key={key} data={resource.data} persistenceKey={null} today={resource.data?.sourceDate}
        canManage={Boolean(session?.capabilities.includes('ai.action_proposal.create'))}
        canApprove={Boolean(session?.capabilities.includes('ai.action_proposal.approve'))}
        canExport={false} context={context} initialDraft={initialDraft} onCommand={command} />
    </ProductDataState>
  </>;
}
