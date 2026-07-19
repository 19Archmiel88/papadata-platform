import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthComponentShowcase } from '../../screens/account-access/AuthComponentShowcase';

const meta = {
  title: "PapaData/Dostęp do konta/Komponenty",
  component: AuthComponentShowcase,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    initialTheme: {
      control: "inline-radio",
      options: ["light", "dark"],
    },
  },
} satisfies Meta<typeof AuthComponentShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZestawKomponentow: Story = {
  name: "Zestaw komponentów",
  args: {
    initialTheme: "dark",
  },
};
