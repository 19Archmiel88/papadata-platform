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
  NotificationCenter,
  OperationCenter,
  ProductShellFrame,
  PublicTopbar,
  type ShellOperation,
  ShellLayerDemo,
  Sidebar,
  WorkspaceSwitcher,
} from '../../runtime/shell/index';
import '../../../storybook-next/presentation/story-presentation.css';
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
  title: '20 Powłoka produktu/Powłoka i nawigacja',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function ShellPage({
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
              label: 'Owner',
              value: 'Product Shell',
            },
            {
              label: 'Status',
              value: status,
            },
            {
              label: 'Dokument',
              value: `docs/specyfikacja-docelowa/06-powloka-produktu-i-nawigacja/${storyId.replace('.', '-')}`,
            },
          ]}
        />
      )}
      sectionCode="20"
      sectionLabel="Powłoka produktu"
      storyId={storyId}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
  );
}

function CommandCenterPreview() {
  return (
    <section className="pd-s20-isolated" aria-labelledby="s20-runtime-title">
      <div className="pd-s20-panel">
        <p>Chroniona powierzchnia</p>
        <h3 id="s20-runtime-title">Centrum Dowodzenia</h3>
        <p>
          Ten widok jest osadzony w realnej powłoce. Prawdziwe ekrany domenowe
          zaczynają się po zamknięciu P0.20 i nie zastępują tej warstwy shell.
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
            Akcja testowa
          </Button>
        </div>
      </div>
    </section>
  );
}

function ShellFrameDemo({
  activePath = '/app/command-center',
  initialOverlay = null,
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
        notificationUnreadCount={defaultShellNotifications.filter((item) => item.unread).length}
        notifications={defaultShellNotifications}
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
        <CommandCenterPreview />
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
  name: '20.01 AppShell',
  render: () => (
    <ShellPage
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
    </ShellPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('heading', { name: 'AppShell' })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: /Szukaj lub uruchom komendę/u })).toBeInTheDocument();
    await expect(await canvas.findByRole('complementary', { name: 'Nawigacja główna' })).toBeInTheDocument();
    const sidebarToggle = canvas.queryByRole('button', { name: /nawigację/u });
    if (sidebarToggle) {
      await expect(sidebarToggle).toBeInTheDocument();
    }
  },
};

export const PublicTopbarStory: Story = {
  name: '20.02 Topbar publiczny',
  render: () => (
    <ShellPage
      storyId="20.02"
      summary="Publiczny topbar Auth utrzymuje kanoniczną markę PapaData oraz globalne kontrolki języka i motywu."
      title="Topbar publiczny"
    >
      <StoryPresentationSection index="01" layout="full" title="Topbar Auth">
        <div className="pd-s20-stage pd-s20-topbar-only">
          <PublicTopbar onNavigate={navigateAction} />
        </div>
      </StoryPresentationSection>
    </ShellPage>
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
  name: '20.03 Topbar zalogowany',
  render: () => (
    <ShellPage
      storyId="20.03"
      summary="Topbar zalogowany skupia globalne akcje robocze; język i motyw są dostępne w panelu konta."
      title="Topbar zalogowany"
    >
      <StoryPresentationSection index="01" layout="full" title="Globalne akcje">
        <ShellFrameDemo />
      </StoryPresentationSection>
    </ShellPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const notificationButton = canvas
      .getAllByRole('button', { name: /Powiadomienia/u })
      .find((button: HTMLElement) => button.classList.contains('pd-shell-topbar__notifications-trigger'));

    if (!notificationButton) {
      throw new Error('Authenticated topbar notification button is not rendered.');
    }

    await userEvent.click(notificationButton);
    const notificationDialog = await page.findByRole('dialog', { name: 'Powiadomienia' });
    await expect(notificationDialog).toBeInTheDocument();
    await userEvent.click(within(notificationDialog).getByRole('button', { name: 'Zamknij' }));

    const accountButton = canvas.getByRole('button', { name: /Konto użytkownika/u });
    await userEvent.click(accountButton);
    const accountDialog = await page.findByRole('dialog', { name: 'Konto' });
    await expect(accountDialog).toBeInTheDocument();
    await expect(within(accountDialog).getByRole('group', { name: 'Język' })).toBeInTheDocument();
    await expect(within(accountDialog).getByRole('group', { name: 'Motyw' })).toBeInTheDocument();
  },
};

export const SidebarStory: Story = {
  name: '20.04 Sidebar',
  render: () => (
    <ShellPage
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
    </ShellPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('complementary', { name: 'Nawigacja główna' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: /Centrum Dowodzenia/u })).toHaveAttribute('aria-current', 'page');
  },
};

