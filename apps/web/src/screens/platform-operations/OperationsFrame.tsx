import type { ReactNode } from 'react';
import { Button, Dialog } from '../../design-system';
import { useProductLocale } from '../shared/useProductLocale';
import './operations.css';
export function OperationsFrame({title,description,demo=false,onReload,children}:{title:string;description:string;demo?:boolean;onReload?:()=>void;children:ReactNode}){
 const {t}=useProductLocale();
 return <main className="pd-operations"><header className="pd-operations__header"><div><h1>{title}</h1><p>{description}</p></div><div className="pd-operations__header-actions">{demo&&<span className="pd-operations__demo" title={t('Dane przykładowe. Zmiany są lokalne, bez połączeń i płatności.','Sample data. Changes are local, without connections or payments.')}>{t('Demo · zmiany lokalne','Demo · local changes')}</span>}{onReload&&<Button variant="secondary" onClick={onReload}>{t('Odśwież dane','Refresh data')}</Button>}</div></header>{children}</main>;
}
export function OperationsDialog({open,title,onClose,busy=false,children}:{open:boolean;title:string;onClose:()=>void;busy?:boolean;children:ReactNode}){
 return <Dialog open={open} title={title} description={null} modal closeOnEscape={!busy} closeOnBackdrop={!busy} dismissible={!busy} onOpenChange={value=>{if(!value&&!busy)onClose();}}><div className="pd-operations">{children}</div></Dialog>;
}
export function OperationError({message}:{message:string|null}) { return message?<p role="alert" className="pd-operations__notice">{message}</p>:null; }
