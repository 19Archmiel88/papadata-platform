import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import {
  OperationId,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { Principal } from "../auth/principal.decorator.js";
import type { RequestPrincipal } from "../auth/request-principal.js";
import { SnoozeNotificationDto, type NotificationListView } from "./notification.dto.js";
import { NotificationService } from "./notification.service.js";

@Controller("v1/notifications")
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  @OperationId("notifications.list")
  @RequireCapabilities("workspace.read")
  async list(
    @Principal() principal: RequestPrincipal,
    @Query("view") rawView?: string,
  ): Promise<object> {
    const view: NotificationListView = rawView === "snoozed" || rawView === "all"
      ? rawView
      : "active";
    return { data: await this.service.list(principal, view) };
  }

  @Post(":id/read")
  @OperationId("notifications.mark-read")
  @RequireCapabilities("workspace.read")
  async markRead(
    @Principal() principal: RequestPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) notificationId: string,
  ): Promise<object> {
    return { data: await this.service.markRead(principal, notificationId) };
  }

  @Post(":id/unread")
  @OperationId("notifications.mark-unread")
  @RequireCapabilities("workspace.read")
  async markUnread(
    @Principal() principal: RequestPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) notificationId: string,
  ): Promise<object> {
    return { data: await this.service.markUnread(principal, notificationId) };
  }

  @Post("read-all")
  @OperationId("notifications.mark-all-read")
  @RequireCapabilities("workspace.read")
  async markAllRead(
    @Principal() principal: RequestPrincipal,
  ): Promise<object> {
    return { data: await this.service.markAllRead(principal) };
  }

  @Post(":id/snooze")
  @OperationId("notifications.snooze")
  @RequireCapabilities("workspace.read")
  async snooze(
    @Principal() principal: RequestPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) notificationId: string,
    @Body() input: SnoozeNotificationDto,
  ): Promise<object> {
    return {
      data: await this.service.snooze(principal, notificationId, input.until),
    };
  }

  @Post(":id/unsnooze")
  @OperationId("notifications.unsnooze")
  @RequireCapabilities("workspace.read")
  async unsnooze(
    @Principal() principal: RequestPrincipal,
    @Param("id", new ParseUUIDPipe({ version: "4" })) notificationId: string,
  ): Promise<object> {
    return { data: await this.service.unsnooze(principal, notificationId) };
  }
}
