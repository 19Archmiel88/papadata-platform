import type { Meta } from '@storybook/react-vite';
import {
  BundleSimulator as BundleSimulatorStory,
  EvidenceAndRisk as EvidenceAndRiskStory,
} from './ProductsBiPage.story-support';
const meta = { title: 'ANALIZA/Produkty/Interakcje' } satisfies Meta;
export default meta;
export const BundleSimulator = { ...BundleSimulatorStory, name: 'Symulator zestawów' };
export const EvidenceAndRisk = { ...EvidenceAndRiskStory, name: 'Koszt, ryzyko i szczegóły SKU' };
