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
import type {
  PapaDataRuntimeLocale,
} from '../../foundations';
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

import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';
import './action-showcase.css';

const meta = {
  title: '00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje',
  component: Button,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'System akcji PapaData rozdziela komendę, nawigację, akcję w danych, akcję destrukcyjną i mobile. Wygląd wynika z roli decyzji, nie z lokalnych wariantów ekranowych.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

type ActionVariantDefinition = {
  readonly variant: ButtonVariant;
  readonly label: LocalizedCopy;
  readonly intent: LocalizedCopy;
  readonly roleLabel: LocalizedCopy;
  readonly description: LocalizedCopy;
  readonly icon: PapaDataIconName;
};

type ActionUsageRuleDefinition = {
  readonly component: string;
  readonly role: LocalizedCopy;
  readonly useWhen: LocalizedCopy;
  readonly notFor: LocalizedCopy;
};

function readLocale(): PapaDataRuntimeLocale {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en'
    ? 'en'
    : 'pl';
}

function readTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'dark'
    : 'light';
}

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function Localized({
  pl,
  en,
}: LocalizedCopy) {
  return <>{copy({ pl, en })}</>;
}

const actionVariants = [
  {
    variant: 'primary',
    label: { pl: 'Zastosuj zmiany', en: 'Apply changes' },
    intent: { pl: 'Decyzja główna', en: 'Primary decision' },
    roleLabel: { pl: 'akcja główna', en: 'primary action' },
    description: {
      pl: 'Jedna dominująca akcja prowadząca użytkownika do zatwierdzenia danych albo konfiguracji.',
      en: 'One dominant action that confirms data or configuration.',
    },
    icon: 'success',
  },
  {
    variant: 'secondary',
    label: { pl: 'Sprawdź wpływ', en: 'Check impact' },
    intent: { pl: 'Decyzja wspierająca', en: 'Supporting decision' },
    roleLabel: { pl: 'akcja wspierająca', en: 'supporting action' },
    description: {
      pl: 'Akcja równorzędna merytorycznie, ale niższa w hierarchii niż decyzja główna.',
      en: 'A meaningful peer action lower in hierarchy than the primary decision.',
    },
    icon: 'trend',
  },
  {
    variant: 'ghost',
    label: { pl: 'Pokaż szczegóły', en: 'Show details' },
    intent: { pl: 'Eksploracja', en: 'Exploration' },
    roleLabel: { pl: 'akcja lekka', en: 'lightweight action' },
    description: {
      pl: 'Kontrola pomocnicza dla filtrów, szczegółów i mniej krytycznych interakcji.',
      en: 'A supporting control for filters, details and lower-risk interactions.',
    },
    icon: 'search',
  },
  {
    variant: 'danger',
    label: { pl: 'Usuń segment', en: 'Delete segment' },
    intent: { pl: 'Ryzyko', en: 'Risk' },
    roleLabel: { pl: 'akcja destrukcyjna', en: 'destructive action' },
    description: {
      pl: 'Operacja destrukcyjna zachowuje własny kolor statusowy i nie miesza się z brandem.',
      en: 'A destructive operation keeps its status color and does not merge with brand color.',
    },
    icon: 'warning',
  },
] satisfies ActionVariantDefinition[];

