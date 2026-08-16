import type { Meta, StoryObj } from '@storybook/react-vite';

import { RuntimeContextDocument } from './RuntimeContextDocument';
import './runtime-contexts.css';

const meta = {
  title: '00 Fundamenty/06 Katalog komponentów/Realne konteksty 83 komponentów',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const RealneKonteksty83Komponentow: Story = {
  name: 'Realne konteksty 83 komponentów',
  render: () => <RuntimeContextDocument />,
};
