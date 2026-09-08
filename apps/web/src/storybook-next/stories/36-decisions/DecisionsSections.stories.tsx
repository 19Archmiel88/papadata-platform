import type { Meta } from '@storybook/react-vite';
import {
  Evidence as E,
  Plan as P,
  Measurement as M,
  Registry as R,
} from './Decisions.story-support';
export default { title: 'DECYZJE/Centrum decyzji/Sekcje' } satisfies Meta;
export const Evidence = { ...E, name: 'Dowody i ograniczenia' };
export const Plan = { ...P, name: 'Plan i wykonanie' };
export const Measurement = { ...M, name: 'Pomiar efektów' };
export const Registry = { ...R, name: 'Rejestr decyzji' };
