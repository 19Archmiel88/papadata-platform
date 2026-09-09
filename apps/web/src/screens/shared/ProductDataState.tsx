import type { ReactNode } from 'react';
import { Button, EmptyState, ErrorState, Spinner } from '../../design-system';
import { useProductLocale } from './useProductLocale';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import './product-data.css';

export function ProductDataState({ state, problem, onRetry, children }: {
  readonly state: RemoteState | 'empty' | 'partial' | 'stale';
  readonly problem?: string | null;
  readonly onRetry?: () => void;
  readonly children?: ReactNode;
}) {
  const { t } = useProductLocale();
  if (state === 'ready') return <>{children}</>;
  if (state === 'partial' || state === 'stale') return <>
    <p className="pd-product-data__notice" role="status">{problem ?? (state === 'partial'
      ? t('Dane są częściowe. Niedostępne metryki nie są zastępowane zerem.', 'Data is partial. Unavailable metrics are not replaced with zero.')
      : t('Dane wymagają synchronizacji. Sprawdź datę źródła.', 'Data needs synchronization. Check the source timestamp.'))}</p>{children}</>;
  if (state === 'loading') return <div className="pd-product-data__state" aria-busy="true"><Spinner delayMs={0} label={t('Wczytywanie danych', 'Loading data')} size={24} showLabel /></div>;
  if (state === 'empty' || state === 'forbidden') return <EmptyState variant={state === 'empty' ? 'empty' : 'forbidden'}
    title={state === 'empty' ? t('Brak danych w wybranym zakresie', 'No data in this range') : t('Brak uprawnień do tego obszaru', 'You do not have access to this area')}
    message={problem ?? t('Sprawdź zakres, filtry i dostęp. Brak danych nie oznacza wyniku zerowego.', 'Check the range, filters and access. Missing data does not mean zero.')}
    onPrimaryAction={state === 'empty' ? onRetry : undefined} primaryActionLabel={onRetry ? t('Odśwież dane', 'Refresh data') : null} />;
  return <ErrorState errorCode={state === 'offline' ? 'OFFLINE' : 'READ_FAILED'} variant="data"
    title={state === 'offline' ? t('Brak połączenia z siecią', 'You are offline') : t('Nie udało się pobrać danych', 'Unable to load data')}
    message={problem ?? t('Dane nie zostały zastąpione demonstracją. Ponów odczyt.', 'Data was not replaced with a demonstration. Retry the request.')}
    retryLabel={t('Ponów odczyt', 'Retry')} onRetry={onRetry} />;
}

export function DataProvenance({ source, synchronizedAt, calculatedAt, limitations = [], demo = false }: {
  readonly source: string;
  readonly synchronizedAt?: string | null;
  readonly calculatedAt?: string | null;
  readonly limitations?: readonly string[];
  readonly demo?: boolean;
}) {
  const { t, language } = useProductLocale();
  const time = (value: string | null | undefined) => value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : t('Nie udostępniono', 'Not provided');
  return <details className="pd-product-data__provenance">
    <summary>{demo ? t('Dane demonstracyjne', 'Demonstration data') : source} · {t('Źródło i ograniczenia', 'Source and limitations')}</summary>
    <dl><div><dt>{t('Ostatnia synchronizacja źródła', 'Last source synchronization')}</dt><dd>{time(synchronizedAt)}</dd></div>
      <div><dt>{t('Odczyt / obliczenie odpowiedzi', 'Response read / calculation')}</dt><dd>{time(calculatedAt)}</dd></div></dl>
    {!synchronizedAt && <p>{t('Czas odpowiedzi API nie potwierdza świeżości danych źródłowych.', 'The API response time does not establish source freshness.')}</p>}
    {limitations.map((text, i) => <p key={i}>{text}</p>)}
  </details>;
}

export function MetricSummary({ label, value, description }: {
  readonly label: string; readonly value: ReactNode; readonly description: string;
}) {
  return <div className="pd-product-data__metric"><dt>{label}</dt><dd>{value}<p>{description}</p></dd></div>;
}
export function ProductViewNav<T extends string>({ label, active, items, onChange }: {
  readonly label: string; readonly active: T; readonly items: readonly { readonly id: T; readonly label: string }[];
  readonly onChange: (value: T) => void;
}) {
  return <nav className="pd-product-data__views" aria-label={label}>{items.map(item =>
    <Button key={item.id} variant={active === item.id ? 'primary' : 'ghost'} size="small" aria-current={active === item.id ? 'page' : undefined}
      onClick={() => onChange(item.id)}>{item.label}</Button>)}</nav>;
}
