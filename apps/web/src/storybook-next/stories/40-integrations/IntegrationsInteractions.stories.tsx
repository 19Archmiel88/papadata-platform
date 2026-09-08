import type {
  Meta,
} from '@storybook/react-vite';

import {
  ConnectWizardStory as ConnectWizardStoryStory,
  DisconnectDialogStory as DisconnectDialogStoryStory,
  ReconnectWizardStory as ReconnectWizardStoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Interakcje',
} satisfies Meta;

export default meta;

export const ConnectWizardStory = {
  ...ConnectWizardStoryStory,
  name: 'Połącz źródło',
};

export const ReconnectWizardStory = {
  ...ReconnectWizardStoryStory,
  name: 'Ponowne połączenie',
};

export const DisconnectDialogStory = {
  ...DisconnectDialogStoryStory,
  name: 'Odłączenie',
};
