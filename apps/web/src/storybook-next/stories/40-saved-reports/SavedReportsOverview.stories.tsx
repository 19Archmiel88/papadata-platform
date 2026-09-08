import type { Meta } from '@storybook/react-vite';
import * as stories from './SavedReports.story-support';
export default {
  title: 'RAPORTY/Zapisane raporty/Całość',
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta;
export const Library = { ...stories.Library, name: 'Biblioteka raportów' };
export const Reader = { ...stories.Reader, name: 'Zapisany raport' };
export const Editor = { ...stories.Editor, name: 'Edytor i podgląd' };
