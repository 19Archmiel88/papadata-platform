import type { CommerceFulfillment, CommercePayment, CommerceMeta } from '@papadata/contracts';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
export const paymentLabels:Record<CommercePayment,readonly [string,string]>={paid:['Opłacone','Paid'],pending:['Oczekuje','Pending'],failed:['Nieudana','Failed'],refunded:['Zwrócone','Refunded'],partial:['Częściowe','Partial'],unknown:['Nieustalone','Unknown']};
export const fulfillmentLabels:Record<CommerceFulfillment,readonly [string,string]>={fulfilled:['Zrealizowane','Fulfilled'],processing:['W realizacji','Processing'],pending:['Oczekuje','Pending'],cancelled:['Anulowane','Cancelled'],unknown:['Nieustalone','Unknown']};
export function commerceMoney(value:number|null|undefined,currency:string|null|undefined,language:string):string {
  if(value==null||!Number.isFinite(value))return '—';
  if(!currency||currency==='XXX')return `${new Intl.NumberFormat(language,{maximumFractionDigits:2}).format(value)} (${language.startsWith('pl')?'waluta nieznana':'unknown currency'})`;
  return new Intl.NumberFormat(language,{style:'currency',currency}).format(value);
}
export function commerceNumber(value:number|null|undefined,language:string):string {
  return value==null||!Number.isFinite(value)?'—':new Intl.NumberFormat(language,{maximumFractionDigits:2}).format(value);
}
export function commerceTimestamp(value:string|null|undefined,timezone:string,language:string):string {
  return value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat(language,{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
}
export function commerceState(meta:CommerceMeta|null|undefined,state:RemoteState):RemoteState|'partial'|'stale'|'empty' {
  if(state!=='ready')return state;
  return meta?.quality==='selection_required'?'empty':meta?.quality??'empty';
}
