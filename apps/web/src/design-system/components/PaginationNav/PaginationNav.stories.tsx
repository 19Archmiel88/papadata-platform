import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';

import {
  PaginationNav,
} from './PaginationNav';
import '../Navigation/navigation-showcase.css';

function PaginationNavExample({
  compact = false,
  loading = false,
}: {
  readonly compact?: boolean;
  readonly loading?: boolean;
}) {
  const [cursor, setCursor] = useState('after_25');

  return (
    <PaginationNav
      cursor={cursor}
      loading={loading}
      nextCursor={loading ? null : 'after_50'}
      previousCursor="before_25"
      size={
        compact
          ? 'compact'
          : 'default'
      }
      summary="26–50 z 240 wyników"
      onNavigate={(direction) => {
        setCursor(
          direction === 'next'
            ? 'after_50'
            : 'after_25',
        );
      }}
    />
  );
}

const meta = {
  title: '10 Komponenty/PaginationNav',
  component: PaginationNav,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof PaginationNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PaginationNavStory: Story = {
  args: {
    cursor: null,
    loading: false,
    nextCursor: null,
    previousCursor: null,
  },
  name: 'Nawigacja zakresów',
  render: () => (
    <main className="pd-navigation-story">
      <div className="pd-navigation-story__inner">
        <header className="pd-navigation-story__header">
          <p className="pd-navigation-story__kicker">10 Komponenty/PaginationNav</p>
          <h1>Nawigacja zakresów ma wspierać listy i tabele bez udawania pełnej paginacji stron.</h1>
          <p className="pd-navigation-story__lead">
            Ten wariant jest prostszy: pokazuje zakres, stan ładowania i akcje
            poprzedniego lub następnego wycinka wyników.
          </p>
        </header>

        <section className="pd-navigation-story__section">
          <h2>Warianty</h2>
          <div className="pd-navigation-story__rows">
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant listy</h3>
                <p>Zakres wyników dla tabeli lub listy zewnętrznie sterowanej.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <PaginationNavExample />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Mniejsza gęstość dla paneli bocznych i pobocznych list.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <PaginationNavExample compact />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Stan ładowania</h3>
                <p>Przy aktywnym pobieraniu zakresu obie akcje pozostają wyłączone.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <PaginationNavExample loading />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
};
