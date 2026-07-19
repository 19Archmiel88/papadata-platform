import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageHeader } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  HeadingActionsDemo,
  HeadingLongDemo,
  HeadingPageDemo,
  HeadingSectionDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Nagłówki',
  component: PageHeader,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: { title: 'Tytuł strony' },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Strony: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <HeadingPageDemo />,
};

export const Sekcje: Story = {
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <HeadingSectionDemo />,
};

export const ZAkcjami: Story = {
  name: 'Z akcjami',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <HeadingActionsDemo />,
};

export const LongText: Story = {
  name: 'Długi tekst',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <HeadingLongDemo />,
};
