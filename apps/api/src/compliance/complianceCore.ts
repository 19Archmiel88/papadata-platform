import type { IsoDateTime } from "@papadata/contracts";

import type {
  AccessPolicyDecision,
  AccessService,
} from "../access/accessCore.ts";
import {
  responseMeta,
  toIso,
} from "../auth/authCore.ts";
import type {
  AuthErrorCode,
  AuthRandomSource,
  AuthService,
  AuthServiceResult,
  AuthenticatedPrincipal,
  RequestContext,
} from "../auth/authCore.ts";

export const COMPLIANCE_POLICY_VERSION = "compliance-policy.v1";

export const cookieCategories = [
  "necessary",
  "preferences",
  "analytics",
  "marketing",
] as const;

export type CookieCategory = (typeof cookieCategories)[number];

export type CookieConsentSettings = Record<CookieCategory, boolean>;

export type CookieConsentRecord = {
  readonly categories: CookieConsentSettings;
  readonly consentId: string;
  readonly createdAt: IsoDateTime;
  readonly subjectId: string;
  readonly tenantId: string | null;
  readonly updatedAt: IsoDateTime;
  readonly userId: string | null;
  readonly version: typeof COMPLIANCE_POLICY_VERSION;
  readonly workspaceId: string | null;
};

export const legalDocumentTypes = [
  "cookie_policy",
  "data_processing_terms",
  "privacy_notice",
  "terms_of_service",
] as const;

export type LegalDocumentType = (typeof legalDocumentTypes)[number];

export type LegalDocumentStatus = "active" | "superseded";

export type LegalDocumentRecord = {
  readonly body: string;
  readonly documentId: string;
  readonly effectiveAt: IsoDateTime;
  readonly status: LegalDocumentStatus;
  readonly title: string;
  readonly type: LegalDocumentType;
  readonly version: string;
};

export type LegalAcceptanceRecord = {
  readonly acceptedAt: IsoDateTime;
  readonly acceptanceId: string;
  readonly documentId: string;
  readonly documentType: LegalDocumentType;
  readonly documentVersion: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly workspaceId: string;
};

