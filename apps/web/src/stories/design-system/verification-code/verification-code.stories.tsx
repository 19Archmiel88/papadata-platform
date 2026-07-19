import type { Meta, StoryObj } from '@storybook/react-vite';

import { VerificationCodeInput } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  CodeBasicDemo,
  CodeCompleteDemo,
  CodeDisabledDemo,
  CodeErrorDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Kod jednorazowy',
  component: VerificationCodeInput,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: {
    id: 'verification-code',
    label: 'Kod bezpieczeństwa',
    name: 'verification-code',
    onChange: () => undefined,
    value: '',
  },
} satisfies Meta<typeof VerificationCodeInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podstawowy: Story = {
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <CodeBasicDemo />,
};

export const Complete: Story = {
  name: 'Uzupełniony',
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <CodeCompleteDemo />,
};

export const Error: Story = {
  name: 'Błąd',
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <CodeErrorDemo />,
};

export const Nieaktywny: Story = {
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <CodeDisabledDemo />,
};
