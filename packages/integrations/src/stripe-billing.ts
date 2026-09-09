import type { PaymentMethodType, BillingPaymentMethodStatus } from '@papadata/contracts';
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

/** Feature flags read once per checkout. Fail-closed like PAPADATA_PAPA_REMOTE_ENABLED
 * elsewhere in this repo (see config/p0-integrations.env.example): an unset or non-'true'
 * value means disabled, there is no other implicit default. */
export type PaymentMethodsConfig = {readonly card:boolean;readonly blik:boolean;readonly blikRecurring:boolean;readonly fastBankTransfer:boolean;readonly bankTransfer:boolean;readonly applePay:boolean;readonly googlePay:boolean};
export function readPaymentMethodsConfig(env:NodeJS.ProcessEnv=process.env):PaymentMethodsConfig {
 return {
  card:env.PAYMENT_ENABLE_CARD==='true',
  blik:env.PAYMENT_ENABLE_BLIK==='true',
  blikRecurring:env.PAYMENT_ENABLE_BLIK_RECURRING==='true',
  fastBankTransfer:env.PAYMENT_ENABLE_FAST_TRANSFER==='true',
  bankTransfer:env.PAYMENT_ENABLE_BANK_TRANSFER==='true',
  applePay:env.PAYMENT_ENABLE_APPLE_PAY==='true',
  googlePay:env.PAYMENT_ENABLE_GOOGLE_PAY==='true',
 };
}

export type StripeCheckoutPaymentMethodPlan = {readonly types:readonly string[];readonly statuses:readonly BillingPaymentMethodStatus[]};
const ALL_PAYMENT_METHOD_TYPES:readonly PaymentMethodType[] = ['card','blik','blik_recurring','fast_bank_transfer','traditional_bank_transfer','apple_pay','google_pay'];

