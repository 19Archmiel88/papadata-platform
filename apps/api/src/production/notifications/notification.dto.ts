export type NotificationListView = "active" | "all" | "snoozed";

export class SnoozeNotificationDto {
  readonly until!: string;
}
