import { Component, type ReactNode } from 'react';
import { useProductLocale } from '../../../screens/shared/useProductLocale';
function Failure({onRetry}:{readonly onRetry:()=>void}) {
  const {t}=useProductLocale();
  return <section className="pd-runtime-loading" role="alert"><h2>{t('Nie udało się wyświetlić widoku','The view could not be rendered')}</h2>
    <p>{t('Adres pozostaje bez zmian. Po odświeżeniu sprawdź stan ostatniej operacji.','The URL stays unchanged. After reloading, check the last operation status.')}</p>
    <button type="button" onClick={onRetry}>{t('Ponów widok','Retry view')}</button>
    <button type="button" onClick={()=>window.location.reload()}>{t('Odśwież stronę','Reload page')}</button>
  </section>;
}
/** Contains a failed render/import, not API authorization or domain-operation failures. */
export class RenderBoundary extends Component<{readonly children:ReactNode},{readonly failed:boolean}> {
  override state={failed:false};
  static getDerivedStateFromError():{failed:boolean}{return {failed:true};}
  override render():ReactNode {return this.state.failed?<Failure onRetry={()=>this.setState({failed:false})}/>:this.props.children;}
}
