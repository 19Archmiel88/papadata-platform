import { useEffect, useRef } from 'react';
import type { BillingSessionCommand } from '@papadata/contracts';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { BillingOperationsScreen } from '../../screens/platform-operations/BillingOperationsScreen';
export function SubscriptionBillingPage(){
 const runtime=useAuthSessionRuntimeContext(),scope=`${runtime.session?.activeTenantId}:${runtime.session?.activeWorkspaceId}:${runtime.session?.userId}`;
 return <BillingRuntime key={scope} scope={scope}/>;
}
function BillingRuntime({scope}:{scope:string}){
 const runtime=useAuthSessionRuntimeContext(),{params,update,location}=useProductQuery(),cursor=params.get('invoiceAfter')??undefined;
 const active=useRef<string|null>(scope);active.current=scope;
 useEffect(()=>{active.current=scope;return()=>{active.current=null;};},[scope]);
 const resource=useRemoteResource(`${scope}:${cursor??''}`,signal=>bffClient.readBillingOperations(cursor,signal));
 async function session(input:BillingSessionCommand){
  const result=await runtime.runAuthenticatedCommand(()=>bffClient.createBillingSession(input),location);
  if(active.current!==scope)throw new Error('Workspace changed. Open billing in the active workspace.');
  const url=new URL(result.url);
  if(url.protocol!=='https:'||url.username||url.password||!['checkout.stripe.com','billing.stripe.com'].includes(url.hostname))throw new Error('Untrusted billing redirect.');
  window.location.assign(url.href);
 }
 return <BillingOperationsScreen data={resource.data} state={resource.state} problem={resource.problem} onReload={()=>void resource.reload()} onSession={runtime.session?.capabilities.includes('billing.manage')?session:undefined} onNextInvoices={resource.data?.invoiceCursor?()=>update({billingView:'invoices',invoiceAfter:resource.data?.invoiceCursor??null}):undefined} onFirstInvoices={cursor?()=>update({invoiceAfter:null}):undefined}/>;
}
