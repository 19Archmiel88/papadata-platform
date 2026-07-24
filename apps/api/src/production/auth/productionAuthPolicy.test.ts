import "reflect-metadata";

import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, test } from "node:test";
import type { ExecutionContext } from "@nestjs/common";
import {
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { canonicalCapabilities } from "@papadata/contracts";
import ts from "typescript";
import { ProductionAppModule } from "../app.module.js";
import { IntegrationController } from "../integrations/integration.controller.js";
import { ProductionAuthGuard } from "./auth.guard.js";
import { CapabilityGuard } from "./capability.guard.js";
import type { DeniedAccessAuditService } from "./denied-access-audit.service.js";
import {
  AuditDeniedAccess,
  ExternalProviderEndpoint,
  InfrastructureEndpoint,
  PublicEndpoint,
  RequireAuthLevel,
  RequireCapabilities,
} from "./route-policy.js";
import { readRoutePolicy } from "./route-policy-reader.js";
import {
  PRINCIPAL_SESSION_STORE,
  internalPrincipalHeaderName,
  PrincipalService,
  TestMemoryPrincipalSessionStore,
  type PrincipalClock,
  type PrincipalSessionRecord,
  type PrincipalSessionStore,
} from "./principal.service.js";
import type {
  RequestPrincipal,
  RequestWithPrincipal,
} from "./request-principal.js";

class GuardPolicyController {
  external(): void {}

  infrastructure(): void {}

  missing(): void {}

  mfa(): void {}

  public(): void {}

  read(): void {}

  stepUp(): void {}
}

decorate("read", RequireCapabilities("reports.read"));
decorate("stepUp", RequireCapabilities("reports.download"));
decorate("stepUp", RequireAuthLevel("step_up"));
decorate("stepUp", AuditDeniedAccess());
decorate("mfa", RequireCapabilities("reports.create"));
decorate("mfa", RequireAuthLevel("mfa"));
decorate("public", PublicEndpoint());
decorate("infrastructure", InfrastructureEndpoint());
decorate("external", ExternalProviderEndpoint());

describe("production A01 auth and route policies", () => {
  test("route policy enumeration covers all production controller endpoints", () => {
    const matrix = readProductionRouteMatrix();
    const invalid = matrix.filter((entry) => entry.classifications.length !== 1);

    assert.deepEqual(formatEntries(invalid), []);

    const authenticatedWithoutCapabilities = matrix.filter(
      (entry) =>
        entry.classifications.includes("authenticated")
        && entry.capabilities.length === 0,
    );

    assert.deepEqual(formatEntries(authenticatedWithoutCapabilities), []);

    const invalidCapabilities = matrix.flatMap((entry) =>
      entry.capabilities.filter(
        (capability) =>
          !canonicalCapabilitySet.has(capability),
      ).map((capability) => `${entry.method} ${entry.path} ${capability}`),
    );

    assert.deepEqual(invalidCapabilities, []);

    const metrics = matrix.find(
      (entry) => entry.method === "GET" && entry.path === "/metrics",
    );
    assert.equal(metrics?.classifications[0], "infrastructure");

    const webhook = matrix.find(
      (entry) =>
        entry.method === "POST"
        && entry.path === "/v1/integrations/webhooks/:provider",
    );
    assert.equal(webhook?.classifications[0], "external-provider");
    assert.equal(webhook?.capabilities.length, 0);
  });

  test("production controllers do not use public scope headers as authoritative input", () => {
    const forbiddenHeaders = [
      "x-tenant-id",
      "x-workspace-id",
      "x-user-id",
      "x-session-id",
    ] as const;

    for (const file of findControllerFiles(productionRoot)) {
      const source = readFileSync(file, "utf8");

      for (const header of forbiddenHeaders) {
        assert.equal(
          new RegExp(`@Headers\\(\\s*["']${header}["']`, "u").test(source),
          false,
          `${relative(packageRoot, file)} still reads ${header}`,
        );
      }
    }
  });

  test("missing credentials return 401", async () => {
    const guard = authGuard(principalService());

    await assert.rejects(
      () => guard.canActivate(context("read", { headers: {} })),
      UnauthorizedException,
    );
  });

  test("invalid token returns 401", async () => {
    const guard = authGuard(principalService());

    await withPrincipalEnv(async () => {
      await assert.rejects(
        () =>
          guard.canActivate(
            context("read", {
              headers: {
                [internalPrincipalHeaderName]: "not-a-jwt",
              },
            }),
          ),
        UnauthorizedException,
      );
    });
  });

  test("client authorization header is not accepted as internal principal", async () => {
    const guard = authGuard(principalService());

    await withPrincipalEnv(async () => {
      await assert.rejects(
        () =>
          guard.canActivate(
            context("read", {
              headers: {
                authorization: `Bearer ${signToken()}`,
              },
            }),
          ),
        UnauthorizedException,
      );
    });
  });

  test("expired token returns 401", async () => {
    const guard = authGuard(principalService());

    await withPrincipalEnv(async () => {
      await assert.rejects(
        () =>
          guard.canActivate(
            context("read", {
              headers: {
                [internalPrincipalHeaderName]: signToken({ expired: true }),
              },
            }),
          ),
        UnauthorizedException,
      );
    });
  });

  test("revoked session returns 401", async () => {
    const guard = authGuard(stubPrincipalService(null));

    await assert.rejects(
      () =>
        guard.canActivate(
          context("read", {
            headers: {
              [internalPrincipalHeaderName]: signToken(),
            },
          }),
        ),
      UnauthorizedException,
    );
  });

  test("workspace outside active membership returns 403", async () => {
    const guard = authGuard(
      stubPrincipalService(
        principal({
          memberships: [
            {
              capabilities: ["reports.read"],
              roles: ["viewer"],
              tenantId: "tenant-real",
              workspaceId: "workspace-other",
            },
          ],
        }),
      ),
    );

    await assert.rejects(
      () => guard.canActivate(context("read", { headers: {} })),
      ForbiddenException,
    );
  });

  test("spoofed identity and scope headers do not change principal", async () => {
    const request: RequestWithPrincipal = {
      headers: {
        "x-session-id": "session-spoofed",
        "x-tenant-id": "tenant-spoofed",
        "x-user-id": "user-spoofed",
        "x-workspace-id": "workspace-spoofed",
      },
      method: "GET",
      url: "/v1/reports/report-1",
    };
    const guard = authGuard(stubPrincipalService(principal()));

    await guard.canActivate(context("read", request));

    assert.equal(request.principal?.tenantId, "tenant-real");
    assert.equal(request.principal?.workspaceId, "workspace-real");
    assert.equal(request.principal?.userId, "user-real");
    assert.equal(request.principal?.sessionId, "session-real");
  });

  test("frontend-sent capability does not grant access", async () => {
    const request: RequestWithPrincipal = {
      headers: {
        "x-capabilities": "reports.download",
      },
      method: "GET",
      principal: principal({ capabilities: ["reports.read"] }),
      url: "/v1/reports/report-1/download",
    };
    const guard = capabilityGuard();

    await assert.rejects(
      () => guard.canActivate(context("stepUp", request)),
      ForbiddenException,
    );
  });

  test("missing capability returns 403", async () => {
    const request: RequestWithPrincipal = {
      headers: {},
      principal: principal({ capabilities: ["reports.read"] }),
    };

    await assert.rejects(
      () => capabilityGuard().canActivate(context("stepUp", request)),
      ForbiddenException,
    );
  });

  test("expired step-up returns 403", async () => {
    const request: RequestWithPrincipal = {
      headers: {},
      principal: principal({
        authLevel: "step_up",
        capabilities: ["reports.download"],
        stepUpExpiresAt: new Date(Date.now() - 1_000).toISOString(),
      }),
    };

    await assert.rejects(
      () => capabilityGuard().canActivate(context("stepUp", request)),
      ForbiddenException,
    );
  });

  test("privileged operation without required auth level is blocked", async () => {
    const request: RequestWithPrincipal = {
      headers: {},
      principal: principal({
        authLevel: "session",
        capabilities: ["reports.create"],
      }),
    };

    await assert.rejects(
      () => capabilityGuard().canActivate(context("mfa", request)),
      ForbiddenException,
    );
  });

  test("endpoint without policy is denied by route policy reader", () => {
    const result = readRoutePolicy(
      new Reflector(),
      handler("missing"),
      GuardPolicyController,
    );

    assert.equal(result.valid, false);
  });

  test("valid issued-at token resolves and reaches the guarded handler", async () => {
    const request: RequestWithPrincipal = {
      headers: {
        [internalPrincipalHeaderName]: signToken({
          capabilities: ["reports.read"],
        }),
      },
      method: "GET",
      url: "/v1/reports/report-1",
    };

    await withPrincipalEnv(async () => {
      assert.equal(
        await authGuard(principalService()).canActivate(
          context("read", request),
        ),
        true,
      );
    });

    assert.equal(request.principal?.issuedAt, isoFromSeconds(nowSeconds - 10));
  });

  test("previous internal auth secret verifies during rotation", async () => {
    const request: RequestWithPrincipal = {
      headers: {
        [internalPrincipalHeaderName]: signToken({
          capabilities: ["reports.read"],
          secret: "abcdef0123456789abcdef0123456789",
        }),
      },
      method: "GET",
      url: "/v1/reports/report-1",
    };

    await withPrincipalEnv(async () => {
      assert.equal(
        await authGuard(principalService()).canActivate(
          context("read", request),
        ),
        true,
      );
    });
  });

  test("missing issued-at returns 401", async () => {
    await rejectsToken({ omitIat: true });
  });

  test("issued-at far in the future returns 401", async () => {
    await rejectsToken({ iat: nowSeconds + 600, exp: nowSeconds + 900 });
  });

  test("issued-at inside clock skew is accepted", async () => {
    const request: RequestWithPrincipal = {
      headers: {
        [internalPrincipalHeaderName]: signToken({
          iat: nowSeconds + 30,
          exp: nowSeconds + 120,
        }),
      },
      method: "GET",
      url: "/v1/reports/report-1",
    };

    await withPrincipalEnv(async () => {
      assert.equal(
        await authGuard(principalService()).canActivate(
          context("read", request),
        ),
        true,
      );
    });
  });

  test("token older than max age returns 401", async () => {
    await rejectsToken({
      exp: nowSeconds + 3_600,
      iat: nowSeconds - 1_000,
    });
  });

  test("exp not later than issued-at returns 401", async () => {
    await rejectsToken({
      exp: nowSeconds,
      iat: nowSeconds,
    });
  });

  test("distant exp does not bypass max token age", async () => {
    await rejectsToken({
      exp: nowSeconds + 30_000,
      iat: nowSeconds - 1_000,
    });
  });

  test("non-numeric issued-at returns 401", async () => {
    await rejectsToken({
      iat: "not-a-number",
    });
  });

  test("missing exp returns 401", async () => {
    await rejectsToken({ omitExp: true });
  });

  test("non-numeric exp returns 401", async () => {
    await rejectsToken({
      exp: "not-a-number",
    });
  });

  test("ProductionAppModule enforces A01 policies over HTTP", async () => {
    await withProductionHttpApp(async (fixture) => {
      const noCredentials = await fixture.inject({
        method: "GET",
        url: "/v1/integrations/connections",
      });

      assert.equal(noCredentials.statusCode, 401);

      const missingCapability = await fixture.inject({
        headers: {
          [internalPrincipalHeaderName]: fixture.token({
            capabilities: ["reports.read"],
          }),
        },
        method: "GET",
        url: "/v1/integrations/connections",
      });

      assert.equal(missingCapability.statusCode, 403);

      const allowed = await fixture.inject({
        headers: {
          [internalPrincipalHeaderName]: fixture.token({
            capabilities: ["integrations.connection.read"],
          }),
        },
        method: "GET",
        url: "/v1/integrations/connections",
      });

      assert.equal(allowed.statusCode, 200);

      const spoofed = await fixture.inject({
        headers: {
          [internalPrincipalHeaderName]: fixture.token({
            capabilities: ["integrations.connection.read"],
          }),
          "x-session-id": "session-spoofed",
          "x-tenant-id": "tenant-spoofed",
          "x-user-id": "user-spoofed",
          "x-workspace-id": "workspace-spoofed",
        },
        method: "GET",
        url: "/v1/integrations/connections",
      });

      assert.equal(spoofed.statusCode, 200);
      assert.deepEqual(fixture.capturedScope(), {
        tenantId: "tenant-real",
        workspaceId: "workspace-real",
      });

      const metrics = await fixture.inject({
        headers: {
          [internalPrincipalHeaderName]: fixture.token({
            capabilities: ["integrations.connection.read"],
          }),
        },
        method: "GET",
        url: "/metrics",
      });

      assert.equal(metrics.statusCode, 403);

      const webhook = await fixture.inject({
        method: "POST",
        url: "/v1/integrations/webhooks/shopify",
      });

      assert.equal(webhook.statusCode, 403);

      const health = await fixture.inject({
        method: "GET",
        url: "/health",
      });

      assert.equal(health.statusCode, 200);
    });
  });
});

const packageRoot = dirname(dirname(dirname(import.meta.dirname)));
const productionRoot = join(packageRoot, "src", "production");
const canonicalCapabilitySet = new Set<string>(canonicalCapabilities);
const fixedNow = new Date("2026-07-22T10:00:00.000Z");
const nowSeconds = Math.floor(fixedNow.getTime() / 1000);

function decorate(
  methodName: keyof GuardPolicyController & string,
  decorator: MethodDecorator,
): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    GuardPolicyController.prototype,
    methodName,
  );

  assert.ok(descriptor);
  decorator(GuardPolicyController.prototype, methodName, descriptor);
}

