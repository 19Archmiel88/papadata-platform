/** Hosted billing only: no card data or SDK objects cross the application boundary. */
export type BillingPriceConfig = { plan: 'starter'|'growth'|'scale'; cycle:'monthly'|'annual'; priceId:string; name:string };
export type StripeBillingConfig = { mode:'test'|'live'; secretKey:string; apiVersion:string; returnOrigin:string; portalConfiguration:string|null; prices:readonly BillingPriceConfig[] };
export function readStripeBillingConfig(env:NodeJS.ProcessEnv=process.env):StripeBillingConfig|null {
 if(env.PAPADATA_BILLING_MODE!=='test'&&env.PAPADATA_BILLING_MODE!=='live')return null;
 const mode=env.PAPADATA_BILLING_MODE,secretKey=env.STRIPE_SECRET_KEY??'',apiVersion=env.STRIPE_API_VERSION??'',returnOrigin=env.PAPADATA_BILLING_RETURN_ORIGIN??'';
 if(!secretKey.startsWith(`sk_${mode}_`)||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}(\.[a-z]+)?$/.test(apiVersion))throw new Error('Billing mode, Stripe key and pinned API version must match.');
 if(mode==='live'&&env.PAPADATA_BILLING_ALLOW_LIVE!=='true')throw new Error('Live billing requires explicit operator authorization.');
 const origin=new URL(returnOrigin);
 if(origin.username||origin.password||origin.search||origin.hash||origin.pathname!=='/'||(origin.protocol!=='https:'&&!(mode==='test'&&origin.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(origin.hostname))))throw new Error('Billing return origin must use HTTPS, or localhost for test mode.');
 const parsed:unknown=JSON.parse(env.PAPADATA_BILLING_PRICES_JSON??'[]');
 if(!Array.isArray(parsed)||parsed.length>6)throw new Error('Billing price catalog must have at most six offers.');
 const prices:BillingPriceConfig[]=parsed.map((value:unknown)=>{
  if(!value||typeof value!=='object')throw new Error('Invalid price catalog.');
  const row=value as Record<string,unknown>;
  if(!['starter','growth','scale'].includes(String(row.plan))||!['monthly','annual'].includes(String(row.cycle))||!/^price_[A-Za-z0-9]+$/.test(String(row.priceId))||typeof row.name!=='string'||row.name.length>80)throw new Error('Invalid price catalog entry.');
  return {plan:row.plan as BillingPriceConfig['plan'],cycle:row.cycle as BillingPriceConfig['cycle'],priceId:String(row.priceId),name:row.name};
 });
 if(new Set(prices.map(p=>p.priceId)).size!==prices.length||new Set(prices.map(p=>`${p.plan}:${p.cycle}`)).size!==prices.length)throw new Error('Duplicate billing offer.');
 const portalConfiguration=env.STRIPE_PORTAL_CONFIGURATION||null;
 if(portalConfiguration&&!/^bpc_[A-Za-z0-9]+$/.test(portalConfiguration))throw new Error('Invalid portal configuration.');
 return {mode,secretKey,apiVersion,returnOrigin:origin.origin,portalConfiguration,prices};
}
export class StripeBillingClient {
 readonly config: StripeBillingConfig;

 constructor(config: StripeBillingConfig) {
  this.config = config;
 }
 async request(path:string,method:'GET'|'POST'='GET',values:Readonly<Record<string,string>>={},idempotencyKey?:string):Promise<Record<string,unknown>> {
  if(!/^\/(prices|customers|subscriptions|invoices|checkout\/sessions|billing_portal\/sessions)(\/[A-Za-z0-9_]+)?$/.test(path))throw new Error('Unsupported billing resource.');
  const query=new URLSearchParams(values),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try {
   const response=await fetch(`https://api.stripe.com/v1${path}${method==='GET'&&query.size?`?${query}`:''}`,{method,redirect:'error',signal:controller.signal,headers:{Authorization:`Bearer ${this.config.secretKey}`,'Stripe-Version':this.config.apiVersion,...(method==='POST'?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotencyKey?{'Idempotency-Key':idempotencyKey}:{})},...(method==='POST'?{body:query.toString()}:{})});
   // Never forward provider errors (which may contain account identifiers or submitted data).
   if(!response.ok)throw new Error(`Billing provider request failed (${response.status}). Retry with the same request identifier.`);
   const text=await response.text();if(text.length>2*1024*1024)throw new Error('Billing response exceeds its safe limit.');
   const json:unknown=JSON.parse(text);if(!json||typeof json!=='object'||Array.isArray(json))throw new Error('Invalid billing response.');
   const result=json as Record<string,unknown>;
   if(typeof result.livemode==='boolean'&&result.livemode!==(this.config.mode==='live'))throw new Error('Billing response mode does not match the configured environment.');
   return result;
  } finally {clearTimeout(timer);}
 }
}
export function stripeRecord(value:unknown):Record<string,unknown>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};}
export function stripeId(value:unknown,prefix:string):string|null {const id=typeof value==='string'?value:stripeRecord(value).id;return typeof id==='string'&&new RegExp(`^${prefix}_[A-Za-z0-9_]+$`).test(id)?id:null;}
export function stripeTimestamp(value:unknown):string|null {return typeof value==='number'&&Number.isFinite(value)&&value>0&&value<1e11?new Date(value*1000).toISOString():null;}
export function stripeSafeUrl(value:unknown,hosts:readonly string[]):string|null {if(typeof value!=='string')return null;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&hosts.includes(u.hostname)?u.href:null;}catch{return null;}}
