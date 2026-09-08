import type { Meta } from '@storybook/react-vite';
import {
  Approve as A,
  Execute as E,
  RejectAndReopen as R,
  Search as S,
  Create as C,
} from './Decisions.story-support';
export default { title: 'DECYZJE/Centrum decyzji/Interakcje' } satisfies Meta;
export const Approve = { ...A, name: 'Zatwierdzenie planu' };
export const Execute = { ...E, name: 'Odnotowanie wykonania' };
export const RejectAndReopen = { ...R, name: 'Odrzucenie i ponowna ocena' };
export const Search = { ...S, name: 'Wyszukiwanie decyzji' };
export const Create = { ...C, name: 'Nowa propozycja' };
export { RecordMeasurement } from './Decisions.story-support';
