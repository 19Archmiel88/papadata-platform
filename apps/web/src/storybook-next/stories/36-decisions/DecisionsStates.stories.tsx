import type { Meta } from '@storybook/react-vite';
import {
  Loading as L,
  Empty as E,
  MissingEvidence as M,
  ReadOnly as R,
  Error as X,
} from './Decisions.story-support';
export default { title: 'DECYZJE/Centrum decyzji/Stany' } satisfies Meta;
export const Loading = { ...L, name: 'Ładowanie' };
export const Empty = { ...E, name: 'Pusta kolejka' };
export const MissingEvidence = { ...M, name: 'Brak danych do akceptacji' };
export const ReadOnly = { ...R, name: 'Tylko odczyt' };
export const Error = { ...X, name: 'Błąd i ponowienie' };
