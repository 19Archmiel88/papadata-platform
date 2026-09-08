import type {
  Meta,
} from '@storybook/react-vite';

import {
  ProviderOutageStory as ProviderOutageStoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Stany',
} satisfies Meta;

export default meta;

export const ProviderOutageStory = {
  ...ProviderOutageStoryStory,
  name: 'Awaria providera',
};
