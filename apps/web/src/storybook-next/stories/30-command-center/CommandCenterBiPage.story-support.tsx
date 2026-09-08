import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CommandCenterScreen } from '../../../screens/command-center/CommandCenterScreen';
import { commandCenterOverviewFixture } from '../../fixtures/command-center/commandCenterOverviewFixture';
import type { OverviewSection } from '../../../screens/command-center/CommandCenterScreen.model';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/ANALIZA/Przegląd',
  component: CommandCenterScreen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CommandCenterScreen>;
export default meta;
type Story = StoryObj<typeof meta>;

export function OverviewStoryFrame({ section }: { readonly section?: OverviewSection }) {
  return (
    <StorybookProductShellFrame activePath="/app/command-center">
      <CommandCenterScreen data={commandCenterOverviewFixture} section={section} />
    </StorybookProductShellFrame>
  );
}
export const Overview: Story = {
  render: () => <OverviewStoryFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { name: 'Wynik biznesu' })).toBeInTheDocument();
    await expect(
      await canvas.findByRole('heading', { name: 'Decyzje na teraz' }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole('heading', { name: 'Co zmieniło marżę?' }),
    ).toBeInTheDocument();
  },
};
export const Kpi: Story = { render: () => <OverviewStoryFrame section="metrics" /> };
export const Trend: Story = { render: () => <OverviewStoryFrame section="trend" /> };
export const Drivers: Story = { render: () => <OverviewStoryFrame section="drivers" /> };
export const Guardian: Story = { render: () => <OverviewStoryFrame section="decisions" /> };
export const DataHealth: Story = { render: () => <OverviewStoryFrame section="data" /> };
export const EvidenceInteraction: Story = {
  render: () => <OverviewStoryFrame />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      body = within(canvasElement.ownerDocument.body);
    const buttons = await canvas.findAllByRole('button', { name: /Sprawdź dowody/ });
    await userEvent.click(buttons[0]);
    const dialog = await body.findByRole('dialog', {
      name: 'Sprawdź rentowność retargetingu Meta',
    });
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByText('128 zł')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};
