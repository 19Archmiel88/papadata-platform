import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  InlineNotice,
  SectionNavigation,
  StatusBadge,
  TextAction,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const inspectLayoutAction = fn();

const masterDetailItems = [
  {
    href: '#przeglad-zadania',
    id: 'overview',
    label: 'Przegląd zadania',
  },
  {
    href: '#dowody-i-zrodla',
    id: 'evidence',
    label: 'Dowody i źródła',
  },
] as const;

function PageSectionPattern() {
  const [activeRegion, setActiveRegion] =
    useState('overview');
  const [message, setMessage] = useState(
    'Widok pokazuje domyślną hierarchię: nagłówek strony, region treści, podział i relację lista-szczegół.',
  );

  const activateRegion = (regionId: string) => {
    setActiveRegion(regionId);
    setMessage(
      regionId === 'evidence'
        ? 'Wybrano region dowodów. Zmienia się szczegół, ale nie powstaje osobna karta układu.'
        : 'Wybrano region przeglądu. Strona nadal opiera się o separatory i rytm treści.',
    );
  };

  return (
    <div className="pd-x18-stack">
      <section
        aria-label="Główna treść strony"
        className="pd-x18-region"
      >
        <div className="pd-x18-region__header">
          <p className="pd-x18-region__eyebrow">Nagłówek strony</p>
          <h3 className="pd-x18-region__title">
            Jedna teza, status i lekka akcja prowadzą użytkownika do treści
          </h3>
          <p className="pd-x18-region__text">
            Nagłówek strony ustawia kontekst zadania, a region treści nie
            wymaga dodatkowej zamkniętej powierzchni tylko po to, żeby oddzielić
            bloki.
          </p>
        </div>

        <div className="pd-x18-status-row">
          <div className="pd-x18-meta-row">
            <StatusBadge
              status="Status wzorca"
              text="W przeglądzie"
              tone="info"
            />
            <span className="pd-x18-description">
              Punkt orientacyjny `main` pochodzi z StoryPresentationPage.
            </span>
          </div>
          <TextAction
            onClick={() => {
              inspectLayoutAction();
              setMessage(
                'Akcja tekstowa odsłania decyzję układu bez dokładania osobnego kafla.',
              );
            }}
          >
            Pokaż decyzję układu
          </TextAction>
        </div>
      </section>

      <section
        aria-label="Podział treści i region poboczny"
        className="pd-x18-split"
      >
        <div className="pd-x18-flow-region">
          <div className="pd-x18-flow-region__header">
            <p className="pd-x18-region__eyebrow">Nagłówek sekcji</p>
            <h3 className="pd-x18-flow-region__title">
              Region treści zachowuje rytm pionowy
            </h3>
            <p className="pd-x18-flow-region__text">
              Sekcja ma nagłówek, opis i treść rozdzieloną liniami. Brak
              lokalnych wrapperów, które udają komponenty bazowe.
            </p>
          </div>

          <ul className="pd-x18-separator-list pd-x18-separator-list--inline">
            <li>
              <span className="pd-x18-term">Sekcja</span>
              <span className="pd-x18-description">
                Konsekwentny nagłówek, indeks i opis wymagania.
              </span>
            </li>
            <li>
              <span className="pd-x18-term">Treść</span>
              <span className="pd-x18-description">
                Układ otwarty, bez siatki kart do rozdzielania akapitów.
              </span>
            </li>
            <li>
              <span className="pd-x18-term">Akcje</span>
              <span className="pd-x18-description">
                Akcje drugorzędne pozostają tekstowe i blisko kontekstu.
              </span>
            </li>
          </ul>
        </div>

        <aside
          aria-label="Region poboczny decyzji"
          className="pd-x18-flow-region"
        >
          <div className="pd-x18-flow-region__header">
            <h3 className="pd-x18-flow-region__title">
              Region poboczny nie tworzy konkurencyjnej powierzchni
            </h3>
            <p className="pd-x18-flow-region__text">
              Metadane i komentarz stoją obok treści. Ich rolą jest uzupełnić
              decyzję, nie tworzyć osobny ekran w ekranie.
            </p>
          </div>
          <InlineNotice
            message="To jest informacja kontekstowa, nie alert ani stan błędu."
            title="Lekka informacja"
            tone="info"
          />
        </aside>
      </section>

      <section
        aria-label="Relacja lista-szczegół"
        className="pd-x18-master-detail"
      >
        <div className="pd-x18-master-detail__master">
          <SectionNavigation
            activeId={activeRegion}
            aria-controls="pd-x18-master-detail-panel"
            ariaLabel="Nawigacja relacji lista-szczegół"
            itemProps={(item) => ({
              onClick: (event) => {
                event.preventDefault();
                activateRegion(item.id);
              },
            })}
            items={masterDetailItems}
            orientation="vertical"
            size="compact"
          />
        </div>
        <div
          className="pd-x18-master-detail__detail"
          id="pd-x18-master-detail-panel"
        >
          <div className="pd-x18-flow-region__header">
            <h3 className="pd-x18-flow-region__title">
              {activeRegion === 'evidence'
                ? 'Szczegół: dowody i źródła'
                : 'Szczegół: przegląd zadania'}
            </h3>
            <p
              aria-live="polite"
              className="pd-x18-flow-region__text"
            >
              {message}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Układ strony i sekcji',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const PageSectionLayoutStory: Story = {
  name: 'Układ strony i sekcji',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca układu"
          items={[
            { label: 'Kontrakt', value: '18.01' },
            { label: 'Zakres', value: 'Tylko wzorzec' },
            { label: 'Status', value: 'W przeglądzie' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.01"
      summary="Układ strony i sekcji korzysta z semantycznych regionów, typografii, separatorów i istniejących akcji. Nie buduje ekranu jako siatki zamkniętych kontenerów."
      title="Układ strony i sekcji"
    >
      <StoryPresentationSection
        index="01"
        summary="Nagłówek strony, nagłówek sekcji, region treści, podział i relacja lista-szczegół w jednym otwartym wzorcu."
        title="Otwarta kompozycja strony"
      >
        <PageSectionPattern />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'Układ strony i sekcji',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('main'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('region', {
        name: 'Główna treść strony',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('region', {
        name: 'Podział treści i region poboczny',
      }),
    ).toBeInTheDocument();

    const layoutAction = canvas.getByRole('button', {
      name: 'Pokaż decyzję układu',
    });

    await userEvent.click(layoutAction);

    await expect(
      canvas.getByText(/bez dokładania osobnego kafla/),
    ).toBeInTheDocument();

    const evidenceNavigationItem = canvas.getByRole('link', {
      name: 'Dowody i źródła',
    });

    await userEvent.click(
      evidenceNavigationItem,
    );

    await expect(
      evidenceNavigationItem,
    ).toHaveAttribute('aria-current', 'page');

    await expect(
      canvas.getByRole('heading', {
        name: 'Szczegół: dowody i źródła',
      }),
    ).toBeInTheDocument();
  },
};
