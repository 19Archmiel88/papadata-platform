export const cookieConsentCategoryIds=['necessary','preferences','analytics','marketing'] as const;
export type CookieConsentCategoryId=typeof cookieConsentCategoryIds[number];
// `necessary` is the literal `true` (not `boolean`) deliberately: no value
// of this type can ever express necessary:false, so a caller cannot
// construct an invalid decision even before it reaches runtime validation.
export type CookieConsentCategories={
 readonly necessary:true;
 readonly preferences:boolean;
 readonly analytics:boolean;
 readonly marketing:boolean;
};
export type CookieConsentDecision={
 readonly categories:CookieConsentCategories;
 readonly version:string;
 readonly decidedAt:string;
};
// `decision` is the most recent decision on record, even when it was made
// against an older `currentVersion` -- callers must compare the two
// (isCookieConsentDecisionCurrent) rather than assume a non-null decision
// means "no action needed". A stale decision is still real history, not a
// fabricated one.
export type CookieConsentStatus={
 readonly currentVersion:string;
 readonly decision:CookieConsentDecision|null;
};
export function parseCookieConsentCategories(value:unknown):CookieConsentCategories{
 if(!isRecord(value))throw new Error('Cookie consent categories must be an object.');
 const keys=Object.keys(value);
 const expected=['analytics','marketing','preferences'] as const;
 if(keys.length!==expected.length||!expected.every(key=>keys.includes(key))){
  throw new Error('Cookie consent categories must contain preferences, analytics and marketing only.');
 }
 for(const key of expected){
  if(typeof value[key]!=='boolean')throw new Error(`Cookie consent category "${key}" must be boolean.`);
 }
 return {
  analytics:value.analytics as boolean,
  marketing:value.marketing as boolean,
  necessary:true,
  preferences:value.preferences as boolean,
 };
}
export function isCookieConsentDecisionCurrent(
 decision:CookieConsentDecision|null,
 currentVersion:string,
):decision is CookieConsentDecision{
 return decision!==null&&decision.version===currentVersion;
}

function isRecord(value:unknown):value is Record<string,unknown>{
 return value!==null&&typeof value==='object'&&!Array.isArray(value);
}
