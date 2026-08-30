import type {
  ShellCommandResult,
  ShellNavigationGroup,
} from './shellTypes';

type RuntimeItem = ShellNavigationGroup['items'][number] & {
  readonly capabilities?: readonly string[];
};

type RuntimeGroup = Omit<ShellNavigationGroup, 'items'> & {
  readonly items: readonly RuntimeItem[];
};

const runtimeCapabilityAliases: Readonly<Record<string, readonly string[]>> = {
  'ai.assistant.run': ['ai.read', 'ai.use', 'decisions.read'],
  'analytics.command_center.read': ['analytics.read', 'decisions.read'],
  'analytics.metrics.read': [
    'analytics.read',
    'campaigns.read',
    'customers.read',
    'orders.read',
    'products.read',
    'traffic.read',
  ],
  'billing.manage': ['billing.read'],
  'integrations.catalog.read': ['integrations.read'],
  'integrations.connection.read': ['integrations.read'],
  'settings.manage': ['settings.read'],
  'workspace.read': ['help.read', 'settings.read'],
};

const runtimeNavigation: readonly RuntimeGroup[] = [
  {
    id: 'analytics',
    label: 'Analiza',
    items: [
      { capabilities: ['analytics.read', 'analytics.command_center.read', 'analytics.metrics.read'], icon: 'home', id: 'command-center', label: 'Centrum Dowodzenia', path: '/app/command-center' },
      { capabilities: ['analytics.read', 'campaigns.read'], icon: 'trend', id: 'campaigns', label: 'Kampanie płatne', path: '/app/campaigns' },
      { capabilities: ['analytics.read', 'orders.read'], icon: 'data', id: 'orders', label: 'Zamówienia', path: '/app/orders' },
      { capabilities: ['analytics.read', 'products.read'], icon: 'products', id: 'products', label: 'Produkty', path: '/app/products' },
      { capabilities: ['analytics.read', 'customers.read'], icon: 'customers', id: 'customers', label: 'Klienci', path: '/app/customers' },
      { capabilities: ['analytics.read', 'traffic.read'], icon: 'trend', id: 'traffic', label: 'Ruch na stronie', path: '/app/traffic' },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    items: [
      { capabilities: ['ai.assistant.run', 'ai.use', 'ai.read'], icon: 'assistant', id: 'papa', label: 'Laboratorium Papa Asystenta', path: '/app/papa' },
    ],
  },
  {
    id: 'data-integrations',
    label: 'Dane i integracje',
    items: [
      {
        capabilities: ['integrations.read', 'integrations.connection.read', 'integrations.catalog.read'],
        icon: 'integration',
        id: 'integrations',
        label: 'Integracje',
        path: '/app/integrations/sources',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administracja',
    items: [
      { capabilities: ['settings.read', 'settings.manage', 'workspace.read'], icon: 'security', id: 'settings', label: 'Ustawienia', path: '/app/settings/organizacja' },
      { capabilities: ['billing.read', 'billing.manage'], icon: 'billing', id: 'billing', label: 'Subskrypcja i płatności', path: '/app/billing/subskrypcja' },
    ],
  },
  {
    id: 'support',
    label: 'Wsparcie',
    items: [
      { capabilities: ['decisions.read', 'decisions.manage'], icon: 'decisions', id: 'decisions', label: 'Wsparcie w marketingu', path: '/app/decisions/centrum-decyzji' },
      { capabilities: ['help.read', 'workspace.read'], icon: 'help', id: 'help', label: 'Centrum Pomocy', path: '/app/help/strona-glowna-pomocy' },
    ],
  },
];

export function createRuntimeShellNavigation(
  capabilities: readonly string[],
): readonly ShellNavigationGroup[] {
  return runtimeNavigation.flatMap((group): readonly ShellNavigationGroup[] => {
    const items = group.items
      .filter((item) => hasAnyCapability(capabilities, item.capabilities ?? []))
      .map(({ capabilities: _requiredCapabilities, ...item }) => item);
    return items.length > 0 ? [{ ...group, items }] : [];
  });
}

export function createRuntimeShellCommands(
  navigationGroups: readonly ShellNavigationGroup[],
): readonly ShellCommandResult[] {
  const navigation = navigationGroups
    .flatMap((group) => group.items)
    .filter((item) => !item.disabled)
    .map((item): ShellCommandResult => ({
      description: `Przejdź do: ${item.label}.`,
      id: `navigate-${item.id}`,
      keywords: [item.label, item.id],
      label: item.label,
      path: item.path,
      section: 'Nawigacja',
    }));

  const papaAvailable = navigationGroups.some((group) => (
    group.items.some((item) => item.id === 'papa' && !item.disabled)
  ));
  const papaCommands: readonly ShellCommandResult[] = papaAvailable
    ? [
        {
          action: 'open-papa',
          description: 'Otwórz Papa Asystenta z kontekstem bieżącego ekranu.',
          id: 'open-papa-assistant',
          keywords: ['papa', 'asystent', 'ai'],
          label: 'Otwórz Papa Asystenta',
          path: '/app/papa',
          section: 'Papa',
        },
        {
          action: 'analyze-screen',
          description: 'Przekaż bieżący ekran do analizy Papa.',
          id: 'analyze-current-screen',
          keywords: ['analiza', 'ekran', 'papa'],
          label: 'Analizuj bieżący ekran',
          path: '/app/papa',
          section: 'Papa',
        },
      ]
    : [];

  return [...papaCommands, ...navigation];
}

function hasAnyCapability(
  capabilities: readonly string[],
  required: readonly string[],
): boolean {
  if (required.length === 0) return true;
  const available = expandRuntimeCapabilities(capabilities);
  return required.some((capability) => available.has(capability));
}

function expandRuntimeCapabilities(
  capabilities: readonly string[],
): ReadonlySet<string> {
  const available = new Set<string>();

  capabilities.forEach((capability) => {
    available.add(capability);

    runtimeCapabilityAliases[capability]?.forEach((alias) => {
      available.add(alias);
    });
  });

  return available;
}
