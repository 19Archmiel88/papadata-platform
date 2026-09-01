import type {
  Meta,
} from '@storybook/react-vite';

import {
  AccountProfile as AccountProfileStory,
  AccountSecurity as AccountSecurityStory,
  WsCompany as WsCompanyStory,
  WsTeam as WsTeamStory,
  WsAnalytics as WsAnalyticsStory,
  WsAi as WsAiStory,
  WsNotifications as WsNotificationsStory,
  WsCompliance as WsComplianceStory,
} from './SettingsGovernanceBiPage.story-support';

const meta = {
  title: 'ADMINISTRACJA/Ustawienia/Sekcje',
} satisfies Meta;

export default meta;

export const AccountProfile = {
  ...AccountProfileStory,
  name: 'Moje konto',
};

export const AccountSecurity = {
  ...AccountSecurityStory,
  name: 'Bezpieczeństwo',
};

export const WsCompany = {
  ...WsCompanyStory,
  name: 'Firma i workspace',
};

export const WsTeam = {
  ...WsTeamStory,
  name: 'Zespół i uprawnienia',
};

export const WsAnalytics = {
  ...WsAnalyticsStory,
  name: 'Analityka i cele',
};

export const WsAi = {
  ...WsAiStory,
  name: 'Papa Asystent',
};

export const WsNotifications = {
  ...WsNotificationsStory,
  name: 'Powiadomienia',
};

export const WsCompliance = {
  ...WsComplianceStory,
  name: 'Prywatność i zgodność',
};