const actionUsageRules = [
  {
    component: 'Button',
    role: { pl: 'Komenda pierwszoplanowa', en: 'Foreground command' },
    useWhen: {
      pl: 'użytkownik zatwierdza, zapisuje, publikuje albo uruchamia przepływ',
      en: 'the user confirms, saves, publishes or starts a flow',
    },
    notFor: {
      pl: 'nawigacji tekstowej, linków w treści i drobnych akcji wiersza',
      en: 'text navigation, inline links or small row actions',
    },
  },
  {
    component: 'TextAction',
    role: { pl: 'Komenda w treści', en: 'Inline command' },
    useWhen: {
      pl: 'akcja jest częścią zdania, notatki, tabeli albo komunikatu',
      en: 'the action is part of a sentence, note, table or message',
    },
    notFor: {
      pl: 'zmiany widoku, przejścia do innego ekranu albo głównego CTA',
      en: 'view changes, route transitions or the primary CTA',
    },
  },
  {
    component: 'LinkAction',
    role: { pl: 'Nawigacja kontekstowa', en: 'Context navigation' },
    useWhen: {
      pl: 'kliknięcie prowadzi do innego miejsca, raportu albo rekordu',
      en: 'the click leads to another place, report or record',
    },
    notFor: {
      pl: 'mutacji danych, zapisu, publikacji i destrukcyjnych komend',
      en: 'data mutation, saving, publishing or destructive commands',
    },
  },
  {
    component: 'IconButton',
    role: { pl: 'Komenda ikonowa', en: 'Icon command' },
    useWhen: {
      pl: 'przestrzeń jest ograniczona, a ikona ma jednoznaczną etykietę',
      en: 'space is constrained and the icon has an explicit label',
    },
    notFor: {
      pl: 'nieznanych akcji bez tekstowej etykiety dostępności',
      en: 'unknown actions without an accessible text label',
    },
  },
] satisfies ActionUsageRuleDefinition[];

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

function assertActivityLineMatchesControl(control: HTMLElement) {
  const line = control.querySelector<HTMLElement>(
    '[data-slot="activity-line"]',
  );
  const owner = control.querySelector<HTMLElement>(
    '[data-slot="activity-line-owner"]',
  ) ?? control;

  if (!line) {
    throw new Error('Missing activity line.');
  }

  const lineRect = line.getBoundingClientRect();
  const ownerRect = owner.getBoundingClientRect();
  const controlRect = control.getBoundingClientRect();
  const tolerance = 1;

  if (lineRect.width - controlRect.width > tolerance) {
    throw new Error('Activity line exceeds the clickable control.');
  }

  if (lineRect.left < controlRect.left - tolerance || lineRect.right > controlRect.right + tolerance) {
    throw new Error('Activity line escapes the clickable control.');
  }

  if (lineRect.width - ownerRect.width > tolerance) {
    throw new Error('Activity line exceeds its action content.');
  }
}

