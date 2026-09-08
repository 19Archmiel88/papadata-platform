import type {
  Meta,
} from '@storybook/react-vite';

import {
  AuditP0 as AuditP0Story,
} from './SettingsGovernanceBiPage.story-support';

const meta = {
  title: 'ADMINISTRACJA/Ustawienia/Stany',
} satisfies Meta;

export default meta;

export const AuditP0 = {
  ...AuditP0Story,
  name: 'Spójność konfiguracji',
};
