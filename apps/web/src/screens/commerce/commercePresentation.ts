import type { CommerceFulfillment, CommercePayment, CommerceMeta } from '@papadata/contracts';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { formatPapaDataCurrency, formatPapaDataNumber } from '../../design-system/foundations';
export const paymentLabels:Record<CommercePayment,readonly [string,string]>={paid:['Opłacone','Paid'],pending:['Oczekuje','Pending'],failed:['Nieudana','Failed'],refunded:['Zwrócone','Refunded'],partial:['Częściowe','Partial'],unknown:['Nieustalone','Unknown']};
export const fulfillmentLabels:Record<CommerceFulfillment,readonly [string,string]>={fulfilled:['Zrealizowane','Fulfilled'],processing:['W realizacji','Processing'],pending:['Oczekuje','Pending'],cancelled:['Anulowane','Cancelled'],unknown:['Nieustalone','Unknown']};
export function commerceMoney(value:number|null|undefined,currency:string|null|undefined,language:string):string {
  if(value==null||!Number.isFinite(value))return '—';
  const locale=language.startsWith('en')?'en':'pl';
  if(!currency||currency==='XXX')return `${formatPapaDataNumber(value,locale)} (${language.startsWith('pl')?'waluta nieznana':'unknown currency'})`;
  return formatPapaDataCurrency(value,locale,currency);
}
export function commerceNumber(value:number|null|undefined,language:string):string {
  if(value==null||!Number.isFinite(value))return '—';
  return formatPapaDataNumber(value,language.startsWith('en')?'en':'pl');
}
// Timezone + time-of-day display has no equivalent in formatPapaDataDate (date-only, no timeZone option) — kept local.
export function commerceTimestamp(value:string|null|undefined,timezone:string,language:string):string {
  return value&&Number.isFinite(Date.parse(value))?new Intl.DateTimeFormat(language,{timeZone:timezone,dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
}
export function commerceState(meta:CommerceMeta|null|undefined,state:RemoteState):RemoteState|'partial'|'stale'|'empty' {
  if(state!=='ready')return state;
  return meta?.quality==='selection_required'?'empty':meta?.quality??'empty';
}
