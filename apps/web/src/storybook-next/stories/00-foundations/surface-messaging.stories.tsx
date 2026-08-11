import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';

import {
  Button,
} from '../../../design-system/components/Button';
import {
  StatusBadge,
} from '../../../design-system/components/StatusBadge';
import type {
  PapaDataRuntimeLocale,
} from '../../../design-system/foundations';
import {
  Icon,
} from '../../../design-system/icons';
import '../../presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../presentation/StoryPresentation';
import './surface-messaging.css';

const meta = {
  title: '00 Fundamenty/02 Powierzchnie i komunikaty',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
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

function FoundationSurfacePage({
  title,
  summary,
  children,
}: {
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <StoryPresentationPage
      headerAside={
        <StoryPresentationMeta
          ariaLabel={copy({
            pl: 'Parametry powierzchni i komunikatów',
            en: 'Surface and messaging parameters',
          })}
          items={[
            { label: <Localized pl="Właściciel" en="Owner" />, value: '00' },
            { label: <Localized pl="Motyw" en="Theme" />, value: readTheme() === 'dark' ? <Localized pl="Ciemny" en="Dark" /> : <Localized pl="Jasny" en="Light" /> },
            { label: <Localized pl="Język" en="Language" />, value: readLocale().toUpperCase() },
          ]}
        />
      }
      sectionCode="00"
      sectionLabel={<Localized pl="Fundamenty" en="Foundations" />}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
  );
}

function FoundationSurfaceSection({
  index,
  title,
  summary,
  children,
}: {
  readonly index: string;
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <StoryPresentationSection
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

const surfaceRows = [
  {
    level: '00',
    name: 'canvas',
    token: '--pd-canvas',
    title: { pl: 'Canvas aplikacji', en: 'Application canvas' },
    description: {
      pl: 'Tło robocze. Nie jest kartą i nie konkuruje z treścią.',
      en: 'Working background. It is not a card and does not compete with content.',
    },
  },
  {
    level: '01',
    name: 'surface',
    token: '--pd-surface-panel',
    title: { pl: 'Powierzchnia danych', en: 'Data surface' },
    description: {
      pl: 'Stabilny region pracy: tabela, wykres, sekcja danych albo inspector.',
      en: 'Stable work region: table, chart, data section or inspector.',
    },
  },
  {
    level: '02',
    name: 'floating',
    token: '--pd-shadow-floating',
    title: { pl: 'Warstwa pomocnicza', en: 'Supporting layer' },
    description: {
      pl: 'Rekomendacja, popover, krótkotrwały kontekst albo toast.',
      en: 'Recommendation, popover, short-lived context or toast.',
    },
  },
  {
    level: '03',
    name: 'overlay',
    token: '--pd-shadow-overlay',
    title: { pl: 'Overlay', en: 'Overlay' },
    description: {
      pl: 'Modal lub warstwa, która świadomie odcina kontekst bazowy.',
      en: 'Modal or layer that intentionally cuts off the base context.',
    },
  },
] as const;

const surfaceConsumerRows = [
  {
    level: '15',
    name: 'surface',
    title: {
      pl: 'Wykresy i dane',
      en: 'Charts and data',
    },
    token: 'ChartFrame / DataTable',
    description: {
      pl: 'Wykres, tabela i panel danych korzystają z powierzchni roboczej zamiast tworzyć własną kartę.',
      en: 'Charts, tables and data panels use the working surface instead of creating a private card.',
    },
  },
  {
    level: '18',
    name: 'floating',
    title: {
      pl: 'Kalendarze i zakresy',
      en: 'Calendars and ranges',
    },
    token: 'Popover / DatePicker',
    description: {
      pl: 'Biblioteka kalendarza dziedziczy warstwę floating, separator i kontrast kontrolek.',
      en: 'A calendar library inherits the floating layer, separator and control contrast.',
    },
  },
  {
    level: '18',
    name: 'floating',
    title: {
      pl: 'Komunikaty',
      en: 'Messages',
    },
    token: 'InlineNotice / Toast',
    description: {
      pl: 'Komunikat używa semantycznego tonu jako lokalnego akcentu, nie jako pełnego tła.',
      en: 'A message uses semantic tone as a local accent, not as a full background.',
    },
  },
  {
    level: '18',
    name: 'overlay',
    title: {
      pl: 'Modal i potwierdzenie',
      en: 'Modal and confirmation',
    },
    token: 'Dialog / Confirm',
    description: {
      pl: 'Warstwa odcinająca kontekst korzysta z overlay i zachowuje czytelną ścieżkę powrotu.',
      en: 'A context-blocking layer uses overlay and keeps a clear return path.',
    },
  },
] as const;

const noticeRows = [
  {
    tone: 'info',
    title: { pl: 'Informacja', en: 'Information' },
    copy: {
      pl: 'Dane są aktualizowane w tle. Widok pozostaje dostępny.',
      en: 'Data is updating in the background. The view remains available.',
    },
  },
  {
    tone: 'success',
    title: { pl: 'Sukces', en: 'Success' },
    copy: {
      pl: 'Rekomendacja została zapisana razem z zakresem danych.',
      en: 'The recommendation was saved with the data scope.',
    },
  },
  {
    tone: 'warning',
    title: { pl: 'Ostrzeżenie', en: 'Warning' },
    copy: {
      pl: 'Źródło danych jest częściowe. Decyzja wymaga dodatkowej kontroli.',
      en: 'The data source is partial. The decision requires an extra check.',
    },
  },
  {
    tone: 'critical',
    title: { pl: 'Krytyczne', en: 'Critical' },
    copy: {
      pl: 'Nie można zapisać decyzji bez potwierdzonego dowodu.',
      en: 'The decision cannot be saved without confirmed evidence.',
    },
  },
] as const;

const noticeUsageRows = [
  {
    title: { pl: 'Użyj', en: 'Use' },
    token: 'InlineNotice',
    detail: {
      pl: 'Gdy komunikat należy do danych, formularza, filtra albo lokalnego kontekstu decyzji.',
      en: 'When the message belongs to data, a form, filter or local decision context.',
    },
  },
  {
    title: { pl: 'Nie używaj', en: 'Do not use' },
    token: 'Toast / EmptyState / StatusBadge',
    detail: {
      pl: 'Do krótkiego potwierdzenia operacji, statusu rekordu albo pełnego pustego stanu.',
      en: 'For short operation confirmation, record status or a full empty state.',
    },
  },
] as const;

const objectStatusRows = [
  {
    icon: 'data',
    status: 'record',
    text: { pl: 'Rekord gotowy', en: 'Record ready' },
    tone: 'success',
    detail: {
      pl: 'Status pojedynczego rekordu po walidacji.',
      en: 'A single record status after validation.',
    },
  },
  {
    icon: 'integration',
    status: 'sync',
    text: { pl: 'Synchronizacja trwa', en: 'Sync running' },
    tone: 'processing',
    detail: {
      pl: 'Status procesu, który jeszcze nie ma wyniku końcowego.',
      en: 'A process status that does not yet have a final result.',
    },
  },
  {
    icon: 'security',
    status: 'blocked',
    text: { pl: 'Zablokowane', en: 'Blocked' },
    tone: 'critical',
    detail: {
      pl: 'Blokada dostępu, planu, uprawnienia albo polityki.',
      en: 'A block caused by access, plan, permission or policy.',
    },
  },
  {
    icon: 'data',
    status: 'draft',
    text: { pl: 'Wersja robocza', en: 'Draft' },
    tone: 'neutral',
    detail: {
      pl: 'Stan roboczy bez oceny pozytywnej lub negatywnej.',
      en: 'A working state without positive or negative evaluation.',
    },
  },
] as const;

const toastRows = [
  {
    tone: 'success',
    title: { pl: 'Widok zapisany', en: 'View saved' },
    copy: {
      pl: 'Toast potwierdza akcję, ale nie tworzy nowego panelu.',
      en: 'Toast confirms the action but does not create a new panel.',
    },
  },
  {
    tone: 'warning',
    title: { pl: 'Eksport opóźniony', en: 'Export delayed' },
    copy: {
      pl: 'Proces wymaga uwagi, a szczegóły zostają w widoku danych.',
      en: 'The process needs attention, while details stay in the data view.',
    },
  },
  {
    tone: 'progress',
    title: { pl: 'Eksport trwa', en: 'Export running' },
    copy: {
      pl: 'Krótka informacja o operacji w tle bez zmiany layoutu.',
      en: 'A short note about a background operation without layout change.',
    },
  },
] as const;

const stateAnatomyRows = [
  {
    title: { pl: 'Nagłówek', en: 'Heading' },
    token: 'title',
    detail: {
      pl: 'Jednozdaniowa diagnoza stanu.',
      en: 'A one-sentence diagnosis of the state.',
    },
  },
  {
    title: { pl: 'Opis', en: 'Description' },
    token: 'description',
    detail: {
      pl: 'Krótki kontekst bez zastępowania dokumentacji.',
      en: 'Short context without replacing documentation.',
    },
  },
  {
    title: { pl: 'Przyczyna', en: 'Cause' },
    token: 'reason',
    detail: {
      pl: 'Brak danych, błąd źródła, blokada planu albo brak uprawnienia.',
      en: 'No data, source error, plan block or missing permission.',
    },
  },
  {
    title: { pl: 'Akcja', en: 'Action' },
    token: 'primary action',
    detail: {
      pl: 'Jedna następna decyzja, zgodna z systemem akcji.',
      en: 'One next decision aligned with the action system.',
    },
  },
  {
    title: { pl: 'Status pomocniczy', en: 'Supporting status' },
    token: 'status',
    detail: {
      pl: 'Status lub metadane, jeśli pomagają wyjaśnić stan.',
      en: 'Status or metadata when it helps explain the state.',
    },
  },
] as const;

const stateRows = [
  {
    name: 'empty',
    icon: 'data',
    title: { pl: 'Brak danych', en: 'Empty' },
    copy: {
      pl: 'Nie znaleziono rekordów dla bieżącego filtra.',
      en: 'No records were found for the current filter.',
    },
    reason: {
      pl: 'Filtr nie zwrócił wyników',
      en: 'The filter returned no results',
    },
    action: {
      pl: 'Zmień filtr',
      en: 'Change filter',
    },
    tone: 'neutral',
  },
  {
    name: 'error',
    icon: 'warning',
    title: { pl: 'Błąd możliwy do naprawy', en: 'Recoverable error' },
    copy: {
      pl: 'Źródło nie odpowiedziało. Użytkownik może ponowić próbę.',
      en: 'The source did not respond. The user can retry.',
    },
    reason: {
      pl: 'Timeout źródła danych',
      en: 'Data source timeout',
    },
    action: {
      pl: 'Ponów próbę',
      en: 'Retry',
    },
    tone: 'warning',
  },
  {
    name: 'blocked',
    icon: 'security',
    title: { pl: 'Brak dostępu', en: 'Blocked' },
    copy: {
      pl: 'Ten zakres wymaga wyższego planu albo uprawnienia.',
      en: 'This scope requires a higher plan or permission.',
    },
    reason: {
      pl: 'Brak uprawnienia lub limit planu',
      en: 'Missing permission or plan limit',
    },
    action: {
      pl: 'Sprawdź dostęp',
      en: 'Check access',
    },
    tone: 'critical',
  },
] as const;

export const HierarchiaPowierzchni: Story = {
  name: 'Canvas, tło i powierzchnie',
  render: () => (
    <FoundationSurfacePage
      title={<Localized pl="Canvas, tło i powierzchnie" en="Canvas, background and surfaces" />}
      summary={<Localized pl="To pierwszy materialny poziom interfejsu: tło robocze, powierzchnia danych, warstwa pomocnicza i overlay." en="This is the first material level of the interface: working background, data surface, supporting layer and overlay." />}
    >
      <FoundationSurfaceSection
        index="01"
        title={<Localized pl="Materiał roboczy aplikacji" en="Application work material" />}
        summary={<Localized pl="Nie tworzymy osobnych kart dla każdej domeny. Domena korzysta z tych samych poziomów." en="We do not create separate cards for every domain. The domain consumes the same levels." />}
      >
        <div className="pd-f0-surface-grid" role="list">
          {surfaceRows.map((item) => (
            <article className="pd-f0-surface-card" data-surface-level={item.name} key={item.name} role="listitem">
              <span className="pd-f0-surface-card__level">{item.level}</span>
              <div>
                <h3>{copy(item.title)}</h3>
                <p>{copy(item.description)}</p>
              </div>
              <code>{item.token}</code>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>

      <FoundationSurfaceSection
        index="02"
        title={<Localized pl="Konsumenci powierzchni" en="Surface consumers" />}
        summary={<Localized pl="Zaawansowane biblioteki i wzorce produktu mają wejść w te poziomy, a nie definiować osobne tło, cień i obramowanie." en="Advanced libraries and product patterns should enter these levels instead of defining their own background, shadow and border." />}
      >
        <div className="pd-f0-surface-grid" role="list">
          {surfaceConsumerRows.map((item) => (
            <article className="pd-f0-surface-card" data-surface-level={item.name} key={`${item.level}-${item.token}`} role="listitem">
              <span className="pd-f0-surface-card__level">{item.level}</span>
              <div>
                <h3>{copy(item.title)}</h3>
                <p>{copy(item.description)}</p>
              </div>
              <code>{item.token}</code>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>
    </FoundationSurfacePage>
  ),
};

export const KomunikatWKontekscie: Story = {
  name: 'Komunikat w kontekście',
  render: () => (
    <FoundationSurfacePage
      title={<Localized pl="Komunikat w kontekście" en="In-context notice" />}
      summary={<Localized pl="InlineNotice jest komunikatem w kontekście. Nie zastępuje statusu, toasta ani pustego stanu." en="InlineNotice is an in-context message. It does not replace status, toast or empty state." />}
    >
      <FoundationSurfaceSection
        index="01"
        title={<Localized pl="Tony komunikatów" en="Message tones" />}
      >
        <div className="pd-f0-notice-stack" role="list">
          {noticeRows.map((item) => (
            <article className="pd-f0-inline-notice" data-tone={item.tone} key={item.tone} role="listitem">
              <Icon decorative name={item.tone === 'critical' || item.tone === 'warning' ? 'warning' : item.tone === 'success' ? 'success' : 'data'} size={20} />
              <div>
                <h3>{copy(item.title)}</h3>
                <p>{copy(item.copy)}</p>
              </div>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>

      <FoundationSurfaceSection
        index="02"
        title={<Localized pl="Kiedy używać" en="When to use" />}
        summary={<Localized pl="InlineNotice zostaje blisko miejsca problemu albo informacji. Krótka operacja, status rekordu i cały pusty stan mają innych właścicieli." en="InlineNotice stays close to the problem or information. A short operation, record status and a full empty state have different owners." />}
      >
        <div className="pd-f0-usage-grid" role="list">
          {noticeUsageRows.map((item) => (
            <article className="pd-f0-usage-card" key={item.title.pl} role="listitem">
              <h3>{copy(item.title)}</h3>
              <p>{copy(item.detail)}</p>
              <code>{item.token}</code>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>
    </FoundationSurfacePage>
  ),
};

export const StatusObiektu: Story = {
  name: 'Status obiektu',
  render: () => (
    <FoundationSurfacePage
      title={<Localized pl="Status obiektu" en="Object status" />}
      summary={<Localized pl="StatusBadge opisuje stan obiektu. Domena mapuje swoje klucze na ograniczony zestaw tonów systemowych." en="StatusBadge describes an object state. The domain maps its keys to a constrained set of system tones." />}
    >
      <FoundationSurfaceSection
        index="01"
        title={<Localized pl="Statusy obiektu w użyciu" en="Object statuses in use" />}
        summary={<Localized pl="Wygląd badge’a mieszka tutaj. Statusy semantyczne z 01 mówią, co znaczy ton; ta story pokazuje, jak ton wygląda na obiekcie." en="Badge appearance lives here. Semantic statuses in 01 explain tone meaning; this story shows how the tone looks on an object." />}
      >
        <div className="pd-f0-status-object-grid" role="list">
          {objectStatusRows.map((item) => (
            <article className="pd-f0-status-object-card" data-tone={item.tone} key={item.status} role="listitem">
              <Icon decorative name={item.icon} size={20} />
              <StatusBadge status={item.status} text={copy(item.text)} tone={item.tone} />
              <p>{copy(item.detail)}</p>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>
    </FoundationSurfacePage>
  ),
};

export const ToastOperacyjny: Story = {
  name: 'Toast operacyjny',
  render: () => (
    <FoundationSurfacePage
      title={<Localized pl="Toast operacyjny" en="Operational toast" />}
      summary={<Localized pl="Toast jest krótkotrwałą warstwą operacyjną. Nie zmienia układu i nie przejmuje roli InlineNotice." en="Toast is a short-lived operational layer. It does not change layout and does not take over InlineNotice's role." />}
    >
      <FoundationSurfaceSection
        index="01"
        title={<Localized pl="Komunikaty operacyjne" en="Operational messages" />}
      >
        <div className="pd-f0-toast-lab" role="list">
          {toastRows.map((item) => (
            <article className="pd-f0-toast-sample" data-tone={item.tone} key={item.tone} role="listitem">
              <span />
              <div>
                <h3>{copy(item.title)}</h3>
                <p>{copy(item.copy)}</p>
              </div>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>

      <FoundationSurfaceSection
        index="02"
        title={<Localized pl="Granica użycia" en="Usage boundary" />}
        summary={<Localized pl="Toast nie przenosi informacji z widoku. Potwierdza operację i znika bez zmiany układu." en="Toast does not move information out of the view. It confirms an operation and disappears without layout change." />}
      >
        <div className="pd-f0-usage-grid" role="list">
          <article className="pd-f0-usage-card" role="listitem">
            <h3><Localized pl="Użyj" en="Use" /></h3>
            <p><Localized pl="Po zapisie, eksporcie, zmianie widoku albo operacji w tle." en="After saving, exporting, changing a view or a background operation." /></p>
            <code>operation feedback</code>
          </article>
          <article className="pd-f0-usage-card" role="listitem">
            <h3><Localized pl="Nie używaj" en="Do not use" /></h3>
            <p><Localized pl="Do błędów blokujących, instrukcji formularza i informacji wymagającej decyzji." en="For blocking errors, form instructions and information requiring a decision." /></p>
            <code>InlineNotice / EmptyState</code>
          </article>
        </div>
      </FoundationSurfaceSection>
    </FoundationSurfacePage>
  ),
};

export const StanyPusteBledyIBlokady: Story = {
  name: 'Stany puste, błędy i blokady',
  render: () => (
    <FoundationSurfacePage
      title={<Localized pl="Stany puste, błędy i blokady" en="Empty, error and blocked states" />}
      summary={<Localized pl="Stany ekranów mają wspólną anatomię. Treść zmienia domena, nie konstrukcja wizualna." en="Screen states share one anatomy. The domain changes copy, not the visual construction." />}
    >
      <FoundationSurfaceSection
        index="01"
        title={<Localized pl="Anatomia stanu" en="State anatomy" />}
        summary={<Localized pl="To kontrakt dla przyszłych bibliotek danych i wykresów: pusty wynik, błąd źródła i blokada planu mają tę samą konstrukcję." en="This is the contract for future data and chart libraries: empty result, source error and plan block use the same construction." />}
      >
        <div className="pd-f0-state-anatomy" role="list">
          {stateAnatomyRows.map((item) => (
            <article className="pd-f0-usage-card" key={item.token} role="listitem">
              <h3>{copy(item.title)}</h3>
              <p>{copy(item.detail)}</p>
              <code>{item.token}</code>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>

      <FoundationSurfaceSection
        index="02"
        title={<Localized pl="Warianty stanów" en="State variants" />}
      >
        <div className="pd-f0-state-grid" role="list">
          {stateRows.map((item) => (
            <article className="pd-f0-state-card" data-state={item.name} key={item.name} role="listitem">
              <Icon decorative name={item.icon} size={24} />
              <h3>{copy(item.title)}</h3>
              <p>{copy(item.copy)}</p>
              <StatusBadge status={item.name} text={copy(item.reason)} tone={item.tone} />
              <Button size="small" variant={item.name === 'blocked' ? 'secondary' : 'primary'}>
                {copy(item.action)}
              </Button>
            </article>
          ))}
        </div>
      </FoundationSurfaceSection>
    </FoundationSurfacePage>
  ),
};