function authGuard(principalService: PrincipalService): ProductionAuthGuard {
  return new ProductionAuthGuard(principalService, new Reflector());
}

function capabilityGuard(): CapabilityGuard {
  const audit: Pick<DeniedAccessAuditService, "record"> = {
    async record(): Promise<void> {},
  };

  return new CapabilityGuard(
    new Reflector(),
    audit as DeniedAccessAuditService,
  );
}

function stubPrincipalService(
  value: RequestPrincipal | null,
): PrincipalService {
  return {
    async resolve(): Promise<RequestPrincipal | null> {
      return value;
    },
  } as unknown as PrincipalService;
}

function principalService(
  options: {
    readonly clock?: PrincipalClock;
    readonly session?: PrincipalSessionRecord | null;
  } = {},
): PrincipalService {
  return new PrincipalService(
    sessionStore(options.session === undefined
      ? sessionRecord()
      : options.session),
    options.clock ?? { now: () => fixedNow },
  );
}

function sessionStore(
  session: PrincipalSessionRecord | null,
): PrincipalSessionStore {
  return {
    findSession: (sessionId: string) =>
      Promise.resolve(session?.sessionId === sessionId ? session : null),
  };
}

function sessionRecord(
  overrides: Partial<PrincipalSessionRecord> = {},
): PrincipalSessionRecord {
  return {
    activeTenantId: "tenant-real",
    activeWorkspaceId: "workspace-real",
    expiresAt: isoFromSeconds(nowSeconds + 600),
    revokedAt: null,
    sessionId: "session-real",
    userId: "user-real",
    ...overrides,
  };
}

