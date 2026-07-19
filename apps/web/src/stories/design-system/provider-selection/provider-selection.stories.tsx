import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProviderButton } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  ProviderAvailableDemo,
  ProviderStatesDemo,
  ProviderUnavailableDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Wybór dostawcy',
  component: ProviderButton,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: { children: 'Google', provider: 'google' },
} satisfies Meta<typeof ProviderButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dostepni: Story = {
  name: 'Dostępni',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <ProviderAvailableDemo />,
};

export const Niedostepny: Story = {
  name: 'Niedostępny',
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <ProviderUnavailableDemo />,
};

export const Stany: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <ProviderStatesDemo />,
};
