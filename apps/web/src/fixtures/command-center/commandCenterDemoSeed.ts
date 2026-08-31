import {
  commandCenterSections,
  commandCompareOptions,
  commandCustomerCohorts,
  commandCustomers,
  commandDateRanges,
  commandDecisions,
  commandDriversWaterfall,
  commandFunnel,
  commandGuardian,
  commandIntegrations,
  commandKpis,
  commandMeta,
  commandPlan,
  commandProducts,
  commandRisks,
  commandSources,
  commandTimeSeries,
  commandTrendMetrics,
} from '../../screens/command-center/CommandCenterScreen.data';
import type {
  CommandCenterScreenData,
} from '../../screens/command-center/CommandCenterScreen.model';

export const commandCenterDemoSeed: CommandCenterScreenData = {
  compareMode: commandCompareOptions[0].value,
  customerCohorts: commandCustomerCohorts,
  customers: commandCustomers,
  decisions: commandDecisions,
  driversWaterfall: commandDriversWaterfall,
  funnel: commandFunnel,
  guardian: commandGuardian,
  integrations: commandIntegrations,
  kpis: commandKpis,
  meta: commandMeta,
  plan: commandPlan,
  products: commandProducts,
  risks: commandRisks,
  sections: commandCenterSections,
  sources: commandSources,
  timeSeries: commandTimeSeries,
  trendMetrics: commandTrendMetrics,
};

export const commandCenterDemoDateRanges = commandDateRanges;
