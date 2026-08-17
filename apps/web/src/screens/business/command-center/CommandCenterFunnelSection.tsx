import {
  FunnelChart,
  InlineNotice,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  CommandFunnelSummary,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';

export function CommandCenterFunnelSection({
  data,
  dataState,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
}) {
  if (data.funnelSteps.length === 0) {
    return (
      <InlineNotice
        message="Dla bieżącego zakresu nie ma jeszcze kroków lejka do pokazania."
        title="Brak danych lejka"
        tone={dataState === 'error' ? 'critical' : 'info'}
      />
    );
  }

  return (
    <section
      aria-labelledby="command-center-funnel-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        eyebrow="Lejek"
        title="Największy odpływ na ścieżce zakupowej"
        titleId="command-center-funnel-title"
      />
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
    </section>
  );
}
