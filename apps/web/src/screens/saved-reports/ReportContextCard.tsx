import type { ReportContext } from '@papadata/contracts/saved-reports';
import { cleanProductContextPath } from '@papadata/contracts';
import { Button } from '../../design-system';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { contextualProductLink, productRoutes } from '../../runtime/app/routing/productRoutes';
import { useProductLocale } from '../shared/useProductLocale';
export function ReportContextCard({ context, reportId, reportVersion, onClear }: {
    readonly context?: ReportContext | null;
    readonly reportId?: string;
    readonly reportVersion?: number;
    readonly onClear?: () => void;
}) {
    const { t } = useProductLocale(), navigate = useShellNavigate();
    if (!context)
        return null;
    const original = cleanProductContextPath(context.sourcePath) ?? '/app';
    const assistant = contextualProductLink(productRoutes.assistant, { conversationId: context.conversationId, caseThreadId: context.caseThreadId, returnTo: original });
    const sourceQuery = new URL(original, window.location.origin).searchParams;
    const sourceDomain = original.startsWith('/app/traffic') ? 'traffic' : original.startsWith('/app/customers') ? 'customers' : original.startsWith('/app/campaigns') ? 'campaigns' : 'data';
    return <section className="pd-reports-inline-note" aria-label={t('Kontekst raportu', 'Report context')}><strong>{t('Raport powiązany z analizą', 'Report linked to analysis')}</strong><p><code>{original}</code></p><div className="pd-reports-actions">
  <Button variant="secondary" onClick={() => navigate(original)}>{t('Otwórz analizę źródłową', 'Open source analysis')}</Button>
  {context.conversationId && <Button variant="secondary" onClick={() => navigate(assistant)}>{t('Wróć do tej rozmowy Papa', 'Return to this Papa conversation')}</Button>}
  {context.decisionId && <Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.decisions, { decisionId: context.decisionId }))}>{t('Otwórz powiązaną decyzję', 'Open linked decision')}</Button>}
  {reportId && <Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.decisions, { ...Object.fromEntries(sourceQuery), domain: sourceDomain, reportId, reportVersion: reportVersion ? String(reportVersion) : null, conversationId: context.conversationId, caseThreadId: context.caseThreadId, budgetPlanId: context.budgetPlanId, returnTo: original, title: t('Decyzja na podstawie raportu', 'Decision based on report') }))}>{t('Przygotuj decyzję z raportu', 'Prepare a decision from this report')}</Button>}
  {onClear && <Button variant="ghost" onClick={onClear}>{t('Odłącz kontekst od szkicu', 'Detach draft context')}</Button>}
 </div><p>{t('Odnośniki nie nadają uprawnień. Odczyt i zapis są sprawdzane w bieżącym workspace.', 'Links do not grant permissions. Reads and writes are checked in the current workspace.')}</p></section>;
}
