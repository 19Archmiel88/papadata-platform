import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  Button,
  DataList,
  Drawer,
  StatusBadge,
  Tabs,
  TextAction,
} from '../../../design-system/components';
import type {
  TabsItem,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const saveRecommendationAction = fn();

function DrawerContent() {
  const [activeTab, setActiveTab] =
    useState('details');

  const items: readonly TabsItem[] = [
    {
      id: 'details',
      label: 'Szczegóły',
      badge: '3',
      panel: (
        <div className="pd-x18-drawer-body">
          <section
            aria-label="Kontekst operacyjny decyzji"
            className="pd-x18-decision-hero"
          >
            <div className="pd-x18-decision-hero__header">
              <p className="pd-x18-drawer-kicker">
                Kontekst operacyjny
              </p>
              <StatusBadge
                status="Ocena"
                text="Wymaga decyzji"
                tone="warning"
              />
            </div>
            <div className="pd-x18-decision-hero__copy">
              <h3 className="pd-x18-drawer-title">
                Spadek jakości leadów obniża skuteczność kampanii B2B.
              </h3>
              <p className="pd-x18-drawer-copy">
                Panel zbiera zakres, dowody i rekomendację w jednej warstwie,
                bez przenoszenia użytkownika na osobną stronę.
              </p>
            </div>
            <dl className="pd-x18-drawer-metrics">
              <div>
                <dt>Segment</dt>
                <dd>B2B performance</dd>
              </div>
              <div>
                <dt>Okno</dt>
                <dd>14 dni</dd>
              </div>
              <div>
                <dt>Decyzja</dt>
                <dd>Zmniejszyć budżet</dd>
              </div>
            </dl>
          </section>

          <section className="pd-x18-drawer-section">
            <div className="pd-x18-drawer-section__header">
              <h3 className="pd-x18-drawer-section__title">
                Zakres i właścicielstwo
              </h3>
              <p className="pd-x18-drawer-copy">
                Najważniejsze informacje są dostępne od razu, zanim użytkownik
                przejdzie do dowodów albo rekomendacji.
              </p>
            </div>
            <dl className="pd-x18-drawer-ledger">
              <div>
                <dt>Obiekt</dt>
                <dd>Leady B2B z kampanii performance i formularzy demo.</dd>
              </div>
              <div>
                <dt>Właściciel</dt>
                <dd>Revenue Operations, walidacja źródła w CRM.</dd>
              </div>
              <div>
                <dt>Następny krok</dt>
                <dd>Wstrzymać wzrost budżetu do poprawy kompletności pól.</dd>
              </div>
            </dl>
          </section>
        </div>
      ),
    },
    {
      id: 'evidence',
      label: 'Dowody',
      badge: '2',
      panel: (
        <div className="pd-x18-drawer-body">
          <section className="pd-x18-drawer-section pd-x18-drawer-section--evidence">
            <div className="pd-x18-drawer-section__header">
              <p className="pd-x18-drawer-kicker">
                Dowody do decyzji
              </p>
              <h3 className="pd-x18-drawer-section__title">
                Dwa sygnały wskazują ten sam kierunek.
              </h3>
            </div>
            <DataList
              density="compact"
              items={[
                {
                  description: 'Wzrost kosztu pozyskania o 18% przy stabilnym wolumenie.',
                  id: 'source-cac',
                  meta: [
                    'Źródło: warehouse',
                    'Odświeżono 10:24',
                  ],
                  status: {
                    status: 'Jakość źródła',
                    text: 'Zweryfikowane',
                    tone: 'success',
                  },
                  title: 'Koszt pozyskania',
                },
                {
                  description: 'Leady z jednego formularza mają niższą kompletność pól.',
                  id: 'source-form',
                  meta: [
                    'Źródło: CRM',
                    'Próba 420 rekordów',
                  ],
                  status: {
                    status: 'Jakość źródła',
                    text: 'Częściowe',
                    tone: 'warning',
                  },
                  title: 'Jakość formularza',
                },
              ]}
            />
          </section>

          <section className="pd-x18-drawer-section">
            <dl className="pd-x18-drawer-metrics pd-x18-drawer-metrics--wide">
              <div>
                <dt>Pewność</dt>
                <dd>78%</dd>
              </div>
              <div>
                <dt>Ryzyko</dt>
                <dd>Wysoki koszt przy stałym wolumenie</dd>
              </div>
            </dl>
          </section>
        </div>
      ),
    },
    {
      id: 'recommendation',
      label: 'Rekomendacja',
      badge: '1',
      panel: (
        <div className="pd-x18-drawer-body">
          <section className="pd-x18-recommendation-panel">
            <p className="pd-x18-drawer-kicker">
              Rekomendacja
            </p>
            <h3 className="pd-x18-drawer-title">
              Zmniejszyć budżet formularza demo do czasu poprawy jakości pól.
            </h3>
            <p className="pd-x18-drawer-copy">
              Decyzja ogranicza koszt słabszych leadów i zostawia przestrzeń na
              szybki test korekty formularza.
            </p>
          </section>

          <dl className="pd-x18-drawer-ledger">
            <div>
              <dt>Ograniczenie</dt>
              <dd>Segment Enterprise ma małą próbę i wymaga ręcznego przeglądu.</dd>
            </div>
            <div>
              <dt>Warunek powrotu</dt>
              <dd>Kompletność pól wraca powyżej 92% przez trzy kolejne dni.</dd>
            </div>
            <div>
              <dt>Akcja zapisu</dt>
              <dd>Rekomendacja trafia do historii decyzji razem z dowodami.</dd>
            </div>
          </dl>
        </div>
      ),
    },
  ];

  return (
    <Tabs
      activation="manual"
      activeId={activeTab}
      ariaLabel="Zakładki panelu szczegółów"
      items={items}
      orientation="horizontal"
      onActiveIdChange={setActiveTab}
    />
  );
}

function DetailPanelPattern() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    'Panel jest zamknięty. Otwórz go, żeby zobaczyć semantyczną warstwę Drawer.',
  );
  const openButtonRef =
    useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (open || !restoreFocusRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      restoreFocusRef.current = false;
      openButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    open,
  ]);

  return (
    <div className="pd-x18-stack">
      <section
        aria-label="Kontekst panelu szczegółów"
        className="pd-x18-drawer-preview"
      >
        <div className="pd-x18-region__header">
          <h3 className="pd-x18-region__title">
            Panel jest warstwą roboczą, nie kartą listy
          </h3>
          <p className="pd-x18-region__text">
            18.07 dopuszcza zamkniętą powierzchnię, bo Drawer jest realnym
            panelem szczegółów, dowodów i rekomendacji.
          </p>
        </div>
        <div className="pd-x18-status-row">
          <div className="pd-x18-meta-row">
            <StatusBadge
              status="Stan panelu"
              text={open ? 'Otwarty' : 'Zamknięty'}
              tone={open ? 'processing' : 'neutral'}
            />
            <span className="pd-x18-description">{message}</span>
          </div>
          <Button
            ref={openButtonRef}
            variant="secondary"
            onClick={() => {
              setOpen(true);
              setMessage('Panel otwarty przez realny Drawer.');
            }}
          >
            Otwórz panel decyzji
          </Button>
        </div>
      </section>

      <ul className="pd-x18-separator-list pd-x18-separator-list--inline">
        <li>
          <span className="pd-x18-term">Szczegóły</span>
          <span className="pd-x18-description">
            Krótki opis obiektu i zakresu decyzji.
          </span>
        </li>
        <li>
          <span className="pd-x18-term">Dowody</span>
          <span className="pd-x18-description">
            Lista źródeł z jakością i datą odświeżenia.
          </span>
        </li>
        <li>
          <span className="pd-x18-term">Rekomendacja</span>
          <span className="pd-x18-description">
            Decyzja, ograniczenia i akcja zapisu.
          </span>
        </li>
      </ul>

      <TextAction
        tone="muted"
        onClick={() => {
          setMessage('Akcja kontekstowa nie otwiera dodatkowego kontenera.');
        }}
      >
        Zapisz notatkę kontekstową
      </TextAction>

      <Drawer
        description="Panel szczegółów korzysta z zakładek: szczegóły, dowody i rekomendacja."
        dismissible
        open={open}
        primaryActionLabel="Zapisz rekomendację"
        secondaryActionLabel="Odłóż decyzję"
        side="right"
        title="Panel decyzji jakości leadów"
        width={560}
        onOpenChange={(nextOpen, reason) => {
          setOpen(nextOpen);

          if (!nextOpen) {
            restoreFocusRef.current = true;
            setMessage(
              reason === 'escape'
                ? 'Panel zamknięty klawiszem Escape; focus wraca do przycisku otwarcia.'
                : 'Panel zamknięty z kontrolki Drawer.',
            );
          }

          if (reason === 'primary-action') {
            saveRecommendationAction();
          }
        }}
      >
        <DrawerContent />
      </Drawer>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DetailEvidenceRecommendationPanelsStory: Story = {
  name: 'Panele szczegółów, dowodów i rekomendacji',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca paneli"
          items={[
            { label: 'Kontrakt', value: '18.07' },
            { label: 'Warstwa', value: 'Drawer' },
            { label: 'Status', value: 'review' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.07"
      summary="Panele szczegółów, dowodów i rekomendacji korzystają z realnego Drawer oraz Tabs. To semantycznie uzasadniona powierzchnia robocza, nie wzór na listę kart."
      title="Panele szczegółów, dowodów i rekomendacji"
    >
      <StoryPresentationSection
        index="01"
        summary="Drawer pokazuje trzy zakładki i realny model zamknięcia Escape z powrotem focusu."
        title="Panel jako warstwa szczegółów"
      >
        <DetailPanelPattern />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await expect(
      canvas.getByRole('heading', {
        name: 'Panele szczegółów, dowodów i rekomendacji',
      }),
    ).toBeInTheDocument();

    const openButton = canvas.getByRole('button', {
      name: 'Otwórz panel decyzji',
    });

    openButton.focus();
    await userEvent.keyboard('{Enter}');

    await expect(
      body.getByRole('dialog', {
        name: 'Panel decyzji jakości leadów',
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      body.getByRole('tab', {
        name: /^Dowody/,
      }),
    );

    await expect(
      body.getByText('Koszt pozyskania'),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await new Promise((resolve) => {
      window.setTimeout(resolve, 30);
    });

    await expect(openButton).toHaveFocus();

    await userEvent.click(openButton);
    await userEvent.click(
      body.getByRole('tab', {
        name: /^Rekomendacja/,
      }),
    );

    await expect(
      body.getByText(/Zmniejszyć budżet formularza demo/),
    ).toBeInTheDocument();
  },
};