export const SidebarVariantsStory: Story = {
  name: '20.05 Sidebar warianty',
  render: () => (
    <ShellPage
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
    </ShellPage>
  ),
};

export const WorkspaceSwitcherStory: Story = {
  name: '20.06 Workspace switcher',
  render: () => (
    <ShellPage
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
    </ShellPage>
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
  name: '20.07 Global search / command palette',
  render: () => (
    <ShellPage
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
    </ShellPage>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const input = await page.findByRole('textbox', { name: 'Fraza lub komenda' });

    await userEvent.type(input, 'brak');
    await expect(await page.findByText('Brak wyników')).toBeInTheDocument();
  },
};

export const NotificationsStory: Story = {
  name: '20.08 Powiadomienia',
  render: () => (
    <ShellPage
      storyId="20.08"
      summary="Powiadomienia są niemodalnym popoverem z filtrami, listą, empty state i error state."
      title="Powiadomienia"
    >
      <StoryPresentationSection index="01" layout="wide" title="Popover powiadomień">
        <div className="pd-s20-stage pd-s20-drawer-preview">
          <NotificationCenter
            notifications={defaultShellNotifications}
            onMarkAllRead={notificationMutationAction}
            onMarkRead={notificationMutationAction}
            onMarkUnread={notificationMutationAction}
            onOpenChange={openChangeAction}
            onSnooze={notificationMutationAction}
            onUnsnooze={notificationMutationAction}
            open
            unreadCount={defaultShellNotifications.filter((item) => item.unread).length}
          />
        </div>
      </StoryPresentationSection>
      <StoryPresentationSection index="02" layout="showcase" title="Empty i error">
        <div className="pd-s20-isolated__row">
          <div className="pd-s20-stage pd-s20-drawer-preview">
            <NotificationCenter notifications={[]} onOpenChange={openChangeAction} open unreadCount={0} />
          </div>
          <div className="pd-s20-stage pd-s20-drawer-preview">
            <NotificationCenter
              error="Nie można pobrać powiadomień."
              notifications={[]}
              onOpenChange={openChangeAction}
              open
              unreadCount={0}
            />
          </div>
        </div>
      </StoryPresentationSection>
    </ShellPage>
  ),
  play: async ({ canvasElement }) => {
    notificationMutationAction.mockClear();
    const page = within(canvasElement.ownerDocument.body);
    const dialogs = await page.findAllByRole('dialog', { name: 'Powiadomienia' });
    const dialog = dialogs[0];
    if (!dialog) throw new Error('Notification dialog is not rendered.');
    const actions = within(dialog).getAllByText('Akcje');
    await userEvent.click(actions[0]);
    const markRead = within(dialog).queryByRole('button', { name: 'Oznacz jako przeczytane' });
    if (markRead) {
      await userEvent.click(markRead);
      await expect(notificationMutationAction).toHaveBeenCalled();
    }
  },
};
export const BackgroundOperationsStory: Story = {
  name: '20.09 Operacje w tle',
  render: () => (
    <ShellPage
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
    </ShellPage>
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
  name: '20.10 OverlayRoot i system warstw',
  render: () => (
    <ShellPage
      storyId="20.10"
      summary="Dialog, drawer, command palette i mobile shell korzystają ze wspólnego systemu warstw."
      title="OverlayRoot"
    >
      <StoryPresentationSection index="01" layout="wide" title="Warstwa dialogu">
        <div className="pd-s20-stage pd-s20-command-preview">
          <ShellLayerDemo onOpenChange={openChangeAction} open />
        </div>
      </StoryPresentationSection>
      <StoryPresentationSection index="02" layout="narrow" title="Status">
        <InlineNotice
          message="OverlayRoot jest jeden dla Dialog, Drawer i Command Palette."
          title="Brak konfliktu warstw"
          tone="success"
        />
      </StoryPresentationSection>
    </ShellPage>
  ),
};

export const MobileShellStory: Story = {
  name: '20.11 Powłoka mobilna',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <ShellPage
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
            <CommandCenterPreview />
          </ProductShellFrame>
        </div>
      </StoryPresentationSection>
    </ShellPage>
  ),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole('dialog', { name: 'Nawigacja' })).toBeInTheDocument();
  },
};

export const FooterStatusBarStory: Story = {
  name: '20.12 Pasek stopki',
  render: () => (
    <ShellPage
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
    </ShellPage>
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