async function rejectsToken(
  options: SignTokenOptions,
): Promise<void> {
  await withPrincipalEnv(async () => {
    await assert.rejects(
      () =>
        authGuard(principalService()).canActivate(
          context("read", {
            headers: {
              [internalPrincipalHeaderName]: signToken(options),
            },
          }),
        ),
      UnauthorizedException,
    );
  });
}

function context(
  methodName: keyof GuardPolicyController & string,
  request: RequestWithPrincipal,
): ExecutionContext {
  return {
    getClass: () => GuardPolicyController,
    getHandler: () => handler(methodName),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function handler(methodName: keyof GuardPolicyController & string): Function {
  const value = GuardPolicyController.prototype[methodName];
  assert.equal(typeof value, "function");
  return value;
}

function principal(
  overrides: Partial<RequestPrincipal> = {},
): RequestPrincipal {
  return {
    authLevel: "mfa",
    capabilities: ["reports.read", "reports.download"],
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    issuedAt: new Date().toISOString(),
    issuer: "issuer",
    memberships: [
      {
        capabilities: ["reports.read", "reports.download"],
        roles: ["analyst"],
        tenantId: "tenant-real",
        workspaceId: "workspace-real",
      },
    ],
    sessionId: "session-real",
    source: "internal_token",
    stepUpExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    tenantId: "tenant-real",
    userId: "user-real",
    workspaceId: "workspace-real",
    ...overrides,
  };
}

async function withPrincipalEnv(run: () => Promise<void>): Promise<void> {
  const previousIssuer = process.env.PAPADATA_API_AUTH_ISSUER;
  const previousAudience = process.env.PAPADATA_API_AUTH_AUDIENCE;
  const previousActiveSecret = process.env.PAPADATA_API_AUTH_ACTIVE_SECRET;
  const previousLegacySecret = process.env.PAPADATA_API_AUTH_JWT_SECRET;
  const previousPreviousSecret = process.env.PAPADATA_API_AUTH_PREVIOUS_SECRET;
  const previousClockSkew = process.env.AUTH_CLOCK_SKEW_SECONDS;
  const previousMaxAge = process.env.AUTH_INTERNAL_TOKEN_MAX_AGE_SECONDS;

  process.env.PAPADATA_API_AUTH_ISSUER = "issuer";
  process.env.PAPADATA_API_AUTH_AUDIENCE = "audience";
  process.env.PAPADATA_API_AUTH_ACTIVE_SECRET =
    "0123456789abcdef0123456789abcdef";
  process.env.PAPADATA_API_AUTH_PREVIOUS_SECRET =
    "abcdef0123456789abcdef0123456789";
  delete process.env.PAPADATA_API_AUTH_JWT_SECRET;
  process.env.AUTH_CLOCK_SKEW_SECONDS = "60";
  process.env.AUTH_INTERNAL_TOKEN_MAX_AGE_SECONDS = "300";

  try {
    await run();
  } finally {
    restoreEnv("PAPADATA_API_AUTH_ISSUER", previousIssuer);
    restoreEnv("PAPADATA_API_AUTH_AUDIENCE", previousAudience);
    restoreEnv("PAPADATA_API_AUTH_ACTIVE_SECRET", previousActiveSecret);
    restoreEnv("PAPADATA_API_AUTH_JWT_SECRET", previousLegacySecret);
    restoreEnv("PAPADATA_API_AUTH_PREVIOUS_SECRET", previousPreviousSecret);
    restoreEnv("AUTH_CLOCK_SKEW_SECONDS", previousClockSkew);
    restoreEnv("AUTH_INTERNAL_TOKEN_MAX_AGE_SECONDS", previousMaxAge);
  }
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

type SignTokenOptions = {
  readonly baseNowSeconds?: number;
  readonly capabilities?: readonly string[];
  readonly exp?: unknown;
  readonly expired?: boolean;
  readonly iat?: unknown;
  readonly omitExp?: boolean;
  readonly omitIat?: boolean;
  readonly secret?: string;
};

function signToken(options: SignTokenOptions = {}): string {
  const baseNowSeconds = options.baseNowSeconds ?? nowSeconds;
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload: Record<string, unknown> = {
    aud: "audience",
    auth_level: "mfa",
    caps: options.capabilities ?? ["reports.read"],
    iss: "issuer",
    memberships: [
      {
        capabilities: options.capabilities ?? ["reports.read"],
        roles: ["analyst"],
        tenantId: "tenant-real",
        workspaceId: "workspace-real",
      },
    ],
    sid: "session-real",
    sub: "user-real",
    tid: "tenant-real",
    wid: "workspace-real",
  };

  if (!options.omitIat) {
    payload.iat = options.iat ?? baseNowSeconds - 10;
  }

  if (!options.omitExp) {
    payload.exp = options.expired
      ? baseNowSeconds - 120
      : options.exp ?? baseNowSeconds + 60;
  }

  const encodedPayload = encodeJson(payload);
  const signature = createHmac(
    "sha256",
    options.secret ?? "0123456789abcdef0123456789abcdef",
  )
    .update(`${header}.${encodedPayload}`)
    .digest("base64url");

  return `${header}.${encodedPayload}.${signature}`;
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function isoFromSeconds(value: number): string {
  return new Date(value * 1000).toISOString();
}

type ProductionHttpFixture = {
  readonly capturedScope: () => {
    readonly tenantId: string;
    readonly workspaceId: string;
  } | null;
  readonly inject: NestFastifyApplication["inject"];
  readonly token: (options: SignTokenOptions) => string;
};

async function withProductionHttpApp(
  run: (fixture: ProductionHttpFixture) => Promise<void>,
): Promise<void> {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousRedisUrl = process.env.REDIS_URL;
  const previousStorageBucket = process.env.PAPADATA_STORAGE_BUCKET;
  const previousSessionStore = process.env.PAPADATA_API_AUTH_SESSION_STORE;

  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://user:pass@127.0.0.1:1/db";
  process.env.REDIS_URL = "redis://127.0.0.1:1";
  process.env.PAPADATA_STORAGE_BUCKET = "test-bucket";
  process.env.PAPADATA_API_AUTH_SESSION_STORE = "test-memory";

  await withPrincipalEnv(async () => {
    const app = await NestFactory.create<NestFastifyApplication>(
      ProductionAppModule,
      new FastifyAdapter(),
      { logger: false },
    );

    try {
      await app.init();

      const sessionStore = app.get<TestMemoryPrincipalSessionStore>(
        PRINCIPAL_SESSION_STORE,
      );
      sessionStore.saveSession(sessionRecord({
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
      }));

      let capturedScope: {
        readonly tenantId: string;
        readonly workspaceId: string;
      } | null = null;

      const controller = app.get(IntegrationController, {
        strict: false,
      });
      Object.defineProperty(controller, "service", {
        configurable: true,
        value: {
          listConnections: (
            tenantId: string,
            workspaceId: string,
          ): readonly [] => {
            capturedScope = { tenantId, workspaceId };
            return [];
          },
        },
      });

      await run({
        capturedScope: () => capturedScope,
        inject: app.inject.bind(app),
        token: (options) =>
          signToken({
            ...options,
            baseNowSeconds: Math.floor(Date.now() / 1000),
          }),
      });
    } finally {
      await app.close();
      restoreEnv("NODE_ENV", previousNodeEnv);
      restoreEnv("DATABASE_URL", previousDatabaseUrl);
      restoreEnv("REDIS_URL", previousRedisUrl);
      restoreEnv("PAPADATA_STORAGE_BUCKET", previousStorageBucket);
      restoreEnv(
        "PAPADATA_API_AUTH_SESSION_STORE",
        previousSessionStore,
      );
    }
  });
}

type RouteMatrixEntry = {
  readonly authLevel: string | null;
  readonly auditDeniedAccess: boolean;
  readonly capabilities: readonly string[];
  readonly classifications: readonly string[];
  readonly file: string;
  readonly method: string;
  readonly path: string;
};

function readProductionRouteMatrix(): readonly RouteMatrixEntry[] {
  return findControllerFiles(productionRoot).flatMap((file) => {
    const source = readFileSync(file, "utf8");
    const parsed = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    const entries: RouteMatrixEntry[] = [];

    for (const statement of parsed.statements) {
      if (!ts.isClassDeclaration(statement)) {
        continue;
      }

      const controllerPath = readControllerPath(statement);

      if (controllerPath === null) {
        continue;
      }

      for (const member of statement.members) {
        if (!ts.isMethodDeclaration(member)) {
          continue;
        }

        const route = readRouteDecorator(member);

        if (!route) {
          continue;
        }

        const decoratorNames = getDecorators(member).map(readDecoratorName);
        const capabilities = readCapabilities(member);

        entries.push({
          auditDeniedAccess: decoratorNames.includes("AuditDeniedAccess"),
          authLevel: readAuthLevel(member)
            ?? (capabilities.length > 0 ? "session" : null),
          capabilities,
          classifications: [
            decoratorNames.includes("PublicEndpoint") ? "public" : null,
            decoratorNames.includes("InfrastructureEndpoint")
              ? "infrastructure"
              : null,
            decoratorNames.includes("ExternalProviderEndpoint")
              ? "external-provider"
              : null,
            capabilities.length > 0 ? "authenticated" : null,
          ].filter((value): value is string => value !== null),
          file: relative(packageRoot, file),
          method: route.method,
          path: joinRoutePath(controllerPath, route.path),
        });
      }
    }

    return entries;
  });
}

function findControllerFiles(root: string): readonly string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);

    if (entry.isDirectory()) {
      return findControllerFiles(path);
    }

    return entry.isFile() && entry.name.endsWith(".controller.ts")
      ? [path]
      : [];
  });
}

