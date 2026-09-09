import type { ReactNode } from 'react';
import { Button, Dialog } from '../../design-system';
import { useProductLocale } from '../shared/useProductLocale';
import './operations.css';
export function OperationsFrame({title,description,demo=false,onReload,children}:{title:string;description:string;demo?:boolean;onReload?:()=>void;children:ReactNode}){
 const {t}=useProductLocale();
 return <main className="pd-operations"><header className="pd-operations__header"><div><p>{t('Administracja / obszar roboczy','Administration / workspace')}</p><h1>{title}</h1><p>{description}</p></div>{onReload&&<Button variant="secondary" onClick={onReload}>{t('Odswiez dane','Refresh data')}</Button>}</header>{demo&&<p className="pd-operations__notice" role="status">{t('Demonstracja. Zmiany sa lokalne, bez API i bez obciazen.','Demonstration. Changes are local, without API calls or charges.')}</p>}{children}</main>;
}
export function OperationsDialog({open,title,onClose,busy=false,children}:{open:boolean;title:string;onClose:()=>void;busy?:boolean;children:ReactNode}){
 return <Dialog open={open} title={title} description={null} modal closeOnEscape={!busy} closeOnBackdrop={!busy} dismissible={!busy} onOpenChange={value=>{if(!value&&!busy)onClose();}}><div className="pd-operations">{children}</div></Dialog>;
}
export function OperationError({message}:{message:string|null}) { return message?<p role="alert" className="pd-operations__notice">{message}</p>:null; }
