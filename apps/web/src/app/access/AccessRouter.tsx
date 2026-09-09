import {useEffect,useRef,useState} from 'react';
import type {AccessSurfaceId} from '@papadata/contracts';
import {Button} from '../../design-system';
import {AuthSurface,type AuthSurfaceMode,type AuthSurfaceProps} from '../../runtime/features/auth/AuthSurface';
import {AccessFlowScreen,type AccessFlowAction} from '../../runtime/features/auth/AccessFlowScreen';
import {businessOutcomeMessage,oauthErrorMessage} from '../../runtime/features/auth/oauthOutcomes';
import {bffClient,BffProblem,type OAuthAvailability,type OAuthCallbackResult} from '../../runtime/shared/api/bffClient';
import type {AuthSessionRuntime} from '../../runtime/shared/auth/authSessionRuntime';
import {useRemoteResource} from '../../runtime/shared/data/useRemoteResource';
import {safeRandomUUID} from '../../runtime/shared/id/safeRandomUUID';
import {navigate} from '../../runtime/app/routing/navigation';
import {MfaSetupDialog} from '../../screens/platform-operations/MfaSetupDialog';
import {useProductLocale} from '../../screens/shared/useProductLocale';
import {accessRoutes} from './accessRoutes';
export {accessRoutes,isAccessRoute} from './accessRoutes';
function safeDestination(value:string|null):string{try{const url=new URL(value??'/app',window.location.origin);return url.origin===window.location.origin&&(url.pathname==='/app'||url.pathname.startsWith('/app/'))?url.pathname+url.search:'/app';}catch{return '/app';}}
const callbacks=new Map<string,Promise<OAuthCallbackResult>>();
function completeOnce(code:string,state:string):Promise<OAuthCallbackResult>{
 let pending=callbacks.get(state);if(!pending){pending=bffClient.completeOAuthCallback({code,state});callbacks.set(state,pending);setTimeout(()=>callbacks.delete(state),120_000);}return pending;
}
export function AccessRouter({locationPath,runtime}:{locationPath:string;runtime:AuthSessionRuntime}){
 const scope=`${runtime.session?.userId??'anon'}:${runtime.session?.activeTenantId??''}:${runtime.session?.activeWorkspaceId??''}`;
 return <AccessRuntime key={scope} locationPath={locationPath} runtime={runtime} scope={scope}/>;
}
function AccessRuntime({locationPath,runtime,scope}:{locationPath:string;runtime:AuthSessionRuntime;scope:string}){
 const {t}=useProductLocale(),path=locationPath.split('?')[0]??'/auth',query=new URLSearchParams(locationPath.split('?')[1]??'');
 const [secrets,setSecrets]=useState(()=>{const q=new URLSearchParams(window.location.search),f=new URLSearchParams(window.location.hash.slice(1));return {token:f.get('token')??q.get('token')??'',resetToken:f.get('resetToken')??q.get('resetToken')??'',code:q.get('code')??'',state:q.get('state')??'',invitationId:q.get('invitationId')??'',error:q.get('error')??''};});
 const [availability,setAvailability]=useState<OAuthAvailability|undefined>(),[problem,setProblem]=useState<string|null>(null),[notice,setNotice]=useState<string|null>(null),[busy,setBusy]=useState(false),[mfa,setMfa]=useState(false),[recovery,setRecovery]=useState(false),[recoveryCode,setRecoveryCode]=useState('');
 const lock=useRef(false),alive=useRef(true),lastMutation=useRef<{signature:string;id:string}|null>(null),resendAt=useRef(0);
 const resource=useRemoteResource(scope,async signal=>runtime.session?bffClient.readAccessLifecycle(signal):null);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{let active=true;void bffClient.readAuthStatus().then(status=>{if(active)setAvailability(status.oauth);}).catch(()=>undefined);return()=>{active=false;};},[]);
 useEffect(()=>{
  const url=new URL(window.location.href);if(['code','state','token','resetToken','error_description','error'].some(k=>url.searchParams.has(k))||url.hash){for(const k of ['code','state','token','resetToken','error_description','error'])url.searchParams.delete(k);url.hash='';window.history.replaceState(null,'',url.pathname+url.search);}
 },[]);
 useEffect(()=>{if(path!=='/oauth/callback')return;let active=true;setBusy(true);setProblem(null);
  if(secrets.error||!secrets.code||!secrets.state){setProblem(t('Logowanie przerwane lub link niekompletny. Rozpocznij ponownie.','Sign-in was cancelled or the callback is incomplete. Start again.'));setBusy(false);return;}
  void completeOnce(secrets.code,secrets.state).then(result=>{if(!active)return;
   if(result.outcome==='authenticated'||result.outcome==='reauth_confirmed'){runtime.applySession(result.session);navigate(safeDestination(result.returnTo),{replace:true});}
   else if(result.outcome==='linked'){navigate('/app/settings?settingsView=security',{replace:true});}
   else setProblem(businessOutcomeMessage(result.outcome));
  }).catch(cause=>{if(active)setProblem(oauthErrorMessage(cause instanceof BffProblem?cause.code:null,cause instanceof Error?cause.message:'OAuth failed.'));}).finally(()=>{if(active){setBusy(false);setSecrets(s=>({...s,code:'',state:''}));}});
  return()=>{active=false;};
 },[path]);
 const target=()=>safeDestination(runtime.reauth?.returnTo??query.get('returnTo')??(path.startsWith('/app')?locationPath:'/app'));
 const finishLogin=(session:Parameters<AuthSessionRuntime['applySession']>[0])=>{runtime.applySession(session);navigate(session.memberships.length>1?`/auth/organization?returnTo=${encodeURIComponent(target())}`:target());};
 const declared=accessRoutes[path];let surface:AccessSurfaceId=declared??'auth-02';
 if(surface==='auth-26'&&runtime.session)surface='auth-25';
 if(runtime.status==='service_unavailable')surface='auth-27';else if(runtime.status==='reauth_required')surface=runtime.reauth?.level==='mfa'?'auth-16':'auth-24';
 const protectedFlow=['auth-07','auth-08','auth-09','auth-10','auth-11','auth-12','auth-13','auth-14','auth-16','auth-17','auth-21','auth-22','auth-23','auth-24','auth-25','auth-29'].includes(surface);
 if(protectedFlow&&!runtime.session)surface='auth-02';
 const modes:Partial<Record<AccessSurfaceId,AuthSurfaceMode>>={'auth-01':'entry','auth-02':'login','auth-03':'register','auth-04':'register','auth-15':'accept-invite','auth-16':'mfa','auth-18':'recover','auth-20':'recover','auth-24':'reauth'};
 const mode=modes[surface];
 const authProps:AuthSurfaceProps={mode:mode??'login',state:'ready',tokenResetOnly:true,initialRegistrationStage:surface==='auth-04'?'email':'choice',initialEmail:query.get('email')??'',initialInvitationId:secrets.invitationId,initialInvitationToken:secrets.token,initialResetToken:secrets.resetToken,oauthAvailability:availability,onNavigate:navigate,
  onLogin:async input=>{const result=await bffClient.login(input);finishLogin(result.session);},
  onRegister:async input=>{const result=await bffClient.register(input);runtime.applySession(result.session);navigate('/app/onboarding');},
  onAcceptInvitation:async input=>{const result=await bffClient.acceptInvitation({displayName:input.displayName,invitationId:input.invitationId,password:input.password,token:input.token});if(!result.accepted)throw new Error(t('Zaproszenie nie zostalo przyjete. Sprawdz haslo i waznosc linku.','Invitation was not accepted. Check password and link validity.'));navigate('/login');},
  onValidateInvitation:input=>bffClient.validateInvitation(input),
  onPasswordRecoveryRequest:async input=>{await bffClient.requestPasswordRecovery(input);navigate('/auth/recovery-sent');},
  onPasswordReset:async input=>{await bffClient.resetPassword(input);setSecrets(s=>({...s,resetToken:''}));navigate('/login');},
  onMfaConfirm:async input=>{const result=await bffClient.verifyMfa(input);runtime.applySession(result.session);navigate(target());},
  onStepUpConfirm:async input=>{const result=await bffClient.stepUp({code:input.code,operationScope:'runtime.shell'});runtime.applySession(result.session);navigate(target());},
  onSelectWorkspace:async id=>{const next=await runtime.runAuthenticatedCommand(()=>bffClient.selectWorkspace(id),locationPath);runtime.applySession(next);navigate(target());},onRetry:runtime.retryBootstrap,
  onUseRecoveryCode:()=>setRecovery(true),
  onOAuthContinue:async input=>{
   const next=input.intent==='link_account'?await bffClient.linkOAuthAccount({provider:input.provider,returnTo:target()}):input.intent==='reauth'?await bffClient.startOAuthReauth({provider:input.provider,returnTo:target()}):await bffClient.startOAuth({provider:input.provider,intent:input.intent,returnTo:input.intent==='register'?'/app/onboarding':target(),...(input.intent==='accept_invitation'?{invitationId:secrets.invitationId,invitationToken:secrets.token}:{})});
   const url=new URL(next.redirectUrl);if(url.protocol!=='https:')throw new Error('OAuth redirect must use HTTPS.');window.location.assign(url.href);
  },
 };
 async function action(kind:AccessFlowAction,input?:unknown){
  if(lock.current)return;lock.current=true;setBusy(true);setProblem(null);setNotice(null);
  try{
   if(kind==='retry'){await runtime.retryBootstrap();if(runtime.session)await resource.reload();}
   else if(kind==='mfa')setMfa(true);
   else if(kind==='logout'){await bffClient.logout();navigate('/auth/logged-out');}
   else if(kind==='verify'){await bffClient.verifyAccessEmail(secrets.token);setSecrets(s=>({...s,token:''}));setNotice(t('Adres potwierdzony. Zaloguj sie lub odswiez stan.','Email verified. Sign in or refresh the status.'));await resource.reload();}
   else if(kind==='resend'){if(Date.now()-resendAt.current<60_000)throw new Error(t('Odczekaj minute przed kolejnym linkiem.','Wait one minute before requesting another link.'));const email=(input as {email:string}).email;await bffClient.resendAccessEmail(email);resendAt.current=Date.now();setNotice(t('Zlecenie przyjete. Jezeli adres spelnia warunki, wiadomosc zostanie wyslana.','Request accepted. If eligible, an email will be sent.'));}
   else{
    const signature=JSON.stringify({kind,input});if(lastMutation.current?.signature!==signature)lastMutation.current={signature,id:safeRandomUUID()};
    const payload={...(input&&typeof input==='object'?input:{}),requestId:lastMutation.current.id};
    await runtime.runAuthenticatedCommand(()=>bffClient.commandAccessLifecycle(kind,payload),locationPath);
    lastMutation.current=null;if(!alive.current)return;
    const fresh=await resource.reload();if(!fresh){setNotice(t('Zapis potwierdzony. Odczyt po zapisie nie powiodl sie; nie wysylaj ponownie.','Save confirmed. Readback failed; do not resubmit.'));return;}
    navigate(kind==='company'?'/auth/company/review':kind==='consents'?'/auth/completing':'/auth/registered');
   }
  }catch(cause){if(alive.current)setProblem(cause instanceof Error?cause.message:'Operation failed.');}finally{lock.current=false;if(alive.current)setBusy(false);}
 }
 if(surface==='auth-20'&&!secrets.resetToken)return <AccessFlowScreen surface="auth-20" problem={t('Brak tokenu. Otworz pelny link z wiadomosci lub zamow nowy.','Missing token. Open the full email link or request another.')} onAction={()=>navigate('/auth/recover-access')} onNavigate={navigate}/>;
 if(surface==='auth-16'&&recovery)return <AccessFlowScreen surface="auth-16" data={resource.data} problem={problem} busy={busy} onAction={()=>setRecovery(false)} onNavigate={navigate}><form onSubmit={async e=>{e.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setProblem(null);try{const result=await bffClient.redeemMfaRecovery(recoveryCode);if(!result.verified)throw new Error('Code not accepted.');runtime.applySession(result.session);setRecoveryCode('');navigate(target());}catch(cause){setProblem(cause instanceof Error?cause.message:'Verification failed.');}finally{lock.current=false;setBusy(false);}}}><p>{t('Kod odzyskiwania jest jednorazowy. Nie wklejaj go do rozmowy z Asystentem.','Recovery codes are single-use. Do not paste one into an assistant conversation.')}</p><label>{t('Kod odzyskiwania','Recovery code')}<input autoComplete="one-time-code" required value={recoveryCode} onChange={e=>setRecoveryCode(e.target.value)}/></label><Button disabled={busy} type="submit">{t('Potwierdz kod','Verify code')}</Button><Button variant="secondary" onClick={()=>{setRecoveryCode('');setRecovery(false);}}>{t('Wroc do TOTP','Back to TOTP')}</Button></form></AccessFlowScreen>;
 if(mode)return <AuthSurface key={`${path}:${mode}`} {...authProps}/>;
 const options=runtime.session?.memberships??[],tenants=[...new Map(options.map(m=>[m.tenantId,m])).values()];
 return <><AccessFlowScreen surface={surface} data={resource.data} problem={problem??(runtime.session?resource.problem:null)} notice={notice} busy={busy} loading={!!runtime.session&&resource.state==='loading'} hasToken={!!secrets.token} onAction={(kind,input)=>void action(kind,input)} onNavigate={navigate}>
 {surface==='auth-22'||surface==='auth-23'?<div className="pd-access__actions">{(surface==='auth-22'?tenants:options.filter(m=>!query.get('tenant')||m.tenantId===query.get('tenant'))).map(m=><Button key={surface==='auth-22'?m.tenantId:m.workspaceId} disabled={busy} variant="secondary" onClick={()=>{if(surface==='auth-22'){navigate(`/auth/workspace?tenant=${encodeURIComponent(m.tenantId)}&returnTo=${encodeURIComponent(target())}`);}else{if(lock.current)return;lock.current=true;setBusy(true);void authProps.onSelectWorkspace(m.workspaceId).catch(cause=>setProblem(cause instanceof Error?cause.message:'Selection failed.')).finally(()=>{lock.current=false;if(alive.current)setBusy(false);});}}}>{surface==='auth-22'?(m.tenantName??m.tenantId):(m.workspaceName??m.workspaceId)}</Button>)}{!options.length?<p>{t('Brak aktywnych czlonkostw. Popros o zaproszenie.','No active memberships. Request an invitation.')}</p>:null}</div>:null}
 </AccessFlowScreen><MfaSetupDialog open={mfa} onClose={()=>setMfa(false)} onEnroll={()=>runtime.runAuthenticatedCommand(()=>bffClient.enrollMfa({accountName:resource.data?.email??runtime.session?.userId??''}),locationPath)} onConfirm={async code=>{const result=await bffClient.confirmMfa({code});if(!result.verified)throw new Error('Invalid code.');runtime.applySession(result.session);setNotice(t('MFA wlaczone.','MFA enabled.'));}}/></>;
}
