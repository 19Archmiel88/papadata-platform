export type BffSessionMembership = {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly capabilities: readonly string[];
  readonly roles: readonly string[];
};

export type BffSession = {
  readonly activeTenantId: string;
  readonly activeWorkspaceId: string;
  readonly authLevel: string;
  readonly capabilities: readonly string[];
  readonly expiresAt: string;
  readonly memberships: readonly BffSessionMembership[];
  readonly sessionId: string;
  readonly userId: string;
};

export type AuthenticatedUser = {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
};

export type AuthenticationResult = {
  readonly session: BffSession;
  readonly user: AuthenticatedUser;
};

type ErrorPayload = {
  readonly error?: {
    readonly code?: unknown;
    readonly message?: unknown;
  };
};

export class BffProblem extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'BffProblem';
    this.status = status;
    this.code = code;
  }
}

class BffClient {
  private csrfToken: string | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl = import.meta.env.VITE_BFF_BASE_URL?.trim() ?? '') {
    this.baseUrl = baseUrl.replace(/\/+$/u, '');
  }

  async readSession(): Promise<BffSession | null> {
    const response = await this.fetch('/api/v1/auth/session', { method: 'GET' });
    if (response.status === 401 || response.status === 403) return null;
    const payload = await readJson<{ readonly data: BffSession }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async login(input: {
    readonly email: string;
    readonly password: string;
    readonly rememberDevice?: boolean;
  }): Promise<AuthenticationResult> {
    this.csrfToken = null;
    return this.authenticate('/api/v1/auth/login', input);
  }

  async register(input: {
    readonly email: string;
    readonly fullName: string;
    readonly password: string;
  }): Promise<AuthenticationResult> {
    this.csrfToken = null;
    return this.authenticate('/api/v1/auth/register/email', input);
  }

  async confirmMfa(input: {
    readonly code: string;
  }): Promise<{
    readonly session: BffSession;
    readonly verified: boolean;
  }> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch('/api/v1/auth/mfa/confirm', {
      method: 'POST',
      headers: {
        'x-papadata-csrf': csrfToken,
      },
      body: JSON.stringify(input),
    });
    const payload = await readJson<{
      readonly data: {
        readonly session: BffSession;
        readonly verified: boolean;
      };
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async requestPasswordRecovery(input: {
    readonly email: string;
  }): Promise<void> {
    await this.publicCommand(
      '/api/v1/auth/password/recovery/request',
      input,
    );
  }

  async resetPassword(input: {
    readonly email: string;
    readonly newPassword: string;
    readonly otp: string;
    readonly resetToken: string;
  }): Promise<void> {
    await this.publicCommand('/api/v1/auth/password/reset', input);
  }

  async logout(): Promise<void> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'x-papadata-csrf': csrfToken,
      },
    });
    const payload = await readJson<unknown>(response);
    assertOk(response, payload);
    this.csrfToken = null;
  }

  async probeProtectedApi(): Promise<{
    readonly ok: boolean;
    readonly status: number;
    readonly requestId: string | null;
  }> {
    const response = await this.fetch('/api/v1/integrations/providers', {
      method: 'GET',
    });
    return {
      ok: response.ok,
      status: response.status,
      requestId: response.headers.get('x-request-id'),
    };
  }

  async readDomainScreen<TData>(
    path: `/api/v1/${string}`,
  ): Promise<TData> {
    const response = await this.fetch(path, {
      method: 'GET',
    });
    const payload = await readJson<{
      readonly data: TData;
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  private async authenticate(
    path: string,
    body: Readonly<Record<string, string | boolean>>,
  ): Promise<AuthenticationResult> {
    const response = await this.fetch(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const payload = await readJson<{
      readonly data: AuthenticationResult;
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  private async publicCommand(
    path: string,
    body: Readonly<Record<string, string>>,
  ): Promise<void> {
    const response = await this.fetch(path, {
      method: 'POST',
      headers: {
        'idempotency-key': createCorrelationId(),
      },
      body: JSON.stringify(body),
    });
    const payload = await readJson<unknown>(response);
    assertOk(response, payload);
  }

  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    const response = await this.fetch('/api/csrf', { method: 'GET' });
    const payload = await readJson<{
      readonly data: {
        readonly csrfToken: string;
      };
    }>(response);
    assertOk(response, payload);
    this.csrfToken = payload.data.csrfToken;
    return this.csrfToken;
  }

  private fetch(
    path: string,
    init: RequestInit,
  ): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    headers.set('x-correlation-id', createCorrelationId());
    if (init.body !== undefined && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers,
      redirect: 'manual',
    });
  }
}

export const bffClient = new BffClient();

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new BffProblem(
      response.status,
      'INVALID_JSON_RESPONSE',
      'BFF returned a response that is not valid JSON.',
    );
  }
}

function assertOk(response: Response, payload: unknown): void {
  if (response.ok) return;
  const errorPayload: ErrorPayload = isRecord(payload)
    ? payload as ErrorPayload
    : {};
  const code = typeof errorPayload.error?.code === 'string'
    ? errorPayload.error.code
    : `HTTP_${response.status}`;
  const message = typeof errorPayload.error?.message === 'string'
    ? errorPayload.error.message
    : friendlyMessage(code, response.status);
  throw new BffProblem(response.status, code, message);
}

function friendlyMessage(code: string, status: number): string {
  if (code === 'LOGIN_FAILED') return 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.';
  if (code === 'REGISTRATION_FAILED') return 'Nie udało się utworzyć konta.';
  if (status === 401) return 'Sesja wygasła lub nie jest aktywna.';
  if (status === 403) return 'Żądanie zostało odrzucone przez zabezpieczenia aplikacji.';
  if (status >= 500) return 'Usługa jest chwilowo niedostępna.';
  return 'Żądanie nie mogło zostać wykonane.';
}

function createCorrelationId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