function readControllerPath(node: ts.ClassDeclaration): string | null {
  const controller = getDecorators(node).find(
    (decorator) => readDecoratorName(decorator) === "Controller",
  );
  const call = controller ? readDecoratorCall(controller) : null;
  const first = call?.arguments[0];

  if (!first) {
    return "";
  }

  return ts.isStringLiteralLike(first) ? first.text : null;
}

function readRouteDecorator(
  node: ts.MethodDeclaration,
): { readonly method: string; readonly path: string } | null {
  for (const decorator of getDecorators(node)) {
    const name = readDecoratorName(decorator);
    const method = routeDecoratorMethod[name];

    if (!method) {
      continue;
    }

    const call = readDecoratorCall(decorator);
    const first = call?.arguments[0];

    return {
      method,
      path: first && ts.isStringLiteralLike(first) ? first.text : "",
    };
  }

  return null;
}

function readCapabilities(node: ts.MethodDeclaration): readonly string[] {
  const decorator = getDecorators(node).find(
    (item) => readDecoratorName(item) === "RequireCapabilities",
  );
  const call = decorator ? readDecoratorCall(decorator) : null;

  if (!call) {
    return [];
  }

  return call.arguments.flatMap((argument) =>
    ts.isStringLiteralLike(argument) ? [argument.text] : [],
  );
}

