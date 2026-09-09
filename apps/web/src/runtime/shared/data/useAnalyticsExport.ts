import { useEffect, useRef, useState } from 'react';
import type { DateRange } from '../../../../../../contracts/ui-contract-types';
import { bffClient } from '../api/bffClient';
import { useAuthSessionRuntimeContext } from '../auth/authSessionRuntime';
import { useLocationPath } from '../../app/routing/navigation';
export type AnalyticsExportContext = { readonly columns: readonly string[]; readonly search: string; readonly sort: {readonly columnId:string; readonly direction:'asc'|'desc'} | null };
export function useAnalyticsExport(scope: string, dateRange: DateRange) {
  const runtime=useAuthSessionRuntimeContext(), location=useLocationPath();
  const key=`${scope}:${dateRange.from}:${dateRange.to}:${dateRange.timezone}:${location}`;
  const active=useRef(key);active.current=key;
  const abort=useRef<AbortController|null>(null), busyRef=useRef(false);
  const [busy,setBusy]=useState(false),[problem,setProblem]=useState<string|null>(null);
  useEffect(()=>{setProblem(null);setBusy(false);busyRef.current=false;return()=>abort.current?.abort();},[key]);
  const download=async(source:'customers'|'traffic'|'campaigns'|'orders'|'products',query:Record<string,string|null|undefined>)=>{
    if(busyRef.current)return;
    busyRef.current=true;setBusy(true);setProblem(null);
    const controller=new AbortController();abort.current=controller;
    try{
      const result=await runtime.runAuthenticatedCommand(()=>bffClient.readDomainScreen<{filename:string;content:string;rowCount:number}>((source==='orders'||source==='products'?`/api/v1/commerce/${source}/export`:`/api/v1/analytics/exports/${source}`),{dateRange,query,signal:controller.signal}),location);
      if(active.current!==key||controller.signal.aborted)return;
      if(typeof result.content!=='string'||!/^papadata-[a-z-]+-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.csv$/.test(result.filename)||!Number.isSafeInteger(result.rowCount))throw new Error('Nieprawidłowa odpowiedź eksportu.');
      const blob=new Blob([result.content],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
      link.href=url;link.download=result.filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(error){if(active.current===key&&!controller.signal.aborted)setProblem(error instanceof Error?error.message:'Eksport nie powiódł się.');}
    finally{if(active.current===key){busyRef.current=false;setBusy(false);}}
  };
  return {busy,problem,download};
}
