import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  ArtifactTable,
  getPrimaryArtifact,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/ArtifactTable',
  component: ArtifactTable,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ArtifactTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SearchSortColumnsAndCsv: Story = {
  name: 'Search, sort, kolumny i CSV',
  render: () => (
    <main className="pd-pa-story-stage">
      <ArtifactTable artifact={getPrimaryArtifact()} />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('table', { name: /ArtifactTable/u })).toBeInTheDocument();
    await userEvent.type(await canvas.findByRole('searchbox', { name: /Szukaj w tabeli/u }), 'ROAS');
    await expect(await canvas.findByText('ROAS blended')).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'CSV' })).toBeInTheDocument();
  },
};
