import type {
  Meta,
} from '@storybook/react-vite';

import {
  Screen40_02Story as Screen40_02StoryStory,
  Screen40_07Story as Screen40_07StoryStory,
  Screen40_08Story as Screen40_08StoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Interakcje',
} satisfies Meta;

export default meta;

export const Screen40_02Story = {
  ...Screen40_02StoryStory,
  name: 'Kreator połączenia',
};

export const Screen40_07Story = {
  ...Screen40_07StoryStory,
  name: 'Ponowne połączenie',
};

export const Screen40_08Story = {
  ...Screen40_08StoryStory,
  name: 'Odłączenie',
};
