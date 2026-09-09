import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
/** Model text is not trusted to cause network requests by rendering image URLs. */
export function AssistantMarkdown({children}:{children:string}){
 return <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
  img:({alt})=><span>[{alt||'External image omitted'}]</span>,
  a:({href,children:label})=>{
   let safe=false;try{const u=new URL(href??'',window.location.origin);safe=['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{/* Render text instead of an unsafe URL. */}
   return safe?<a href={href} target="_blank" rel="noopener noreferrer nofollow">{label}</a>:<span>{label}</span>;
  },
 }}>{children}</ReactMarkdown>;
}
