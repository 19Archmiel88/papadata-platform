import type { BffClient, SettingsMembershipRow } from '../../runtime/shared/api/bffClient';
import type {
  SettingsInvitation,
  SettingsTeamMember,
} from '../../fixtures/settings-governance/settingsGovernanceDemoSeed';

// The set of roles a tenant admin can grant via invitation. Mirrors
// apps/api's contract-runtime.service.ts INVITABLE_ROLES exactly -- keep the
// two lists in sync if the backend's list ever changes. "Tenant Owner" is
// included because the backend accepts it (co-ownership is allowed); this
// list is the sole source of truth for what the invite form may submit,
// since inviting an uninvitable role fails server-side with a 400.
export const settingsInvitableRoles: readonly {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}[] = [
  { value: 'Tenant Owner', label: 'Tenant Owner', description: 'Pełny dostęp do organizacji, rozliczeń i bezpieczeństwa' },
  { value: 'Workspace Admin', label: 'Workspace Admin', description: 'Zarządza przestrzenią pracy i integracjami' },
  { value: 'Analyst', label: 'Analyst', description: 'Odczyt danych i raportów, konfiguracja analityki' },
  { value: 'Marketing Operator', label: 'Marketing Operator', description: 'Zarządza kampaniami i budżetem' },
  { value: 'Viewer', label: 'Viewer', description: 'Dostęp wyłącznie do odczytu' },
  { value: 'Billing Admin', label: 'Billing Admin', description: 'Dostęp do rozliczeń i faktur' },
  { value: 'Auditor/Security', label: 'Auditor/Security', description: 'Dostęp do audytu i bezpieczeństwa' },
];

export type SettingsMembershipsView = {
  readonly members: readonly SettingsTeamMember[];
  readonly invitations: readonly SettingsInvitation[];
};

// settings.memberships.read returns one merged list (see MemberListRow in
// packages/database/src/product-domain.ts): active/disabled memberships and
// pending invitations together, the latter tagged status === 'invited' with
// the invitation id standing in for a membership id. This splits it back
// into the two shapes SettingsGovernanceScreen's Team section renders.
export function toSettingsMembershipsView(
  rows: readonly SettingsMembershipRow[],
): SettingsMembershipsView {
  const members: SettingsTeamMember[] = [];
  const invitations: SettingsInvitation[] = [];

  for (const row of rows) {
    if (row.status === 'invited') {
      invitations.push({
        id: row.id,
        email: row.email,
        role: row.role,
        sentAt: formatDate(row.lastSeenAt),
        // settings.memberships.read does not return an invitation's
        // expiry, only its creation time -- there is no data to show here.
        expiresAt: '—',
      });
      continue;
    }
    members.push({
      id: row.id,
      name: row.person,
      email: row.email,
      role: row.role,
      mfa: row.mfa,
      lastSeen: formatDate(row.lastSeenAt),
    });
  }

  return { members, invitations };
}

export async function loadSettingsMemberships(client: BffClient): Promise<SettingsMembershipsView> {
  const { items } = await client.readSettingsMemberships();
  return toSettingsMembershipsView(items);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}
