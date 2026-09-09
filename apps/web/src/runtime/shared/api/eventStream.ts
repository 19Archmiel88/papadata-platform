/** WHATWG event-stream line parser. Handles CR, LF, CRLF and chunk boundaries. */
export async function* readEventData(body:ReadableStream<Uint8Array>,signal?:AbortSignal):AsyncIterable<string>{
 const reader=body.getReader(),decoder=new TextDecoder();let buffer='',data:string[]=[],size=0,skipLF=false;
 function line(text:string):string|null{
  if(text===''){const result=data.length?data.join('\n'):null;data=[];size=0;return result;}
  if(text.startsWith(':'))return null;
  const colon=text.indexOf(':'),field=colon<0?text:text.slice(0,colon);
  let value=colon<0?'':text.slice(colon+1);if(value.startsWith(' '))value=value.slice(1);
  if(field==='data'){size+=value.length;if(size>1024*1024)throw new Error('SSE event exceeds the size limit.');data.push(value);}return null;
 }
 try{
  while(true){signal?.throwIfAborted();const part=await reader.read();if(part.done)break;
   let text=decoder.decode(part.value,{stream:true});
   for(const c of text){
    if(skipLF){skipLF=false;if(c==='\n')continue;}
    if(c==='\r'||c==='\n'){const out=line(buffer);buffer='';skipLF=c==='\r';if(out!==null)yield out;}
    else{buffer+=c;if(buffer.length>1024*1024)throw new Error('SSE line exceeds the size limit.');}
   }
  }
  // An event without its terminating empty line is incomplete and is not emitted.
 }finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
