import type { Meta } from '@storybook/react-vite';
import { Overview as OverviewStory } from './Decisions.story-support';
export default { title: 'DECYZJE/Centrum decyzji/Całość' } satisfies Meta;
export const Overview = { ...OverviewStory, name: 'Kolejka decyzji' };