// -----------------------------------------------------------------------
// Mapping PaymentMethodType -> Stripe `payment_method_types` values for THIS repo's
// checkout, which BillingOperationsService.session always creates with mode:'subscription'.
// Confirmed live against Stripe's own payment-method-support docs
// (docs.stripe.com/payments/payment-methods/payment-method-support, fetched 2026-09-09):
//  - card: fully supported in Checkout subscription mode. HIGH confidence.
//  - apple_pay / google_pay: NOT distinct `payment_method_types` values at all (that doc's
//    own "API enum" column lists "- Unsupported" for both). They ride on `card` automatically
//    once `card` is in the array AND the wallet is turned on in the Stripe Dashboard (Apple
//    Pay additionally needs domain verification there). This code can make sure `card` is
//    present for them but cannot control or verify the Dashboard side. HIGH confidence on "no
//    separate value exists"; the Dashboard dependency is inherently outside this repo.
//  - blik: a real Stripe payment method (`blik`), but the same doc's "Bank redirects product
//    support" table marks Checkout for BLIK as unsupported "when using Checkout in
//    subscription mode" -- exactly the mode this repo always uses for checkout. NOT sent to
//    Stripe here. A working BLIK checkout would need a separate one-time (`mode:'payment'`)
//    or invoice-based flow -- not built by this change. HIGH confidence this exact mapping is
//    unusable as-is for the existing subscription checkout; LOW confidence about what the
//    eventual one-time-flow mapping should look like, since that flow does not exist yet.
//  - blik_recurring: Stripe has no such `payment_method_types` value. Recurring BLIK is a
//    distinct feature (a SetupIntent with usage:'off_session', then a later off-session
//    PaymentIntent charge -- see docs.stripe.com/payments/blik/set-up-payment), not a Checkout
//    Session parameter, and Stripe additionally caps off-session BLIK charges at 2000 PLN and
//    notes not all Polish banks support it. NOT implemented by this change -- flagged here
//    rather than guessed, per this task's own instruction to surface uncertainty explicitly.
//  - fast_bank_transfer: mapped conceptually to Stripe's `p24` (Przelewy24), the common Polish
//    redirect bank transfer method -- UNVERIFIED beyond that conceptual mapping, and moot for
//    this integration point regardless, since the same product-support table marks P24's
//    Checkout support unsupported in subscription mode too. NOT sent to Stripe here.
//  - traditional_bank_transfer: mapped to Stripe's `customer_balance` bank-transfer type,
//    which is one-time-only by construction (no SetupIntent support at all, per that doc's
//    API-support table) and is, once again, unsupported in Checkout subscription mode. NOT
//    sent to Stripe here.
// None of blik/blik_recurring/fast_bank_transfer/traditional_bank_transfer can become sendable
// here without a broader change (a separate one-time/invoice checkout path). The honest thing
// to report meanwhile is "configured, not yet deliverable through this checkout" -- see the
// `note` on each BillingPaymentMethodStatus row below and BillingOperationsService.read's
// limitations array, rather than silently pretending PAYMENT_ENABLE_BLIK etc. have an effect.
// -----------------------------------------------------------------------
function describePaymentMethod(method:PaymentMethodType,config:PaymentMethodsConfig,cardFamily:boolean):BillingPaymentMethodStatus {
 switch(method){
  case 'card':return {method,enabledByConfig:config.card,wiredToCheckout:cardFamily,note:!cardFamily?'Disabled: no payment method is enabled for this checkout.':config.card?'Sent to Stripe as payment_method_types=card.':'Sent to Stripe as payment_method_types=card because Apple Pay/Google Pay require it, even though PAYMENT_ENABLE_CARD is false.'};
  case 'apple_pay':return {method,enabledByConfig:config.applePay,wiredToCheckout:false,note:'Stripe has no separate apple_pay payment_method_types value; it rides on card automatically when enabled AND verified for this domain in the Stripe Dashboard (outside this repo). This flag alone does not guarantee Apple Pay appears.'};
  case 'google_pay':return {method,enabledByConfig:config.googlePay,wiredToCheckout:false,note:'Stripe has no separate google_pay payment_method_types value; it rides on card automatically when turned on in the Stripe Dashboard (outside this repo). This flag alone does not guarantee Google Pay appears.'};
  case 'blik':return {method,enabledByConfig:config.blik,wiredToCheckout:false,note:'Not sent to Stripe: BLIK is not supported in a subscription-mode Checkout Session (confirmed against Stripe payment-method-support docs, fetched 2026-09-09). Would need a separate one-time or invoice-based checkout flow, not built here.'};
  case 'blik_recurring':return {method,enabledByConfig:config.blikRecurring,wiredToCheckout:false,note:'Not implemented: Stripe has no blik_recurring payment_method_types value. Recurring BLIK needs a dedicated SetupIntent(usage=off_session) plus a later off-session PaymentIntent, not this Checkout Session.'};
  case 'fast_bank_transfer':return {method,enabledByConfig:config.fastBankTransfer,wiredToCheckout:false,note:'Not sent to Stripe: maps conceptually to Stripe p24 (Przelewy24), which is also unsupported in a subscription-mode Checkout Session. Would need a separate one-time or invoice-based checkout flow, not built here.'};
  case 'traditional_bank_transfer':return {method,enabledByConfig:config.bankTransfer,wiredToCheckout:false,note:'Not sent to Stripe: maps to Stripe customer_balance (bank transfer) type, which is one-time-only and unsupported in a subscription-mode Checkout Session.'};
  default:{const exhaustive:never=method;return exhaustive;}
 }
}
export function resolveStripeCheckoutPaymentMethods(config:PaymentMethodsConfig):StripeCheckoutPaymentMethodPlan {
 const cardFamily=config.card||config.applePay||config.googlePay;
 const types:string[]=cardFamily?['card']:[];
 const statuses=ALL_PAYMENT_METHOD_TYPES.map(method=>describePaymentMethod(method,config,cardFamily));
 return {types,statuses};
}
