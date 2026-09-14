import {isLegalDocumentType,type LegalDocumentType} from '@papadata/contracts';
import {EmptyState} from '../../design-system';
import {navigate} from '../../runtime/app/routing/navigation';
import {bffClient} from '../../runtime/shared/api/bffClient';
import {useRemoteResource} from '../../runtime/shared/data/useRemoteResource';
import {LegalDocumentScreen} from '../../runtime/features/legal/LegalDocumentScreen';
import {useProductLocale} from '../../screens/shared/useProductLocale';
import {resolveLegalDocumentScreenState} from './legalDocumentPageState';
import '../../runtime/features/legal/legal-document-screen.css';

export function LegalDocumentPage({locationPath}:{readonly locationPath:string}){
 const pathname=locationPath.split('?',1)[0]??locationPath;
 const rawType=pathname.replace(/^\/legal\//,'');

 if(!isLegalDocumentType(rawType)){
  return <UnknownLegalDocument/>;
 }

 return <LegalDocumentRoute type={rawType}/>;
}

function UnknownLegalDocument(){
 const {t}=useProductLocale();
 return (
  <main className="pd-legal-document">
   <div className="pd-legal-document__panel">
    <EmptyState
     message={t('Nie znaleziono takiego dokumentu.','No such document was found.')}
     onPrimaryAction={()=>navigate('/')}
     primaryActionLabel={t('Wróć do PapaData','Back to PapaData')}
     title={t('Nieznany dokument','Unknown document')}
     variant="empty"
    />
   </div>
  </main>
 );
}

function LegalDocumentRoute({type}:{readonly type:LegalDocumentType}){
 const resource=useRemoteResource(`legal-document:${type}`,()=>bffClient.readLegalDocument(type));
 const state=resolveLegalDocumentScreenState(resource.state,resource.data);

 return (
  <LegalDocumentScreen
   document={resource.data?.document??null}
   onBack={()=>navigate('/')}
   onRetry={()=>void resource.reload()}
   problem={resource.problem}
   state={state}
   type={type}
  />
 );
}
