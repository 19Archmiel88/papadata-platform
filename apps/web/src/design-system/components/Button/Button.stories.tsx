import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  Icon,
} from '../../icons';
import type {
  PapaDataIconName,
} from '../../icons';
import {
  Button,
} from './Button';
import type {
  ButtonVariant,
} from './Button';
import {
  ButtonGroup,
} from './ButtonGroup';
import {
  IconButton,
} from './IconButton';
import {
  LinkAction,
} from './LinkAction';
import {
  TextAction,
} from './TextAction';

import './action-showcase.css';

const meta = {
  title: '10 Komponenty/Przyciski i akcje',
  component: Button,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'System akcji PapaData pokazuje realne przyciski, ikony i linki bez dekoracyjnych kontenerów. Wspólny motyw interakcji to bursztynowe podświetlenie i kreska rozchodząca się od środka.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

type ActionVariantDefinition = {
  readonly variant: ButtonVariant;
  readonly label: string;
  readonly intent: string;
  readonly description: string;
  readonly icon: PapaDataIconName;
};

const actionVariants = [
  {
    variant: 'primary',
    label: 'Zastosuj zmiany',
    intent: 'Decyzja główna',
    description:
      'Jedna dominująca akcja prowadząca użytkownika do zatwierdzenia danych albo konfiguracji.',
    icon: 'success',
  },
  {
    variant: 'secondary',
    label: 'Sprawdź wpływ',
    intent: 'Decyzja wspierająca',
    description:
      'Akcja równorzędna merytorycznie, ale niższa w hierarchii niż decyzja główna.',
    icon: 'trend',
  },
  {
    variant: 'ghost',
    label: 'Pokaż szczegóły',
    intent: 'Eksploracja',
    description:
      'Kontrola pomocnicza dla filtrów, szczegółów i mniej krytycznych interakcji.',
    icon: 'search',
  },
  {
    variant: 'danger',
    label: 'Usuń segment',
    intent: 'Ryzyko',
    description:
      'Operacja destrukcyjna zachowuje własny kolor statusowy i nie miesza się z brandem.',
    icon: 'warning',
  },
  {
    variant: 'link',
    label: 'Otwórz raport',
    intent: 'Przejście',
    description:
      'Lekka akcja nawigacyjna używana w treści, tabelach i opisach źródeł.',
    icon: 'integration',
  },
] satisfies ActionVariantDefinition[];

function icon(name: PapaDataIconName) {
  return <Icon decorative name={name} size={20} />;
}

function assertNoLayoutShift(
  before: DOMRect,
  after: DOMRect,
) {
  const tolerance = 0.5;

  if (
    Math.abs(before.width - after.width) > tolerance
    || Math.abs(before.height - after.height) > tolerance
  ) {
    throw new Error('Layout shifted during interaction.');
  }
}

function StorySection({
  children,
  description,
  eyebrow,
  title,
}: {
  readonly children: ReactNode;
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}) {
  return (
    <section className="pd-action-section">
      <header className="pd-action-section__header">
        <p className="pd-action-kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}

function ActionsShowcase() {
  return (
    <div className="pd-action-system">
      <main className="pd-action-system__inner">
        <header className="pd-action-hero">
          <div>
            <p className="pd-action-kicker">10.02 Przyciski i akcje</p>
            <h1>Akcje jako precyzyjny system decyzji.</h1>
            <p className="pd-action-hero__lead">
              Przyciski, ikony i linki nie są opakowane w dekoracyjne
              pudełka. Są samodzielnymi kontrolkami: czytelne w spoczynku,
              podświetlone na hoverze i spięte jedną bursztynową kreską.
            </p>
          </div>

          <div className="pd-action-hero__actions">
            <span aria-hidden="true" className="pd-action-focus-strip" />
            <ButtonGroup
              className="button-group-horizontal"
              label="Controlled action group"
            >
              <Button startIcon={icon('success')}>
                Zastosuj zmiany
              </Button>
              <Button startIcon={icon('trend')} variant="secondary">
                Sprawdź wpływ
              </Button>
              <IconButton
                icon="data"
                label="Otwórz źródła danych"
                variant="secondary"
              />
            </ButtonGroup>
          </div>
        </header>

        <StorySection
          description="Każdy wariant ma jasną rolę w produkcie. Hierarchia wynika z koloru, ciężaru tekstu, ikony i zachowania kreski, nie z dodatkowej ramki wokół przykładu."
          eyebrow="01"
          title="Hierarchia decyzji"
        >
          <div className="pd-action-ledger">
            {actionVariants.map((item) => (
              <article className="pd-action-row" key={item.variant}>
                <div>
                  <h3>{item.intent}</h3>
                  <p className="pd-action-row__meta">
                    variant: {item.variant}
                  </p>
                </div>
                <div>
                  <Button
                    startIcon={icon(item.icon)}
                    variant={item.variant}
                  >
                    {item.label}
                  </Button>
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </StorySection>

        <StorySection
          description="Stany nie zmieniają geometrii elementu. Loading blokuje kliknięcia, disabled jest spokojny, a rozmiary pozostają częścią tego samego języka."
          eyebrow="02"
          title="Stany bez przesunięć"
        >
          <div className="pd-action-state-ledger">
            <article className="pd-action-state-row">
              <div>
                <h3>Gęsty układ</h3>
                <p className="pd-action-state-row__meta">size: small</p>
              </div>
              <Button
                size="small"
                startIcon={icon('trend')}
                variant="secondary"
              >
                Analiza
              </Button>
              <p>Filtry, tabele i panele boczne.</p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3>Domyślna akcja</h3>
                <p className="pd-action-state-row__meta">size: medium</p>
              </div>
              <Button startIcon={icon('success')}>
                Zatwierdź konfigurację
              </Button>
              <p>Formularze, widoki robocze i decyzje operacyjne.</p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3>Wejście w przepływ</h3>
                <p className="pd-action-state-row__meta">size: large</p>
              </div>
              <Button endIcon={icon('integration')} size="large">
                Przejdź do integracji
              </Button>
              <p>Pierwszoplanowe akcje na ekranach decyzyjnych.</p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3>Ładowanie</h3>
                <p className="pd-action-state-row__meta">aria-busy</p>
              </div>
              <Button
                loading
                loadingLabel="Syncing integrations"
              >
                Synchronizuj integracje
              </Button>
              <p>Stan zajęty jest dostępny dla czytników i blokuje kliknięcia.</p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3>Brak danych</h3>
                <p className="pd-action-state-row__meta">disabled</p>
              </div>
              <Button disabled variant="secondary">
                Brak wymaganych danych
              </Button>
              <p>Stan nieaktywny pozostaje czytelny bez udawania interakcji.</p>
            </article>
          </div>
        </StorySection>

        <StorySection
          description="Ikony zachowują się jak kontrolki, nie jak ozdobne kafelki. Na hoverze rozświetla się sam znak oraz kreska pod nim."
          eyebrow="03"
          title="Ikony i pasek operacyjny"
        >
          <div className="pd-action-toolbar">
            <div className="pd-action-toolbar__line">
              <span className="pd-action-toolbar__label">
                Narzędzia danych
              </span>
              <IconButton
                icon="data"
                label="Odśwież dane"
                variant="primary"
              />
              <IconButton
                icon="search"
                label="Szukaj w źródłach"
                variant="secondary"
              />
              <IconButton
                icon="assistant"
                label="Otwórz asystenta"
                variant="ghost"
              />
              <IconButton
                icon="warning"
                label="Oznacz ryzyko"
                variant="danger"
              />
              <IconButton
                icon="integration"
                label="Synchronizuj integracje"
                loading
                loadingLabel="Syncing integrations"
                variant="secondary"
              />
            </div>

            <ButtonGroup
              className="button-group-horizontal"
              label="Pasek operacyjny"
            >
              <IconButton
                icon="data"
                label="Odśwież widok"
                variant="secondary"
              />
              <IconButton
                icon="security"
                label="Sprawdź zgodność"
                variant="secondary"
              />
              <Button startIcon={icon('success')}>
                Zatwierdź widok
              </Button>
            </ButtonGroup>
          </div>
        </StorySection>

        <StorySection
          description="Akcje tekstowe i linki działają w treści. Nie konkurują z CTA, ale mają ten sam efekt kreski i podświetlenia."
          eyebrow="04"
          title="Akcje tekstowe i linki"
        >
          <div className="pd-action-inline-grid">
            <article className="pd-action-inline">
              <h3>Tekst operacyjny</h3>
              <p className="pd-action-inline-copy">
                Segment został przeliczony na podstawie nowych danych.
                Możesz{' '}
                <TextAction endIcon={icon('integration')}>
                  archiwizować segment
                </TextAction>{' '}
                albo{' '}
                <TextAction tone="muted">
                  porównać poprzednią wersję
                </TextAction>
                .
              </p>
            </article>

            <article className="pd-action-inline">
              <h3>Link kontekstowy</h3>
              <p className="pd-action-inline-copy">
                Źródło danych ma komplet audytowalnych zmian.{' '}
                <LinkAction
                  endIcon={icon('trend')}
                  href="#raport-kwartalny"
                >
                  Otwórz raport kwartalny
                </LinkAction>{' '}
                lub{' '}
                <LinkAction href="#rejestr-ryzyka" tone="danger">
                  przejdź do rejestru ryzyka
                </LinkAction>
                .
              </p>
            </article>
          </div>
        </StorySection>

        <StorySection
          description="Grupa jest semantycznym zbiorem decyzji. Ma nazwę, orientację i kolejność bez dodatkowej wizualnej ramy."
          eyebrow="05"
          title="Grupy akcji"
        >
          <div className="pd-action-review">
            <article className="pd-action-review__summary">
              <div>
                <h3>Rewizja kampanii sprzedażowej</h3>
                <p>
                  System wykrył wzrost kosztu pozyskania i rekomenduje
                  ręczną akceptację zmian przed publikacją.
                </p>
              </div>

              <div className="pd-action-review__footer">
                <span className="pd-action-note">
                  Ostatnia synchronizacja: 2 min temu
                </span>

                <ButtonGroup
                  className="button-group-horizontal"
                  label="Akcje rewizji"
                >
                  <Button startIcon={icon('success')}>
                    Zapisz decyzję
                  </Button>
                  <Button variant="secondary">
                    Przekaż do sprawdzenia
                  </Button>
                  <Button variant="ghost">
                    Poproś o zmiany
                  </Button>
                </ButtonGroup>
              </div>
            </article>

            <ButtonGroup
              className="button-group-vertical"
              label="Akcje pionowe dla mobile"
              orientation="vertical"
            >
              <Button fullWidth>
                Kontynuuj konfigurację
              </Button>
              <Button fullWidth variant="secondary">
                Zapisz jako wersję roboczą
              </Button>
              <Button fullWidth variant="ghost">
                Wróć do podsumowania
              </Button>
            </ButtonGroup>
          </div>
        </StorySection>
      </main>
    </div>
  );
}

export const Przyciski: Story = {
  name: 'Przyciski',
  args: {
    children: 'Zastosuj zmiany',
  },
  render: () => <ActionsShowcase />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    const primaryAction = canvas.getAllByRole('button', {
      name: 'Zastosuj zmiany',
    })[0];
    const defaultAction = canvas.getByRole('button', {
      name: 'Zatwierdź konfigurację',
    });

    await expect(defaultAction).toHaveAttribute('type', 'button');
    await expect(primaryAction).toHaveAttribute(
      'data-variant',
      'primary',
    );

    await userEvent.tab();
    primaryAction.focus();
    await expect(primaryAction).toHaveFocus();
    primaryAction.blur();

    const beforeFocus = primaryAction.getBoundingClientRect();
    await userEvent.keyboard('{Enter}');

    const afterFocus = primaryAction.getBoundingClientRect();
    assertNoLayoutShift(beforeFocus, afterFocus);

    const loadingActions = canvas.getAllByRole('button', {
      name: 'Syncing integrations',
    });
    const loadingButton = loadingActions[0];
    const loadingIconButton = loadingActions[1];

    await expect(loadingButton).toBeDisabled();
    await expect(loadingButton).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await expect(loadingButton).toHaveAttribute(
      'data-loading',
      'true',
    );

    await expect(loadingIconButton).toHaveAttribute(
      'aria-label',
      'Syncing integrations',
    );
    await expect(
      loadingIconButton.querySelector('.pd-icon-button__spinner'),
    ).toBeInTheDocument();

    const iconAction = canvas.getAllByRole('button', {
      name: 'Odśwież dane',
    })[0];

    await expect(iconAction).toHaveAttribute(
      'data-variant',
      'primary',
    );

    const horizontalGroup = canvas.getByRole('group', {
      name: 'Controlled action group',
    });

    await expect(horizontalGroup).toHaveClass(
      'button-group-horizontal',
    );
    await expect(horizontalGroup).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );

    const verticalGroup = canvas.getByRole('group', {
      name: 'Akcje pionowe dla mobile',
    });

    await expect(verticalGroup).toHaveClass(
      'button-group-vertical',
    );
    await expect(verticalGroup).toHaveAttribute(
      'data-orientation',
      'vertical',
    );

    const reviewGroup = canvas.getByRole('group', {
      name: 'Akcje rewizji',
    });

    await expect(reviewGroup).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );

    const reportLink = canvas.getByRole('link', {
      name: 'Otwórz raport kwartalny',
    });

    await expect(reportLink).toHaveAttribute('href', '#raport-kwartalny');

    const textDecorationLine =
      getComputedStyle(reportLink).textDecorationLine;

    await expect(textDecorationLine).toBe('none');

    const decorativeIcon = canvasElement.querySelector(
      '.pd-button svg',
    );

    await expect(decorativeIcon).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(decorativeIcon).toHaveAttribute(
      'focusable',
      'false',
    );

    if (
      canvasElement.ownerDocument.activeElement
      instanceof HTMLElement
    ) {
      canvasElement.ownerDocument.activeElement.blur();
    }
  },
};
