import type { ReactNode } from 'react';
import { useProductLocale } from './useProductLocale';
import './analysis-scope.css';

/** Keep the applied scope visible; open the full controls when changing it. */
export function AnalysisScope({ summary, children, actions }: {
  readonly summary: string;
  readonly children: ReactNode;
  readonly actions?: ReactNode;
}) {
  const { t } = useProductLocale();
  return <div className="pd-analysis-scope">
    <details className="pd-analysis-scope__disclosure">
      <summary>
        <span>{summary}</span>
        <span className="pd-analysis-scope__edit">{t('Zmień filtry', 'Change filters')}</span>
      </summary>
      <div className="pd-product-data__toolbar pd-analysis-scope__controls">{children}</div>
    </details>
    {actions && <div className="pd-analysis-scope__actions">{actions}</div>}
  </div>;
}
