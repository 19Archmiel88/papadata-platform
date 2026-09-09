import { createHash } from 'node:crypto';
import { BadRequestException, ConflictException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { BillingRepository, ProductionDatabase, IntegrationRepository } from '@papadata/database';
import { entitlementsForMigratedPlan, type BillingOverview, type BillingOffer, type BillingSessionResult, type BillingInvoiceView } from '@papadata/contracts';
import { readStripeBillingConfig, StripeBillingClient, stripeRecord, stripeTimestamp, stripeSafeUrl, stripeId, readPaymentMethodsConfig, resolveStripeCheckoutPaymentMethods, readKsefConfig, KsefAdapter } from '@papadata/integrations';
import type { RequestPrincipal } from '../auth/request-principal.js';
import { object, onlyKeys, string, uuid } from './validation.js';
@Injectable()
export class BillingOperationsService {
 constructor(@Inject(ProductionDatabase) private readonly db:ProductionDatabase){}
 private client():StripeBillingClient|null {try{const config=readStripeBillingConfig();return config?new StripeBillingClient(config):null;}catch{throw new ServiceUnavailableException('Billing provider configuration is invalid. Contact an administrator.');}}
 private async offer(client:StripeBillingClient,id:string):Promise<BillingOffer>{
  const offer=client.config.prices.find(row=>row.priceId===id);if(!offer)throw new BadRequestException('Offer unavailable.');
  const price=await client.request(`/prices/${id}`),recurring=stripeRecord(price.recurring),interval=offer.cycle==='annual'?'year':'month';
  if(price.active!==true||price.type!=='recurring'||recurring.interval!==interval||recurring.interval_count!==1||typeof price.unit_amount!=='number'||!Number.isSafeInteger(price.unit_amount)||price.unit_amount<=0||!['pln','eur','usd'].includes(String(price.currency)))throw new ServiceUnavailableException('Offer is not an active supported recurring price.');
  return {...offer,currency:String(price.currency).toUpperCase(),unitAmount:price.unit_amount,interval,intervalCount:1,taxBehavior:String(price.tax_behavior??'unspecified')};
 }
 async read(p:RequestPrincipal,cursor?:string):Promise<BillingOverview>{
  if(cursor&&!/^in_[A-Za-z0-9]+$/.test(cursor))throw new BadRequestException('Invalid invoice cursor.');
  const subscription=await new BillingRepository(this.db).readSubscription(p.tenantId,p.workspaceId),connections=await new IntegrationRepository(this.db).listConnections(p.tenantId,p.workspaceId);
  const row=await this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>(await c.query<{provider_status:string|null;provider_checked_at:string|null;cancel_at_period_end:boolean|null}>('SELECT provider_status,provider_checked_at::text,cancel_at_period_end FROM app.workspace_subscriptions WHERE tenant_id=$1 AND workspace_id=$2',[p.tenantId,p.workspaceId])).rows[0]);
  const ksefConfig=readKsefConfig(),ksef=new KsefAdapter(ksefConfig);
  const ksefLimitation=ksefConfig.env==='demo'?'KSeF is running in demo mode: invoice KSeF status is a deterministic, network-free simulation for demonstration only, not a real submission to the KSeF API.':ksefConfig.baseUrl&&ksefConfig.certificateRef?'KSeF production mode is configured but not implemented in this build; invoice KSeF status is reported as not connected.':'KSeF is not connected; no KSeF receipt or status is inferred from a Stripe invoice.';
  const paymentMethods=resolveStripeCheckoutPaymentMethods(readPaymentMethodsConfig());
  const paymentLimitations:string[]=[];
  const configuredNotWired=paymentMethods.statuses.filter(s=>!s.wiredToCheckout&&s.enabledByConfig&&s.method!=='apple_pay'&&s.method!=='google_pay');
  if(configuredNotWired.length>0)paymentLimitations.push(`Payment methods enabled in configuration but not yet sent to Stripe for this subscription checkout: ${configuredNotWired.map(s=>s.method).join(', ')}. Stripe does not support them in a subscription-mode Checkout Session.`);
  if(paymentMethods.statuses.some(s=>(s.method==='apple_pay'||s.method==='google_pay')&&s.enabledByConfig))paymentLimitations.push('Real availability of Apple Pay/Google Pay depends on your Stripe Dashboard configuration (domain verification for Apple Pay); this application does not control or verify that.');
  const result:BillingOverview={version:'billing.operations.v1',mode:'disabled',canManage:p.capabilities.includes('billing.manage'),subscription:{plan:subscription.planId,status:subscription.status,customerConfigured:Boolean(subscription.stripeCustomerId),subscriptionConfigured:Boolean(subscription.stripeSubscriptionId),currentPeriodEnd:subscription.currentPeriodEnd,providerStatus:row?.provider_status??null,cancelAtPeriodEnd:row?.cancel_at_period_end??null,providerCheckedAt:row?.provider_checked_at??null},usage:{connectedSources:connections.filter(c=>c.status!=='disconnected').length,maxSources:entitlementsForMigratedPlan(subscription.planId).maxDataSources},offers:[],invoices:[],invoicesHasMore:false,invoiceCursor:null,pendingCheckout:null,portalEnabled:false,paymentMethods:paymentMethods.statuses,limitations:[ksefLimitation,'Provider changes are confirmed only by a verified webhook and server readback.',...paymentLimitations]};
  const pending=await this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>(await c.query<{requestId:string;offerId:string;expiresAt:string}>("SELECT request_id AS \"requestId\",offer_id AS \"offerId\",expires_at::text AS \"expiresAt\" FROM app.billing_checkout_sessions WHERE tenant_id=$1 AND workspace_id=$2 AND actor_id=$3 AND status IN ('preparing','open') AND expires_at>now() ORDER BY created_at DESC LIMIT 1",[p.tenantId,p.workspaceId,p.userId])).rows[0]);
  result.pendingCheckout=pending??null;
  const client=this.client();if(!client){result.limitations=[...result.limitations,'Payment provider is disabled. No prices or payment methods are fabricated.'];return result;}
  result.mode=client.config.mode;result.portalEnabled=Boolean(subscription.stripeCustomerId&&client.config.portalConfiguration);
  try{result.offers=await Promise.all(client.config.prices.map(price=>this.offer(client,price.priceId)));}catch{result.limitations=[...result.limitations,'The provider price catalog could not be read. Checkout is unavailable until it can be verified.'];}
  if(subscription.stripeCustomerId){
   try{
    const collection=await client.request('/invoices','GET',{customer:subscription.stripeCustomerId,limit:'25',...(cursor?{starting_after:cursor}:{})});
    if(!Array.isArray(collection.data))throw new Error('Invoice response invalid.');
    result.invoices=await Promise.all(collection.data.map(async (value:unknown):Promise<BillingInvoiceView>=>{
     const invoice=stripeRecord(value),id=stripeId(invoice,'in');
     if(!id||stripeId(invoice.customer,'cus')!==subscription.stripeCustomerId||typeof invoice.total!=='number'||typeof invoice.amount_remaining!=='number')throw new Error('Invalid invoice scope.');
     const createdAt=stripeTimestamp(invoice.created)??'';
     let ksefStatus:BillingInvoiceView['ksefStatus']='not_connected';
     try{const status=await ksef.statusFor({localInvoiceId:id,createdAt});if(status.ok)ksefStatus=status.reference.status;}catch{/* keep 'not_connected' -- a KSeF adapter failure must never hide the invoice itself */}
     return {id,number:typeof invoice.number==='string'?invoice.number:null,currency:String(invoice.currency).toUpperCase(),total:invoice.total,due:invoice.amount_remaining,status:String(invoice.status??'unknown'),createdAt,dueAt:stripeTimestamp(invoice.due_date),pdfUrl:stripeSafeUrl(invoice.invoice_pdf,['pay.stripe.com','invoice.stripe.com']),paymentUrl:stripeSafeUrl(invoice.hosted_invoice_url,['invoice.stripe.com']),ksefStatus};
    }));result.invoicesHasMore=collection.has_more===true;result.invoiceCursor=result.invoices.at(-1)?.id??null;
   }catch{result.limitations=[...result.limitations,'Invoices are temporarily unavailable. This does not mean that the invoice count is zero.'];}
  }
  return result;
 }
 async session(p:RequestPrincipal,value:unknown):Promise<BillingSessionResult>{
  const raw=object(value);onlyKeys(raw,['requestId','action','offerId']);const requestId=uuid(raw.requestId),action=string(raw.action);
  const client=this.client();if(!client)throw new ServiceUnavailableException('Billing provider is not configured.');
  if(action!=='checkout'&&action!=='portal')throw new BadRequestException('Unsupported billing action.');
  const subscription=await new BillingRepository(this.db).readSubscription(p.tenantId,p.workspaceId);
  const returnUrl=`${client.config.returnOrigin}/app/billing?providerReturn=1`;
  if(action==='portal'){
   if(!subscription.stripeCustomerId||!client.config.portalConfiguration)throw new ConflictException('A billing customer and an explicitly configured portal are required.');
   const response=await client.request('/billing_portal/sessions','POST',{customer:subscription.stripeCustomerId,return_url:returnUrl,configuration:client.config.portalConfiguration},`portal:${p.tenantId}:${p.workspaceId}:${p.userId}:${requestId}`);
   const url=stripeSafeUrl(response.url,['billing.stripe.com']);if(!url)throw new ServiceUnavailableException('Invalid portal URL.');
   return {url,action,mode:client.config.mode,status:'requires_provider_confirmation'};
  }
  const paymentMethods=resolveStripeCheckoutPaymentMethods(readPaymentMethodsConfig());
  if(paymentMethods.types.length===0)throw new ServiceUnavailableException('No payment method is enabled for checkout in the current configuration.');
  const offer=await this.offer(client,string(raw.offerId,7,100));
  type Intent={request_id:string;actor_id:string;offer_id:string;stripe_session_id:string|null;status:string;expires_at:string;request_params:Record<string,string>;configuration_hash:string};
  // Commit the intent BEFORE contacting Stripe. Retries use the identical parameters,
  // including expires_at, even if the first response was lost or the DB was unavailable.
  const intent=await this.db.withTenantWorkspace(p.tenantId,p.workspaceId,async c=>{
   await c.query('SELECT workspace_id FROM app.workspaces WHERE tenant_id=$1 AND workspace_id=$2 FOR UPDATE',[p.tenantId,p.workspaceId]);
   const live=(await c.query<{stripe_subscription_id:string|null;stripe_customer_id:string|null}>(`SELECT stripe_subscription_id,stripe_customer_id FROM app.workspace_subscriptions WHERE tenant_id=$1 AND workspace_id=$2`,[p.tenantId,p.workspaceId])).rows[0];
   if(live?.stripe_subscription_id)throw new ConflictException('An existing subscription must be managed through the customer portal, not a second checkout.');
   const configurationHash=createHash('sha256').update(JSON.stringify({mode:client.config.mode,price:offer.priceId,customer:live?.stripe_customer_id??null,returnUrl,paymentMethodTypes:paymentMethods.types})).digest('hex');
   const attempts=await c.query<Intent>(`SELECT *,expires_at::text FROM app.billing_checkout_sessions WHERE tenant_id=$1 AND workspace_id=$2 AND (request_id=$3 OR (status IN ('preparing','open','complete') AND (status='complete' OR expires_at>now()))) ORDER BY created_at DESC LIMIT 20`,[p.tenantId,p.workspaceId,requestId]);
   if(attempts.rows.some(row=>row.request_id!==requestId))throw new ConflictException('A checkout is already pending. Resume it or let it expire before creating another.');
   const prior=attempts.rows.find(row=>row.request_id===requestId);
   if(prior){
    if(prior.offer_id!==offer.priceId||prior.actor_id!==p.userId||prior.configuration_hash!==configurationHash)throw new ConflictException('Request identifier belongs to a different checkout or provider configuration.');
    if(prior.status==='expired'||Date.parse(prior.expires_at)<=Date.now())throw new ConflictException('This checkout attempt has expired. Start a new one.');
    return prior;
   }
   const expires=Math.floor(Date.now()/1000)+3600;
   const params:Record<string,string>={mode:'subscription',...Object.fromEntries(paymentMethods.types.map((type,index)=>[`payment_method_types[${index}]`,type])),'line_items[0][price]':offer.priceId,'line_items[0][quantity]':'1',client_reference_id:`${p.tenantId}:${p.workspaceId}`,'metadata[planId]':offer.plan,'subscription_data[metadata][planId]':offer.plan,success_url:returnUrl,cancel_url:returnUrl,expires_at:String(expires),...(live?.stripe_customer_id?{customer:live.stripe_customer_id}:{})};
   return (await c.query<Intent>(`INSERT INTO app.billing_checkout_sessions(tenant_id,workspace_id,request_id,actor_id,offer_id,status,expires_at,request_params,configuration_hash) VALUES($1,$2,$3,$4,$5,'preparing',to_timestamp($6),$7::jsonb,$8) RETURNING *,expires_at::text`,[p.tenantId,p.workspaceId,requestId,p.userId,offer.priceId,expires,JSON.stringify(params),configurationHash])).rows[0]!;
  });
  const response=intent.stripe_session_id?await client.request(`/checkout/sessions/${intent.stripe_session_id}`):await client.request('/checkout/sessions','POST',intent.request_params,`checkout:${p.tenantId}:${p.workspaceId}:${p.userId}:${requestId}`);
  const id=stripeId(response,'cs');
  if(!id||response.client_reference_id!==`${p.tenantId}:${p.workspaceId}`)throw new ServiceUnavailableException('Invalid checkout identity returned by the provider.');
  const status=response.status==='complete'?'complete':response.status==='expired'?'expired':'open';
  await this.db.withTenantWorkspace(p.tenantId,p.workspaceId,c=>c.query(`UPDATE app.billing_checkout_sessions SET stripe_session_id=$4,status=$5 WHERE tenant_id=$1 AND workspace_id=$2 AND request_id=$3 AND (stripe_session_id IS NULL OR stripe_session_id=$4)`,[p.tenantId,p.workspaceId,requestId,id,status]));
  if(response.status!=='open')throw new ConflictException('This checkout is no longer open. Refresh the billing state.');
  const url=stripeSafeUrl(response.url,['checkout.stripe.com']);if(!url)throw new ServiceUnavailableException('Invalid checkout URL.');
  return {url,action:'checkout',mode:client.config.mode,status:'requires_provider_confirmation'};
 }
}
