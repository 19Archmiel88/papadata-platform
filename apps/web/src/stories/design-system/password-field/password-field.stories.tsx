import type { Meta, StoryObj } from '@storybook/react-vite';

import { PasswordField } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  PasswordBasicDemo,
  PasswordStatesDemo,
  PasswordValidationDemo,
  PasswordVisibilityDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Pole hasła',
  component: PasswordField,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: { label: 'Hasło' },
} satisfies Meta<typeof PasswordField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podstawowe: Story = {
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <PasswordBasicDemo />,
};

export const Widocznosc: Story = {
  name: 'Widoczność',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <PasswordVisibilityDemo />,
};

export const Walidacja: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <PasswordValidationDemo />,
};

export const Stany: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <PasswordStatesDemo />,
};
