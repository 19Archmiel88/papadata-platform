import {createCipheriv,createDecipheriv,createHmac,randomBytes} from 'node:crypto';
import {createTransport} from 'nodemailer';
export type AuthMailSmtpConfig={host:string;port:number;secure:boolean;auth:{user:string;pass:string}|null};
export type AuthMailTransport={kind:'resend';apiKey:string}|{kind:'smtp';smtp:AuthMailSmtpConfig};
export type AuthMailConfig={key:Buffer;from:string;webOrigin:string;transport:AuthMailTransport};
export function authMailConfig(env:NodeJS.ProcessEnv=process.env):AuthMailConfig|null{
 if(env.PAPADATA_AUTH_MAIL_ENABLED!=='true')return null;
 const key=Buffer.from(env.PAPADATA_AUTH_MAIL_KEY_BASE64??'','base64');
 const from=env.PAPADATA_AUTH_MAIL_FROM?.trim()??'';
 const origin=new URL(env.PAPADATA_WEB_ORIGIN??'');
 if(key.length!==32||!from.includes('@')||/[\r\n]/.test(from)||origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/')throw new Error('Invalid auth mail configuration (HTTPS origin, sender, 32-byte encryption key required).');
 return {key,from,webOrigin:origin.origin,transport:readTransport(env)};
}
// PAPADATA_AUTH_MAIL_TRANSPORT is deliberately never read via NODE_ENV/
// runtimeEnvironment -- production-parity sets it to 'smtp' (Mailpit) purely
// through its own generated env, exactly like every other production-parity
// knob; staging/production never set it, so they keep today's Resend
// behavior via the default below, completely unaffected by this branch.
function readTransport(env:NodeJS.ProcessEnv):AuthMailTransport{
 const kind=env.PAPADATA_AUTH_MAIL_TRANSPORT?.trim()||'resend';
 if(kind==='smtp'){
  const host=env.PAPADATA_AUTH_MAIL_SMTP_HOST?.trim()??'';
  const port=Number(env.PAPADATA_AUTH_MAIL_SMTP_PORT??'');
  if(!host||!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid auth mail configuration (SMTP host/port required).');
  const secure=env.PAPADATA_AUTH_MAIL_SMTP_SECURE==='true';
  const user=env.PAPADATA_AUTH_MAIL_SMTP_USER?.trim()??'',pass=env.PAPADATA_AUTH_MAIL_SMTP_PASSWORD??'';
  return {kind:'smtp',smtp:{host,port,secure,auth:user?{user,pass}:null}};
 }
 if(kind==='resend'){
  const apiKey=env.PAPADATA_AUTH_MAIL_API_KEY?.trim()??'';
  if(apiKey.length<12)throw new Error('Invalid auth mail configuration (API key required).');
  return {kind:'resend',apiKey};
 }
 throw new Error('Invalid auth mail configuration (unsupported PAPADATA_AUTH_MAIL_TRANSPORT).');
}
export function sealAuthMail(text:string,key:Buffer):string{
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from('papadata.auth-mail.v1'));
 const data=Buffer.concat([cipher.update(text,'utf8'),cipher.final()]);return ['v1',iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),data.toString('base64url')].join('.');
}
export function openAuthMail(text:string,key:Buffer):string{
 const [v,iv,tag,data]=text.split('.');if(v!=='v1'||!iv||!tag||!data)throw new Error('Invalid encrypted mail payload.');
 const cipher=createDecipheriv('aes-256-gcm',key,Buffer.from(iv,'base64url'));cipher.setAAD(Buffer.from('papadata.auth-mail.v1'));cipher.setAuthTag(Buffer.from(tag,'base64url'));
 return Buffer.concat([cipher.update(Buffer.from(data,'base64url')),cipher.final()]).toString('utf8');
}
export function authMailDigest(kind:string,email:string,key:Buffer):string{return createHmac('sha256',key).update(`${kind}:${email}:${Math.floor(Date.now()/60000)}`).digest('hex');}
export async function deliverAuthMail(config:AuthMailConfig,id:string,body:unknown):Promise<void>{
 if(config.transport.kind==='smtp')return deliverViaSmtp(config.transport.smtp,id,toMailMessage(body));
 return deliverViaResend(config.transport.apiKey,id,body);
}
async function deliverViaResend(apiKey:string,id:string,body:unknown):Promise<void>{
 const response=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'content-type':'application/json',authorization:`Bearer ${apiKey}`,'idempotency-key':`papadata-auth-${id}`},body:JSON.stringify(body)});
 if(!response.ok){await response.body?.cancel();throw new Error(`MAIL_PROVIDER_${response.status}`);}await response.body?.cancel();
}
type AuthMailMessage={from:string;to:readonly string[];subject:string;text:string};
function toMailMessage(body:unknown):AuthMailMessage{
 const b=body as {from?:unknown;to?:unknown;subject?:unknown;text?:unknown}|null;
 if(typeof b?.from!=='string'||!Array.isArray(b.to)||b.to.some(x=>typeof x!=='string')||typeof b.subject!=='string'||typeof b.text!=='string')throw new Error('MAIL_PROVIDER_SMTP');
 return {from:b.from,to:b.to,subject:b.subject,text:b.text};
}
// Mailpit/local SMTP have no delivery-status webhook or idempotency header
// like Resend's -- a retried send after a transient failure can double-send
// into the mailbox. Acceptable for a local test mailbox; the real
// production transport stays Resend, unaffected by this path.
async function deliverViaSmtp(smtp:AuthMailSmtpConfig,id:string,message:AuthMailMessage):Promise<void>{
 const transport=createTransport({host:smtp.host,port:smtp.port,secure:smtp.secure,auth:smtp.auth??undefined,connectionTimeout:15000,socketTimeout:15000});
 try{
  await transport.sendMail({from:message.from,to:[...message.to],subject:message.subject,text:message.text,messageId:`<papadata-auth-${id}@papadata.local>`});
 }catch{
  throw new Error('MAIL_PROVIDER_SMTP');
 }finally{
  transport.close();
 }
}
