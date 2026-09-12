import { ProductSectionFrame } from '../../design-system';
import { useProductLocale } from '../shared/useProductLocale';
export type GovernanceView={mode:string;approval:boolean;execute:string;rollback:string;scopeRequired:boolean;counts:readonly {label:string;value:number}[]};
function record(value:unknown):Record<string,unknown>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};}
export function parseSettingsGovernance(value:unknown):GovernanceView{
 const root=record(value),policy=record(root.governance),effects=record(policy.externalEffects),summary=record(root.summary);
 if(typeof policy.aiMode!=='string'||typeof policy.approvalRequiredForExternalEffects!=='boolean'||typeof policy.tenantWorkspaceScopeRequired!=='boolean')throw new Error('Unsupported AI governance response.');
 return {mode:policy.aiMode,approval:policy.approvalRequiredForExternalEffects,scopeRequired:policy.tenantWorkspaceScopeRequired,execute:typeof effects.execute==='string'?effects.execute:'not_provided',rollback:typeof effects.rollback==='string'?effects.rollback:'not_provided',counts:['openCases','actionProposals','actionApprovals','outcomes'].flatMap(key=>typeof summary[key]==='number'?[{label:key,value:summary[key] as number}]:[])};
}
export function SettingsGovernancePanel({data}:{data:GovernanceView}){
 const {t}=useProductLocale();
 return <ProductSectionFrame icon="assistant" title={t('Papa AI: zasady wykonania','Papa AI: execution policy')} description={t('Rzeczywista odpowiedź backendu. Brak przełącznika nie oznacza automatycznej zgody na narzędzia.','Actual backend response. An absent switch does not imply automatic tool approval.')}>
 <dl className="pd-operations__facts"><div><dt>{t('Tryb','Mode')}</dt><dd>{data.mode}</dd></div><div><dt>{t('Akceptacja skutków zewnętrznych','Approval of external effects')}</dt><dd>{data.approval?t('wymagana','required'):t('niewymagana według serwera','not required by server')}</dd></div><div><dt>{t('Wykonanie','Execution')}</dt><dd>{data.execute}</dd></div><div><dt>{t('Kompensacja','Compensation')}</dt><dd>{data.rollback}</dd></div><div><dt>{t('Izolacja tenant/workspace','Tenant/workspace scope')}</dt><dd>{data.scopeRequired?t('wymagana','required'):t('niepotwierdzona','not confirmed')}</dd></div></dl>
 <p>{t('Polityka pamięci i kontekstu jest edytowana poniżej po odczycie uprawnień. To nie jest zgoda na wykonanie zewnętrznych AI Actions.','Memory and context policy is edited below after permissions are loaded. This does not authorize external AI Actions.')}</p>
 </ProductSectionFrame>;
}
