import type { Meta } from '@storybook/react-vite';
import { Overview as OverviewStory } from './Decisions.story-support';
export default {
  title: 'DECYZJE/Centrum decyzji/Całość',
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta;
export const Overview = { ...OverviewStory, name: 'Kolejka decyzji' };
