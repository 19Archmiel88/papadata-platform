import type {
  PapaDataIconName,
} from '../../design-system';
import type {
  SettingsTabId,
} from '../../fixtures/settings-governance/settingsGovernanceDemoSeed';

export const settingsSections = [
  {
    icon: 'home',
    id: 'account-profile',
    navLabel: 'Moje konto',
    title: 'Moje konto',
  },
  {
    icon: 'security',
    id: 'account-security',
    navLabel: 'Bezpieczeństwo',
    title: 'Bezpieczeństwo i dostęp',
  },
  {
    icon: 'data',
    id: 'ws-company',
    navLabel: 'Firma',
    title: 'Firma i workspace',
  },
  {
    icon: 'customers',
    id: 'ws-team',
    navLabel: 'Zespół',
    title: 'Zespół i uprawnienia',
  },
  {
    icon: 'trend',
    id: 'ws-analytics',
    navLabel: 'Analityka',
    title: 'Analityka i cele biznesowe',
  },
  {
    icon: 'assistant',
    id: 'ws-ai',
    navLabel: 'Papa AI',
    title: 'Papa Asystent',
  },
  {
    icon: 'notifications',
    id: 'ws-notifications',
    navLabel: 'Powiadomienia',
    title: 'Powiadomienia i raporty',
  },
  {
    icon: 'success',
    id: 'ws-compliance',
    navLabel: 'Prywatność',
    title: 'Prywatność i zgodność',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: Exclude<SettingsTabId, 'audit-p0'>;
  readonly navLabel: string;
  readonly title: string;
}[];

export type SettingsSectionId = typeof settingsSections[number]['id'];

export const settingsSectionsById = settingsSections.reduce((accumulator, section) => {
  accumulator[section.id] = section;
  return accumulator;
}, {} as Record<SettingsSectionId, typeof settingsSections[number]>);
