import type {
  Meta,
} from '@storybook/react-vite';

import {
  Workbench as WorkbenchStory,
} from './PapaAssistantLabPage.story-support';

const meta = {
  title: 'AI/Laboratorium Papa Asystenta/Całość',
} satisfies Meta;

export default meta;

export const Workbench = {
  ...WorkbenchStory,
  name: 'Widok pełny',
};
