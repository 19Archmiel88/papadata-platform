import type { Meta } from '@storybook/react-vite';
import { EvidenceAndQueue as EvidenceAndQueueStory } from './OrdersBiPage.story-support';
const meta = { title: 'ANALIZA/Zamówienia/Interakcje' } satisfies Meta;
export default meta;
export const EvidenceAndQueue = { ...EvidenceAndQueueStory, name: 'Kolejka i dowody zamówienia' };
