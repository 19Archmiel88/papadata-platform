import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
} from 'lucide-react';

import { Button } from '../../../design-system';
import {
  ComponentShowcase,
  ComponentSpecRow,
} from '../_shared/ComponentCanvas';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';

function NavigationReference() {
  return (
    <nav aria-label="Nawigacja referencyjna">
      <a href="#przeglad">Przegląd</a>
    </nav>
  );
}

const meta = {
  title: 'PapaData/02 Komponenty/Nawigacja',
  component: NavigationReference,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'wide',
    docs: {
      toc: true,
    },
  },
} satisfies Meta<typeof NavigationReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podstawowa: Story = {
  render: () => (
    <ComponentShowcase
      title="Akcje globalne"
      description="Kontrolki globalne zachowują stałe znaczenie i kolejność w całej aplikacji."
    >
      <div className="pds-component-spec-row">
        <strong>Nawigacja</strong>

        <p>
          Najczęściej używane działania dostępne w kontekście
          całej aplikacji.
        </p>

        <nav
          className="pds-navigation-toolbar"
          aria-label="Akcje globalne"
        >
          <Button type="button" variant="secondary">
            <span className="pds-story-inline">
              <Search size={16} aria-hidden="true" />
              Szukaj
            </span>
          </Button>

          <Button type="button" variant="secondary">
            <span className="pds-story-inline">
              <CalendarDays size={16} aria-hidden="true" />
              Ostatnie 30 dni
            </span>
          </Button>

          <Button type="button" variant="ghost">
            <span className="pds-story-inline">
              <Bell size={16} aria-hidden="true" />
              Alerty
            </span>
          </Button>

          <Button type="button" variant="ghost">
            <span className="pds-story-inline">
              <Settings size={16} aria-hidden="true" />
              Ustawienia
            </span>
          </Button>
        </nav>
      </div>
    </ComponentShowcase>
  ),
};

export const Sciezka: Story = {
  name: 'Ścieżka',
  render: () => (
    <ComponentShowcase
      title="Ścieżka nawigacyjna"
      description="Breadcrumb wskazuje aktualne położenie użytkownika w strukturze aplikacji."
    >
      <ComponentSpecRow
        label="Breadcrumb"
        description="Ostatni element opisuje aktualny widok i nie jest linkiem."
      >
        <nav
          className="pds-navigation-breadcrumb"
          aria-label="Ścieżka nawigacyjna"
        >
          <ol>
            <li>
              <a href="#workspace">Workspace</a>
            </li>

            <li aria-hidden="true">/</li>

            <li>
              <a href="#integracje">Integracje</a>
            </li>

            <li aria-hidden="true">/</li>

            <li aria-current="page">Shopify</li>
          </ol>
        </nav>
      </ComponentSpecRow>
    </ComponentShowcase>
  ),
};

export const Tabs: Story = {
  name: 'Zakładki',
  render: () => (
    <ComponentShowcase
      title="Zakładki"
      description="Zakładki przełączają równorzędne widoki bez opuszczania bieżącego kontekstu."
    >
      <div className="pds-navigation-preview">
        <p className="pds-navigation-preview__label">
          Sekcje integracji
        </p>

        <div
          className="pds-navigation-tabs"
          role="tablist"
          aria-label="Sekcje integracji"
        >
          <button
            className="pds-navigation-tab is-active"
            type="button"
            role="tab"
            aria-selected="true"
          >
            Przegląd
          </button>

          <button
            className="pds-navigation-tab"
            type="button"
            role="tab"
            aria-selected="false"
          >
            Dane
          </button>

          <button
            className="pds-navigation-tab"
            type="button"
            role="tab"
            aria-selected="false"
          >
            Uprawnienia
          </button>

          <button
            className="pds-navigation-tab"
            type="button"
            role="tab"
            aria-selected="false"
          >
            Historia synchronizacji
          </button>
        </div>
      </div>
    </ComponentShowcase>
  ),
};

export const Paginacja: Story = {
  render: () => (
    <ComponentShowcase
      title="Paginacja"
      description="Paginacja informuje o bieżącej stronie i umożliwia przewidywalne przechodzenie po wynikach."
    >
      <ComponentSpecRow
        label="Strony"
        description="Bieżąca strona otrzymuje aria-current."
      >
        <nav
          className="pds-navigation-pagination"
          aria-label="Strony wyników"
        >
          <button
            className="pds-navigation-page"
            type="button"
            aria-label="Poprzednia strona"
            disabled
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>

          <button
            className="pds-navigation-page is-active"
            type="button"
            aria-current="page"
          >
            1
          </button>

          <button className="pds-navigation-page" type="button">
            2
          </button>

          <button className="pds-navigation-page" type="button">
            3
          </button>

          <span aria-hidden="true">…</span>

          <button className="pds-navigation-page" type="button">
            12
          </button>

          <button
            className="pds-navigation-page"
            type="button"
            aria-label="Następna strona"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </nav>
      </ComponentSpecRow>
    </ComponentShowcase>
  ),
};

export const Stany: Story = {
  render: () => (
    <ComponentShowcase
      title="Stany elementów"
      description="Aktywność, focus i brak dostępności muszą być czytelne bez dodatkowego opisu."
    >
      <ComponentSpecRow
        label="Domyślny"
        description="Element jest dostępny, ale nie jest aktualnie aktywny."
      >
        <button className="pds-navigation-item" type="button">
          Raporty
        </button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Najechanie"
        description="Wskaźnik znajduje się nad elementem."
      >
        <button
          className="pds-navigation-item is-hover"
          type="button"
        >
          Raporty
        </button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Focus"
        description="Element został wybrany za pomocą klawiatury."
      >
        <button
          className="pds-navigation-item is-focus"
          type="button"
        >
          Raporty
        </button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Aktywny"
        description="Element reprezentuje aktualnie otwarty widok."
      >
        <button
          className="pds-navigation-item is-active"
          type="button"
          aria-current="page"
        >
          Raporty
          <Check size={15} aria-hidden="true" />
        </button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Nieaktywny"
        description="Element nie może zostać obecnie użyty."
      >
        <button
          className="pds-navigation-item"
          type="button"
          disabled
        >
          Raporty
        </button>
      </ComponentSpecRow>
    </ComponentShowcase>
  ),
};
