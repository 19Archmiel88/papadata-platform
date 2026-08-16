import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  PageHeader,
} from './PageHeader';
import type {
  PageHeaderProps,
} from './PageHeader';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    breadcrumbs: [
      { label: 'Centrum Dowodzenia', href: '/' },
      { label: 'Akwizycja', href: '/acquisition' },
      { label: 'Budżet kampanii', href: null },
    ],
    description: 'Nagłówek obszaru roboczego z kontekstem decyzji i metadanymi.',
    meta: [
      { label: 'Zakres', value: '1–16 sierpnia' },
      { label: 'Stan danych', value: 'częściowe' },
    ],
    subtitle: 'Monitorowanie decyzji marketingowych',
    title: 'Budżet i atrybucja',
  } satisfies PageHeaderProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Budżet i atrybucja')).toBeInTheDocument();
  },
};
