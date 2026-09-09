import type {AssistantPreferences,AssistantMemory,AssistantAttachment,AssistantThread,AssistantContextExport} from '@papadata/contracts';
import {createDemoAssistantGateway,type AssistantGateway} from '../../runtime/shell/papa-assistant/assistantGateway';
import {safeRandomUUID} from '../../runtime/shared/id/safeRandomUUID';
/** Explicit in-memory presentation adapter. Never calls API, a provider or a filesystem. */
export function createWorkspaceDemoGateway(readonly=false,failed=false):AssistantGateway{
 const base=createDemoAssistantGateway(),threads:AssistantThread[]=[],snapshots=new Map<string,unknown>();
 let prefs:AssistantPreferences={version:1,historyEnabled:true,contextDays:30,memoryEnabled:true,attachmentEnabled:true,allowedReadTools:['context','evidence','reports','metrics','memory'],externalActionsEnabled:false,canEdit:!readonly};
 let notes:AssistantMemory[]=[{id:safeRandomUUID(),title:'Cel demonstracyjny',content:'Porownuj wartosc zamowien w tej samej walucie. To notatka demonstracyjna, nie dane klienta.',version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+30*86400000).toISOString()}],files:AssistantAttachment[]=[];
 const gateway:AssistantGateway={...base,
  async capturePapaContext(input){const result=await base.capturePapaContext(input);snapshots.set(result.conversationId,input.snapshot);if(!threads.some(t=>t.id===result.conversationId))threads.push({id:result.conversationId,title:input.title??'Rozmowa demonstracyjna',kind:input.parentConversationId?'case':'conversation',parentId:input.parentConversationId??null,updatedAt:new Date().toISOString(),archivedAt:null,canArchive:true});return result;},
  workspace:{
   async readAssistantWorkspace<T>(path: Parameters<NonNullable<AssistantGateway['workspace']>['readAssistantWorkspace']>[0]):Promise<T>{if(failed)throw new globalThis.Error('Demonstracja: odczyt niedostepny.');let value:unknown;
    if(path==='preferences')value=prefs;
    else if(path==='memory')value=notes;
    else if(path.startsWith('threads')){const q=new URLSearchParams(path.split('?')[1]??''),archived=q.get('archived')==='true',search=q.get('search')??'';value={records:threads.filter(t=>!!t.archivedAt===archived&&t.title.toLowerCase().includes(search.toLowerCase())),hasMore:false};}
    else if(path.startsWith('attachments/'))value=files.filter(f=>f.conversationId===path.slice(12));
    else if(path.startsWith('export/')){const id=path.slice(7),answers=await base.readPapaAnswers(id);value={schema:'papadata.context.v1',exportedAt:new Date().toISOString(),workspaceId:'00000000-0000-4000-8000-000000000002',conversationId:id,title:'Demonstracja eksportu - dane przykladowe',snapshot:snapshots.get(id)??null,messages:answers.records,evidence:[],limits:{messageLimit:100,evidenceLimit:100}} satisfies AssistantContextExport;}
    else if(path==='notifications')value={notifications:[]};
    else value={contracts:[],events:[],snapshots:[],provenance:[]};return structuredClone(value) as T;
   },
   async commandAssistantWorkspace<T>(path: Parameters<NonNullable<AssistantGateway['workspace']>['commandAssistantWorkspace']>[0],input: Parameters<NonNullable<AssistantGateway['workspace']>['commandAssistantWorkspace']>[1]):Promise<T>{if(failed||readonly)throw new globalThis.Error('Demonstracja: zapis odrzucony.');const stamp=new Date().toISOString();let result:unknown={applied:true,demo:true};
    if(path==='preferences'){if(input.expectedVersion!==prefs.version)throw new globalThis.Error('Demonstracja: konflikt wersji.');prefs={version:prefs.version+1,historyEnabled:Boolean(input.historyEnabled),contextDays:Number(input.contextDays),memoryEnabled:Boolean(input.memoryEnabled),attachmentEnabled:Boolean(input.attachmentEnabled),allowedReadTools:input.allowedReadTools as string[],canEdit:true,externalActionsEnabled:false};}
    else if(path==='memory'){const current=notes.find(n=>n.id===input.id);if((current?.version??0)!==input.expectedVersion)throw new globalThis.Error('Demonstracja: konflikt notatki.');notes=[...notes.filter(n=>n.id!==input.id),{id:String(input.id),title:String(input.title),content:String(input.content),version:Number(input.expectedVersion)+1,createdAt:current?.createdAt??stamp,updatedAt:stamp,expiresAt:new Date(Date.now()+Number(input.days)*86400000).toISOString()}];}
    else if(path==='memory/delete')notes=notes.filter(n=>n.id!==input.id);
    else if(path==='attachments'){if(files.length>=5)throw new globalThis.Error('Demonstracja: limit plikow.');files.push({id:input.requestId,name:String(input.name),conversationId:String(input.conversationId),mediaType:'text/plain',bytes:new TextEncoder().encode(String(input.content)).length,sha256:'DEMO-NOT-A-HASH',excerpt:String(input.content).slice(0,240),createdAt:stamp,expiresAt:new Date(Date.now()+7*86400000).toISOString()});}
    else if(path==='attachments/delete')files=files.filter(f=>f.id!==input.id);
    else if(path==='threads/archive'){const t=threads.find(t=>t.id===input.conversationId);if(t)t.archivedAt=input.archived?stamp:null;}
    return result as T;
   },
  },
 };
 return gateway;
}
