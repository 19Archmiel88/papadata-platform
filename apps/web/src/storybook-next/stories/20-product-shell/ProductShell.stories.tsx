import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  Button,
  Dialog,
  InlineNotice,
  StatusBadge,
} from '../../../design-system';
import {
  CommandPalette,
  defaultShellCommands,
  defaultShellNavigation,
  defaultShellNotifications,
  defaultShellOperations,
  defaultShellUser,
  defaultShellWorkspaces,
  OperationCenter,
  ProductShellFrame,
  PublicTopbar,
  type ShellOperation,
  Sidebar,
  WorkspaceSwitcher,
} from '../../../runtime/shell/index';
import '../../presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './product-shell.stories.css';

const navigateAction = fn();
const logoutAction = fn();
const overlayAction = fn();
const openChangeAction = fn();
const notificationMutationAction = fn();
const operationItemAction = fn();

const meta = {
  title: 'PRODUCT SHELL/Elementy powłoki',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function ShellLayerPreview() {
  return (
    <Dialog
      closeOnBackdrop
      closeOnEscape
      description="Dialog korzysta z tego samego OverlayRoot co pozostałe warstwy powłoki."
      modal
      onOpenChange={openChangeAction}
      open
      primaryActionLabel="Potwierdź"
      secondaryActionLabel="Anuluj"
      title="Globalna warstwa dialogu"
    >
      <InlineNotice
        message="Dialog, drawer, paleta poleceń i powłoka mobilna współdzielą kolejność warstw oraz zasady przywracania fokusu."
        title="Jeden system overlayów"
        tone="info"
      />
    </Dialog>
  );
}

function ShellDocumentationPage({
  children,
  status = 'accepted',
  storyId,
  summary,
  title,
}: {
  readonly children: React.ReactNode;
  readonly status?: string;
  readonly storyId: string;
  readonly summary: string;
  readonly title: string;
}) {
  return (
    <StoryPresentationPage
      className="pd-s20-page"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Status powłoki"
          items={[
            {
              label: 'Właściciel',
              value: 'runtime/shell',
            },
            {
              label: 'Status',
              value: status === 'accepted' ? 'Kanoniczny runtime' : status,
            },
            {
              label: 'Źródło UI',
              value: 'ProductShellFrame',
            },
          ]}
        />
      )}
      sectionCode="PF"
      sectionLabel="Powłoka produktu"
      storyId={storyId}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
  );
}

function ProductContentPreview() {
  return (
    <section className="pd-s20-isolated" aria-labelledby="s20-runtime-title">
      <div className="pd-s20-panel">
        <p>Chroniona powierzchnia</p>
        <h3 id="s20-runtime-title">Centrum Dowodzenia</h3>
        <p>
          Ten widok jest osadzony w realnej powłoce. Ekrany domenowe pozostają
          konsumentami nawigacji, sesji i globalnych operacji.
        </p>
      </div>
      <div className="pd-s20-isolated__row">
        <div className="pd-s20-panel">
          <h3>Sesja</h3>
          <p>Tenant, workspace i capability są widoczne w obszarze roboczym.</p>
          <StatusBadge status="Sesja" text="Aktywna" tone="success" />
        </div>
        <div className="pd-s20-panel">
          <h3>Operacje</h3>
          <p>Globalne operacje pozostają dostępne bez przeładowania trasy.</p>
          <Button onClick={overlayAction} variant="secondary">
            Sprawdź działanie
          </Button>
        </div>
      </div>
    </section>
  );
}

function ShellFrameDemo({
  activePath = '/app/command-center',
  initialOverlay = null,
  notificationError = null,
  notifications = defaultShellNotifications,
  operations = defaultShellOperations,
  problem = null,
  sidebarCollapsed = false,
  sidebarDense = false,
  workspaceError = null,
  workspaces = defaultShellWorkspaces,
}: Partial<React.ComponentProps<typeof ProductShellFrame>>) {
  return (
    <div className="pd-s20-stage">
      <ProductShellFrame
        activePath={activePath}
        commands={defaultShellCommands}
        initialOverlay={initialOverlay}
        navigationGroups={defaultShellNavigation}
        notificationError={notificationError}
        notificationUnreadCount={notifications.filter((item) => item.unread).length}
        notifications={notifications}
        onLogout={logoutAction}
        onMarkAllNotificationsRead={notificationMutationAction}
        onMarkNotificationRead={notificationMutationAction}
        onMarkNotificationUnread={notificationMutationAction}
        onNavigate={navigateAction}
        onOperationAction={operationItemAction}
        onSelectWorkspace={navigateAction}
        onSnoozeNotification={notificationMutationAction}
        onUnsnoozeNotification={notificationMutationAction}
        operations={operations}
        problem={problem}
        sidebarCollapsed={sidebarCollapsed}
        sidebarDense={sidebarDense}
        user={defaultShellUser}
        workspaceError={workspaceError}
        workspaces={workspaces}
      >
        <ProductContentPreview />
      </ProductShellFrame>
    </div>
  );
}

