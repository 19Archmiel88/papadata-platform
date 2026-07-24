import { createHash, scrypt, randomBytes, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import {
  AUTH_API_BASE_PATH,
  AUTH_BASE_PATH,
  AUTH_CONTRACT_VERSION,
  AuthService,
  InMemoryAuthState,
  authCookieNames,
  csrfHeaderName,
  responseMeta,
} from "./src/auth/authCore.ts";
import { AccessService, InMemoryAccessState } from "./src/access/accessCore.ts";
import { ComplianceService, InMemoryComplianceState } from "./src/compliance/complianceCore.ts";
import { DashboardMetricService, InMemoryMetricState } from "./src/metrics/metricEngineCore.ts";
import {
  InMemoryRemainingBackendState,
  RemainingBackendService,
} from "./src/operations/remainingBackendCore.ts";
import { RedisAuthState } from "./redisAuthState.mjs";

const scryptAsync = promisify(scrypt);
const jsonContentType = "application/json; charset=utf-8";

export function createNodeSecretHasher() {
  return {
    async hashSecret(value, purpose) {
      const salt = randomBytes(16).toString("hex");
      const digest = await deriveDigest(value, purpose, salt);

      return {
        algorithm: "scrypt.v1",
        digest,
        salt,
      };
    },

    async verifySecret(value, purpose, hash) {
      const digest = await deriveDigest(value, purpose, hash.salt);
      const left = Buffer.from(digest, "hex");
      const right = Buffer.from(hash.digest, "hex");

      if (left.byteLength !== right.byteLength) {
        return false;
      }

      return timingSafeEqual(left, right);
    },
  };
}

export function createNodeRandomSource() {
  return {
    operationId() {
      return `op_${randomUUID()}`;
    },

    token(prefix, bytes) {
      if (prefix === "otp") {
        return `otp_${randomInt(0, 1_000_000).toString().padStart(6, "0")}`;
      }

      return `${prefix}_${randomBytes(bytes).toString("base64url")}`;
    },

    uuid() {
      return randomUUID();
    },
  };
}

export function createNodeReportFileStore(baseDirectory = join(tmpdir(), "papadata-report-exports")) {
  return {
    async writeReportFile(input) {
      const directory = join(baseDirectory, input.tenantId, input.workspaceId);
      await mkdir(directory, { recursive: true });
      const filePath = join(directory, input.fileName);
      await writeFile(filePath, input.content, "utf8");
      const bytes = Buffer.byteLength(input.content);
      const sha256 = createHash("sha256").update(input.content).digest("hex");

      return {
        bytes,
        contentType: input.contentType,
        fileName: input.fileName,
        path: filePath,
        sha256,
      };
    },

    async readReportFile(path, contentType) {
      const content = await readFile(path, "utf8");

      return {
        bytes: Buffer.byteLength(content),
        content,
        contentType,
      };
    },
  };
}

export function createAuthHttpRuntime(options = {}) {
  const state = options.state ?? createDefaultState(options);
  const now = options.now ?? (() => new Date());
  const random = options.random ?? createNodeRandomSource();
  const allowedHosts = options.allowedHosts ?? ["127.0.0.1:3001", "localhost:3001"];
  const allowedOrigins = options.allowedOrigins ?? [
    "http://127.0.0.1:3001",
    "http://localhost:3001",
  ];
  const cookieOptions = {
    environment: options.environment ?? "local",
    path: AUTH_API_BASE_PATH,
    sameSite: "Lax",
  };
  const service =
    options.service ??
    new AuthService({
      hasher: options.hasher ?? createNodeSecretHasher(),
      policy: options.policy,
      random,
      state,
    });
  const accessState = options.accessState ?? new InMemoryAccessState();
  const accessService =
    options.accessService ??
    new AccessService({
      authService: service,
      now,
      random,
      state: accessState,
    });
  const complianceState = options.complianceState ?? new InMemoryComplianceState();
  const complianceService =
    options.complianceService ??
    new ComplianceService({
      accessService,
      authService: service,
      random,
      state: complianceState,
    });
  const metricState = options.metricState ?? new InMemoryMetricState();
  const dashboardService =
    options.dashboardService ??
    new DashboardMetricService({
      accessService,
      random,
      state: metricState,
    });
  const remainingBackendState =
    options.remainingBackendState ?? new InMemoryRemainingBackendState();
  const remainingBackendService =
    options.remainingBackendService ??
    new RemainingBackendService({
      accessService,
      dashboardService,
      fileStore: options.reportFileStore ?? createNodeReportFileStore(options.reportExportDirectory),
      random,
      state: remainingBackendState,
    });

  const server = createServer((request, response) => {
    void handleRequest(request, response, {
      allowedHosts,
      allowedOrigins,
      cookieOptions,
      exposeLocalTestRoutes: options.exposeLocalTestRoutes ?? false,
      complianceService,
      dashboardService,
      now,
      remainingBackendService,
      accessService,
      service,
    }).catch((error) => {
      console.error(
        JSON.stringify({
          error: error instanceof Error ? error.name : "UnknownError",
          service: "api-auth",
        }),
      );
      sendJson(response, 500, {
        error: {
          code: "VALIDATION_FAILED",
          contractVersion: AUTH_CONTRACT_VERSION,
          correlationId: correlationIdFromRequest(request),
          message: "Auth request failed.",
          retryable: true,
        },
        meta: responseMeta(createContext(request, now())),
      });
    });
  });

  return {
    server,
    accessService,
    accessState,
    complianceService,
    complianceState,
    dashboardService,
    metricState,
    remainingBackendService,
    remainingBackendState,
    service,
    state,
  };
}

function createDefaultState(options) {
  if (options.useRedis ?? Boolean(process.env.REDIS_HOST)) {
    return new RedisAuthState({
      host: options.redisHost,
      port: options.redisPort,
      prefix: options.redisPrefix,
    });
  }

  return new InMemoryAuthState();
}

async function handleRequest(request, response, options) {
  applyCors(request, response, options.allowedOrigins);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  const host = request.headers.host ?? "localhost";
  const url = new URL(request.url ?? "/", `http://${host}`);
  const context = createContext(request, options.now());

  if (url.pathname === "/healthz" || url.pathname === "/readyz") {
    sendJson(response, 200, {
      data: {
        dependencies: {
          postgres: process.env.POSTGRES_HOST ?? "postgres",
          redis: process.env.REDIS_HOST ?? "redis",
        },
        service: "api",
        status: "ready",
      },
      meta: responseMeta(context),
    });
    return;
  }

  if (!url.pathname.startsWith(`${AUTH_API_BASE_PATH}/`)) {
    sendJson(response, 404, {
      error: {
        code: "NOT_FOUND",
        contractVersion: AUTH_CONTRACT_VERSION,
        correlationId: correlationIdFromRequest(request),
        message: "Auth endpoint was not found.",
        retryable: false,
      },
      meta: responseMeta(context),
    });
    return;
  }

  const authRoute = url.pathname.startsWith(AUTH_BASE_PATH)
    ? url.pathname.slice(AUTH_BASE_PATH.length) || "/"
    : undefined;

  if (request.method === "GET" && authRoute === "/csrf") {
    const csrfToken = createNodeRandomSource().token("csrf", 24);
    appendSetCookie(
      response,
      serializeCookie(authCookieNames.csrf, csrfToken, {
        ...options.cookieOptions,
        httpOnly: false,
        maxAgeSeconds: 60 * 60,
      }),
    );
    sendJson(response, 200, {
      data: {
        csrfToken,
      },
      meta: responseMeta(context),
    });
    return;
  }

  if (requiresCsrf(request.method ?? "GET")) {
    const csrf = validateCsrf(request, options.allowedHosts, options.allowedOrigins);

    if (!csrf.valid) {
      await options.service.recordAudit("auth.csrf_rejected", "denied", context, {});
      sendJson(response, 403, {
        error: {
          code: "CSRF_INVALID",
          contractVersion: AUTH_CONTRACT_VERSION,
          correlationId: context.correlationId,
          message: "CSRF validation failed.",
          retryable: true,
        },
        meta: responseMeta(context),
      });
      return;
    }
  }

  let body;

  try {
    body = await readJsonBody(request);
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(response, 400, {
        error: {
          code: "VALIDATION_FAILED",
          contractVersion: AUTH_CONTRACT_VERSION,
          correlationId: context.correlationId,
          message: "Request body must be valid JSON.",
          retryable: false,
        },
        meta: responseMeta(context),
      });
      return;
    }

    throw error;
  }

  const result = authRoute
    ? await dispatchAuthRoute(request.method ?? "GET", authRoute, body, context, options)
    : await dispatchAccessRoute(request.method ?? "GET", url.pathname, body, context, options);
  applyCookieUpdate(response, result.cookies, options.cookieOptions);
  sendJson(response, result.status, result.body);
}

