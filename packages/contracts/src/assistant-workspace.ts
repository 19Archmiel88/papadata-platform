export type AssistantRunStatus='queued'|'running'|'completed'|'failed'|'cancelled'|'interrupted';
export type AssistantRun = {
 readonly id:string; readonly conversationId:string; readonly caseThreadId:string|null;
 readonly status:AssistantRunStatus; readonly partialText:string; readonly result:unknown;
 readonly errorCode:string|null; readonly updatedAt:string; readonly nativeStreaming:boolean;
};
export type AssistantStreamEvent =
 | {type:'run';runId:string;nativeStreaming:boolean}
 | {type:'delta';text:string}
 | {type:'completed';result:unknown}
 | {type:'stopped';status:'failed'|'cancelled'|'interrupted';code:string};
export type AssistantPreferences = {
 readonly version:number; readonly historyEnabled:boolean; readonly contextDays:number;
 readonly memoryEnabled:boolean; readonly attachmentEnabled:boolean;
 readonly allowedReadTools:readonly string[]; readonly externalActionsEnabled:false;
 readonly canEdit:boolean;
};
export const assistantReadTools=['context','evidence','reports','metrics','memory'] as const;
export type AssistantMemory = {id:string;title:string;content:string;version:number;createdAt:string;updatedAt:string;expiresAt:string|null};
export type AssistantAttachment = {id:string;conversationId:string;name:string;mediaType:string;bytes:number;sha256:string;excerpt:string;createdAt:string;expiresAt:string};
export type AssistantThread = {id:string;title:string;kind:'conversation'|'case';parentId:string|null;updatedAt:string;archivedAt:string|null;canArchive:boolean};
export type AssistantContextExport={
 schema:'papadata.context.v1';exportedAt:string;workspaceId:string;conversationId:string;
 title:string;snapshot:unknown;messages:readonly unknown[];evidence:readonly unknown[];
 limits:{messageLimit:number;evidenceLimit:number};
};
export const assistantFileTypes={txt:'text/plain',md:'text/markdown',csv:'text/csv',json:'application/json'} as const;
export const assistantAttachmentByteLimit=128*1024;