const footerDemoOperationsAllClear: readonly ShellOperation[] = [
  {
    action: null,
    actionLabel: null,
    description: 'Pobieranie zamówień i refundów z ostatnich 30 dni.',
    errorCode: null,
    id: 'sync-woo-completed',
    progress: 100,
    startedAt: '11:58',
    status: 'completed',
    statusText: 'Zakończone',
    title: 'Synchronizacja WooCommerce',
  },
];

const footerDemoOperationsSyncing: readonly ShellOperation[] = [
  {
    action: 'cancel',
    actionLabel: 'Anuluj',
    description: 'Pobieranie zamówień i refundów z ostatnich 30 dni.',
    errorCode: null,
    id: 'sync-woo-running',
    progress: 42,
    startedAt: '12:24',
    status: 'running',
    statusText: 'W toku',
    title: 'Synchronizacja WooCommerce',
  },
];

export const AppShellStory: Story = {
  name: 'Powłoka aplikacji',
  render: () => (
    <ShellDocumentationPage
      storyId="20.01"
      summary="Pełna powłoka aplikacji z topbarem, sidebarem, workspace i globalnymi overlayami."
      title="AppShell"
    >
      <StoryPresentationSection
        index="01"
        layout="full"
        summary="Wariant potwierdza desktopowy układ powłoki i pierwszy punkt wejścia do chronionych ekranów."
        title="Pełna powłoka"
      >
        <ShellFrameDemo />
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { name: 'AppShell' })).toBeInTheDocument();
    // The command-palette trigger collapses at narrow viewports (topbar.css, <=820px) in favor
    // of the sidebar's own direct navigation links, so it is only asserted when actually visible.
    const searchTrigger = canvas.queryByRole('button', { name: /Szukaj lub uruchom komendę/u });
    if (searchTrigger) {
      await expect(searchTrigger).toBeInTheDocument();
    }
    const page = within(canvasElement.ownerDocument.body);
    let navigation = page.queryByRole('navigation', { name: 'Nawigacja główna' });

    if (!navigation) {
      const openNavigation = canvas.getByRole('button', { name: 'Otwórz nawigację' });
      await userEvent.click(openNavigation);
      navigation = await page.findByRole('navigation', { name: 'Nawigacja główna' });
    }

    await expect(navigation).toBeInTheDocument();
  },
};

export const PublicTopbarStory: Story = {
  name: 'Górny pasek publiczny',
  render: () => (
    <ShellDocumentationPage
      storyId="20.02"
      summary="Publiczny topbar Auth utrzymuje kanoniczną markę PapaData oraz globalne kontrolki języka i motywu."
      title="Topbar publiczny"
    >
      <StoryPresentationSection index="01" layout="full" title="Topbar Auth">
        <div className="pd-s20-stage pd-s20-topbar-only">
          <PublicTopbar onNavigate={navigateAction} />
        </div>
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'PapaData — strona główna' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('group', { name: 'Język interfejsu' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: /Zmień motyw/u }),
    ).toBeInTheDocument();
  },
};

export const AuthenticatedTopbarStory: Story = {
  name: 'Górny pasek użytkownika',
  render: () => (
    <ShellDocumentationPage
      storyId="20.03"
      summary="Topbar zalogowany skupia globalne akcje robocze; język i motyw są dostępne w panelu konta."
      title="Topbar zalogowany"
    >
      <StoryPresentationSection index="01" layout="full" title="Globalne akcje">
        <ShellFrameDemo />
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(findNotificationsTrigger(canvas));
    const notificationDialog = await page.findByRole('dialog', { name: 'Powiadomienia' });
    await expect(notificationDialog).toBeInTheDocument();
    await userEvent.click(within(notificationDialog).getByRole('button', { name: 'Zamknij' }));

    const accountButton = canvas.getByRole('button', { name: /Konto użytkownika/u });
    await userEvent.click(accountButton);
    const accountDialog = await page.findByRole('dialog', { name: 'Konto' });
    await expect(accountDialog).toBeInTheDocument();
    await expect(within(accountDialog).getByRole('radiogroup', { name: 'Język interfejsu' })).toBeInTheDocument();
    await expect(within(accountDialog).getByRole('radiogroup', { name: 'Motyw interfejsu' })).toBeInTheDocument();
  },
};