function readAuthLevel(node: ts.MethodDeclaration): string | null {
  const decorator = getDecorators(node).find(
    (item) => readDecoratorName(item) === "RequireAuthLevel",
  );
  const call = decorator ? readDecoratorCall(decorator) : null;
  const first = call?.arguments[0];
  return first && ts.isStringLiteralLike(first) ? first.text : null;
}

function getDecorators(
  node: ts.ClassDeclaration | ts.MethodDeclaration,
): readonly ts.Decorator[] {
  return ts.canHaveDecorators(node) ? ts.getDecorators(node) ?? [] : [];
}

function readDecoratorName(decorator: ts.Decorator): string {
  const expression = ts.isCallExpression(decorator.expression)
    ? decorator.expression.expression
    : decorator.expression;

  return ts.isIdentifier(expression) ? expression.text : "";
}

function readDecoratorCall(
  decorator: ts.Decorator,
): ts.CallExpression | null {
  return ts.isCallExpression(decorator.expression)
    ? decorator.expression
    : null;
}

function joinRoutePath(controllerPath: string, methodPath: string): string {
  return `/${[controllerPath, methodPath]
    .filter((part) => part.length > 0)
    .join("/")
    .replace(/\/+/gu, "/")}`;
}

function formatEntries(
  entries: readonly RouteMatrixEntry[],
): readonly string[] {
  return entries.map(
    (entry) =>
      `${entry.method} ${entry.path} ${entry.classifications.join(",") || "none"} ${entry.file}`,
  );
}

const routeDecoratorMethod: Readonly<Record<string, string>> = {
  All: "ALL",
  Delete: "DELETE",
  Get: "GET",
  Head: "HEAD",
  Options: "OPTIONS",
  Patch: "PATCH",
  Post: "POST",
  Put: "PUT",
};
