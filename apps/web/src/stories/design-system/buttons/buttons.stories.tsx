import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowRight,
  LoaderCircle,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';

import { Button } from '../../../design-system';
import {
  ComponentShowcase,
  ComponentSpecRow,
} from '../_shared/ComponentCanvas';
import { ComponentCanvasDecorator } from '../_shared/ComponentCanvasDecorator';

const meta = {
  title: 'PapaData/02 Komponenty/Przyciski',
  component: Button,
  decorators: [ComponentCanvasDecorator],
  parameters: {
    layout: 'fullscreen',
    componentCanvas: 'centered',
    docs: {
      toc: true,
    },
  },
  args: {
    children: 'Kontynuuj',
    disabled: false,
    type: 'button',
    variant: 'primary',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Widoczna etykieta przycisku.',
    },
    variant: {
      control: 'select',
      description: 'Znaczenie i hierarchia akcji.',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    disabled: {
      control: 'boolean',
      description: 'Blokuje wykonanie akcji.',
    },
    type: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podstawowy: Story = {
  render: (args) => (
    <div className="pds-story-basic">
      <Button {...args}>
        <span className="pds-story-inline">
          {args.children}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </Button>
    </div>
  ),
};

export const Warianty: Story = {
  parameters: {
    componentCanvas: 'wide',
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ComponentShowcase
      title="Warianty przycisków"
      description="Każdy wariant odpowiada innemu poziomowi ważności oraz konsekwencji działania."
    >
      <ComponentSpecRow
        label="Główny"
        description="Najważniejsza akcja w bieżącym kontekście."
      >
        <Button type="button" variant="primary">
          <span className="pds-story-inline">
            Kontynuuj
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Drugorzędny"
        description="Akcja alternatywna lub uzupełniająca."
      >
        <Button type="button" variant="secondary">
          <span className="pds-story-inline">
            <RefreshCw size={16} aria-hidden="true" />
            Odśwież
          </span>
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Dyskretny"
        description="Działanie o niskim priorytecie wizualnym."
      >
        <Button type="button" variant="ghost">
          Anuluj
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Destrukcyjny"
        description="Operacja usuwająca dane, konfigurację albo dostęp."
      >
        <Button type="button" variant="danger">
          <span className="pds-story-inline">
            <Trash2 size={16} aria-hidden="true" />
            Usuń dostęp
          </span>
        </Button>
      </ComponentSpecRow>
    </ComponentShowcase>
  ),
};

export const Rozmiary: Story = {
  parameters: {
    componentCanvas: 'wide',
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ComponentShowcase
      title="Rozmiary"
      description="Domyślny rozmiar obsługuje większość formularzy i działań w aplikacji."
    >
      <ComponentSpecRow
        label="Mały"
        description="Gęste paski narzędzi i działania pomocnicze."
      >
        <Button
          className="pds-story-button-small"
          type="button"
          variant="secondary"
        >
          Zapisz filtr
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Domyślny"
        description="Standardowe formularze i procesy."
      >
        <Button type="button" variant="primary">
          Zapisz zmiany
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Duży"
        description="Główna decyzja w krótkim procesie."
      >
        <Button
          className="pds-story-button-large"
          type="button"
          variant="primary"
        >
          Połącz źródło
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Pełna szerokość"
        description="Formularze na małych ekranach."
      >
        <Button
          className="pds-story-button-full"
          type="button"
          variant="primary"
        >
          Przejdź dalej
        </Button>
      </ComponentSpecRow>
    </ComponentShowcase>
  ),
};

export const Stany: Story = {
  parameters: {
    componentCanvas: 'wide',
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ComponentShowcase
      title="Stany interakcji"
      description="Stan musi pozostać czytelny bez polegania wyłącznie na zmianie koloru."
    >
      <ComponentSpecRow
        label="Domyślny"
        description="Element jest gotowy do wykonania akcji."
      >
        <Button type="button" variant="primary">
          Zapisz
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Najechanie"
        description="Wskaźnik znajduje się nad aktywnym elementem."
      >
        <Button
          className="pds-story-forced-hover"
          type="button"
          variant="primary"
        >
          Zapisz
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Focus"
        description="Element został wybrany za pomocą klawiatury."
      >
        <Button
          className="pds-story-forced-focus"
          type="button"
          variant="secondary"
        >
          Edytuj
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Aktywny"
        description="Akcja jest aktualnie wykonywana przez użytkownika."
      >
        <Button
          className="pds-story-forced-active"
          type="button"
          variant="secondary"
        >
          Zastosuj
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Nieaktywny"
        description="Akcja jest chwilowo niedostępna."
      >
        <Button disabled type="button" variant="primary">
          Niedostępny
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Przetwarzanie"
        description="Operacja została rozpoczęta i oczekuje na wynik."
      >
        <Button
          aria-busy="true"
          disabled
          type="button"
          variant="primary"
        >
          <span className="pds-story-inline">
            <LoaderCircle
              className="pds-story-spinner"
              size={16}
              aria-hidden="true"
            />
            Przetwarzanie
          </span>
        </Button>
      </ComponentSpecRow>
    </ComponentShowcase>
  ),
};

export const Ikony: Story = {
  parameters: {
    componentCanvas: 'wide',
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ComponentShowcase
      title="Przyciski z ikonami"
      description="Ikona wzmacnia znaczenie akcji, ale nie zastępuje jednoznacznej etykiety."
    >
      <ComponentSpecRow
        label="Przed etykietą"
        description="Ikona opisuje rodzaj wykonywanej operacji."
      >
        <Button type="button" variant="secondary">
          <span className="pds-story-inline">
            <RefreshCw size={16} aria-hidden="true" />
            Synchronizuj
          </span>
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Po etykiecie"
        description="Ikona wskazuje kierunek lub rezultat przejścia."
      >
        <Button type="button" variant="primary">
          <span className="pds-story-inline">
            Otwórz raport
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Button>
      </ComponentSpecRow>

      <ComponentSpecRow
        label="Tylko ikona"
        description="Wymaga dostępnej nazwy przez aria-label."
      >
        <div className="pds-story-icon-group">
          <Button
            aria-label="Wyszukaj"
            className="pds-story-icon-button"
            type="button"
            variant="secondary"
          >
            <Search size={17} aria-hidden="true" />
          </Button>

          <Button
            aria-label="Odśwież"
            className="pds-story-icon-button"
            type="button"
            variant="secondary"
          >
            <RefreshCw size={17} aria-hidden="true" />
          </Button>

          <Button
            aria-label="Więcej działań"
            className="pds-story-icon-button"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal size={18} aria-hidden="true" />
          </Button>
        </div>
      </ComponentSpecRow>
    </ComponentShowcase>
  ),
};