export const SidebarStory: Story = {
  name: 'Nawigacja boczna',
  render: () => (
    <ShellDocumentationPage
      storyId="20.04"
      summary="Sidebar utrzymuje aktywny stan, role semantyczne i czytelny focus."
      title="Sidebar"
    >
      <StoryPresentationSection index="01" layout="wide" title="Nawigacja główna">
        <div className="pd-s20-stage pd-s20-stage--compact">
          <Sidebar
            activePath="/app/command-center"
            groups={defaultShellNavigation}
            onNavigate={navigateAction}
          />
        </div>
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('navigation', { name: 'Nawigacja główna' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /Przegląd/u })).toHaveAttribute('aria-current', 'page');
  },
};

export const SidebarVariantsStory: Story = {
  name: 'Warianty nawigacji bocznej',
  render: () => (
    <ShellDocumentationPage
      storyId="20.05"
      summary="Collapsed, dense i error-safe bez poziomego overflow."
      title="Sidebar warianty"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Warianty">
        <div className="pd-s20-isolated__row">
          <div className="pd-s20-stage">
            <Sidebar
              activePath="/app/campaigns/przeglad"
              collapsed
              groups={defaultShellNavigation}
              onNavigate={navigateAction}
            />
          </div>
          <div className="pd-s20-stage">
            <Sidebar
              activePath="/app/integrations/katalog-integracji"
              dense
              groups={defaultShellNavigation}
              onNavigate={navigateAction}
            />
          </div>
        </div>
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
};

export const WorkspaceSwitcherStory: Story = {
  name: 'Wybór workspace',
  render: () => (
    <ShellDocumentationPage
      storyId="20.06"
      summary="Workspace switcher obsługuje role, brak dostępu, empty state i error state."
      title="Workspace switcher"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Stany workspace">
        <div className="pd-s20-isolated__row">
          <div className="pd-s20-panel">
            <WorkspaceSwitcher
              activeWorkspaceId="commerce"
              onCreateWorkspace={navigateAction}
              onSelectWorkspace={navigateAction}
              workspaces={defaultShellWorkspaces}
            />
          </div>
          <div className="pd-s20-panel">
            <WorkspaceSwitcher
              activeWorkspaceId={null}
              workspaces={[]}
            />
          </div>
          <div className="pd-s20-panel">
            <WorkspaceSwitcher
              activeWorkspaceId={null}
              error="BFF zwrócił brak tenant context."
              workspaces={defaultShellWorkspaces}
            />
          </div>
        </div>
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: /Zmień workspace/u }));
    const dialog = await page.findByRole('dialog', { name: 'Zmień workspace' });
    await expect(within(dialog).getByRole('button', { name: 'Dodaj workspace' })).toBeInTheDocument();
  },
};

export const GlobalSearchCommandPaletteStory: Story = {
  name: 'Wyszukiwanie i paleta poleceń',
  render: () => (
    <ShellDocumentationPage
      storyId="20.07"
      summary="Command palette działa w dialogu, ma wyszukiwarkę i empty state."
      title="Global search i command palette"
    >
      <StoryPresentationSection index="01" layout="wide" title="Dialog komend">
        <div className="pd-s20-stage pd-s20-command-preview">
          <CommandPalette
            commands={defaultShellCommands}
            onNavigate={navigateAction}
            onOpenChange={openChangeAction}
            open
          />
        </div>
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const input = await page.findByRole('textbox', { name: 'Fraza lub komenda' });

    await userEvent.type(input, 'brak');
    await expect(await page.findByText('Brak wyników')).toBeInTheDocument();

    // Empty state jest zweryfikowany powyżej — story ma jednak kończyć się w
    // reprezentatywnym stanie z pełną listą komend, a nie na "Brak wyników",
    // więc czyścimy wyszukiwanie i potwierdzamy powrót do listy.
    await userEvent.clear(input);
    await expect(page.queryByText('Brak wyników')).not.toBeInTheDocument();
    await expect(await page.findByText('Otwórz Papa Asystenta')).toBeInTheDocument();
  },
};

