import type { Meta, StoryObj } from '@storybook/react-vite';

import { LogoWordmarkReference } from '../../screens/foundations/LogoWordmarkReference';

const meta = {
  title: 'PapaData/Podstawy marki/Logo i wordmark',
  component: LogoWordmarkReference,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LogoWordmarkReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReferencjaZnaku: Story = {
  name: 'Referencja znaku',
};
