import type { Meta, StoryObj } from '@storybook/react-vite';

import { InlineNotice } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  MessageActionDemo,
  MessageLongDemo,
  MessageNoIconDemo,
  MessageValidationDemo,
  MessageVariantsDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Komunikaty',
  component: InlineNotice,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: { children: 'Treść komunikatu', tone: 'info' },
} satisfies Meta<typeof InlineNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Warianty: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <MessageVariantsDemo />,
};

export const Walidacja: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <MessageValidationDemo />,
};

export const BezIkony: Story = {
  name: 'Bez ikony',
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <MessageNoIconDemo />,
};

export const ZAkcja: Story = {
  name: 'Z akcją',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <MessageActionDemo />,
};

export const LongContent: Story = {
  name: 'Długa treść',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <MessageLongDemo />,
};
