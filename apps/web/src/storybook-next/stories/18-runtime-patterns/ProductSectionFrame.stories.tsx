import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  Button,
} from '../../../design-system';
import {
  ProductSectionFrame,
} from '../../../design-system/components/Domain/ProductSectionFrame/ProductSectionFrame';

const action = fn();

const meta = {
  title: 'DESIGN SYSTEM/Wzorce/Ramka sekcji produktu',
  component: ProductSectionFrame,
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
  },
} satisfies Meta<typeof ProductSectionFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZAkcja: Story = {
  name: 'Z opisem i akcją',
  args: {
    actions: (
      <Button onClick={action} size="small" variant="secondary">
        Otwórz szczegóły
      </Button>
    ),
    children: (
      <p>
        Zawartość sekcji pozostaje własnością ekranu domenowego. Ramka zapewnia wspólny nagłówek,
        odstępy i miejsce na akcje.
      </p>
    ),
    description: 'Kanoniczna rama sekcji używana przez ekrany produktowe PapaData.',
    icon: 'customers',
    title: 'Eksplorator klientów',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Eksplorator klientów' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Otwórz szczegóły' })).toBeInTheDocument();
  },
};

export const Minimalna: Story = {
  name: 'Minimalna',
  args: {
    children: <p>Treść sekcji.</p>,
    icon: 'data',
    title: 'Jakość danych',
  },
};
