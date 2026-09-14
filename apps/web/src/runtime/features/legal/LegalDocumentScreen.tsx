import {useEffect} from 'react';
import type {LegalDocumentType,PublishedLegalDocument} from '@papadata/contracts';
import {EmptyState,ErrorState,Spinner} from '../../../design-system';
import {SafeMarkdown} from '../../shared/markdown/SafeMarkdown';
import {useProductLocale} from '../../../screens/shared/useProductLocale';
import './legal-document-screen.css';

export type LegalDocumentScreenState='loading'|'ready'|'unavailable'|'error';

export type LegalDocumentScreenProps={
 readonly type:LegalDocumentType;
 readonly state:LegalDocumentScreenState;
 readonly document:PublishedLegalDocument|null;
 readonly problem?:string|null;
 readonly onRetry:()=>void;
 readonly onBack:()=>void;
};

const typeLabels:Record<LegalDocumentType,[pl:string,en:string]>={
 cookie_policy:['Polityka cookies','Cookie policy'],
 data_processing_terms:['Umowa powierzenia przetwarzania danych','Data processing terms'],
 privacy_notice:['Polityka prywatności','Privacy notice'],
 terms_of_service:['Regulamin świadczenia usług','Terms of service'],
};

export function LegalDocumentScreen({type,state,document:legalDocument,problem,onRetry,onBack}:LegalDocumentScreenProps){
 const {t,locale}=useProductLocale();
 const [labelPl,labelEn]=typeLabels[type];
 const fallbackTitle=locale==='en'?labelEn:labelPl;
 const title=state==='ready'&&legalDocument?legalDocument.title:fallbackTitle;

 // Every state renders its own <h1 id="legal-document-title">; focusing it
 // on mount/state-change matches AccessFlowScreen's #access-title pattern
 // so this route (reachable pre-login from the cookie consent banner) is
 // announced the same way the rest of the pre-auth shell already is.
 useEffect(()=>{window.document.getElementById('legal-document-title')?.focus();},[state,type]);

 return (
  <main className="pd-legal-document" aria-busy={state==='loading'}>
   <header className="pd-legal-document__header">
    <a
     className="pd-legal-document__back"
     href="/"
     onClick={event=>{event.preventDefault();onBack();}}
    >
     {t('← Wróć do PapaData','← Back to PapaData')}
    </a>
   </header>
   <div className="pd-legal-document__panel">
    <h1 id="legal-document-title" tabIndex={-1}>{title}</h1>
    {state==='loading'?(
     <Spinner delayMs={0} label={t('Wczytywanie dokumentu…','Loading document…')} showLabel size={20} />
    ):null}
    {state==='ready'&&legalDocument?(
     <>
      <dl className="pd-legal-document__meta">
       <div><dt>{t('Wersja','Version')}</dt><dd>{legalDocument.version}</dd></div>
       <div><dt>{t('Obowiązuje od','Effective from')}</dt><dd>{formatEffectiveDate(legalDocument.effectiveAt,locale)}</dd></div>
      </dl>
      <div className="pd-legal-document__body">
       <SafeMarkdown>{legalDocument.body}</SafeMarkdown>
      </div>
     </>
    ):null}
    {state==='unavailable'?(
     <EmptyState
      message={t(
       'Ten dokument nie jest jeszcze opublikowany w tym środowisku.',
       'This document has not been published in this environment yet.',
      )}
      onSecondaryAction={onBack}
      secondaryActionLabel={t('Wróć do PapaData','Back to PapaData')}
      title={t('Dokument niedostępny','Document unavailable')}
      variant="configuration"
     />
    ):null}
    {state==='error'?(
     <ErrorState
      errorCode="LEGAL_DOCUMENT_UNAVAILABLE"
      message={problem??t(
       'Nie udało się wczytać dokumentu. Spróbuj ponownie.',
       'The document could not be loaded. Please try again.',
      )}
      onRetry={onRetry}
      title={t('Nie udało się wczytać dokumentu','The document could not be loaded')}
     />
    ):null}
   </div>
  </main>
 );
}

function formatEffectiveDate(effectiveAt:string,locale:'pl'|'en'):string{
 const parsed=new Date(effectiveAt);
 if(Number.isNaN(parsed.getTime()))return effectiveAt;
 return new Intl.DateTimeFormat(locale==='en'?'en-US':'pl-PL',{dateStyle:'long'}).format(parsed);
}