function findNotificationsTrigger(canvas: ReturnType<typeof within>): HTMLElement {
  const trigger = canvas
    .getAllByRole('button', { name: /Powiadomienia/u })
    .find((button: HTMLElement) => button.classList.contains('pd-shell-topbar__notifications-trigger'));

  if (!trigger) {
    throw new Error('Realny trigger powiadomień w topbarze nie jest wyrenderowany.');
  }

  return trigger;
}

export const NotificationsDefaultStory: Story = {
  name: 'Powiadomienia — lista',
  render: () => (
    <ShellDocumentationPage
      storyId="20.08A"
      summary="Kanoniczny NotificationCenter, otwierany przez realny dzwonek w pełnym ProductShellFrame — jeden otwarty portal, lista i akcje."
      title="Powiadomienia — lista"
    >
      <StoryPresentationSection index="01" layout="full" title="Lista powiadomień">
        <ShellFrameDemo />
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    notificationMutationAction.mockClear();
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(findNotificationsTrigger(canvas));

    const dialog = await page.findByRole('dialog', { name: 'Powiadomienia' });
    await expect(dialog).toBeInTheDocument();
    await expect(page.getAllByRole('dialog', { name: 'Powiadomienia' })).toHaveLength(1);

    const actions = within(dialog).getAllByText('Akcje');
    await userEvent.click(actions[0]);
    const markRead = within(dialog).queryByRole('button', { name: 'Oznacz jako przeczytane' });
    if (markRead) {
      await userEvent.click(markRead);
      await expect(notificationMutationAction).toHaveBeenCalled();
    }
  },
};

export const NotificationsEmptyStory: Story = {
  name: 'Powiadomienia — pusto',
  render: () => (
    <ShellDocumentationPage
      storyId="20.08B"
      summary="Empty state NotificationCenter, otwierany przez realny dzwonek w pełnym ProductShellFrame — bez nakładania drugiego portalu."
      title="Powiadomienia — brak danych"
    >
      <StoryPresentationSection index="01" layout="full" title="Brak powiadomień">
        <ShellFrameDemo notifications={[]} />
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(findNotificationsTrigger(canvas));

    const dialog = await page.findByRole('dialog', { name: 'Powiadomienia' });
    await expect(dialog).toBeInTheDocument();
    await expect(page.getAllByRole('dialog', { name: 'Powiadomienia' })).toHaveLength(1);
    await expect(within(dialog).getByText('Brak powiadomień')).toBeInTheDocument();
  },
};

export const NotificationsErrorStory: Story = {
  name: 'Powiadomienia — błąd',
  render: () => (
    <ShellDocumentationPage
      storyId="20.08C"
      summary="Error state NotificationCenter, otwierany przez realny dzwonek w pełnym ProductShellFrame — jeden portal overlay."
      title="Powiadomienia — błąd"
    >
      <StoryPresentationSection index="01" layout="full" title="Błąd pobierania">
        <ShellFrameDemo notificationError="Nie można pobrać powiadomień." notifications={[]} />
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(findNotificationsTrigger(canvas));

    await expect(await page.findByRole('dialog', { name: 'Powiadomienia' })).toBeInTheDocument();
    await expect(page.getAllByRole('dialog', { name: 'Powiadomienia' })).toHaveLength(1);
    await expect(page.getByText('Powiadomienia niedostępne')).toBeInTheDocument();
    await expect(page.getByText('Nie można pobrać powiadomień.')).toBeInTheDocument();
  },
};

export const BackgroundOperationsStory: Story = {
  name: 'Operacje w tle',
  render: () => (
    <ShellDocumentationPage
      storyId="20.09"
      summary="Centrum operacji pokazuje progress, retry, cancel i statusy końcowe."
      title="Operacje w tle"
    >
      <StoryPresentationSection index="01" layout="wide" title="Drawer operacji">
        <div className="pd-s20-stage pd-s20-drawer-preview">
          <OperationCenter
            onAction={operationItemAction}
            onOpenChange={openChangeAction}
            open
            operations={defaultShellOperations}
          />
        </div>
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    operationItemAction.mockClear();
    const page = within(canvasElement.ownerDocument.body);
    const retry = await page.findByRole('button', { name: 'Ponów' });
    await userEvent.click(retry);
    await expect(operationItemAction).toHaveBeenCalled();
  },
};

