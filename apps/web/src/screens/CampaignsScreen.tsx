import {
  AnalyticsModuleScreen,
} from './analytics/AnalyticsModuleScreen';

export type CampaignsScreenProps = {
  readonly path?: string;
};

export function CampaignsScreen({
  path = '/app/campaigns/przeglad',
}: CampaignsScreenProps) {
  return (
    <AnalyticsModuleScreen
      group='campaigns'
      path={path}
    />
  );
}