export const notificationTypes = [
  "approval_required",
  "high_returns",
  "inventory_shortage_risk",
  "plan_limit_reached",
  "readiness_blocked",
  "report_ready",
  "stale_data",
  "sync_failed",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export type NotificationPriority = "critical" | "high" | "medium";

export type NotificationStatus = "read" | "unread";

export type NotificationRecord = {
  readonly createdAt: IsoDateTime;
  readonly message: string;
  readonly notificationId: string;
  readonly ownerUserId: string | null;
  readonly priority: NotificationPriority;
  readonly readAt: IsoDateTime | null;
  readonly recipientUserId: string;
  readonly resource: {
    readonly id: string | null;
    readonly type: string;
  };
  readonly status: NotificationStatus;
  readonly tenantId: string;
  readonly title: string;
  readonly type: NotificationType;
  readonly workspaceId: string;
};

export type ComplianceAuditEventRecord = {
  readonly action: ComplianceAuditAction;
  readonly actorType: "anonymous" | "system" | "user";
  readonly actorUserId: string | null;
  readonly auditEventId: string;
  readonly authStrength: "mfa" | "none" | "password";
  readonly correlationId: string;
  readonly dataClassification: "legal" | "metadata" | "privacy";
  readonly occurredAt: IsoDateTime;
  readonly operationId: string;
  readonly policyVersion: typeof COMPLIANCE_POLICY_VERSION;
  readonly result: "denied" | "success";
  readonly targetId: string | null;
  readonly targetType: string;
  readonly tenantId: string | null;
  readonly workspaceId: string | null;
};

export type ComplianceAuditAction =
  | "cookie_consent.read"
  | "cookie_consent.updated"
  | "legal.acceptance.created"
  | "legal.acceptance.read"
  | "legal.document.read"
  | "notification.created"
  | "notification.listed"
  | "notification.marked_read"
  | "notification.marked_read_all";

export type ComplianceStateSnapshot = {
  readonly auditEvents: readonly ComplianceAuditEventRecord[];
  readonly cookieConsents: readonly CookieConsentRecord[];
  readonly legalAcceptances: readonly LegalAcceptanceRecord[];
  readonly legalDocuments: readonly LegalDocumentRecord[];
  readonly notifications: readonly NotificationRecord[];
};

export type ComplianceStateStore = {
  appendAudit: (event: ComplianceAuditEventRecord) => MaybePromise<void>;
  findCookieConsent: (subjectId: string) => MaybePromise<CookieConsentRecord | undefined>;
  findLegalAcceptance: (
    userId: string,
    tenantId: string,
    workspaceId: string,
    documentId: string,
  ) => MaybePromise<LegalAcceptanceRecord | undefined>;
  findLegalDocument: (
    type: LegalDocumentType,
    version?: string,
  ) => MaybePromise<LegalDocumentRecord | undefined>;
  findNotification: (notificationId: string) => MaybePromise<NotificationRecord | undefined>;
  listLegalAcceptancesByUser: (
    userId: string,
    tenantId: string,
    workspaceId: string,
  ) => MaybePromise<readonly LegalAcceptanceRecord[]>;
  listLegalDocuments: () => MaybePromise<readonly LegalDocumentRecord[]>;
  listNotifications: (
    userId: string,
    tenantId: string,
    workspaceId: string,
  ) => MaybePromise<readonly NotificationRecord[]>;
  saveCookieConsent: (consent: CookieConsentRecord) => MaybePromise<void>;
  saveLegalAcceptance: (acceptance: LegalAcceptanceRecord) => MaybePromise<void>;
  saveLegalDocument: (document: LegalDocumentRecord) => MaybePromise<void>;
  saveNotification: (notification: NotificationRecord) => MaybePromise<void>;
  snapshot: () => MaybePromise<ComplianceStateSnapshot>;
};

export type MaybePromise<TValue> = TValue | Promise<TValue>;

export class InMemoryComplianceState implements ComplianceStateStore {
  private readonly auditEvents = new Map<string, ComplianceAuditEventRecord>();

  private readonly cookieConsents = new Map<string, CookieConsentRecord>();

  private readonly legalAcceptances = new Map<string, LegalAcceptanceRecord>();

  private readonly legalDocuments = new Map<string, LegalDocumentRecord>();

  private readonly notifications = new Map<string, NotificationRecord>();

  appendAudit(event: ComplianceAuditEventRecord): void {
    this.auditEvents.set(event.auditEventId, event);
  }

  findCookieConsent(subjectId: string): CookieConsentRecord | undefined {
    return this.cookieConsents.get(subjectId);
  }

  saveCookieConsent(consent: CookieConsentRecord): void {
    this.cookieConsents.set(consent.subjectId, consent);
  }

  findLegalDocument(
    type: LegalDocumentType,
    version?: string,
  ): LegalDocumentRecord | undefined {
    return [...this.legalDocuments.values()]
      .filter(
        (document) =>
          document.type === type &&
          (version ? document.version === version : document.status === "active"),
      )
      .sort((left, right) => right.effectiveAt.localeCompare(left.effectiveAt))[0];
  }

  saveLegalDocument(document: LegalDocumentRecord): void {
    this.legalDocuments.set(document.documentId, document);
  }

  listLegalDocuments(): readonly LegalDocumentRecord[] {
    return [...this.legalDocuments.values()].sort((left, right) =>
      left.type.localeCompare(right.type),
    );
  }

  findLegalAcceptance(
    userId: string,
    tenantId: string,
    workspaceId: string,
    documentId: string,
  ): LegalAcceptanceRecord | undefined {
    return this.legalAcceptances.get(
      acceptanceKey(userId, tenantId, workspaceId, documentId),
    );
  }

  saveLegalAcceptance(acceptance: LegalAcceptanceRecord): void {
    this.legalAcceptances.set(
      acceptanceKey(
        acceptance.userId,
        acceptance.tenantId,
        acceptance.workspaceId,
        acceptance.documentId,
      ),
      acceptance,
    );
  }

  listLegalAcceptancesByUser(
    userId: string,
    tenantId: string,
    workspaceId: string,
  ): readonly LegalAcceptanceRecord[] {
    return [...this.legalAcceptances.values()]
      .filter(
        (acceptance) =>
          acceptance.userId === userId &&
          acceptance.tenantId === tenantId &&
          acceptance.workspaceId === workspaceId,
      )
      .sort((left, right) => right.acceptedAt.localeCompare(left.acceptedAt));
  }

  findNotification(notificationId: string): NotificationRecord | undefined {
    return this.notifications.get(notificationId);
  }

  saveNotification(notification: NotificationRecord): void {
    this.notifications.set(notification.notificationId, notification);
  }

  listNotifications(
    userId: string,
    tenantId: string,
    workspaceId: string,
  ): readonly NotificationRecord[] {
    return [...this.notifications.values()]
      .filter(
        (notification) =>
          notification.recipientUserId === userId &&
          notification.tenantId === tenantId &&
          notification.workspaceId === workspaceId,
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  snapshot(): ComplianceStateSnapshot {
    return {
      auditEvents: [...this.auditEvents.values()],
      cookieConsents: [...this.cookieConsents.values()],
      legalAcceptances: [...this.legalAcceptances.values()],
      legalDocuments: [...this.legalDocuments.values()],
      notifications: [...this.notifications.values()],
    };
  }
}

export type CookieConsentInput = Partial<Record<CookieCategory, boolean>>;

export type LegalAcceptanceInput = {
  readonly type: LegalDocumentType;
  readonly version?: string;
};

export class ComplianceService {
  private readonly accessService: AccessService;

  private readonly authService: AuthService;

  private readonly random: AuthRandomSource;

  private readonly state: ComplianceStateStore;

  constructor(options: {
    readonly accessService: AccessService;
    readonly authService: AuthService;
    readonly random: AuthRandomSource;
    readonly state?: ComplianceStateStore;
  }) {
    this.accessService = options.accessService;
    this.authService = options.authService;
    this.random = options.random;
    this.state = options.state ?? new InMemoryComplianceState();
  }

  async getSnapshot(): Promise<ComplianceStateSnapshot> {
    await this.ensureLegalDocuments();
    return this.state.snapshot();
  }

  async getCookieConsent(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ consent: CookieConsentRecord }>> {
    const subject = await this.consentSubject(context);
    const consent = (await this.state.findCookieConsent(subject.subjectId)) ??
      defaultCookieConsent(subject, context, this.random.uuid());
    await this.audit(
      "cookie_consent.read",
      "success",
      context,
      subject.principal,
      {
        dataClassification: "privacy",
        targetId: consent.consentId,
        targetType: "cookie_consent",
        tenantId: consent.tenantId,
        workspaceId: consent.workspaceId,
      },
    );

    return this.ok({ consent }, 200, context);
  }

  async updateCookieConsent(
    input: CookieConsentInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ consent: CookieConsentRecord }>> {
    const subject = await this.consentSubject(context);
    const existing = await this.state.findCookieConsent(subject.subjectId);
    const consent = {
      categories: {
        analytics: Boolean(input.analytics),
        marketing: Boolean(input.marketing),
        necessary: true,
        preferences: Boolean(input.preferences),
      },
      consentId: existing?.consentId ?? this.random.uuid(),
      createdAt: existing?.createdAt ?? toIso(context.now),
      subjectId: subject.subjectId,
      tenantId: subject.tenantId,
      updatedAt: toIso(context.now),
      userId: subject.userId,
      version: COMPLIANCE_POLICY_VERSION,
      workspaceId: subject.workspaceId,
    } satisfies CookieConsentRecord;
    await this.state.saveCookieConsent(consent);
    await this.audit(
      "cookie_consent.updated",
      "success",
      context,
      subject.principal,
      {
        dataClassification: "privacy",
        targetId: consent.consentId,
        targetType: "cookie_consent",
        tenantId: consent.tenantId,
        workspaceId: consent.workspaceId,
      },
    );

    return this.ok({ consent }, 200, context);
  }

  async listLegalDocuments(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ documents: CursorPage<LegalDocumentRecord> }>> {
    await this.ensureLegalDocuments();
    await this.audit("legal.document.read", "success", context, undefined, {
      dataClassification: "legal",
      targetId: null,
      targetType: "legal_documents",
      tenantId: null,
      workspaceId: null,
    });

    return this.ok(
      {
        documents: toCursorPage(
          (await this.state.listLegalDocuments()).filter(
            (document) => document.status === "active",
          ),
        ),
      },
      200,
      context,
    );
  }

  async getLegalDocument(
    type: string,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ document: LegalDocumentRecord }>> {
    await this.ensureLegalDocuments();
    const documentType = parseLegalDocumentType(type);

    if (!documentType) {
      return this.fail("NOT_FOUND", "Legal document was not found.", 404, context);
    }

    const document = await this.state.findLegalDocument(documentType);

    if (!document) {
      return this.fail("NOT_FOUND", "Legal document was not found.", 404, context);
    }

    await this.audit("legal.document.read", "success", context, undefined, {
      dataClassification: "legal",
      targetId: document.documentId,
      targetType: "legal_document",
      tenantId: null,
      workspaceId: null,
    });

    return this.ok({ document }, 200, context);
  }

  async acceptLegalDocument(
    input: LegalAcceptanceInput,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ acceptance: LegalAcceptanceRecord }>> {
    const authorized = await this.accessService.authorizeSelectedContext(
      context,
      "legal.acceptance.write",
    );

    if (!authorized.ok) {
      return authorized.result;
    }

    await this.ensureLegalDocuments();
    const document = await this.state.findLegalDocument(input.type, input.version);

    if (!document) {
      return this.fail("NOT_FOUND", "Legal document was not found.", 404, context);
    }

    const existing = await this.state.findLegalAcceptance(
      authorized.principal.user.userId,
      authorized.tenantId,
      authorized.workspaceId,
      document.documentId,
    );

    if (existing) {
      return this.ok({ acceptance: existing }, 200, context);
    }

    const acceptance: LegalAcceptanceRecord = {
      acceptanceId: this.random.uuid(),
      acceptedAt: toIso(context.now),
      documentId: document.documentId,
      documentType: document.type,
      documentVersion: document.version,
      tenantId: authorized.tenantId,
      userId: authorized.principal.user.userId,
      workspaceId: authorized.workspaceId,
    };
    await this.state.saveLegalAcceptance(acceptance);
    await this.auditFromDecision(
      "legal.acceptance.created",
      context,
      authorized,
      "legal",
      "legal_acceptance",
      acceptance.acceptanceId,
    );

    return this.ok({ acceptance }, 201, context);
  }

  async myLegalAcceptances(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ acceptances: CursorPage<LegalAcceptanceRecord> }>> {
    const authorized = await this.accessService.authorizeSelectedContext(context, "legal.read");

    if (!authorized.ok) {
      return authorized.result;
    }

    const acceptances = await this.state.listLegalAcceptancesByUser(
      authorized.principal.user.userId,
      authorized.tenantId,
      authorized.workspaceId,
    );
    await this.auditFromDecision(
      "legal.acceptance.read",
      context,
      authorized,
      "legal",
      "legal_acceptances",
      null,
    );

    return this.ok({ acceptances: toCursorPage(acceptances) }, 200, context);
  }

  async listNotifications(
    context: RequestContext,
  ): Promise<
    AuthServiceResult<{
      notifications: CursorPage<NotificationRecord>;
      unreadCount: number;
    }>
  > {
    const authorized = await this.accessService.authorizeSelectedContext(
      context,
      "notification.read",
    );

    if (!authorized.ok) {
      return authorized.result;
    }

    const notifications = await this.state.listNotifications(
      authorized.principal.user.userId,
      authorized.tenantId,
      authorized.workspaceId,
    );
    await this.auditFromDecision(
      "notification.listed",
      context,
      authorized,
      "metadata",
      "notifications",
      null,
    );

    return this.ok(
      {
        notifications: toCursorPage(notifications),
        unreadCount: notifications.filter((notification) => notification.status === "unread").length,
      },
      200,
      context,
    );
  }

  async markNotificationRead(
    notificationId: string,
    context: RequestContext,
  ): Promise<AuthServiceResult<{ notification: NotificationRecord }>> {
    const notification = await this.state.findNotification(notificationId);

    if (!notification) {
      return this.fail("NOT_FOUND", "Notification was not found.", 404, context);
    }

    const authorized = await this.accessService.authorizeSelectedContext(
      context,
      "notification.update",
      notification.tenantId,
      notification.workspaceId,
    );

    if (!authorized.ok) {
      return authorized.result;
    }

    if (notification.recipientUserId !== authorized.principal.user.userId) {
      return this.fail("NOT_FOUND", "Notification was not found.", 404, context);
    }

    const updated = {
      ...notification,
      readAt: notification.readAt ?? toIso(context.now),
      status: "read",
    } satisfies NotificationRecord;
    await this.state.saveNotification(updated);
    await this.auditFromDecision(
      "notification.marked_read",
      context,
      authorized,
      "metadata",
      "notification",
      updated.notificationId,
    );

    return this.ok({ notification: updated }, 200, context);
  }

  async markAllNotificationsRead(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ readCount: number }>> {
    const authorized = await this.accessService.authorizeSelectedContext(
      context,
      "notification.update",
    );

    if (!authorized.ok) {
      return authorized.result;
    }

    const notifications = await this.state.listNotifications(
      authorized.principal.user.userId,
      authorized.tenantId,
      authorized.workspaceId,
    );
    let readCount = 0;

    for (const notification of notifications) {
      if (notification.status === "read") {
        continue;
      }

      readCount += 1;
      await this.state.saveNotification({
        ...notification,
        readAt: toIso(context.now),
        status: "read",
      });
    }

    await this.auditFromDecision(
      "notification.marked_read_all",
      context,
      authorized,
      "metadata",
      "notifications",
      null,
    );

    return this.ok({ readCount }, 200, context);
  }

  async createNotificationForTest(input: {
    readonly message?: string;
    readonly ownerUserId?: string | null;
    readonly priority?: NotificationPriority;
    readonly recipientUserId: string;
    readonly resourceId?: string | null;
    readonly resourceType?: string;
    readonly tenantId: string;
    readonly title?: string;
    readonly type: NotificationType;
    readonly workspaceId: string;
  }): Promise<NotificationRecord> {
    const notification = {
      createdAt: toIso(new Date()),
      message: input.message ?? defaultNotificationCopy[input.type].message,
      notificationId: this.random.uuid(),
      ownerUserId: input.ownerUserId ?? null,
      priority: input.priority ?? defaultNotificationCopy[input.type].priority,
      readAt: null,
      recipientUserId: input.recipientUserId,
      resource: {
        id: input.resourceId ?? null,
        type: input.resourceType ?? defaultNotificationCopy[input.type].resourceType,
      },
      status: "unread",
      tenantId: input.tenantId,
      title: input.title ?? defaultNotificationCopy[input.type].title,
      type: input.type,
      workspaceId: input.workspaceId,
    } satisfies NotificationRecord;
    await this.state.saveNotification(notification);
    await this.audit("notification.created", "success", testAuditContext(), undefined, {
      dataClassification: "metadata",
      targetId: notification.notificationId,
      targetType: "notification",
      tenantId: notification.tenantId,
      workspaceId: notification.workspaceId,
    });
    return notification;
  }

  private async consentSubject(context: RequestContext): Promise<{
    readonly principal?: AuthenticatedPrincipal;
    readonly subjectId: string;
    readonly tenantId: string | null;
    readonly userId: string | null;
    readonly workspaceId: string | null;
  }> {
    const principal = await this.authService.getAuthenticatedPrincipal(context);

    if (!principal) {
      return {
        subjectId: `anonymous:${context.ip}:${context.userAgent}`,
        tenantId: null,
        userId: null,
        workspaceId: null,
      };
    }

    return {
      principal,
      subjectId: `user:${principal.user.userId}`,
      tenantId: principal.session.activeTenantId ?? null,
      userId: principal.user.userId,
      workspaceId: principal.session.activeWorkspaceId ?? null,
    };
  }

  private async ensureLegalDocuments(): Promise<void> {
    const existing = await this.state.listLegalDocuments();

    if (existing.length > 0) {
      return;
    }

    for (const document of defaultLegalDocuments) {
      await this.state.saveLegalDocument(document);
    }
  }

  private async auditFromDecision(
    action: ComplianceAuditAction,
    context: RequestContext,
    authorized: {
      readonly decision: AccessPolicyDecision;
      readonly principal: AuthenticatedPrincipal;
      readonly tenantId: string;
      readonly workspaceId: string;
    },
    dataClassification: ComplianceAuditEventRecord["dataClassification"],
    targetType: string,
    targetId: string | null,
  ): Promise<void> {
    await this.audit(action, "success", context, authorized.principal, {
      authStrength: authorized.decision.authStrength,
      dataClassification,
      targetId,
      targetType,
      tenantId: authorized.tenantId,
      workspaceId: authorized.workspaceId,
    });
  }

  private async audit(
    action: ComplianceAuditAction,
    result: ComplianceAuditEventRecord["result"],
    context: RequestContext,
    principal: AuthenticatedPrincipal | undefined,
    target: {
      readonly authStrength?: ComplianceAuditEventRecord["authStrength"];
      readonly dataClassification: ComplianceAuditEventRecord["dataClassification"];
      readonly targetId: string | null;
      readonly targetType: string;
      readonly tenantId: string | null;
      readonly workspaceId: string | null;
    },
  ): Promise<void> {
    await this.state.appendAudit({
      action,
      actorType: principal ? "user" : "anonymous",
      actorUserId: principal?.user.userId ?? null,
      auditEventId: this.random.uuid(),
      authStrength: target.authStrength ?? principal?.session.authStrength ?? "none",
      correlationId: context.correlationId,
      dataClassification: target.dataClassification,
      occurredAt: toIso(context.now),
      operationId: context.correlationId || this.random.operationId(),
      policyVersion: COMPLIANCE_POLICY_VERSION,
      result,
      targetId: target.targetId,
      targetType: target.targetType,
      tenantId: target.tenantId,
      workspaceId: target.workspaceId,
    });
  }

  private ok<TData>(
    data: TData,
    status: number,
    context: RequestContext,
  ): AuthServiceResult<TData> {
    return {
      body: {
        data,
        meta: responseMeta(context),
      },
      status,
    };
  }

  private fail(
    code: AuthErrorCode,
    message: string,
    status: number,
    context: RequestContext,
    retryable = false,
  ): AuthServiceResult<never> {
    return {
      body: {
        error: {
          code,
          contractVersion: responseMeta(context).contractVersion,
          correlationId: context.correlationId,
          message,
          retryable,
        },
        meta: {
          ...responseMeta(context),
          limitations: [code],
        },
      },
      status,
    };
  }
}

export type CursorPage<TItem> = {
  readonly items: readonly TItem[];
  readonly pageInfo: {
    readonly endCursor: string | null;
    readonly hasNextPage: false;
    readonly hasPreviousPage: false;
    readonly startCursor: string | null;
  };
};

function toCursorPage<TItem>(items: readonly TItem[]): CursorPage<TItem> {
  return {
    items,
    pageInfo: {
      endCursor: items.length ? String(items.length - 1) : null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: items.length ? "0" : null,
    },
  };
}

function defaultCookieConsent(
  subject: {
    readonly subjectId: string;
    readonly tenantId: string | null;
    readonly userId: string | null;
    readonly workspaceId: string | null;
  },
  context: RequestContext,
  consentId: string,
): CookieConsentRecord {
  return {
    categories: {
      analytics: false,
      marketing: false,
      necessary: true,
      preferences: false,
    },
    consentId,
    createdAt: toIso(context.now),
    subjectId: subject.subjectId,
    tenantId: subject.tenantId,
    updatedAt: toIso(context.now),
    userId: subject.userId,
    version: COMPLIANCE_POLICY_VERSION,
    workspaceId: subject.workspaceId,
  };
}

function parseLegalDocumentType(value: string): LegalDocumentType | undefined {
  return legalDocumentTypes.find((type) => type === value);
}

function acceptanceKey(
  userId: string,
  tenantId: string,
  workspaceId: string,
  documentId: string,
): string {
  return `${userId}:${tenantId}:${workspaceId}:${documentId}`;
}

function testAuditContext(): RequestContext {
  return {
    correlationId: "corr_test",
    ip: "127.0.0.1",
    now: new Date(),
    userAgent: "node-test",
  };
}

const defaultLegalDocuments = [
  {
    body: "PapaData privacy notice for application users.",
    documentId: "legal_privacy_notice_2026_07",
    effectiveAt: "2026-07-18T00:00:00.000Z" as IsoDateTime,
    status: "active",
    title: "Privacy Notice",
    type: "privacy_notice",
    version: "2026-07",
  },
  {
    body: "PapaData terms of service for workspace usage.",
    documentId: "legal_terms_of_service_2026_07",
    effectiveAt: "2026-07-18T00:00:00.000Z" as IsoDateTime,
    status: "active",
    title: "Terms of Service",
    type: "terms_of_service",
    version: "2026-07",
  },
  {
    body: "PapaData cookie policy for necessary, preferences, analytics and marketing categories.",
    documentId: "legal_cookie_policy_2026_07",
    effectiveAt: "2026-07-18T00:00:00.000Z" as IsoDateTime,
    status: "active",
    title: "Cookie Policy",
    type: "cookie_policy",
    version: "2026-07",
  },
  {
    body: "PapaData data processing terms for customer workspace data.",
    documentId: "legal_data_processing_terms_2026_07",
    effectiveAt: "2026-07-18T00:00:00.000Z" as IsoDateTime,
    status: "active",
    title: "Data Processing Terms",
    type: "data_processing_terms",
    version: "2026-07",
  },
] as const satisfies readonly LegalDocumentRecord[];

const defaultNotificationCopy = {
  approval_required: {
    message: "A human approval is required before this action can continue.",
    priority: "high",
    resourceType: "approval",
    title: "Approval required",
  },
  high_returns: {
    message: "Return rate is above the configured threshold.",
    priority: "medium",
    resourceType: "metric",
    title: "High returns",
  },
  inventory_shortage_risk: {
    message: "Inventory can run out before the next replenishment window.",
    priority: "high",
    resourceType: "inventory",
    title: "Inventory shortage risk",
  },
  plan_limit_reached: {
    message: "A plan usage limit was reached for this workspace.",
    priority: "high",
    resourceType: "billing",
    title: "Plan limit reached",
  },
  readiness_blocked: {
    message: "Readiness is blocked and some analytics cannot be trusted.",
    priority: "critical",
    resourceType: "readiness",
    title: "Readiness blocked",
  },
  report_ready: {
    message: "A requested report is ready to download.",
    priority: "medium",
    resourceType: "report",
    title: "Report ready",
  },
  stale_data: {
    message: "Data freshness is outside the accepted window.",
    priority: "medium",
    resourceType: "dataset",
    title: "Stale data",
  },
  sync_failed: {
    message: "A source synchronization failed and requires recovery.",
    priority: "high",
    resourceType: "sync_job",
    title: "Synchronization failed",
  },
} as const satisfies Record<
  NotificationType,
  {
    readonly message: string;
    readonly priority: NotificationPriority;
    readonly resourceType: string;
    readonly title: string;
  }
>;
