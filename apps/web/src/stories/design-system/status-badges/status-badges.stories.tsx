import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusBadge } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  StatusContextDemo,
  StatusLabelsDemo,
  StatusVariantsDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Statusy i odznaki',
  component: StatusBadge,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: { status: 'ready' },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Warianty: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <StatusVariantsDemo />,
};

export const Etykiety: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <StatusLabelsDemo />,
};

export const WKontekscie: Story = {
  name: 'W kontekście',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <StatusContextDemo />,
};
