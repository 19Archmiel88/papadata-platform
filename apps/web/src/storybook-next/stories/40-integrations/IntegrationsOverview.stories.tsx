import type {
  Meta,
} from '@storybook/react-vite';

import {
  Screen40_01Story as Screen40_01StoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Całość',
} satisfies Meta;

export default meta;

export const Screen40_01Story = {
  ...Screen40_01StoryStory,
  name: 'Katalog integracji',
};
