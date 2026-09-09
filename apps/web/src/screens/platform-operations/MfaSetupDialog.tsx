import { useEffect, useState } from 'react';
import { Button } from '../../design-system';
import { useProductLocale } from '../shared/useProductLocale';
import { OperationsDialog, OperationError } from './OperationsFrame';
export type MfaEnrollment={secret:string;otpauthUri:string;recoveryCodes:readonly string[]};
export function MfaSetupDialog({open,onClose,onEnroll,onConfirm}:{open:boolean;onClose:()=>void;onEnroll:()=>Promise<MfaEnrollment>;onConfirm:(code:string)=>Promise<void>}){
 const {t}=useProductLocale(),[enrollment,setEnrollment]=useState<MfaEnrollment|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[code,setCode]=useState(''),[saved,setSaved]=useState(false);
 useEffect(()=>{if(!open){setEnrollment(null);setCode('');setSaved(false);setError(null);}},[open]);
 return <OperationsDialog open={open} title={t('Konfiguracja MFA','MFA setup')} busy={busy} onClose={onClose}>
 {!enrollment?<><p>{t('Wygeneruj sekret i zapisz kody odzyskiwania w menedzerze hasel. Dane pozostaja tylko w pamieci tego widoku; nie sa zapisywane w localStorage.','Generate a secret and store recovery codes in your password manager. These details stay only in this view\'s memory, not in localStorage.')}</p><Button disabled={busy} onClick={()=>{setBusy(true);setError(null);void onEnroll().then(setEnrollment).catch(cause=>setError(cause instanceof Error?cause.message:'Enrollment failed')).finally(()=>setBusy(false));}}>{t('Rozpocznij konfiguracje','Start setup')}</Button></>:<form onSubmit={e=>{e.preventDefault();if(!saved||busy)return;setBusy(true);setError(null);void onConfirm(code).then(()=>{setEnrollment(null);onClose();}).catch(cause=>setError(cause instanceof Error?cause.message:'Confirmation failed')).finally(()=>setBusy(false));}}>
 <p>{t('Dodaj konto PapaData do aplikacji uwierzytelniajacej jako TOTP, 6 cyfr, okres 30 sekund.','Add PapaData to your authenticator as TOTP, 6 digits, 30-second period.')}</p>
 <label>{t('Sekret do recznego wprowadzenia','Manual setup secret')}<input readOnly value={enrollment.secret} autoComplete="off" spellCheck={false}/></label>
 <details><summary>{t('Kody odzyskiwania jednorazowego uzytku','One-time recovery codes')}</summary><p>{t('Nie udostepniaj tych kodow. Nie pojawia sie ponownie po zamknieciu widoku.','Do not share these codes. They will not be shown again after closing this view.')}</p><pre>{enrollment.recoveryCodes.join('\n')}</pre></details>
 <label className="pd-operations__check"><input type="checkbox" checked={saved} onChange={e=>setSaved(e.target.checked)}/>{t('Zapisalem kody odzyskiwania w bezpiecznym miejscu.','I saved the recovery codes in a secure location.')}</label>
 <label>{t('Kod z aplikacji','Authenticator code')}<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/[^0-9]/g,''))}/></label>
 <Button type="submit" disabled={busy||!saved||code.length!==6}>{t('Potwierdz i wlacz MFA','Confirm and enable MFA')}</Button></form>}
 <OperationError message={error}/>
 </OperationsDialog>;
}
