import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProductLocale } from '../shared/useProductLocale';
import { commerceNumber } from './commercePresentation';
export function CommerceTrend({title,points,unit}:{readonly title:string;readonly points:readonly {readonly date:string;readonly value:number|null;readonly previous?:number|null;readonly previousDate?:string}[];readonly unit:string}) {
  const {t,language}=useProductLocale();
  const hasPrevious=points.some(row=>row.previous!==undefined);
  const count=points.filter(row=>row.value!==null).length;
  return <section className="pd-product-data__section"><h2>{title}</h2><p>{t('Brak obserwacji pozostaje przerwą na wykresie. Tabela poniżej zawiera te same wartości.','Missing observations remain gaps. The table below contains the same values.')}</p>
    {count>0?<div className="pd-product-data__chart" role="img" aria-label={`${title}. ${t('Alternatywa tabelaryczna poniżej.','Table alternative below.')}`}><ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <LineChart data={[...points]} margin={{top:16,right:16,bottom:4,left:8}} accessibilityLayer>
        <CartesianGrid stroke="var(--pd-separator)" vertical={false}/><XAxis dataKey="date" minTickGap={50} tickLine={false} axisLine={false} tick={{fill:'var(--pd-text-secondary)',fontSize:12}}/>
        <YAxis width={72} tickFormatter={v=>commerceNumber(Number(v),language)} tickLine={false} axisLine={false} tick={{fill:'var(--pd-text-secondary)',fontSize:12}}/>
        <Tooltip formatter={v=>typeof v==='number'?`${commerceNumber(v,language)} ${unit}`:'—'} contentStyle={{background:'var(--pd-surface-overlay)',color:'var(--pd-text)',border:'1px solid var(--pd-separator-strong)'}}/>
        <Line dataKey="value" name={t('Bieżący okres','Current period')} stroke="var(--pd-data-series-1)" strokeWidth={2.5} dot={count===1} connectNulls={false} isAnimationActive={false}/>
        {hasPrevious&&<Line dataKey="previous" name={t('Poprzedni okres','Previous period')} stroke="var(--pd-data-series-2)" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} isAnimationActive={false}/>}
      </LineChart></ResponsiveContainer></div>:<p className="pd-product-data__notice">{t('Brak potwierdzonych punktów tej miary.','No confirmed points for this metric.')}</p>}
    <details><summary>{t('Tabela danych wykresu','Chart data table')}</summary><div className="pd-product-data__table-scroll" tabIndex={0} role="region" aria-label={title}>
      <table className="pd-product-data__table"><caption>{title} · {unit}</caption><thead><tr><th scope="col">{t('Dzień','Day')}</th><th scope="col">{t('Wartość','Value')}</th>{hasPrevious&&<th scope="col">{t('Poprzedni okres','Previous period')}</th>}</tr></thead>
        <tbody>{points.map(row=><tr key={row.date}><th scope="row">{row.date}</th><td>{commerceNumber(row.value,language)}</td>{hasPrevious&&<td>{commerceNumber(row.previous,language)}{row.previousDate&&<small> ({row.previousDate})</small>}</td>}</tr>)}</tbody></table></div></details>
  </section>;
}
