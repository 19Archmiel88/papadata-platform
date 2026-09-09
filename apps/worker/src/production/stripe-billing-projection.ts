import type { PlatformDatabase } from '@papadata/database';
import { readStripeBillingConfig, StripeBillingClient, stripeId, stripeRecord, stripeTimestamp } from '@papadata/integrations';
/** Read current subscription after a signed event. Arrival order never becomes business order. */
export async function projectStripeBilling(database:PlatformDatabase,payload:Readonly<Record<string,unknown>>):Promise<object>{
 const config=readStripeBillingConfig();if(!config)throw new Error('Billing provider config must also be configured on the worker.');
 const client=new StripeBillingClient(config),object=stripeRecord(payload.stripeObject),eventType=String(payload.stripeEventType??''),eventId=String(payload.stripeEventId??'');
 if(!/^evt_[A-Za-z0-9]+$/.test(eventId))throw new Error('Invalid Stripe event id.');
 const checkout=eventType==='checkout.session.completed'||eventType==='checkout.session.async_payment_succeeded';
 if(!checkout&&!['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed'].includes(eventType))return {status:'ignored',event:eventType};
 const nested=stripeRecord(stripeRecord(object.parent).subscription_details);
 let subscriptionId=checkout?stripeId(object.subscription,'sub'):eventType.startsWith('customer.subscription.')?stripeId(object,'sub'):stripeId(object.subscription??nested.subscription,'sub');
 if(!subscriptionId)return {status:'ignored',reason:'no_subscription'};
 return database.withTransaction(async c=>{
  await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`billing-project:${subscriptionId}`]);
  const duplicate=await c.query('SELECT event_id FROM app.billing_provider_events WHERE event_id=$1',[eventId]);if(duplicate.rows[0])return {status:'duplicate'};
  let tenantId:string,workspaceId:string;
  if(checkout){
   const sessionId=stripeId(object,'cs');if(!sessionId)throw new Error('Missing checkout id.');
   const attempt=await c.query<{tenant_id:string;workspace_id:string}>('SELECT tenant_id,workspace_id FROM app.billing_checkout_sessions WHERE stripe_session_id=$1 FOR UPDATE',[sessionId]);
   if(!attempt.rows[0])throw new Error('Checkout not yet persisted or not initiated by this application.');
   tenantId=attempt.rows[0].tenant_id;workspaceId=attempt.rows[0].workspace_id;
   const current=await client.request(`/checkout/sessions/${sessionId}`);
   subscriptionId=stripeId(current.subscription,'sub');
   if(current.client_reference_id!==`${tenantId}:${workspaceId}`||current.status!=='complete'||!subscriptionId)throw new Error('Checkout scope or completion not confirmed.');
   await c.query("UPDATE app.billing_checkout_sessions SET status='complete' WHERE stripe_session_id=$1",[sessionId]);
  } else {
   const existing=await c.query<{tenant_id:string;workspace_id:string}>('SELECT tenant_id,workspace_id FROM app.workspace_subscriptions WHERE stripe_subscription_id=$1',[subscriptionId]);
   // Retry: subscription.created can arrive before checkout.session.completed.
   if(!existing.rows[0])throw new Error('Subscription is not mapped yet. Retry after checkout mapping.');
   tenantId=existing.rows[0].tenant_id;workspaceId=existing.rows[0].workspace_id;
  }
  const subscription=await client.request(`/subscriptions/${subscriptionId}`),customerId=stripeId(subscription.customer,'cus'),items=stripeRecord(subscription.items).data;
  if(!customerId||!Array.isArray(items)||items.length!==1)throw new Error('Only one-price workspace subscriptions are supported.');
  const item=stripeRecord(items[0]),priceId=stripeId(item.price,'price'),offer=config.prices.find(p=>p.priceId===priceId);
  if(!offer)throw new Error('Subscription price is not in the server-owned plan map.');
  const providerStatus=String(subscription.status??'unknown');
  const status=providerStatus==='active'?'active':providerStatus==='trialing'?'trialing':['canceled','incomplete_expired'].includes(providerStatus)?'canceled':'past_due';
  await c.query(`INSERT INTO app.workspace_subscriptions(tenant_id,workspace_id,plan_id,status,stripe_customer_id,stripe_subscription_id,current_period_end,provider_checked_at,provider_status,cancel_at_period_end) VALUES($1,$2,$3,$4,$5,$6,$7,now(),$8,$9) ON CONFLICT(tenant_id,workspace_id) DO UPDATE SET plan_id=EXCLUDED.plan_id,status=EXCLUDED.status,stripe_customer_id=EXCLUDED.stripe_customer_id,stripe_subscription_id=EXCLUDED.stripe_subscription_id,current_period_end=EXCLUDED.current_period_end,provider_checked_at=now(),provider_status=EXCLUDED.provider_status,cancel_at_period_end=EXCLUDED.cancel_at_period_end,updated_at=now()`,[tenantId,workspaceId,offer.plan,status,customerId,subscriptionId,stripeTimestamp(item.current_period_end??subscription.current_period_end),providerStatus,subscription.cancel_at_period_end===true]);
  await c.query('INSERT INTO app.billing_provider_events(event_id,tenant_id,workspace_id,subscription_id,event_type) VALUES($1,$2,$3,$4,$5)',[eventId,tenantId,workspaceId,subscriptionId,eventType]);
  return {status:'completed',event:eventType,providerStatus};
 });
}