function StorySection({
  children,
  description,
  eyebrow,
  title,
}: {
  readonly children: ReactNode;
  readonly description: ReactNode;
  readonly eyebrow: string;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-action-section"
      index={eyebrow}
      summary={description}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function ActionsShowcase() {
  const applyChangesLabel = copy({ pl: 'Zastosuj zmiany', en: 'Apply changes' });
  const approveConfigLabel = copy({ pl: 'Zatwierdź konfigurację', en: 'Approve configuration' });
  const syncIntegrationsBusyLabel = copy({
    pl: 'Trwa synchronizacja integracji',
    en: 'Synchronizing integrations',
  });

  return (
    <StoryPresentationPage
      className="pd-action-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({
            pl: 'Parametry kontraktu przycisków',
            en: 'Button contract parameters',
          })}
          items={[
            { label: <Localized pl="Kontrakt" en="Contract" />, value: '00.14' },
            { label: <Localized pl="Motyw" en="Theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
            { label: <Localized pl="Język" en="Language" />, value: readLocale().toUpperCase() },
            { label: 'Status', value: 'accepted' },
          ]}
        />
      )}
      sectionCode="00"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      storyId="00.14"
      summary={
        <Localized
          pl="Przycisk wykonuje komendę, TextAction lekką komendę, LinkAction nawigację, a IconButton komendę ikonową. Każda semantyka ma jednego właściciela."
          en="Button performs a command, TextAction a lightweight command, LinkAction navigation and IconButton an icon command. Each semantic role has one owner."
        />
      }
      title={<Localized pl="Akcje jako precyzyjny system decyzji." en="Actions as a precise decision system." />}
    >

        <StorySection
          description={
            <Localized
              pl="Ten sam kontrakt wizualny działa w nagłówkach, tabelach, formularzach i przepływach bez lokalnych wariantów wyglądu."
              en="The same visual contract works in headers, tables, forms and flows without local visual variants."
            />
          }
          eyebrow="00"
          title={<Localized pl="Podgląd systemu akcji" en="Action system preview" />}
        >
          <div className="pd-action-hero__actions">
            <span aria-hidden="true" className="pd-action-focus-strip" />
            <ButtonGroup
              className="pd-action-review__inline-actions"
              label={copy({ pl: 'Sterowana grupa akcji', en: 'Controlled action group' })}
            >
              <Button startIcon={icon('success')}>
                {applyChangesLabel}
              </Button>
              <Button startIcon={icon('trend')} variant="secondary">
                <Localized pl="Sprawdź wpływ" en="Check impact" />
              </Button>
              <IconButton
                icon="data"
                label={copy({ pl: 'Otwórz źródła danych', en: 'Open data sources' })}
                variant="secondary"
              />
            </ButtonGroup>
          </div>
        </StorySection>

        <StorySection
          description={
            <Localized
              pl="Ten fragment jest kontraktem dla 15 i 18: wybór komponentu wynika z semantyki akcji, nie z tego, który wariant wygląda mocniej."
              en="This fragment is the contract for 15 and 18: component choice follows action semantics, not which variant looks stronger."
            />
          }
          eyebrow="01"
          title={<Localized pl="Kiedy użyć której akcji" en="When to use each action" />}
        >
          <div className="pd-action-usage-ledger">
            {actionUsageRules.map((rule) => (
              <article className="pd-action-usage-row" key={rule.component}>
                <div>
                  <h3>{copy(rule.role)}</h3>
                  <p className="pd-action-row__meta">{rule.component}</p>
                </div>
                <p>
                  <strong><Localized pl="Użyj, gdy" en="Use when" /></strong>
                  {copy(rule.useWhen)}
                </p>
                <p>
                  <strong><Localized pl="Nie używaj do" en="Do not use for" /></strong>
                  {copy(rule.notFor)}
                </p>
              </article>
            ))}
          </div>
        </StorySection>

        <StorySection
          description={
            <Localized
              pl="Każdy wariant ma jasną rolę w produkcie. Hierarchia wynika z koloru, ciężaru tekstu, ikony i zachowania kreski, nie z dodatkowej ramki wokół przykładu."
              en="Each variant has a clear product role. Hierarchy comes from color, text weight, icon and the activity line, not from an extra frame around the example."
            />
          }
          eyebrow="02"
          title={<Localized pl="Hierarchia decyzji" en="Decision hierarchy" />}
        >
          <div className="pd-action-ledger">
            {actionVariants.map((item) => (
              <article className="pd-action-row" key={item.variant}>
                <div>
                  <h3>{copy(item.intent)}</h3>
                  <p className="pd-action-row__meta">
                    <Localized pl="rola" en="role" />: {copy(item.roleLabel)}
                  </p>
                </div>
                <div>
                  <Button
                    startIcon={icon(item.icon)}
                    variant={item.variant}
                  >
                    {copy(item.label)}
                  </Button>
                </div>
                <p>{copy(item.description)}</p>
              </article>
            ))}
          </div>
        </StorySection>

        <StorySection
          description={
            <Localized
              pl="Stany nie zmieniają geometrii elementu. Ładowanie blokuje kliknięcia, stan wyłączony pozostaje spokojny, a rozmiary należą do jednego systemu."
              en="States do not change element geometry. Loading blocks clicks, disabled remains calm and sizes belong to one system."
            />
          }
          eyebrow="03"
          title={<Localized pl="Stany bez przesunięć" en="States without layout shift" />}
        >
          <div className="pd-action-state-ledger">
            <article className="pd-action-state-row">
              <div>
                <h3><Localized pl="Gęsty układ" en="Dense layout" /></h3>
                <p className="pd-action-state-row__meta"><Localized pl="rozmiar: mały" en="size: small" /></p>
              </div>
              <Button
                size="small"
                startIcon={icon('trend')}
                variant="secondary"
              >
                <Localized pl="Analiza" en="Analysis" />
              </Button>
              <p><Localized pl="Filtry, tabele i panele boczne." en="Filters, tables and side panels." /></p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3><Localized pl="Domyślna akcja" en="Default action" /></h3>
                <p className="pd-action-state-row__meta"><Localized pl="rozmiar: średni" en="size: medium" /></p>
              </div>
              <Button startIcon={icon('success')}>
                {approveConfigLabel}
              </Button>
              <p><Localized pl="Formularze, widoki robocze i decyzje operacyjne." en="Forms, working views and operational decisions." /></p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3><Localized pl="Wejście w przepływ" en="Flow entry" /></h3>
                <p className="pd-action-state-row__meta"><Localized pl="rozmiar: duży" en="size: large" /></p>
              </div>
              <Button endIcon={icon('integration')} size="large">
                <Localized pl="Przejdź do integracji" en="Go to integrations" />
              </Button>
              <p><Localized pl="Pierwszoplanowe akcje na ekranach decyzyjnych." en="Foreground actions on decision screens." /></p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3><Localized pl="Ładowanie" en="Loading" /></h3>
                <p className="pd-action-state-row__meta">aria-busy</p>
              </div>
              <Button
                loading
                loadingLabel={syncIntegrationsBusyLabel}
              >
                <Localized pl="Synchronizuj integracje" en="Sync integrations" />
              </Button>
              <p><Localized pl="Stan zajęty jest dostępny dla czytników i blokuje kliknięcia." en="The busy state is available to screen readers and blocks clicks." /></p>
            </article>

            <article className="pd-action-state-row">
              <div>
                <h3><Localized pl="Brak danych" en="Missing data" /></h3>
                <p className="pd-action-state-row__meta"><Localized pl="stan wyłączony" en="disabled state" /></p>
              </div>
              <Button disabled variant="secondary">
                <Localized pl="Brak wymaganych danych" en="Required data missing" />
              </Button>
              <p><Localized pl="Stan nieaktywny pozostaje czytelny bez udawania interakcji." en="The inactive state stays readable without pretending to be interactive." /></p>
            </article>
          </div>
        </StorySection>

        <StorySection
          description={
            <Localized
              pl="Konsumenci nie tworzą lokalnych przycisków. Wykres, tabela, formularz i sidecar używają tego samego właściciela akcji z różną hierarchią."
              en="Consumers do not create local buttons. Chart, table, form and sidecar use the same action owner with different hierarchy."
            />
          }
          eyebrow="04"
          title={<Localized pl="Akcje w kontekście danych" en="Actions in data context" />}
        >
          <div className="pd-action-context-ledger">
            <article className="pd-action-context-row">
              <div>
                <h3>ChartFrame</h3>
                <p className="pd-action-row__meta">owner: 15.01</p>
              </div>
              <ButtonGroup
                className="pd-action-review__inline-actions"
                label={copy({ pl: 'Akcje w ChartFrame', en: 'ChartFrame actions' })}
              >
                <Button startIcon={icon('success')}>
                  <Localized pl="Zapisz wniosek" en="Save insight" />
                </Button>
                <TextAction endIcon={icon('data')}>
                  <Localized pl="Pokaż rekordy źródłowe" en="Show source rows" />
                </TextAction>
              </ButtonGroup>
              <p>
                <Localized
                  pl="Główna decyzja zostaje przy wykresie, a dostęp do rekordów jest lekką komendą w kontekście danych."
                  en="The primary decision stays with the chart, while access to rows is a lightweight command in the data context."
                />
              </p>
            </article>

            <article className="pd-action-context-row">
              <div>
                <h3>DataTable</h3>
                <p className="pd-action-row__meta">owner: DataTable runtime / 18.04</p>
              </div>
              <ButtonGroup
                className="pd-action-review__inline-actions"
                label={copy({ pl: 'Akcje w tabeli', en: 'Table actions' })}
              >
                <IconButton
                  icon="search"
                  label={copy({ pl: 'Otwórz szczegóły wiersza', en: 'Open row details' })}
                  variant="secondary"
                />
                <TextAction tone="danger">
                  <Localized pl="oznacz jako ryzyko" en="mark as risk" />
                </TextAction>
              </ButtonGroup>
              <p>
                <Localized
                  pl="Wiersz tabeli używa małych komend i jasnych etykiet. Destrukcja pozostaje tonem akcji, nie statusem danych."
                  en="A table row uses small commands and explicit labels. Destruction remains an action tone, not a data status."
                />
              </p>
            </article>

            <article className="pd-action-context-row">
              <div>
                <h3><Localized pl="Formularz" en="Form" /></h3>
                <p className="pd-action-row__meta">owner: 00.15</p>
              </div>
              <ButtonGroup
                className="pd-action-review__inline-actions"
                label={copy({ pl: 'Akcje formularza', en: 'Form actions' })}
              >
                <Button>
                  <Localized pl="Zapisz konfigurację" en="Save configuration" />
                </Button>
                <Button variant="secondary">
                  <Localized pl="Sprawdź poprawność" en="Validate" />
                </Button>
              </ButtonGroup>
              <p>
                <Localized
                  pl="Formularz zachowuje jedną decyzję główną i jedną kontrolę wspierającą bez dodatkowej lokalnej geometrii."
                  en="A form keeps one primary decision and one supporting control without extra local geometry."
                />
              </p>
            </article>

            <article className="pd-action-context-row">
              <div>
                <h3><Localized pl="Panel boczny" en="Side panel" /></h3>
                <p className="pd-action-row__meta">owner: 18</p>
              </div>
              <ButtonGroup
                className="pd-action-review__inline-actions"
                label={copy({ pl: 'Akcje panelu bocznego', en: 'Side panel actions' })}
              >
                <TextAction>
                  <Localized pl="zapytaj asystenta" en="ask assistant" />
                </TextAction>
                <LinkAction href="#lista-kampanii">
                  <Localized pl="Otwórz listę kampanii" en="Open campaign list" />
                </LinkAction>
              </ButtonGroup>
              <p>
                <Localized
                  pl="Panel boczny korzysta z lekkiej komendy i nawigacji. Nie tworzy własnego CTA, jeśli decyzja należy do głównego widoku."
                  en="A side panel uses a lightweight command and navigation. It does not create its own CTA when the decision belongs to the main view."
                />
              </p>
            </article>
          </div>
        </StorySection>

        <StorySection
          description={
            <Localized
              pl="Ikony zachowują się jak kontrolki, nie jak ozdobne kafelki. Reagują zmianą koloru i subtelnym znacznikiem aktywności."
              en="Icons behave like controls, not decorative tiles. They respond with color and a subtle activity marker."
            />
          }
          eyebrow="05"
          title={<Localized pl="Ikony i pasek operacyjny" en="Icons and operation bar" />}
        >
          <div className="pd-action-toolbar">
            <div className="pd-action-toolbar__line">
              <span className="pd-action-toolbar__label">
                <Localized pl="Narzędzia danych" en="Data tools" />
              </span>
              <IconButton
                icon="data"
                label={copy({ pl: 'Odśwież dane', en: 'Refresh data' })}
                variant="primary"
              />
              <IconButton
                icon="search"
                label={copy({ pl: 'Szukaj w źródłach', en: 'Search sources' })}
                variant="secondary"
              />
              <IconButton
                icon="assistant"
                label={copy({ pl: 'Otwórz asystenta', en: 'Open assistant' })}
                variant="ghost"
              />
              <IconButton
                icon="warning"
                label={copy({ pl: 'Oznacz ryzyko', en: 'Mark risk' })}
                variant="danger"
              />
              <IconButton
                icon="integration"
                label={copy({ pl: 'Synchronizuj integracje', en: 'Sync integrations' })}
                loading
                loadingLabel={syncIntegrationsBusyLabel}
                variant="secondary"
              />
            </div>

            <ButtonGroup
              className="pd-action-review__inline-actions"
              label={copy({ pl: 'Pasek operacyjny', en: 'Operation bar' })}
            >
              <IconButton
                icon="data"
                label={copy({ pl: 'Odśwież widok', en: 'Refresh view' })}
                variant="secondary"
              />
              <IconButton
                icon="security"
                label={copy({ pl: 'Sprawdź zgodność', en: 'Check compliance' })}
                variant="secondary"
              />
              <Button startIcon={icon('success')}>
                <Localized pl="Zatwierdź widok" en="Approve view" />
              </Button>
            </ButtonGroup>
          </div>
        </StorySection>

        <StorySection
          description={
            <Localized
              pl="TextAction jest komendą w treści, a LinkAction jest nawigacją. Oba nie konkurują z CTA, ale korzystają z tej samej spokojnej hierarchii i znacznika aktywności."
              en="TextAction is an inline command, while LinkAction is navigation. Both avoid competing with CTAs and use the same calm hierarchy and activity marker."
            />
          }
          eyebrow="06"
          title={<Localized pl="Komenda vs link" en="Command vs link" />}
        >
          <div className="pd-action-inline-grid">
            <article className="pd-action-inline">
              <h3><Localized pl="Tekst operacyjny" en="Operational text" /></h3>
              <p className="pd-action-inline-copy">
                <Localized pl="Segment został przeliczony na podstawie nowych danych." en="The segment was recalculated from new data." />{' '}
                <Localized pl="Możesz" en="You can" />{' '}
                <TextAction endIcon={icon('integration')}>
                  <Localized pl="archiwizować segment" en="archive the segment" />
                </TextAction>{' '}
                <Localized pl="albo" en="or" />{' '}
                <TextAction tone="muted">
                  <Localized pl="porównać poprzednią wersję" en="compare the previous version" />
                </TextAction>
                .
              </p>
            </article>

            <article className="pd-action-inline">
              <h3><Localized pl="Link kontekstowy" en="Context link" /></h3>
              <p className="pd-action-inline-copy">
                <Localized pl="Źródło danych ma komplet audytowalnych zmian." en="The data source has a complete audit trail." />{' '}
                <LinkAction
                  endIcon={icon('trend')}
                  href="#raport-kwartalny"
                >
                  <Localized pl="Otwórz raport kwartalny" en="Open quarterly report" />
                </LinkAction>{' '}
                <Localized pl="lub" en="or" />{' '}
                <LinkAction href="#rejestr-ryzyka" tone="danger">
                  <Localized pl="przejdź do rejestru ryzyka" en="go to the risk register" />
                </LinkAction>
                .
              </p>
            </article>
          </div>
        </StorySection>

        <StorySection
          description={
            <Localized
              pl="Ten przykład pokazuje kolejność i układ grupy działań w realnym widoku roboczym. Mobile jest wariantem tej samej kolejności, nie osobnym wzorcem."
              en="This example shows the order and layout of an action group in a real workspace view. Mobile is a variant of the same order, not a separate pattern."
            />
          }
          eyebrow="07"
          title={<Localized pl="Grupa decyzji w widoku roboczym" en="Decision group in a workspace view" />}
        >
          <div className="pd-action-review">
            <article className="pd-action-review__summary">
              <div>
                <h3><Localized pl="Rewizja kampanii sprzedażowej" en="Sales campaign review" /></h3>
                <p>
                  <Localized
                    pl="System wykrył wzrost kosztu pozyskania i rekomenduje ręczną akceptację zmian przed publikacją."
                    en="The system detected an acquisition cost increase and recommends manual approval before publishing."
                  />
                </p>
              </div>

              <div className="pd-action-review__footer">
                <span className="pd-action-note">
                  <Localized pl="Ostatnia synchronizacja: 2 min temu" en="Last sync: 2 min ago" />
                </span>

                <ButtonGroup
                  className="pd-action-review__inline-actions"
                  label={copy({ pl: 'Akcje rewizji', en: 'Review actions' })}
                >
                  <Button startIcon={icon('success')}>
                    <Localized pl="Zapisz decyzję" en="Save decision" />
                  </Button>
                  <Button variant="secondary">
                    <Localized pl="Przekaż do sprawdzenia" en="Send for review" />
                  </Button>
                  <Button variant="ghost">
                    <Localized pl="Poproś o zmiany" en="Request changes" />
                  </Button>
                </ButtonGroup>
              </div>
            </article>

            <ButtonGroup
              className="pd-action-review__stacked-actions"
              label={copy({ pl: 'Akcje pionowe w wąskim układzie', en: 'Vertical actions in a narrow layout' })}
              orientation="vertical"
            >
              <Button fullWidth>
                <Localized pl="Kontynuuj konfigurację" en="Continue setup" />
              </Button>
              <Button fullWidth variant="secondary">
                <Localized pl="Zapisz jako wersję roboczą" en="Save as draft" />
              </Button>
              <Button fullWidth variant="ghost">
                <Localized pl="Wróć do podsumowania" en="Back to summary" />
              </Button>
            </ButtonGroup>
          </div>
        </StorySection>
    </StoryPresentationPage>
  );
}

