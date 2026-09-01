import type {
  Meta,
} from '@storybook/react-vite';

import {
  ModalsAndSearch as ModalsAndSearchStory,
} from './SettingsGovernanceBiPage.story-support';

const meta = {
  title: 'ADMINISTRACJA/Ustawienia/Interakcje',
} satisfies Meta;

export default meta;

export const ModalsAndSearch = {
  ...ModalsAndSearchStory,
  name: 'Modale i wyszukiwanie',
};
