import type {
  Meta,
} from '@storybook/react-vite';

import {
  Screen40_05Story as Screen40_05StoryStory,
  Screen40_09Story as Screen40_09StoryStory,
  Screen40_10Story as Screen40_10StoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Stany',
} satisfies Meta;

export default meta;

export const Screen40_05Story = {
  ...Screen40_05StoryStory,
  name: 'Synchronizacja w toku',
};

export const Screen40_09Story = {
  ...Screen40_09StoryStory,
  name: 'Awaria dostawcy',
};

export const Screen40_10Story = {
  ...Screen40_10StoryStory,
  name: 'Warianty integracji',
};
