import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  FormFieldBasicDemo,
  FormFieldStatesDemo,
  FormFieldTypesDemo,
  FormFieldValidationDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Pola formularzy',
  component: TextField,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: { label: 'Nazwa workspace' },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podstawowe: Story = {
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <FormFieldBasicDemo />,
};

export const Typy: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <FormFieldTypesDemo />,
};

export const Stany: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <FormFieldStatesDemo />,
};

export const Walidacja: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <FormFieldValidationDemo />,
};
