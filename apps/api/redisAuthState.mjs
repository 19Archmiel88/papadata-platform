import { createConnection } from "node:net";

const defaultPrefix = "papadata:auth";

export class RedisAuthState {
  constructor(options = {}) {
    this.client = new RedisRespClient({
      host: options.host ?? process.env.REDIS_HOST ?? "redis",
      port: Number.parseInt(String(options.port ?? process.env.REDIS_PORT ?? "6379"), 10),
    });
    this.prefix = options.prefix ?? defaultPrefix;
  }

  async findUserByEmail(email) {
    const userId = await this.client.get(this.key("email", email));
    return userId ? this.findUserById(userId) : undefined;
  }

  async findUserById(userId) {
    return this.client.getJson(this.key("user", userId));
  }

  async saveUser(user) {
    await this.client.setJson(this.key("user", user.userId), user);
    await this.client.set(this.key("email", user.email), user.userId);
  }

  async findSession(sessionId) {
    return this.client.getJson(this.key("session", sessionId));
  }

  async saveSession(session) {
    await this.client.setJson(this.key("session", session.sessionId), session);
    await this.client.set(this.key("sessionByUser", session.userId, session.sessionId), session.sessionId);
  }

  async listSessionsByUser(userId) {
    const keys = await this.client.keys(this.key("sessionByUser", userId, "*"));
    const sessionIds = await Promise.all(keys.map((key) => this.client.get(key)));
    const sessions = await Promise.all(
      sessionIds.filter(Boolean).map((sessionId) => this.findSession(sessionId)),
    );

    return sessions
      .filter(Boolean)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async saveChallenge(challenge) {
    await this.client.setJson(this.key("challenge", challenge.challengeId), challenge);
    await this.client.set(
      this.key("challengeByUser", challenge.userId, challenge.purpose, challenge.challengeId),
      challenge.challengeId,
    );
  }

  async findChallenge(challengeId) {
    return this.client.getJson(this.key("challenge", challengeId));
  }

  async savePasswordReset(reset) {
    await this.client.setJson(this.key("passwordReset", reset.resetId), reset);
    await this.client.set(this.key("passwordResetByUser", reset.userId, reset.resetId), reset.resetId);
  }

  async findActivePasswordResetByUser(userId) {
    const keys = await this.client.keys(this.key("passwordResetByUser", userId, "*"));
    const resetIds = await Promise.all(keys.map((key) => this.client.get(key)));
    const resets = await Promise.all(
      resetIds.filter(Boolean).map((resetId) => this.client.getJson(this.key("passwordReset", resetId))),
    );

    return resets
      .filter((reset) => reset && reset.usedAt === null)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  }

  async appendEmail(message) {
    await this.client.setJson(this.key("emailOutbox", message.messageId), message);
  }

  async appendAudit(event) {
    await this.client.setJson(this.key("audit", event.auditEventId), event);
  }

  async getRateLimit(key) {
    return this.client.getJson(this.key("rateLimit", key));
  }

  async saveRateLimit(record) {
    await this.client.setJson(this.key("rateLimit", record.key), record);
  }

  async snapshot() {
    const [auditEvents, challenges, emailOutbox, passwordResets, rateLimits, sessions, users] =
      await Promise.all([
        this.valuesByPattern("audit", "*"),
        this.valuesByPattern("challenge", "*"),
        this.valuesByPattern("emailOutbox", "*"),
        this.valuesByPattern("passwordReset", "*"),
        this.valuesByPattern("rateLimit", "*"),
        this.valuesByPattern("session", "*"),
        this.valuesByPattern("user", "*"),
      ]);

    return {
      auditEvents,
      challenges,
      emailOutbox,
      passwordResets,
      rateLimits,
      sessions,
      users,
    };
  }

  async valuesByPattern(...parts) {
    const keys = await this.client.keys(this.key(...parts));
    const values = await Promise.all(keys.map((key) => this.client.getJson(key)));
    return values.filter(Boolean);
  }

  key(...parts) {
    return [this.prefix, ...parts].join(":");
  }
}

class RedisRespClient {
  constructor(options) {
    this.host = options.host;
    this.port = options.port;
  }

  async get(key) {
    return this.command(["GET", key]);
  }

  async getJson(key) {
    const value = await this.get(key);
    return value ? JSON.parse(value) : undefined;
  }

  async keys(pattern) {
    const result = await this.command(["KEYS", pattern]);
    return Array.isArray(result) ? result : [];
  }

  async set(key, value) {
    await this.command(["SET", key, value]);
  }

  async setJson(key, value) {
    await this.set(key, JSON.stringify(value));
  }

  command(args) {
    return new Promise((resolve, reject) => {
      let settled = false;
      let buffer = Buffer.alloc(0);
      const socket = createConnection(
        {
          host: this.host,
          port: this.port,
        },
        () => {
          socket.write(encodeCommand(args));
        },
      );

      socket.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        try {
          const parsed = parseResp(buffer.toString("utf8"));
          settled = true;
          socket.end();
          resolve(parsed.value);
        } catch (error) {
          if (isIncompleteResp(buffer.toString("utf8"))) {
            return;
          }

          settled = true;
          socket.destroy();
          reject(error);
        }
      });
      socket.on("error", (error) => {
        if (!settled) {
          reject(error);
        }
      });
      socket.on("end", () => {
        if (!settled) {
          reject(new Error("Redis connection closed before a response was read."));
        }
      });
    });
  }
}

function encodeCommand(args) {
  return `*${args.length}\r\n${args
    .map((arg) => {
      const value = String(arg);
      return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
    })
    .join("")}`;
}

function parseResp(input, offset = 0) {
  const type = input[offset];

  if (type === "+") {
    const end = input.indexOf("\r\n", offset);
    return {
      next: end + 2,
      value: input.slice(offset + 1, end),
    };
  }

  if (type === "-") {
    const end = input.indexOf("\r\n", offset);
    throw new Error(input.slice(offset + 1, end));
  }

  if (type === ":") {
    const end = input.indexOf("\r\n", offset);
    return {
      next: end + 2,
      value: Number.parseInt(input.slice(offset + 1, end), 10),
    };
  }

  if (type === "$") {
    const end = input.indexOf("\r\n", offset);
    const length = Number.parseInt(input.slice(offset + 1, end), 10);

    if (length === -1) {
      return {
        next: end + 2,
        value: null,
      };
    }

    const start = end + 2;
    return {
      next: start + length + 2,
      value: input.slice(start, start + length),
    };
  }

  if (type === "*") {
    const end = input.indexOf("\r\n", offset);
    const length = Number.parseInt(input.slice(offset + 1, end), 10);
    const values = [];
    let next = end + 2;

    for (let index = 0; index < length; index += 1) {
      const parsed = parseResp(input, next);
      values.push(parsed.value);
      next = parsed.next;
    }

    return {
      next,
      value: values,
    };
  }

  throw new Error("Unsupported Redis response.");
}

function isIncompleteResp(input) {
  return !input.endsWith("\r\n");
}
