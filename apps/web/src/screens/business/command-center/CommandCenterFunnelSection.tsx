import type {
  DataColumn,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  FunnelChart,
  InlineNotice,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  CommandChartTableFallback,
  CommandFunnelSummary,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  formatInteger,
  formatPercent,
  openPapaAssistantForElement,
} from './commandCenterOnePageModel';

const funnelElementId = 'command-funnel';

const funnelColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Krok', sortable: true, width: 240 },
  { align: 'right', id: 'value', label: 'Ilość', sortable: true, width: 140 },
  { align: 'right', id: 'conversionRate', label: 'Konwersja', sortable: true, width: 140 },
];

export function CommandCenterFunnelSection({
  data,
  dataState,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
}) {
  const hasFunnelSteps = data.funnelSteps.length > 0;

  return (
    <section
      aria-labelledby="command-center-funnel-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        actions={hasFunnelSteps ? (
          <Button
            onClick={() => openPapaAssistantForElement(funnelElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        ) : null}
        description="Adnotacja pokazuje największy odpływ bez dokładania osobnej karty ponad właściwym lejkiem."
        eyebrow="Lejek"
        title="Lejek sprzedaży"
        titleId="command-center-funnel-title"
      />

      {hasFunnelSteps ? (
        <>
          <CommandFunnelSummary steps={data.funnelSteps} />
          <FunnelChart
            className="pd-command-center-one-page__chart-surface"
            orientation="horizontal"
            showDropoff
            steps={data.funnelSteps.map((step) => ({
              conversionRate: step.conversionRate,
              id: step.stepId,
              label: step.label,
              value: step.completions,
            }))}
          />

          <CommandChartTableFallback
            ariaLabel="Kroki lejka: ilość i konwersja"
            columns={funnelColumns}
            emptyMessage="Brak kroków lejka."
            minWidth={640}
            rows={data.funnelSteps.map((step) => ({
              conversionRate: formatPercent(step.conversionRate),
              id: step.stepId,
              label: step.label,
              value: formatInteger(step.completions),
            }))}
            sortColumnId="value"
          />
        </>
      ) : (
        <InlineNotice
          message="Dla bieżącego zakresu nie ma jeszcze kroków lejka do pokazania."
          title="Brak danych lejka"
          tone={dataState === 'error' ? 'critical' : 'info'}
        />
      )}
    </section>
  );
}
