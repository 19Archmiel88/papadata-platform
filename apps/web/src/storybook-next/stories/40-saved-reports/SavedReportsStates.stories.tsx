import type { Meta } from '@storybook/react-vite';
import * as stories from './SavedReports.story-support';
export default {
  title: 'RAPORTY/Zapisane raporty/Stany',
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta;
export const Loading = { ...stories.Loading, name: 'Wczytywanie' };
export const Empty = { ...stories.Empty, name: 'Pusta biblioteka' };
export const ReadOnly = { ...stories.ReadOnly, name: 'Tylko odczyt' };
export const NotFound = { ...stories.NotFound, name: 'Raport niedostępny' };
export const Error = { ...stories.Error, name: 'Błąd z ponowieniem' };
export const CalculationError = { ...stories.CalculationError, name: 'Błąd przeliczenia' };
export const Building = { ...stories.Building, name: 'Przeliczanie' };
export const NoObservations = { ...stories.NoObservations, name: 'Brak obserwacji' };
