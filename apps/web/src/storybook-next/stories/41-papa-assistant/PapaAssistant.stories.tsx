import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { useEffect } from 'react';
import { PapaAssistantExperience } from '../../../runtime/shell/papa-assistant/PapaAssistantExperience';
import { usePapaAssistantRuntime } from '../../../runtime/shell/papa-assistant/PapaAssistantRuntimeContext';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
import type { PapaScreenContextSnapshot } from '../../../runtime/shell/papa-assistant/ScreenContextProvider';

const snapshot: PapaScreenContextSnapshot = {
  title: 'Przegląd biznesu', route: '/app/command-center', screenId: '30.01', summary: 'Demonstracja wyniku biznesu.',
  activeSection: null, breadcrumbs: ['Przegląd'], operationId: null, readiness: 'partial',
  dateRange: { from: '2026-08-01', to: '2026-08-31', timezone: 'Europe/Warsaw' }, dateRangeLabel: 'Sierpień 2026', sectionLabel: 'Przegląd',
  updatedAt: '2026-09-08T08:00:00Z', capturedAt: '2026-09-08T08:00:00Z', snapshotId: 'demo-august', captureReason: 'storybook',
  userLabel: 'Anna', workspaceId: 'commerce', workspaceName: 'Commerce PL',
  charts: [{ id: 'trend', label: 'Trend wyniku', kind: 'chart', source: 'Demonstracja' }], tables: [], recommendations: [], elements: [], filters: [], evidence: [],
  metrics: [{ id: 'revenue', label: 'Przychód (PLN)', kind: 'metric', value: '1427101', source: 'Demonstracja' },
    { id: 'margin', label: 'Marża (PLN)', kind: 'metric', value: '245512', source: 'Demonstracja' }],
};
function Seed({ empty = false }: { empty?: boolean }) {
  const runtime = usePapaAssistantRuntime();
  useEffect(() => { runtime.setContext(empty ? { ...snapshot, metrics: [], charts: [] } : snapshot); }, [empty]);
  return <PapaAssistantExperience />;
}
const meta = { title: 'Papa Asystent/Przebudowa', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const FullPage: Story = { name: 'Pełny widok', render: () => <StorybookProductShellFrame activePath="/app/assistant"><Seed /></StorybookProductShellFrame> };
export const EmptyEvidence: Story = { name: 'Brak danych', render: () => <StorybookProductShellFrame activePath="/app/assistant"><Seed empty /></StorybookProductShellFrame> };
export const ConversationAndReport: Story = { name: 'Rozmowa, dowody i szkic', play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.type(await canvas.findByLabelText('Twoje pytanie'), 'Co zmieniło wynik?');
  await userEvent.click(canvas.getByRole('button', { name: 'Wyślij pytanie' }));
  await canvas.findByRole('button', { name: 'Sprawdź dowody (2)' });
  await userEvent.click(canvas.getByRole('button', { name: 'Kontekst' }));
  await userEvent.click(canvas.getByRole('checkbox', { name: /Przychód/ }));
  await expect(canvas.getByRole('checkbox', { name: /Przychód/ })).not.toBeChecked();
  await userEvent.click(canvas.getByRole('button', { name: 'Raporty' }));
  await userEvent.clear(canvas.getByLabelText('Nazwa raportu'));
  await userEvent.type(canvas.getByLabelText('Nazwa raportu'), 'Wynik sierpnia');
  await userEvent.click(canvas.getByRole('button', { name: 'Zapisz szkic' }));
  await expect(await canvas.findByText('Wynik sierpnia · Szkic')).toBeVisible();
} };
export const ReviewAction: Story = { name: 'Przegląd i zatwierdzenie propozycji', play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole('button', { name: 'Działania' }));
  await userEvent.click(await canvas.findByRole('button', { name: /campaigns.budget.review/ }));
  await expect(canvas.getByRole('button', { name: 'Zatwierdź propozycję' })).toBeDisabled();
  await userEvent.type(canvas.getByLabelText('Uzasadnienie decyzji'), 'Sprawdzono okres, dowody i wariant budżetu.');
  await userEvent.click(canvas.getByRole('checkbox'));
  await userEvent.click(canvas.getByRole('button', { name: 'Zatwierdź propozycję' }));
  await expect(await canvas.findByText('Propozycja zatwierdzona. Zmiana zewnętrzna nie została wykonana.')).toBeVisible();
} };
export const ResetAndCancel: Story = { name: 'Przerwanie i nowa rozmowa', play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  await userEvent.type(await canvas.findByLabelText('Twoje pytanie'), 'Porównaj wynik');
  await userEvent.click(canvas.getByRole('button', { name: 'Wyślij pytanie' }));
  await userEvent.click(await canvas.findByRole('button', { name: 'Przerwij oczekiwanie' }));
  await expect(canvas.getByLabelText('Twoje pytanie')).toHaveValue('Porównaj wynik');
  await userEvent.click(canvas.getByRole('button', { name: 'Nowa rozmowa' }));
  const dialog = await body.findByRole('dialog', { name: 'Rozpocząć nową rozmowę?' });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Rozpocznij nową' }));
  await expect(canvas.getByLabelText('Twoje pytanie')).toHaveValue('');
} };
