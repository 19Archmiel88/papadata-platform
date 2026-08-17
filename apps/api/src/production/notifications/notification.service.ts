import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProductionDatabase } from "@papadata/database";
import type { RequestPrincipal } from "../auth/request-principal.js";
import type { NotificationListView } from "./notification.dto.js";

type NotificationRow = {
  readonly notification_id: string;
  readonly notification_type: string;
  readonly priority: string;
  readonly status: "read" | "unread";
  readonly title: string;
  readonly message: string;
  readonly resource_type: string;
  readonly resource_id: string | null;
  readonly read_at: Date | string | null;
  readonly snoozed_until: Date | string | null;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
};

@Injectable()
export class NotificationService {
  constructor(
    @Inject(ProductionDatabase)
    private readonly database: ProductionDatabase,
  ) {}

  async list(principal: RequestPrincipal, view: NotificationListView) {
    return this.database.withTenantWorkspace(
      principal.tenantId,
      principal.workspaceId,
      async (client) => {
        const viewPredicate = view === "snoozed"
          ? "and snoozed_until is not null and snoozed_until > now()"
          : view === "active"
            ? "and (snoozed_until is null or snoozed_until <= now())"
            : "";
        const result = await client.query<NotificationRow>(
          `select notification_id::text, notification_type, priority, status,
                  title, message, resource_type, resource_id, read_at,
                  snoozed_until, created_at, updated_at
             from app.notifications
            where tenant_id = $1::uuid
              and workspace_id = $2::uuid
              and recipient_user_id = $3::uuid
              ${viewPredicate}
            order by
              case when priority = 'critical' then 0 when priority = 'high' then 1 else 2 end,
              created_at desc
            limit 200`,
          [principal.tenantId, principal.workspaceId, principal.userId],
        );
        const unread = await client.query<{ readonly count: string }>(
          `select count(*)::text as count
             from app.notifications
            where tenant_id = $1::uuid
              and workspace_id = $2::uuid
              and recipient_user_id = $3::uuid
              and status = 'unread'
              and (snoozed_until is null or snoozed_until <= now())`,
          [principal.tenantId, principal.workspaceId, principal.userId],
        );

        return {
          notifications: result.rows.map(toNotification),
          unreadCount: Number(unread.rows[0]?.count ?? "0"),
          view,
        };
      },
    );
  }

  markRead(principal: RequestPrincipal, notificationId: string) {
    return this.updateOwned(principal, notificationId, "read");
  }

  markUnread(principal: RequestPrincipal, notificationId: string) {
    return this.updateOwned(principal, notificationId, "unread");
  }

  async markAllRead(principal: RequestPrincipal) {
    return this.database.withTenantWorkspace(
      principal.tenantId,
      principal.workspaceId,
      async (client) => {
        const result = await client.query(
          `update app.notifications
              set status = 'read',
                  read_at = coalesce(read_at, now()),
                  updated_at = now()
            where tenant_id = $1::uuid
              and workspace_id = $2::uuid
              and recipient_user_id = $3::uuid
              and status = 'unread'
              and (snoozed_until is null or snoozed_until <= now())`,
          [principal.tenantId, principal.workspaceId, principal.userId],
        );
        return { readCount: result.rowCount ?? 0 };
      },
    );
  }

  async snooze(
    principal: RequestPrincipal,
    notificationId: string,
    untilInput: string,
  ) {
    const until = new Date(untilInput);
    const maxUntil = Date.now() + 90 * 24 * 60 * 60 * 1_000;
    if (
      !Number.isFinite(until.getTime())
      || until.getTime() <= Date.now() + 30_000
      || until.getTime() > maxUntil
    ) {
      throw new BadRequestException(
        "Snooze time must be between 30 seconds and 90 days in the future.",
      );
    }

    return this.database.withTenantWorkspace(
      principal.tenantId,
      principal.workspaceId,
      async (client) => {
        const policy = await client.query<{ readonly priority: string }>(
          `select priority
             from app.notifications
            where notification_id = $1::uuid
              and tenant_id = $2::uuid
              and workspace_id = $3::uuid
              and recipient_user_id = $4::uuid
            limit 1`,
          [notificationId, principal.tenantId, principal.workspaceId, principal.userId],
        );
        if (!policy.rows[0]) {
          throw new NotFoundException("Notification was not found.");
        }
        if (policy.rows[0].priority === "critical") {
          throw new BadRequestException("Critical notifications cannot be snoozed.");
        }

        const result = await client.query<NotificationRow>(
          `update app.notifications
              set snoozed_until = $4::timestamptz,
                  updated_at = now()
            where notification_id = $1::uuid
              and tenant_id = $2::uuid
              and workspace_id = $3::uuid
              and recipient_user_id = $5::uuid
            returning notification_id::text, notification_type, priority, status,
                      title, message, resource_type, resource_id, read_at,
                      snoozed_until, created_at, updated_at`,
          [
            notificationId,
            principal.tenantId,
            principal.workspaceId,
            until.toISOString(),
            principal.userId,
          ],
        );
        return toOwnedNotification(result.rows[0]);
      },
    );
  }

  async unsnooze(principal: RequestPrincipal, notificationId: string) {
    return this.database.withTenantWorkspace(
      principal.tenantId,
      principal.workspaceId,
      async (client) => {
        const result = await client.query<NotificationRow>(
          `update app.notifications
              set snoozed_until = null,
                  updated_at = now()
            where notification_id = $1::uuid
              and tenant_id = $2::uuid
              and workspace_id = $3::uuid
              and recipient_user_id = $4::uuid
            returning notification_id::text, notification_type, priority, status,
                      title, message, resource_type, resource_id, read_at,
                      snoozed_until, created_at, updated_at`,
          [notificationId, principal.tenantId, principal.workspaceId, principal.userId],
        );
        return toOwnedNotification(result.rows[0]);
      },
    );
  }

  private async updateOwned(
    principal: RequestPrincipal,
    notificationId: string,
    status: "read" | "unread",
  ) {
    return this.database.withTenantWorkspace(
      principal.tenantId,
      principal.workspaceId,
      async (client) => {
        const result = await client.query<NotificationRow>(
          `update app.notifications
              set status = $4,
                  read_at = case when $4 = 'read' then coalesce(read_at, now()) else null end,
                  updated_at = now()
            where notification_id = $1::uuid
              and tenant_id = $2::uuid
              and workspace_id = $3::uuid
              and recipient_user_id = $5::uuid
            returning notification_id::text, notification_type, priority, status,
                      title, message, resource_type, resource_id, read_at,
                      snoozed_until, created_at, updated_at`,
          [notificationId, principal.tenantId, principal.workspaceId, status, principal.userId],
        );
        return toOwnedNotification(result.rows[0]);
      },
    );
  }
}

function toOwnedNotification(row: NotificationRow | undefined) {
  if (!row) {
    throw new NotFoundException("Notification was not found.");
  }
  return { notification: toNotification(row) };
}

function toNotification(row: NotificationRow) {
  return {
    createdAt: iso(row.created_at),
    id: row.notification_id,
    message: row.message,
    priority: row.priority,
    readAt: isoOrNull(row.read_at),
    resource: {
      id: row.resource_id,
      type: row.resource_type,
    },
    snoozedUntil: isoOrNull(row.snoozed_until),
    status: row.status,
    title: row.title,
    type: row.notification_type,
    updatedAt: iso(row.updated_at),
  };
}

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function isoOrNull(value: Date | string | null): string | null {
  return value === null ? null : iso(value);
}
