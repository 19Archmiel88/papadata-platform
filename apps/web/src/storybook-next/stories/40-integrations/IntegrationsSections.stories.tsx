import type {
  Meta,
} from '@storybook/react-vite';

import {
  Screen40_03Story as Screen40_03StoryStory,
  Screen40_04Story as Screen40_04StoryStory,
  Screen40_06Story as Screen40_06StoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Sekcje',
} satisfies Meta;

export default meta;

export const Screen40_03Story = {
  ...Screen40_03StoryStory,
  name: 'Szczegóły integracji',
};

export const Screen40_04Story = {
  ...Screen40_04StoryStory,
  name: 'Historia synchronizacji',
};

export const Screen40_06Story = {
  ...Screen40_06StoryStory,
  name: 'Zakres synchronizacji',
};