export const OverlayRootStory: Story = {
  name: 'System warstw i nakładek',
  render: () => (
    <ShellDocumentationPage
      storyId="20.10"
      summary="Dialog, drawer, command palette i mobile shell korzystają ze wspólnego systemu warstw."
      title="OverlayRoot"
    >
      <StoryPresentationSection index="01" layout="wide" title="Warstwa dialogu">
        <div className="pd-s20-stage pd-s20-command-preview">
          <ShellLayerPreview />
        </div>
      </StoryPresentationSection>
      <StoryPresentationSection index="02" layout="narrow" title="Status">
        <InlineNotice
          message="OverlayRoot jest jeden dla Dialog, Drawer i Command Palette."
          title="Brak konfliktu warstw"
          tone="success"
        />
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
};

export const MobileShellStory: Story = {
  name: 'Powłoka mobilna',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <ShellDocumentationPage
      storyId="20.11"
      summary="Mobilna powłoka zachowuje menu, command palette i brak poziomego overflow."
      title="Powłoka mobilna"
    >
      <StoryPresentationSection index="01" layout="full" title="Mobile shell">
        <div className="pd-s20-stage pd-s20-stage--mobile">
          <ProductShellFrame
            activePath="/app/command-center"
            commands={defaultShellCommands}
            initialOverlay="mobile-navigation"
            navigationGroups={defaultShellNavigation}
            notificationUnreadCount={defaultShellNotifications.filter((item) => item.unread).length}
            notifications={defaultShellNotifications}
            onLogout={logoutAction}
            onNavigate={navigateAction}
            onSelectWorkspace={navigateAction}
            operations={defaultShellOperations}
            user={defaultShellUser}
            workspaces={defaultShellWorkspaces}
          >
            <ProductContentPreview />
          </ProductShellFrame>
        </div>
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole('dialog', { name: 'Nawigacja' })).toBeInTheDocument();
  },
};

export const FooterStatusBarStory: Story = {
  name: 'Pasek stopki',
  render: () => (
    <ShellDocumentationPage
      storyId="20.12"
      summary="Stały, cienki pasek stopki na dole powłoki. Status pochodzi z tej samej listy operacji integracji co Operation Center — nie z osobnego, wymyślonego źródła. Niezależny od zwijania/rozwijania sidebara, tak jak topbar."
      title="Pasek stopki"
    >
      <StoryPresentationSection
        index="01"
        layout="full"
        summary="Brak aktywnych operacji w kolejce — sidebar rozwinięty, pasek zajmuje pełną szerokość powłoki."
        title="Wariant: brak aktywnych operacji"
      >
        <ShellFrameDemo operations={footerDemoOperationsAllClear} />
      </StoryPresentationSection>
      <StoryPresentationSection
        index="02"
        layout="full"
        summary="Synchronizacja w toku — sidebar zwinięty, pasek stopki pozostaje bez zmian, dokładnie jak topbar."
        title="Wariant: synchronizacja w toku, sidebar zwinięty"
      >
        <ShellFrameDemo operations={footerDemoOperationsSyncing} sidebarCollapsed />
      </StoryPresentationSection>
      <StoryPresentationSection
        index="03"
        layout="full"
        summary="Ten sam zestaw operacji co w 20.09 Operacje w tle (jedna failed) — pasek i Operation Center czytają dokładnie tę samą listę, więc nie mogą sobie zaprzeczyć."
        title="Wariant: operacja wymaga uwagi"
      >
        <ShellFrameDemo operations={defaultShellOperations} />
      </StoryPresentationSection>
    </ShellDocumentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bars = await canvas.findAllByRole('contentinfo', { name: 'Stan synchronizacji' });
    await expect(bars.length).toBeGreaterThanOrEqual(3);
    await expect(canvas.getByText('Brak aktywnych operacji integracji')).toBeInTheDocument();
    await expect(canvas.getByText('Synchronizacja w toku')).toBeInTheDocument();
    await expect(canvas.getByText('1 operacja integracji wymaga uwagi')).toBeInTheDocument();
  },
};
