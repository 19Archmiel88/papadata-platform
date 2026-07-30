import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Skeleton,
} from './Skeleton';

import '../Loading/loading-showcase.css';

const meta = {
  title: '10 Komponenty/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Szkielet ładowania utrzymuje realny rytm treści: linie tekstowe, moduły kart oraz listy bez przypadkowych szarych bloków.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SkeletonStory: Story = {
  args: {
    height: 16,
    lines: 3,
    shape: 'text',
    width: '100%',
  },
  name: 'Szkielet ładowania',
  render: () => (
    <main className="pd-loading-story">
      <div className="pd-loading-story__inner">
        <header className="pd-loading-story__header">
          <p className="pd-loading-story__kicker">10 Komponenty/Skeleton</p>
          <h1>Szkielet ma przypominać strukturę danych, nie dekorację.</h1>
          <p className="pd-loading-story__lead">
            Wzorzec wspiera ładowanie list, sekcji i kart. Zachowuje subtelną
            animację oraz czytelne proporcje w obu motywach.
          </p>
        </header>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Typowe kształty</h2>
          <div className="pd-loading-story__list">
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Linie tekstowe</h3>
                <p>Rytm akapitów i nagłówków bez sztucznych kontenerów wokół każdego przykładu.</p>
              </div>
              <Skeleton height={14} lines={4} shape="text" width="100%" />
            </div>
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Awatar lub wskaźnik</h3>
                <p>Mały moduł pomocniczy wpięty w ten sam system proporcji.</p>
              </div>
              <Skeleton height={48} lines={1} shape="circle" width={48} />
            </div>
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Moduł prostokątny</h3>
                <p>Przygotowanie miejsca na dane sekcyjne lub wykres.</p>
              </div>
              <Skeleton height={112} lines={1} shape="rect" width="100%" />
            </div>
          </div>
        </section>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Sekcja i lista</h2>
          <div className="pd-loading-story__surface-band">
            <div className="pd-loading-story__spec-label">
              <h3>Szkielet sekcji</h3>
              <p>Jedna neutralna powierzchnia pokazuje docelowy rytm bez mnożenia kart.</p>
            </div>
            <div className="pd-loading-story__stack">
              <Skeleton height={20} lines={1} shape="text" width="42%" />
              <Skeleton height={14} lines={3} shape="text" width="100%" />
              <Skeleton height={96} lines={1} shape="rect" width="100%" />
            </div>
          </div>
          <div className="pd-loading-story__surface-band">
            <div className="pd-loading-story__spec-label">
              <h3>Szkielet listy</h3>
              <p>Kolejne rekordy są pokazywane liniowo z czytelnym rytmem pionowym.</p>
            </div>
            <div className="pd-loading-story__stack">
              <Skeleton height={16} lines={1} shape="text" width="38%" />
              <div className="pd-loading-story__list">
                <Skeleton height={52} lines={1} shape="rect" width="100%" />
                <Skeleton height={52} lines={1} shape="rect" width="100%" />
                <Skeleton height={52} lines={1} shape="rect" width="100%" />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Tryb jasny i ciemny</h2>
          <div className="pd-loading-story__theme-grid">
            <div className="pd-loading-story__theme-row">
              <span className="pd-loading-story__eyebrow">tryb jasny</span>
              <Skeleton height={16} lines={4} shape="text" width="100%" />
            </div>
            <div className="pd-loading-story__theme-row" data-theme="dark">
              <span className="pd-loading-story__eyebrow">tryb ciemny</span>
              <Skeleton height={16} lines={4} shape="text" width="100%" />
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Typowe kształty'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByText('tryb jasny'),
    ).toBeInTheDocument();
  },
};
