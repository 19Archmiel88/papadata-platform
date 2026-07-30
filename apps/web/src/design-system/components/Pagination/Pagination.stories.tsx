import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';

import {
  Pagination,
} from './Pagination';
import '../Navigation/navigation-showcase.css';

function PaginationExample({
  compact = false,
  total = 240,
}: {
  readonly compact?: boolean;
  readonly total?: number;
}) {
  const [page, setPage] = useState(3);

  return (
    <Pagination
      page={page}
      pageSize={25}
      pageSizeOptions={[
        25,
        50,
        100,
      ]}
      size={
        compact
          ? 'compact'
          : 'default'
      }
      total={total}
      onPageChange={(nextPage) => {
        setPage(nextPage);
      }}
    />
  );
}

const meta = {
  title: '10 Komponenty/Pagination',
  component: Pagination,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PaginationStory: Story = {
  args: {
    page: 1,
    pageSize: 25,
    pageSizeOptions: [
      25,
      50,
    ],
    total: 100,
  },
  name: 'Stronicowanie',
  render: () => (
    <main className="pd-navigation-story">
      <div className="pd-navigation-story__inner">
        <header className="pd-navigation-story__header">
          <p className="pd-navigation-story__kicker">10 Komponenty/Pagination</p>
          <h1>Stronicowanie ma być precyzyjne i lekkie, nie ciężkie jak grupa przycisków.</h1>
          <p className="pd-navigation-story__lead">
            Nawigacja utrzymuje neutralny rytm, czytelny stan bieżącej strony i
            wyłączone akcje graniczne bez nadmiarowej dekoracji.
          </p>
        </header>

        <section className="pd-navigation-story__section">
          <h2>Warianty</h2>
          <div className="pd-navigation-story__rows">
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Zakres wyników, numery stron oraz akcje poprzednia i następna.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <PaginationExample />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Mniejsza gęstość dla list pobocznych i paneli narzędziowych.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <PaginationExample compact />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Granice zakresu</h3>
                <p>Na pierwszej i ostatniej stronie działania graniczne są wyłączone.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <Pagination
                  page={1}
                  pageSize={25}
                  pageSizeOptions={[
                    25,
                    50,
                  ]}
                  total={50}
                />
                <Pagination
                  page={2}
                  pageSize={25}
                  pageSizeOptions={[
                    25,
                    50,
                  ]}
                  total={50}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-navigation-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-navigation-story__theme-grid">
            <div className="pd-navigation-story__theme-column">
              <span className="pd-navigation-story__eyebrow">tryb jasny</span>
              <PaginationExample />
            </div>
            <div
              className="pd-navigation-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-navigation-story__eyebrow">tryb ciemny</span>
              <PaginationExample compact />
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
};
