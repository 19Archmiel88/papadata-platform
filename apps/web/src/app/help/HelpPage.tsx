import { useRef, useState } from 'react';
import { HelpCenterView } from '../../screens/help-center/HelpCenterView';
import { bffClient } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { useRemoteResource } from '../../runtime/shared/data/useRemoteResource';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
export function HelpPage(){
 const runtime=useAuthSessionRuntimeContext(),session=runtime.session,{params,location}=useProductQuery();
 const scope=`${session?.activeTenantId}:${session?.activeWorkspaceId}:${session?.userId}`;
 const current=useRef(scope);current.current=scope;
 const [warning,setWarning]=useState<string|null>(null);
 const query={page:params.get('ticketPage')??'1',search:params.get('ticketSearch')??'',status:params.get('ticketStatus')??'all'};
 const resource=useRemoteResource(scope+JSON.stringify(query),signal=>bffClient.readSupportTickets(signal,query));
 const id=params.get('ticketId');
 const detail=useRemoteResource(scope+':ticket:'+id,signal=>id?bffClient.readSupportTicket(id,signal):Promise.resolve(null));
 return <HelpCenterView key={scope} tickets={resource.data?.records} total={resource.data?.total} pageSize={resource.data?.pageSize} state={resource.state} problem={resource.problem}
  ticketDetail={detail.data} ticketState={detail.state} ticketProblem={detail.problem} onReloadTicket={()=>void detail.reload()}
  onReload={()=>{setWarning(null);void resource.reload();}} deliveryWarning={warning}
  onTicketCommand={async (ticketId,input)=>{
   const confirmed=await runtime.runAuthenticatedCommand(()=>bffClient.commandSupportTicket(ticketId,input),location);
   if(current.current!==scope)throw new Error('Workspace changed during the operation.');
   detail.replace(confirmed);
   void resource.reload();
   try {const fresh=await bffClient.readSupportTicket(ticketId);if(current.current!==scope)throw new Error('Workspace changed during the read.');detail.replace(fresh);return fresh;}
   catch {if(current.current!==scope)throw new Error('Workspace changed during the operation.');setWarning('Serwer potwierdzil zapis. Ponowny odczyt sie nie powiodl; odswiez widok zamiast ponawiac operacje.');return confirmed;}
  }}
  onSubmit={async input=>{
   const ticket=await runtime.runAuthenticatedCommand(()=>bffClient.createSupportTicket(input,`support-${input.requestId}`),location);
   if(current.current!==scope)throw new Error('Workspace changed during the operation.');
   // A filtered list may not include the new request. The server response remains the success receipt.
   void resource.reload();return ticket;
  }}/>
}
