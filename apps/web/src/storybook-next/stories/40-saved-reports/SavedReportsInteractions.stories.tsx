import type { Meta } from '@storybook/react-vite';
import * as stories from './SavedReports.story-support';
export default {
  title: 'RAPORTY/Zapisane raporty/Interakcje',
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta;
export const Favorites = { ...stories.Favorites, name: 'Ulubione' };
export const Search = { ...stories.Search, name: 'Wyszukiwanie' };
export const Publish = { ...stories.Publish, name: 'Zapis nowej wersji' };
export const InvalidatedPreview = {
  ...stories.InvalidatedPreview,
  name: 'Zmiana zakresu wymaga przeliczenia',
};
export const Restore = { ...stories.Restore, name: 'Przywrócenie starej wersji' };
export const Archive = { ...stories.Archive, name: 'Archiwizacja' };
