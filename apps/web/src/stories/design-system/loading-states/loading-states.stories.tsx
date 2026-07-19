import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoadingState } from '../../../design-system';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';
import {
  EmptyOnlyDemo,
  ErrorOnlyDemo,
  LoadingOnlyDemo,
  StateOverviewDemo,
} from '../_shared/ComponentCatalogDemos';

const meta = {
  title: 'PapaData/02 Komponenty/Stany ładowania',
  component: LoadingState,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
  args: {
    text: 'Sprawdzamy gotowość danych.',
    title: 'Trwa sprawdzanie',
  },
} satisfies Meta<typeof LoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ladowanie: Story = {
  name: 'Ładowanie',
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <LoadingOnlyDemo />,
};

export const BrakDanych: Story = {
  name: 'Brak danych',
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <EmptyOnlyDemo />,
};

export const Error: Story = {
  name: 'Błąd',
  parameters: {
    componentCanvas: 'centered',
  },
  render: () => <ErrorOnlyDemo />,
};

export const Przeglad: Story = {
  name: 'Przegląd',
  parameters: {
    componentCanvas: 'wide',
  },
  render: () => <StateOverviewDemo />,
};
