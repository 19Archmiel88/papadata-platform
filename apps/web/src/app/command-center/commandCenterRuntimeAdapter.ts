import type {
  DateRange,
} from '../../../../../contracts/ui-contract-types';
import type {
  CommandCenterScreenData,
} from '../../screens/command-center/CommandCenterScreen.model';
import type {
  BffClient,
} from '../../runtime/shared/api/bffClient';

/**
 * `v1/command-center/widok-glowny` returns CommandCenterScreenData's exact
 * fields (mode/currency/timezone/days/decisions/sources/lastUpdated)
 * directly at the top level of the response, alongside the generic
 * command-center envelope (records/summary/pageInfo) every other
 * command-center operation also returns -- see
 * buildCommandCenterOverviewScreenData in
 * apps/api/src/production/contract-runtime/command-center-metrics.contract-data.ts.
 * Reading it as CommandCenterScreenData simply ignores those extra fields.
 */
export async function loadCommandCenterRuntimeData(
  client: BffClient,
  dateRange: DateRange,
): Promise<CommandCenterScreenData> {
  return client.readDomainScreen<CommandCenterScreenData>(
    '/api/v1/command-center/widok-glowny',
    { dateRange },
  );
}
