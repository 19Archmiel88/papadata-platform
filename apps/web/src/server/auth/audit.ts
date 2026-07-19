import type {
  AuditEvent,
  AuditEventType,
  AuthErrorCode,
  CorrelationId,
} from '../../contracts/auth';
import type { ActorContext } from '../../contracts/authz';
import type { InvitationId, SessionId, UserId, WorkspaceId } from '../../contracts/ids';
import { asAuditEventId, asCorrelationId } from '../../contracts/ids';
import type { TenantContext } from '../../contracts/tenant';

export type ServerAuditTarget = {
  email?: string;
  invitationId?: InvitationId;
  sessionId?: SessionId;
  userId?: UserId;
  workspaceId?: WorkspaceId;
};

export type ServerAuditInput = {
  actor?: Pick<ActorContext, 'actorId' | 'roles'>;
  correlationId?: CorrelationId;
  eventType: AuditEventType;
  reason?: AuthErrorCode | 'granted_by_fixture';
  result: AuditEvent['result'];
  target?: ServerAuditTarget;
  tenant?: Partial<TenantContext>;
};

export type ServerAuditLog = {
  append(input: ServerAuditInput): void;
  list(): readonly AuditEvent[];
};

export function createInMemoryServerAuditLog(
  now: () => Date,
  entropy: () => string,
): ServerAuditLog {
  const events: AuditEvent[] = [];

  return {
    append(input) {
      events.push({
        actor: input.actor,
        auditEventId: asAuditEventId(`aud_srv_${entropy()}`),
        correlationId: input.correlationId ?? asCorrelationId(`corr_srv_${entropy()}`),
        eventType: input.eventType,
        occurredAt: now().toISOString(),
        tenantId: input.tenant?.tenantId,
        reason: input.reason,
        result: input.result,
        source: 'auth_server',
        target: input.target,
        workspaceId: input.tenant?.workspaceId,
      });
    },
    list() {
      return events.map((event) => ({ ...event }));
    },
  };
}

export function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.split('@');
  const first = name.charAt(0) || '*';
  return `${first}***@${domain || 'redacted'}`;
}