async function dispatchAuthRoute(method, route, body, context, options) {
  if (method === "POST" && route === "/context/select") {
    return options.accessService.selectContext(
      {
        tenantId: readString(body, "tenantId"),
        workspaceId: readString(body, "workspaceId"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/register") {
    return options.service.register(
      {
        email: readString(body, "email"),
        fullName: readString(body, "fullName"),
        password: readString(body, "password"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/login") {
    return options.service.login(
      {
        email: readString(body, "email"),
        password: readString(body, "password"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/logout") {
    return options.service.logout(context);
  }

  if (method === "POST" && route === "/refresh") {
    return options.service.refresh(
      {
        refreshToken: getCookieValueFromContext(context, authCookieNames.refreshToken),
      },
      context,
    );
  }

  if (method === "GET" && route === "/me") {
    return options.service.me(context);
  }

  if (method === "POST" && route === "/password/reset/request") {
    return options.service.requestPasswordReset(
      {
        email: readString(body, "email"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/password/reset/confirm") {
    return options.service.confirmPasswordReset(
      {
        email: readString(body, "email"),
        newPassword: readString(body, "newPassword"),
        otp: readString(body, "otp"),
        resetToken: readString(body, "resetToken"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/password/change") {
    return options.service.changePassword(
      {
        currentPassword: readString(body, "currentPassword"),
        newPassword: readString(body, "newPassword"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/email/verify") {
    return options.service.verifyEmail(
      {
        email: readString(body, "email"),
        otp: readString(body, "otp"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/mfa/challenge") {
    return options.service.createMfaChallenge(context);
  }

  if (method === "POST" && route === "/mfa/verify") {
    return options.service.verifyMfa(
      {
        challengeId: readString(body, "challengeId"),
        otp: readString(body, "otp"),
      },
      context,
    );
  }

  if (method === "POST" && route === "/mfa/recovery") {
    return options.service.recoverMfa(
      {
        email: readString(body, "email"),
        recoveryCode: readString(body, "recoveryCode"),
      },
      context,
    );
  }

  if (method === "GET" && route === "/sessions") {
    return options.service.listSessions(context);
  }

  if (method === "DELETE" && route.startsWith("/sessions/")) {
    return options.service.revokeSession(decodeURIComponent(route.slice("/sessions/".length)), context);
  }

  if (method === "GET" && route === "/local/email-outbox" && options.exposeLocalTestRoutes) {
    return {
      body: {
        data: {
          messages: (await options.service.getSnapshot()).emailOutbox,
        },
        meta: responseMeta(context),
      },
      status: 200,
    };
  }

  if (method === "GET" && route === "/local/audit" && options.exposeLocalTestRoutes) {
    await options.service.recordAudit("auth.audit_read", "success", context, {});
    return {
      body: {
        data: {
          events: (await options.service.getSnapshot()).auditEvents,
        },
        meta: responseMeta(context),
      },
      status: 200,
    };
  }

  return {
    body: {
      error: {
        code: "NOT_FOUND",
        contractVersion: AUTH_CONTRACT_VERSION,
        correlationId: context.correlationId,
        message: "Auth endpoint was not found.",
        retryable: false,
      },
      meta: responseMeta(context),
    },
    status: 404,
  };
}

async function dispatchAccessRoute(method, pathname, body, context, options) {
  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/invitations/validate`) {
    return options.accessService.validateInvitation(
      {
        email: readOptionalString(body, "email"),
        invitationToken: readString(body, "invitationToken"),
      },
      context,
    );
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/invitations/accept`) {
    return options.accessService.acceptInvitation(
      {
        invitationToken: readString(body, "invitationToken"),
      },
      context,
    );
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/invitations/resend`) {
    return options.accessService.resendInvitation(
      {
        invitationId: readString(body, "invitationId"),
      },
      context,
    );
  }

  if (
    method === "POST" &&
    pathname.startsWith(`${AUTH_API_BASE_PATH}/invitations/`) &&
    pathname.endsWith("/revoke")
  ) {
    const invitationId = decodeURIComponent(
      pathname.slice(`${AUTH_API_BASE_PATH}/invitations/`.length, -"/revoke".length),
    );
    return options.accessService.revokeInvitation(invitationId, context);
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/organizations/register`) {
    return options.accessService.registerOrganization(
      {
        name: readString(body, "name"),
      },
      context,
    );
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/organizations/verify`) {
    return options.accessService.verifyOrganization(
      {
        tenantId: readString(body, "tenantId"),
        verificationCode: readString(body, "verificationCode"),
      },
      context,
    );
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/organizations/bootstrap`) {
    return options.accessService.bootstrapOrganization(
      {
        tenantId: readString(body, "tenantId"),
        workspaceName: readString(body, "workspaceName"),
      },
      context,
    );
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/workspaces`) {
    return options.accessService.listWorkspaces(context);
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/workspaces`) {
    return options.accessService.createWorkspace(
      {
        name: readString(body, "name"),
        tenantId: readOptionalString(body, "tenantId"),
      },
      context,
    );
  }

  if (
    method === "GET" &&
    pathname.startsWith(`${AUTH_API_BASE_PATH}/workspaces/`) &&
    pathname.endsWith("/readiness")
  ) {
    const workspaceId = decodeURIComponent(
      pathname.slice(`${AUTH_API_BASE_PATH}/workspaces/`.length, -"/readiness".length),
    );
    return options.accessService.workspaceReadiness(workspaceId, context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/onboarding/status`) {
    return options.accessService.onboardingStatus(context);
  }

  if (method === "PUT" && pathname === `${AUTH_API_BASE_PATH}/onboarding/company`) {
    return options.accessService.updateCompany(
      {
        companyName: readString(body, "companyName"),
        country: readString(body, "country"),
        legalName: readString(body, "legalName"),
        taxId: readString(body, "taxId"),
        tenantId: readOptionalString(body, "tenantId"),
        website: readString(body, "website"),
        workspaceId: readOptionalString(body, "workspaceId"),
      },
      context,
    );
  }

  if (method === "PUT" && pathname === `${AUTH_API_BASE_PATH}/onboarding/business-profile`) {
    return options.accessService.updateBusinessProfile(
      {
        averageOrderValueBand: readString(body, "averageOrderValueBand"),
        currency: readString(body, "currency"),
        primaryMarket: readString(body, "primaryMarket"),
        salesModel: readString(body, "salesModel"),
        tenantId: readOptionalString(body, "tenantId"),
        timezone: readString(body, "timezone"),
        workspaceId: readOptionalString(body, "workspaceId"),
      },
      context,
    );
  }

  if (method === "PUT" && pathname === `${AUTH_API_BASE_PATH}/onboarding/platform`) {
    return options.accessService.updatePlatform(
      {
        platformName: readString(body, "platformName"),
        tenantId: readOptionalString(body, "tenantId"),
        workspaceId: readOptionalString(body, "workspaceId"),
      },
      context,
    );
  }

  if (method === "PUT" && pathname === `${AUTH_API_BASE_PATH}/onboarding/data-sources`) {
    return options.accessService.updateDataSources(
      {
        dataSources: readStringArray(body, "dataSources"),
        tenantId: readOptionalString(body, "tenantId"),
        workspaceId: readOptionalString(body, "workspaceId"),
      },
      context,
    );
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/onboarding/complete`) {
    return options.accessService.completeOnboarding(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/privacy/consent`) {
    return options.complianceService.getCookieConsent(context);
  }

  if (method === "PUT" && pathname === `${AUTH_API_BASE_PATH}/privacy/consent`) {
    return options.complianceService.updateCookieConsent(
      {
        analytics: readBoolean(body, "analytics"),
        marketing: readBoolean(body, "marketing"),
        necessary: readBoolean(body, "necessary"),
        preferences: readBoolean(body, "preferences"),
      },
      context,
    );
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/legal/documents`) {
    return options.complianceService.listLegalDocuments(context);
  }

  if (method === "GET" && pathname.startsWith(`${AUTH_API_BASE_PATH}/legal/documents/`)) {
    const type = decodeURIComponent(pathname.slice(`${AUTH_API_BASE_PATH}/legal/documents/`.length));
    return options.complianceService.getLegalDocument(type, context);
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/legal/acceptances`) {
    return options.complianceService.acceptLegalDocument(
      {
        type: readString(body, "type"),
        version: readOptionalString(body, "version"),
      },
      context,
    );
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/legal/acceptances/me`) {
    return options.complianceService.myLegalAcceptances(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/notifications`) {
    return options.complianceService.listNotifications(context);
  }

  if (
    method === "POST" &&
    pathname.startsWith(`${AUTH_API_BASE_PATH}/notifications/`) &&
    pathname.endsWith("/read")
  ) {
    const notificationId = decodeURIComponent(
      pathname.slice(`${AUTH_API_BASE_PATH}/notifications/`.length, -"/read".length),
    );
    return options.complianceService.markNotificationRead(notificationId, context);
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/notifications/read-all`) {
    return options.complianceService.markAllNotificationsRead(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/dashboard/readiness`) {
    return options.dashboardService.dashboardReadiness(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/dashboard/command-center`) {
    return options.dashboardService.commandCenter(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/dashboard/campaigns`) {
    return options.dashboardService.campaigns(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/dashboard/orders`) {
    return options.dashboardService.orders(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/dashboard/products`) {
    return options.dashboardService.products(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/dashboard/customers`) {
    return options.dashboardService.customers(context);
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/dashboard/traffic`) {
    return options.dashboardService.traffic(context);
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/reports/export`) {
    return options.remainingBackendService.exportReport(
      {
        format: readOptionalString(body, "format"),
        periodEnd: readOptionalString(body, "periodEnd"),
        periodStart: readOptionalString(body, "periodStart"),
        reportType: readOptionalString(body, "reportType"),
      },
      context,
    );
  }

  if (
    method === "GET" &&
    pathname.startsWith(`${AUTH_API_BASE_PATH}/reports/`) &&
    pathname.endsWith("/status")
  ) {
    const reportId = decodeURIComponent(
      pathname.slice(`${AUTH_API_BASE_PATH}/reports/`.length, -"/status".length),
    );
    return options.remainingBackendService.reportStatus(reportId, context);
  }

  if (
    method === "GET" &&
    pathname.startsWith(`${AUTH_API_BASE_PATH}/reports/`) &&
    pathname.endsWith("/download")
  ) {
    const reportId = decodeURIComponent(
      pathname.slice(`${AUTH_API_BASE_PATH}/reports/`.length, -"/download".length),
    );
    return options.remainingBackendService.reportDownload(reportId, context);
  }

  if (method === "POST" && pathname === `${AUTH_API_BASE_PATH}/assistant/threads`) {
    return options.remainingBackendService.createAssistantThread(
      {
        resourceId: readOptionalString(body, "resourceId"),
        resourceType: readOptionalString(body, "resourceType"),
        surface: readOptionalString(body, "surface"),
        title: readOptionalString(body, "title"),
        useCaseId: readOptionalString(body, "useCaseId"),
      },
      context,
    );
  }

  if (pathname.startsWith(`${AUTH_API_BASE_PATH}/assistant/threads/`)) {
    const rest = pathname.slice(`${AUTH_API_BASE_PATH}/assistant/threads/`.length);
    const [rawThreadId, action] = rest.split("/");
    const threadId = decodeURIComponent(rawThreadId ?? "");

    if (method === "POST" && action === "messages") {
      return options.remainingBackendService.postAssistantMessage(
        {
          message: readOptionalString(body, "message"),
          simulateNoData: readBoolean(body, "simulateNoData") === true,
          threadId,
        },
        context,
      );
    }

    if (method === "GET" && action === "stream") {
      return options.remainingBackendService.streamAssistantThread(threadId, context);
    }

    if (method === "POST" && action === "simulation") {
      return options.remainingBackendService.simulateAssistantAction(
        {
          actionKind: readOptionalString(body, "actionKind"),
          threadId,
        },
        context,
      );
    }

    if (method === "POST" && action === "approvals") {
      return options.remainingBackendService.createAssistantApproval(
        {
          actionKind: readOptionalString(body, "actionKind"),
          threadId,
        },
        context,
      );
    }

    if (method === "POST" && action === "revalidation") {
      return options.remainingBackendService.revalidateAssistantAction(
        {
          idempotencyKey: readOptionalString(body, "idempotencyKey"),
          targetId: readOptionalString(body, "targetId"),
          threadId,
        },
        context,
      );
    }
  }

  if (method === "GET" && pathname === `${AUTH_API_BASE_PATH}/billing/subscription`) {
    return options.remainingBackendService.billingSubscription(context);
  }

  const billingEventType = billingEventTypeForRoute(method, pathname);

  if (billingEventType) {
    return options.remainingBackendService.applyBillingSandboxEvent(
      billingEventType,
      bodyToJsonObject(body),
      context,
    );
  }

  if (
    method === "GET" &&
    pathname === `${AUTH_API_BASE_PATH}/local/compliance` &&
    options.exposeLocalTestRoutes
  ) {
    return {
      body: {
        data: await options.complianceService.getSnapshot(),
        meta: responseMeta(context),
      },
      status: 200,
    };
  }

  if (
    method === "GET" &&
    pathname === `${AUTH_API_BASE_PATH}/local/remaining-backend` &&
    options.exposeLocalTestRoutes
  ) {
    return {
      body: {
        data: await options.remainingBackendService.getSnapshot(),
        meta: responseMeta(context),
      },
      status: 200,
    };
  }

  return {
    body: {
      error: {
        code: "NOT_FOUND",
        contractVersion: AUTH_CONTRACT_VERSION,
        correlationId: context.correlationId,
        message: "Endpoint was not found.",
        retryable: false,
      },
      meta: responseMeta(context),
    },
    status: 404,
  };
}

function createContext(request, now) {
  const cookies = parseCookies(request.headers.cookie);
  const context = {
    correlationId: correlationIdFromRequest(request),
    ip: clientIp(request),
    now,
    sessionId: cookies.get(authCookieNames.sessionId),
    userAgent: String(request.headers["user-agent"] ?? "unknown"),
  };

  contextCookieHeader.set(context, request.headers.cookie ?? "");
  return context;
}

function getCookieValueFromContext(context, name) {
  return parseCookies(contextCookieHeader.get(context) ?? "").get(name);
}

const contextCookieHeader = new WeakMap();

function correlationIdFromRequest(request) {
  const header = request.headers["x-correlation-id"];

  if (Array.isArray(header)) {
    return header[0] ?? "corr_missing";
  }

  return header ?? "corr_missing";
}

function clientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];

  if (Array.isArray(forwarded)) {
    return forwarded[0] ?? "127.0.0.1";
  }

  return forwarded?.split(",")[0]?.trim() || request.socket.remoteAddress || "127.0.0.1";
}

function requiresCsrf(method) {
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
}

function validateCsrf(request, allowedHosts, allowedOrigins) {
  const host = request.headers.host;

  if (!host || !allowedHosts.includes(host)) {
    return { valid: false };
  }

  const origin = request.headers.origin;

  if (!origin || !allowedOrigins.includes(origin)) {
    return { valid: false };
  }

  const headerToken = singleHeader(request.headers[csrfHeaderName]);
  const csrfCookie = parseCookies(request.headers.cookie).get(authCookieNames.csrf);

  return {
    valid: Boolean(headerToken && csrfCookie && headerToken === csrfCookie),
  };
}

function applyCors(request, response, allowedOrigins) {
  const origin = request.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader(
      "Access-Control-Allow-Headers",
      "content-type, x-correlation-id, x-papadata-csrf",
    );
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  }
}

async function readJsonBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return {};
  }

  let raw = "";

  for await (const chunk of request) {
    raw += chunk;
  }

  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw);
}

function readString(body, key) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = body[key];
  return typeof value === "string" ? value : "";
}

function readOptionalString(body, key) {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const value = body[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readStringArray(body, key) {
  if (!body || typeof body !== "object" || !Array.isArray(body[key])) {
    return [];
  }

  return body[key].filter((value) => typeof value === "string");
}

function readBoolean(body, key) {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const value = body[key];
  return typeof value === "boolean" ? value : undefined;
}

function bodyToJsonObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }

  return body;
}

function billingEventTypeForRoute(method, pathname) {
  if (method !== "POST") {
    return undefined;
  }

  const routes = {
    [`${AUTH_API_BASE_PATH}/billing/subscription/activate`]: "subscription_activated",
    [`${AUTH_API_BASE_PATH}/billing/subscription/change-plan`]: "plan_changed",
    [`${AUTH_API_BASE_PATH}/billing/subscription/cancel`]: "subscription_cancelled",
    [`${AUTH_API_BASE_PATH}/billing/subscription/resume`]: "subscription_resumed",
    [`${AUTH_API_BASE_PATH}/billing/payment/pending`]: "payment_pending",
    [`${AUTH_API_BASE_PATH}/billing/payment/failed`]: "payment_failed",
    [`${AUTH_API_BASE_PATH}/billing/payment/recovered`]: "payment_recovered",
    [`${AUTH_API_BASE_PATH}/billing/invoices/generate`]: "invoice_generated",
    [`${AUTH_API_BASE_PATH}/billing/usage/update`]: "usage_updated",
    [`${AUTH_API_BASE_PATH}/billing/limits/reached`]: "limit_reached",
    [`${AUTH_API_BASE_PATH}/billing/entitlements/change`]: "entitlement_changed",
  };

  return routes[pathname];
}

function parseCookies(header) {
  const cookies = new Map();

  if (!header) {
    return cookies;
  }

  for (const part of header.split(";")) {
    const [name, ...value] = part.trim().split("=");

    if (name) {
      cookies.set(name, decodeURIComponent(value.join("=")));
    }
  }

  return cookies;
}

function applyCookieUpdate(response, update, options) {
  if (!update) {
    return;
  }

  if (update.action === "clear") {
    appendSetCookie(
      response,
      serializeCookie(authCookieNames.sessionId, "", {
        ...options,
        httpOnly: true,
        maxAgeSeconds: 0,
      }),
    );
    appendSetCookie(
      response,
      serializeCookie(authCookieNames.refreshToken, "", {
        ...options,
        httpOnly: true,
        maxAgeSeconds: 0,
      }),
    );
    return;
  }

  appendSetCookie(
    response,
    serializeCookie(authCookieNames.sessionId, update.sessionId, {
      ...options,
      httpOnly: true,
      maxAgeSeconds: 30 * 60,
    }),
  );
  appendSetCookie(
    response,
    serializeCookie(authCookieNames.refreshToken, update.refreshToken, {
      ...options,
      httpOnly: true,
      maxAgeSeconds: 30 * 60,
    }),
  );
  appendSetCookie(
    response,
    serializeCookie(authCookieNames.csrf, update.csrfToken, {
      ...options,
      httpOnly: false,
      maxAgeSeconds: 60 * 60,
    }),
  );
}

function appendSetCookie(response, value) {
  const existing = response.getHeader("Set-Cookie");

  if (!existing) {
    response.setHeader("Set-Cookie", value);
    return;
  }

  if (Array.isArray(existing)) {
    response.setHeader("Set-Cookie", [...existing, value]);
    return;
  }

  response.setHeader("Set-Cookie", [String(existing), value]);
}

function serializeCookie(name, value, options) {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${options.maxAgeSeconds}`,
    `Path=${options.path}`,
    `SameSite=${options.sameSite}`,
  ];

  if (options.httpOnly) {
    attributes.push("HttpOnly");
  }

  if (options.environment === "production") {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

function sendJson(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-length": Buffer.byteLength(payload),
    "content-type": jsonContentType,
  });
  response.end(payload);
}

function singleHeader(value) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

async function deriveDigest(value, purpose, salt) {
  const derived = await scryptAsync(`${purpose}:${value}`, salt, 64);
  return Buffer.from(derived).toString("hex");
}
