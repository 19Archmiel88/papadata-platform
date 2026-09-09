import { useId, useState } from 'react';
import { Button, DateRangePicker, Popover } from '../../design-system';
import { useShellDateRange } from '../../runtime/shell/app-shell/ShellDateRangeContext';
import { updateProductQuery } from '../../runtime/app/routing/productRoutes';
import { useProductLocale } from './useProductLocale';

function dateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function ProductDateControl({ label, displayLabel, clearParams = [], allowFuture = false }: { readonly label: string; readonly displayLabel?: string; readonly clearParams?: readonly string[]; readonly allowFuture?: boolean }) {
  const { dateRange, setDateRange } = useShellDateRange();
  const { locale, t } = useProductLocale();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(dateRange);
  const id = useId();
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:dateRange.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const valid = dateOnly(draft.from) && dateOnly(draft.to) && draft.from <= draft.to && (allowFuture || draft.to <= today) && (Date.parse(draft.to)-Date.parse(draft.from))/86400000 < 366;
  const close = () => { setDraft(dateRange); setOpen(false); };
  return <Popover anchorId={id} title={label} modal={false} open={open} onOpenChange={next=>{setDraft(dateRange);setOpen(next);}} placement="bottom-end"
    trigger={<Button size="small" variant="secondary">{displayLabel ?? `${dateRange.from} – ${dateRange.to}`}</Button>}>
    <DateRangePicker label={label} locale={locale} value={draft} timezone={dateRange.timezone}
      fromLabel={t('Od','From')} toLabel={t('Do','To')} presetLabel={t('Zakres','Range')}
      invalid={!valid} message={!valid?(allowFuture?t('Wybierz poprawny zakres do 366 dni.','Choose a valid range of up to 366 days.'):t('Wybierz poprawny zakres do 366 dni, bez dat przyszłych.','Choose a valid range of up to 366 days, without future dates.')):null}
      presets={[{ label: t('Dzisiaj', 'Today'), value: 'today' }, { label: t('7 dni', '7 days'), value: 'last7d' },
        { label: t('30 dni', '30 days'), value: 'last30d' }, { label: t('90 dni', '90 days'), value: 'last90d' }, { label: t('Własny okres', 'Custom range'), value: 'custom' }]}
      onChange={setDraft} />
    <div className="pd-product-data__toolbar">
      <Button disabled={!valid} onClick={()=>{
        if(!valid)return;
        const range={...draft,timezone:dateRange.timezone};
        setDateRange(range);
        updateProductQuery({ from: range.from, to: range.to, timezone: range.timezone, ...Object.fromEntries(clearParams.map(key => [key, null])) });
        setOpen(false);
      }}>{t('Zastosuj','Apply')}</Button>
      <Button variant="secondary" onClick={close}>{t('Anuluj','Cancel')}</Button>
    </div>
  </Popover>;
}
