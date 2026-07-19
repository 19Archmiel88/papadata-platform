import type { Meta, StoryObj } from '@storybook/react-vite';

import { Surface } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  SurfaceActionDemo,
  SurfaceCardsDemo,
  SurfaceStatusDemo,
  SurfaceVariantsDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Karty i powierzchnie',
  component: Surface,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: { variant: 'default' },
} satisfies Meta<typeof Surface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Powierzchnie: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <SurfaceVariantsDemo />,
};

export const Karty: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <SurfaceCardsDemo />,
};

export const ZAkcja: Story = {
  name: 'Z akcją',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <SurfaceActionDemo />,
};

export const Statusy: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <SurfaceStatusDemo />,
};
