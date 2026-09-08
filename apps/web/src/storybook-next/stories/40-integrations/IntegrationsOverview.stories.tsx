import type {
  Meta,
} from '@storybook/react-vite';

import {
  SourcesStory as SourcesStoryStory,
} from './Integrations.story-support';

const meta = {
  title: 'DANE I INTEGRACJE/Integracje/Całość',
} satisfies Meta;

export default meta;

export const SourcesStory = {
  ...SourcesStoryStory,
  name: 'Źródła',
};