export const Przyciski: Story = {
  name: 'Przyciski i akcje',
  args: {
    children: 'Zastosuj zmiany',
  },
  render: () => <ActionsShowcase />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    const primaryAction = canvas.getAllByRole('button', {
      name: copy({ pl: 'Zastosuj zmiany', en: 'Apply changes' }),
    })[0];
    const defaultAction = canvas.getByRole('button', {
      name: copy({ pl: 'Zatwierdź konfigurację', en: 'Approve configuration' }),
    });

    await expect(defaultAction).toHaveAttribute('type', 'button');
    await expect(primaryAction).toHaveAttribute(
      'data-variant',
      'primary',
    );
    assertActivityLineMatchesControl(primaryAction);

    await userEvent.tab();
    primaryAction.focus();
    await expect(primaryAction).toHaveFocus();
    primaryAction.blur();

    const beforeFocus = primaryAction.getBoundingClientRect();
    await userEvent.keyboard('{Enter}');

    const afterFocus = primaryAction.getBoundingClientRect();
    assertNoLayoutShift(beforeFocus, afterFocus);

    const loadingActions = canvas.getAllByRole('button', {
      name: copy({ pl: 'Trwa synchronizacja integracji', en: 'Synchronizing integrations' }),
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
      copy({ pl: 'Trwa synchronizacja integracji', en: 'Synchronizing integrations' }),
    );
    await expect(
      loadingIconButton.querySelector('.pd-icon-button__spinner'),
    ).toBeInTheDocument();

    const iconAction = canvas.getAllByRole('button', {
      name: copy({ pl: 'Odśwież dane', en: 'Refresh data' }),
    })[0];

    await expect(iconAction).toHaveAttribute(
      'data-variant',
      'primary',
    );
    assertActivityLineMatchesControl(iconAction);

    const horizontalGroup = canvas.getByRole('group', {
      name: copy({ pl: 'Sterowana grupa akcji', en: 'Controlled action group' }),
    });

    await expect(horizontalGroup).toHaveClass(
      'pd-action-review__inline-actions',
    );
    await expect(horizontalGroup).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );

    const verticalGroup = canvas.getByRole('group', {
      name: copy({ pl: 'Akcje pionowe w wąskim układzie', en: 'Vertical actions in a narrow layout' }),
    });

    await expect(verticalGroup).toHaveClass(
      'pd-action-review__stacked-actions',
    );
    await expect(verticalGroup).toHaveAttribute(
      'data-orientation',
      'vertical',
    );

    const fullWidthAction = canvas.getByRole('button', {
      name: copy({ pl: 'Kontynuuj konfigurację', en: 'Continue setup' }),
    });
    const fullWidthContent = fullWidthAction.querySelector<HTMLElement>(
      '[data-slot="activity-line-owner"]',
    );
    assertActivityLineMatchesControl(fullWidthAction);

    if (!fullWidthContent) {
      throw new Error('Missing full-width action content owner.');
    }

    await expect(fullWidthAction.getBoundingClientRect().width).toBeGreaterThan(
      fullWidthContent.getBoundingClientRect().width,
    );

    const reviewGroup = canvas.getByRole('group', {
      name: copy({ pl: 'Akcje rewizji', en: 'Review actions' }),
    });

    await expect(reviewGroup).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );

    const reportLink = canvas.getByRole('link', {
      name: copy({ pl: 'Otwórz raport kwartalny', en: 'Open quarterly report' }),
    });

    await expect(reportLink).toHaveAttribute('href', '#raport-kwartalny');
    assertActivityLineMatchesControl(reportLink);

    const chartFrameActions = canvas.getByRole('group', {
      name: copy({ pl: 'Akcje w ChartFrame', en: 'ChartFrame actions' }),
    });
    await expect(chartFrameActions).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );

    const sourceRowsAction = canvas.getByRole('button', {
      name: copy({ pl: 'Pokaż rekordy źródłowe', en: 'Show source rows' }),
    });
    assertActivityLineMatchesControl(sourceRowsAction);

    const campaignListLink = canvas.getByRole('link', {
      name: copy({ pl: 'Otwórz listę kampanii', en: 'Open campaign list' }),
    });
    await expect(campaignListLink).toHaveAttribute('href', '#lista-kampanii');

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
