import {createCipheriv,createDecipheriv,createHmac,randomBytes} from 'node:crypto';
export type AuthMailConfig={key:Buffer;from:string;apiKey:string;webOrigin:string};
export function authMailConfig(env:NodeJS.ProcessEnv=process.env):AuthMailConfig|null{
 if(env.PAPADATA_AUTH_MAIL_ENABLED!=='true')return null;
 const key=Buffer.from(env.PAPADATA_AUTH_MAIL_KEY_BASE64??'','base64');
 const from=env.PAPADATA_AUTH_MAIL_FROM?.trim()??'',apiKey=env.PAPADATA_AUTH_MAIL_API_KEY?.trim()??'';
 const origin=new URL(env.PAPADATA_WEB_ORIGIN??'');
 if(key.length!==32||!from.includes('@')||/[\r\n]/.test(from)||apiKey.length<12||origin.protocol!=='https:'||origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/')throw new Error('Invalid auth mail configuration (HTTPS origin, sender, API key, 32-byte encryption key required).');
 return {key,from,apiKey,webOrigin:origin.origin};
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
 const response=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'content-type':'application/json',authorization:`Bearer ${config.apiKey}`,'idempotency-key':`papadata-auth-${id}`},body:JSON.stringify(body)});
 if(!response.ok){await response.body?.cancel();throw new Error(`MAIL_PROVIDER_${response.status}`);}await response.body?.cancel();
}
