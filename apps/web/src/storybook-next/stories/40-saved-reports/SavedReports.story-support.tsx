import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { useState } from 'react';
import { SavedReportsScreen } from '../../../screens/saved-reports/SavedReportsScreen';
import { createReportsDemo } from '../../../screens/saved-reports/SavedReports.demo';
import { buildReportSnapshot } from '../../../screens/saved-reports/SavedReports.build';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = {
  title: 'INTERNAL STORY SUPPORT/Raporty',
  component: SavedReportsScreen,
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta<typeof SavedReportsScreen>;
export default meta;
type Story = StoryObj<typeof meta>;
const render = (props: Parameters<typeof SavedReportsScreen>[0] = {}) => (
  <StorybookProductShellFrame activePath="/app/papa">
    <SavedReportsScreen persistenceKey={null} {...props} />
  </StorybookProductShellFrame>
);
export const Library: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      await c.findByRole('heading', { name: /Zapisane raporty/, level: 1 }),
    ).toBeInTheDocument();
    await expect(c.getByRole('list', { name: 'Raporty w bibliotece' }).children).toHaveLength(5);
  },
};
export const Reader: Story = {
  render: () => render({ initialReportId: 'RAP-001', initialVersion: 2 }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('article', { name: 'Zapisany raport' }),
    ).toBeInTheDocument();
  },
};
export const Editor: Story = {
  render: () => render({ initialReportId: 'RAP-004', initialEdit: true }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Przelicz podgląd' }));
    await expect(await c.findByRole('article', { name: 'Podgląd raportu' })).toBeInTheDocument();
  },
};
export const Products: Story = {
  render: () => render({ initialReportId: 'RAP-002' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Wynik z ograniczeniami'),
    ).toBeInTheDocument();
  },
};
export const Inventory: Story = {
  render: () => render({ initialReportId: 'RAP-003' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Stan magazynu z 31 sierpnia 2026; średni popyt z 2–31 sierpnia. Zmiana dat sprzedaży nie zmienia tego stanu.',
      ),
    ).toBeInTheDocument();
  },
};
export const Orders: Story = {
  render: () => render({ initialReportId: 'RAP-005' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(/Jawna próbka sześciu/),
    ).toBeInTheDocument();
  },
};
export const Templates: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: '+ Nowy raport' }),
    );
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await expect(d.getByRole('heading', { name: 'Rentowność produktów' })).toBeInTheDocument();
  },
};
export const History: Story = {
  render: () => render({ initialReportId: 'RAP-001', initialVersion: 2 }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Historia wersji (2)' }),
    );
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Historia i porównanie wersji',
      }),
    ).toBeInTheDocument();
  },
};
export const Export: Story = {
  render: () => render({ initialReportId: 'RAP-001', initialVersion: 2 }),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Eksportuj raport' }),
    );
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('button', { name: 'Pobierz HTML' }),
    ).toBeInTheDocument();
  },
};
export const Favorites: Story = {
  render: () => render({ initialCollection: 'favorites' }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      (await c.findByRole('list', { name: 'Raporty w bibliotece' })).children,
    ).toHaveLength(2);
    await userEvent.click(c.getByRole('button', { name: /Usuń z ulubionych: Sierpień/ }));
    await waitFor(() =>
      expect(c.getByRole('list', { name: 'Raporty w bibliotece' }).children).toHaveLength(1),
    );
  },
};
export const Search: Story = {
  render: () => render(),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(await c.findByRole('searchbox', { name: 'Szukaj raportu' }), 'produkty');
    await expect(c.getByRole('list', { name: 'Raporty w bibliotece' }).children).toHaveLength(1);
  },
};
export const Publish: Story = {
  render: () => render({ initialReportId: 'RAP-004', initialEdit: true }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Przelicz podgląd' }));
    await userEvent.click(await c.findByRole('button', { name: 'Zapisz wersję 2' }));
    await expect(await c.findByRole('article', { name: 'Zapisany raport' })).toBeInTheDocument();
    await expect(
      c.getByText('Zapisano wersję 2. Poprzednie wersje pozostają w historii.'),
    ).toBeInTheDocument();
  },
};
export const InvalidatedPreview: Story = {
  render: () => render({ initialReportId: 'RAP-004', initialEdit: true }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Przelicz podgląd' }));
    await userEvent.type(c.getByLabelText('Tytuł raportu'), ' · rewizja');
    await expect(c.getByRole('button', { name: 'Zapisz wersję 2' })).toBeDisabled();
  },
};
export const Restore: Story = {
  render: () => render({ initialReportId: 'RAP-001', initialVersion: 1 }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Historia wersji (2)' }));
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await userEvent.click(d.getByRole('button', { name: 'Przywróć jako wersję 3' }));
    await expect(await c.findByText('Przywrócono wynik jako nową wersję.')).toBeInTheDocument();
  },
};
export const Archive: Story = {
  render: () => render({ initialReportId: 'RAP-002' }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Przenieś do archiwum' }));
    const d = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'));
    await userEvent.click(d.getByRole('button', { name: 'Przenieś do archiwum' }));
    await expect(await c.findByText('Raport przeniesiono do archiwum.')).toBeInTheDocument();
    await expect(c.getByRole('list', { name: 'Raporty w bibliotece' }).children).toHaveLength(2);
  },
};
export const Loading: Story = {
  render: () => render({ state: 'loading' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Wczytywanie biblioteki raportów…'),
    ).toBeInTheDocument();
  },
};
const empty = { schema: 1 as const, workspace: 'commerce', reports: [] };
export const Empty: Story = {
  render: () => render({ data: empty }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: 'Tutaj zaczyna się Twoja biblioteka',
      }),
    ).toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  render: () => render({ canManage: false, initialReportId: 'RAP-001' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Przygotuj nową wersję' }),
    ).toBeDisabled();
  },
};
export const NotFound: Story = {
  render: () => render({ initialReportId: 'missing' }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', { name: 'Nie znaleziono raportu' }),
    ).toBeInTheDocument();
  },
};
function RetryExample() {
  const [failed, setFailed] = useState(true);
  return render({ state: failed ? 'error' : 'ready', onRetry: () => setFailed(false) });
}
export const Error: Story = {
  render: () => <RetryExample />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Spróbuj ponownie' }));
    await expect(await c.findByRole('list', { name: 'Raporty w bibliotece' })).toBeInTheDocument();
  },
};
function RetryCalculation() {
  const [failed, setFailed] = useState(true);
  return render({
    initialReportId: 'RAP-004',
    initialEdit: true,
    build: async (c) => {
      if (failed) {
        setFailed(false);
        throw new globalThis.Error('Źródło chwilowo niedostępne. Spróbuj ponownie.');
      }
      return buildReportSnapshot(c);
    },
  });
}
export const CalculationError: Story = {
  render: () => <RetryCalculation />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Przelicz podgląd' }));
    await expect(
      await c.findByText('Źródło chwilowo niedostępne. Spróbuj ponownie.'),
    ).toBeInTheDocument();
    await userEvent.click(c.getByRole('button', { name: 'Przelicz podgląd' }));
    await expect(await c.findByRole('article', { name: 'Podgląd raportu' })).toBeInTheDocument();
  },
};
export const Building: Story = {
  render: () =>
    render({ initialReportId: 'RAP-004', initialEdit: true, build: () => new Promise(() => {}) }),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(await c.findByRole('button', { name: 'Przelicz podgląd' }));
    await expect(await c.findByRole('button', { name: 'Anuluj przeliczanie' })).toBeInTheDocument();
  },
};
export const NoObservations: Story = {
  render: () => {
    const data = createReportsDemo();
    const v = data.reports[0].versions[1];
    v.config = { ...v.config, from: '2028-01-01', to: '2028-01-31' };
    v.snapshot = buildReportSnapshot(v.config);
    return render({ data, initialReportId: 'RAP-001' });
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Brak obserwacji w tym zakresie'),
    ).toBeInTheDocument();
  },
};
