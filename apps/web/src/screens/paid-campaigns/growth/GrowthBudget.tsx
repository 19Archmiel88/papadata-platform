import { useEffect, useRef, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { projectGrowthBudget, type GrowthBudgetCommand, type GrowthBudgetPlan, type GrowthPortfolio } from '@papadata/contracts/campaign-growth';
import { Button, Dialog } from '../../../design-system';
import { useProductQuery, contextualProductLink, productRoutes } from '../../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../../runtime/shell/app-shell/ShellNavigationContext';
import { safeRandomUUID } from '../../../runtime/shared/id/safeRandomUUID';
import { useProductLocale } from '../../shared/useProductLocale';
import { growthMoney, growthNumber } from './growthPresentation';
export type SaveGrowthPlan = (command: GrowthBudgetCommand) => Promise<GrowthBudgetPlan>;
export function GrowthBudget({ data, onSave, onReload }: {
    readonly data: GrowthPortfolio;
    readonly onSave?: SaveGrowthPlan;
    readonly onReload?: () => void;
}) {
    const navigate = useShellNavigate();
    const { t, language } = useProductLocale(), { params, update } = useProductQuery();
    const campaign = data.choices.campaigns.find(row => row.id === (params.get('budgetCampaign') ?? data.scope.campaignKey));
    const current = data.budgetPlans.find(plan => plan.campaignKey === campaign?.id);
    const [amount, setAmount] = useState(''), [reason, setReason] = useState(''), [ack, setAck] = useState(false);
    const [open, setOpen] = useState(false), [pending, setPending] = useState(false), [problem, setProblem] = useState<string | null>(null), [saved, setSaved] = useState<string | null>(null);
    const request = useRef<{
        serialized: string;
        id: string;
    } | null>(null), inflight = useRef(false);
    const contextKey = `${data.scope.from}:${data.scope.to}:${campaign?.id}`;
    const liveKey = useRef(contextKey);
    liveKey.current = contextKey;
    useEffect(() => { setAmount(current ? String(current.amount) : ''); setReason(''); setAck(false); setOpen(false); setProblem(null); setSaved(null); request.current = null; }, [contextKey, current?.version]);
    const numeric = Number(amount.replace(',', '.'));
    const valid = amount.trim().length > 0 && Number.isFinite(numeric) && Math.round(numeric * 100) > 0 && numeric <= 1e9;
    const plan: GrowthBudgetPlan | null = campaign && valid ? { id: current?.id ?? 'preview', campaignKey: campaign.id, from: data.scope.from, to: data.scope.to, currency: campaign.currency, amount: Math.round(numeric * 100) / 100, version: current?.version ?? 0, reason, updatedAt: data.scope.calculatedAt, updatedBy: 'preview', target: 'internal_plan' } : current ?? null;
    const projection = plan ? projectGrowthBudget(plan, data.observations, data.scope.asOf) : null;
    const difference = valid && current ? Math.round(numeric * 100) / 100 - current.amount : null;
    const dirty = amount !== (current ? String(current.amount) : '') || Boolean(reason.trim());
    useEffect(() => {
        const beforeUnload = (event: BeforeUnloadEvent) => {
            if (dirty && !pending) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [dirty, pending]);
    const history = data.budgetHistory.filter(event => !campaign || (current && event.planId === current.id));
    const maySave = Boolean(onSave && data.canManagePlans && campaign && campaign.currency !== 'XXX');
    async function save() {
        if (!campaign || !onSave || !maySave || !valid || reason.trim().length < 10 || !ack || inflight.current)
            return;
        const key = liveKey.current;
        const commandWithoutId = { campaignKey: campaign.id, from: data.scope.from, to: data.scope.to, currency: campaign.currency, amount: Math.round(numeric * 100) / 100, expectedVersion: current?.version ?? 0, reason: reason.trim(), acknowledgedInternalPlan: true as const };
        const serialized = JSON.stringify(commandWithoutId);
        if (request.current?.serialized !== serialized)
            request.current = { serialized, id: safeRandomUUID() };
        inflight.current = true;
        setPending(true);
        setProblem(null);
        try {
            const result = await onSave({ ...commandWithoutId, requestId: request.current.id });
            if (liveKey.current !== key)
                return;
            setOpen(false);
            setSaved(`${t('Zapisano plan PapaData, wersja', 'Saved PapaData plan, version')} ${result.version}. ${t('Nie zmieniono budżetu u dostawcy.', 'Provider budget was not changed.')}`);
            request.current = null;
        }
        catch (error) {
            if (liveKey.current === key)
                setProblem(error instanceof Error ? error.message : t('Zapis nie został potwierdzony.', 'Save was not confirmed.'));
        }
        finally {
            inflight.current = false;
            setPending(false);
        }
    }
    return <div className="pd-growth__stack"><section className="pd-product-data__section"><h2>{t('Plan i tempo wydatków', 'Plan and spending pace')}</h2><p>{t('Plan jest wewnętrznym celem PapaData. Nie jest limitem dziennym ani zleceniem zmiany budżetu Google/Meta.', 'This is an internal PapaData goal, not a daily limit or a request to change a Google/Meta budget.')}</p>
    <label>{t('Kampania planu', 'Plan campaign')}<select value={campaign?.id ?? ''} disabled={pending} onChange={e => {
            if (!dirty || window.confirm(t('Odrzucić niezapisany plan?', 'Discard the unsaved plan?')))
                update({ budgetCampaign: e.target.value });
        }}><option value="">{t('Wybierz kampanię', 'Select campaign')}</option>{data.choices.campaigns.filter(row => (!data.scope.provider || row.provider === data.scope.provider) && (!data.scope.currency || row.currency === data.scope.currency)).map(row => <option key={row.id} value={row.id}>{row.name} ({row.currency})</option>)}</select></label>
    {campaign && <><div className="pd-product-data__toolbar"><label>{t('Plan okresu', 'Period plan')} ({campaign.currency})<input inputMode="decimal" value={amount} disabled={pending} onChange={e => { setAmount(e.target.value); setSaved(null); }} aria-invalid={Boolean(amount) && !valid}/></label><p>{data.scope.from} — {data.scope.to}</p>
    {current && [-10, 10, 20].map(change => <Button key={change} variant="secondary" size="small" disabled={pending} onClick={() => setAmount((Math.round(current.amount * (1 + change / 100) * 100) / 100).toString())}>{change > 0 ? '+' : ''}{change}%</Button>)}
    <Button disabled={!valid || !maySave || pending} onClick={() => { setProblem(null); setOpen(true); }}>{t('Przejrzyj zmianę planu', 'Review plan change')}</Button></div>
    {!maySave && <p className="pd-product-data__notice">{t('Symulacja jest lokalna. Zapis wymaga workspace.manage, ponownego uwierzytelnienia i dostępnego API.', 'Simulation is local. Saving requires workspace.manage, reauthentication and an available API.')}</p>}
    {saved && <p role="status">{saved}</p>}
    {projection && plan && <><dl className="pd-product-data__metrics">{[
                    [t('Wykorzystano', 'Spent'), growthMoney(projection.spent, plan.currency, language)],
                    [t('Plan do dnia', 'Plan to date'), growthMoney(projection.expectedSpend, plan.currency, language)],
                    [t('Odchylenie', 'Variance'), growthMoney(projection.deviation, plan.currency, language)],
                    [t('Pozostało', 'Remaining'), growthMoney(projection.remaining, plan.currency, language)],
                    [t('Wykorzystanie', 'Utilization'), projection.utilization === null ? '—' : `${growthNumber(projection.utilization * 100, language, 1)}%`],
                    [t('Scenariusz końca okresu', 'End-of-period scenario'), growthMoney(projection.projectedTotal, plan.currency, language)],
                ].map(([label, value]) => <div className="pd-product-data__metric" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {projection.partial && <p role="status" className="pd-product-data__notice">{t('Pokrycie okresu jest niepełne. Odchylenie i scenariusz są orientacyjne, nie służą do automatycznych zmian budżetu.', 'Period coverage is incomplete. Variance and scenario are indicative, not a basis for automatic budget changes.')}</p>}
    <p>{t('Obliczenia do ostatniego zakończonego dnia', 'Calculated through last completed day')}: {data.scope.asOf}. {projection.observedDays}/{projection.elapsedDays} {t('dni z kompletnym kosztem', 'days with complete spend')}.</p>
    <p className="pd-product-data__notice">{t('Scenariusz = średni koszt obserwowanego dnia × liczba dni planu. To ekstrapolacja, nie prognoza AI ani gwarancja wyniku. Brakujące dni nie są zerami.', 'Scenario = average observed daily spend × plan days. This is an extrapolation, not an AI forecast or guarantee. Missing days are not zeros.')}</p>
    <div className="pd-product-data__chart" role="img" aria-label={t('Plan i wydatki narastająco; dane w tabeli poniżej', 'Cumulative plan and spend; data table below')}><ResponsiveContainer width="100%" height="100%"><LineChart data={[...projection.points]}><CartesianGrid vertical={false} stroke="var(--pd-separator)"/><XAxis dataKey="date" minTickGap={48} tickFormatter={value=>String(value).slice(5).replace('-','/')} tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} width={56}/><Tooltip contentStyle={{background: 'var(--pd-surface)', border: '1px solid var(--pd-separator-strong)', borderRadius: 10, color: 'var(--pd-text)'}} labelStyle={{color: 'var(--pd-text)'}} /><Line isAnimationActive={false} type="monotone" dataKey="planned" name={t('Plan', 'Plan')} stroke="var(--pd-growth-secondary)" dot={false}/><Line isAnimationActive={false} type="monotone" dataKey="actual" name={t('Wydatki', 'Spend')} stroke="var(--pd-growth-accent)" dot={false} connectNulls={false}/></LineChart></ResponsiveContainer></div>
    <details><summary>{t('Dane tabelaryczne wykresu', 'Chart data table')}</summary><div className="pd-product-data__table-wrap"><table><thead><tr><th>{t('Data', 'Date')}</th><th>{t('Plan narastająco', 'Cumulative plan')}</th><th>{t('Koszt narastająco', 'Cumulative spend')}</th></tr></thead><tbody>{projection.points.map(point => <tr key={point.date}><th scope="row">{point.date}</th><td>{growthMoney(point.planned, plan.currency, language)}</td><td>{growthMoney(point.actual, plan.currency, language)}</td></tr>)}</tbody></table></div></details>
    <Button variant="secondary" onClick={() => navigate(contextualProductLink(productRoutes.decisions, { domain: 'campaigns', title: `${t('Przegląd planu budżetu', 'Budget plan review')}: ${campaign.name}`, campaignId: campaign.id, budgetPlanId: current?.id }))}>{t('Przygotuj decyzję z kontekstem', 'Prepare a contextual decision')}</Button>
    </>}
    </>}
  </section><section className="pd-product-data__section"><h2>{t('Historia zmian planu', 'Plan change history')}</h2><p>{t('Zapis planu nie potwierdza wykonania akcji reklamowej.', 'A saved plan does not confirm an advertising action.')}</p>
    <div className="pd-product-data__table-wrap"><table><thead><tr><th>{t('Czas / wersja', 'Time / version')}</th><th>{t('Przed', 'Before')}</th><th>{t('Po', 'After')}</th><th>{t('Uzasadnienie', 'Reason')}</th></tr></thead><tbody>{history.map(event => { const record = data.budgetPlans.find(plan => plan.id === event.planId); return <tr key={event.id}><th scope="row">{event.at} / {event.version}</th><td>{growthMoney(event.before, record?.currency ?? null, language)}</td><td>{growthMoney(event.after, record?.currency ?? null, language)}</td><td>{event.reason}</td></tr>; })}</tbody></table></div>
    {!history.length && <p>{t('Brak zapisanych zmian w tym okresie.', 'No saved changes in this period.')}</p>}</section>
  <Dialog open={open} modal closeOnEscape={!pending} closeOnBackdrop={!pending} dismissible={!pending} title={t('Potwierdź wewnętrzny plan', 'Confirm internal plan')} description={t('Operacja zapisuje tylko plan w PapaData. Może wymagać ponownego uwierzytelnienia.', 'This saves only the PapaData plan. Reauthentication may be required.')} onOpenChange={next => {
            if (!pending)
                setOpen(next);
        }}>
    <div className="pd-product-data pd-growth"><p>{campaign?.name} · {data.scope.from} — {data.scope.to}</p><dl><div><dt>{t('Przed', 'Before')}</dt><dd>{growthMoney(current?.amount ?? null, campaign?.currency ?? null, language)}</dd></div><div><dt>{t('Po', 'After')}</dt><dd>{growthMoney(valid ? numeric : null, campaign?.currency ?? null, language)}</dd></div><div><dt>{t('Zmiana', 'Change')}</dt><dd>{growthMoney(difference, campaign?.currency ?? null, language)}</dd></div></dl>
    <label>{t('Uzasadnienie (minimum 10 znaków)', 'Reason (at least 10 characters)')}<textarea value={reason} maxLength={2000} disabled={pending} onChange={e => setReason(e.target.value)}/></label>
    <label><input type="checkbox" checked={ack} disabled={pending} onChange={e => setAck(e.target.checked)}/>{t('Rozumiem: to plan PapaData, bez zmiany budżetu u dostawcy.', 'I understand: this is a PapaData plan, without changing the provider budget.')}</label>
    {problem && <div role="alert"><p>{problem}</p><Button variant="secondary" disabled={pending} onClick={onReload}>{t('Odczytaj aktualny stan', 'Read current state')}</Button></div>}
    <div className="pd-product-data__toolbar"><Button disabled={pending || !ack || reason.trim().length < 10 || !valid} onClick={() => void save()}>{pending ? t('Zapisywanie...', 'Saving...') : t('Zapisz plan', 'Save plan')}</Button><Button variant="secondary" disabled={pending} onClick={() => setOpen(false)}>{t('Anuluj', 'Cancel')}</Button></div>
  </div></Dialog></div>;
}
