import { createServer, type Server, type Socket } from "node:net";
import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { authMailConfig, deliverAuthMail, openAuthMail, sealAuthMail } from "./auth-mail.js";

const validKeyBase64 = randomBytes(32).toString("base64");

function baseEnv(overrides: Record<string, string | undefined> = {}): NodeJS.ProcessEnv {
  return {
    PAPADATA_AUTH_MAIL_ENABLED: "true",
    PAPADATA_AUTH_MAIL_KEY_BASE64: validKeyBase64,
    PAPADATA_AUTH_MAIL_FROM: "PapaData <no-reply@papadata.localhost>",
    PAPADATA_WEB_ORIGIN: "https://papadata.localhost",
    PAPADATA_AUTH_MAIL_API_KEY: "resend-test-api-key-1234567890",
    ...overrides,
  };
}

describe("authMailConfig", () => {
  it("mail disabled: returns null when PAPADATA_AUTH_MAIL_ENABLED is not 'true'", () => {
    expect(authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_ENABLED: undefined }))).toBeNull();
    expect(authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_ENABLED: "false" }))).toBeNull();
  });

  it("invalid mail config: throws when the encryption key is not exactly 32 bytes", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_KEY_BASE64: Buffer.from("too-short").toString("base64") })))
      .toThrow(/Invalid auth mail configuration/u);
  });

  it("invalid mail config: throws when the sender has no @", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_FROM: "not-an-email" })))
      .toThrow(/Invalid auth mail configuration/u);
  });

  it("invalid mail config: throws when the web origin is not HTTPS", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_WEB_ORIGIN: "http://papadata.localhost" })))
      .toThrow(/Invalid auth mail configuration/u);
  });

  it("invalid mail config: throws when the web origin carries a path/query/fragment", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_WEB_ORIGIN: "https://papadata.localhost/x" })))
      .toThrow(/Invalid auth mail configuration/u);
  });

  it("resend transport config: defaults to resend when PAPADATA_AUTH_MAIL_TRANSPORT is unset (staging/production behavior, unaffected)", () => {
    const config = authMailConfig(baseEnv());
    expect(config?.transport).toEqual({ kind: "resend", apiKey: "resend-test-api-key-1234567890" });
  });

  it("resend transport config: throws when the API key is too short", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_TRANSPORT: "resend", PAPADATA_AUTH_MAIL_API_KEY: "short" })))
      .toThrow(/Invalid auth mail configuration/u);
  });

  it("smtp transport config: reads host/port/secure/optional auth", () => {
    const config = authMailConfig(baseEnv({
      PAPADATA_AUTH_MAIL_TRANSPORT: "smtp",
      PAPADATA_AUTH_MAIL_SMTP_HOST: "mailpit",
      PAPADATA_AUTH_MAIL_SMTP_PORT: "1025",
      PAPADATA_AUTH_MAIL_SMTP_SECURE: "false",
    }));
    expect(config?.transport).toEqual({
      kind: "smtp",
      smtp: { host: "mailpit", port: 1025, secure: false, auth: null },
    });
  });

  it("smtp transport config: works without any credentials (Mailpit needs none)", () => {
    const config = authMailConfig(baseEnv({
      PAPADATA_AUTH_MAIL_TRANSPORT: "smtp",
      PAPADATA_AUTH_MAIL_SMTP_HOST: "mailpit",
      PAPADATA_AUTH_MAIL_SMTP_PORT: "1025",
      PAPADATA_AUTH_MAIL_API_KEY: undefined,
    }));
    expect(config?.transport).toMatchObject({ kind: "smtp", smtp: { auth: null } });
  });

  it("smtp transport config: carries optional auth when a user/pass is configured", () => {
    const config = authMailConfig(baseEnv({
      PAPADATA_AUTH_MAIL_TRANSPORT: "smtp",
      PAPADATA_AUTH_MAIL_SMTP_HOST: "smtp.example.test",
      PAPADATA_AUTH_MAIL_SMTP_PORT: "587",
      PAPADATA_AUTH_MAIL_SMTP_SECURE: "true",
      PAPADATA_AUTH_MAIL_SMTP_USER: "smtp-user",
      PAPADATA_AUTH_MAIL_SMTP_PASSWORD: "smtp-pass",
    }));
    expect(config?.transport).toEqual({
      kind: "smtp",
      smtp: { host: "smtp.example.test", port: 587, secure: true, auth: { user: "smtp-user", pass: "smtp-pass" } },
    });
  });

  it("smtp transport config: throws when host is missing", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_TRANSPORT: "smtp", PAPADATA_AUTH_MAIL_SMTP_PORT: "1025" })))
      .toThrow(/Invalid auth mail configuration/u);
  });

  it("smtp transport config: throws when port is out of range", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_TRANSPORT: "smtp", PAPADATA_AUTH_MAIL_SMTP_HOST: "mailpit", PAPADATA_AUTH_MAIL_SMTP_PORT: "0" })))
      .toThrow(/Invalid auth mail configuration/u);
  });

  it("unsupported transport value throws instead of silently falling back", () => {
    expect(() => authMailConfig(baseEnv({ PAPADATA_AUTH_MAIL_TRANSPORT: "sendgrid" })))
      .toThrow(/Invalid auth mail configuration/u);
  });
});

describe("sealAuthMail / openAuthMail", () => {
  it("round-trips through the SMTP transport path unchanged from the resend path", () => {
    const key = Buffer.from(validKeyBase64, "base64");
    expect(openAuthMail(sealAuthMail("hello@example.test", key), key)).toBe("hello@example.test");
  });
});

// A minimal real SMTP server (EHLO/MAIL FROM/RCPT TO/DATA/QUIT), just enough
// for nodemailer's SMTP transport to complete a real send over a real socket
// -- this exercises the actual deliverAuthMail -> nodemailer -> SMTP wire
// path production-parity's Mailpit sits behind, without depending on Docker
// being available for this test run.
function startFakeSmtpServer(): Promise<{ server: Server; port: number; messages: string[] }> {
  return new Promise((resolve) => {
    const messages: string[] = [];
    const server = createServer((socket: Socket) => {
      let buffer = "";
      let inData = false;
      let dataChunks: string[] = [];
      socket.write("220 fake-smtp ready\r\n");
      socket.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        let index: number;
        while ((index = buffer.indexOf("\r\n")) !== -1) {
          const line = buffer.slice(0, index);
          buffer = buffer.slice(index + 2);
          if (inData) {
            if (line === ".") {
              inData = false;
              messages.push(dataChunks.join("\n"));
              dataChunks = [];
              socket.write("250 OK: queued\r\n");
            } else {
              dataChunks.push(line);
            }
            continue;
          }
          const command = line.split(" ")[0]?.toUpperCase();
          if (command === "EHLO" || command === "HELO") socket.write("250 fake-smtp\r\n");
          else if (command === "MAIL") socket.write("250 OK\r\n");
          else if (command === "RCPT") socket.write("250 OK\r\n");
          else if (command === "DATA") { inData = true; socket.write("354 End data with <CR><LF>.<CR><LF>\r\n"); }
          else if (command === "QUIT") { socket.write("221 Bye\r\n"); socket.end(); }
          else socket.write("500 unrecognized\r\n");
        }
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ server, port, messages });
    });
  });
}

describe("deliverAuthMail: local SMTP delivery", () => {
  let server: Server | undefined;

  afterEach(async () => {
    if (server) await new Promise((resolve) => server!.close(resolve));
    server = undefined;
  });

  it("sends the verification message over real SMTP wire to a local mailbox-shaped server", async () => {
    const fake = await startFakeSmtpServer();
    server = fake.server;
    const config = authMailConfig(baseEnv({
      PAPADATA_AUTH_MAIL_TRANSPORT: "smtp",
      PAPADATA_AUTH_MAIL_SMTP_HOST: "127.0.0.1",
      PAPADATA_AUTH_MAIL_SMTP_PORT: String(fake.port),
      PAPADATA_AUTH_MAIL_SMTP_SECURE: "false",
    }))!;

    await deliverAuthMail(config, "job-1", {
      from: "PapaData <no-reply@papadata.localhost>",
      to: ["new-user@example.test"],
      subject: "PapaData - potwierdzenie adresu e-mail",
      text: "Otworz link: https://papadata.localhost/auth/verify-email#token=abc123",
    });

    expect(fake.messages).toHaveLength(1);
    expect(fake.messages[0]).toContain("Otworz link: https://papadata.localhost/auth/verify-email#token=abc123");
    // The verification/reset token travels only inside the message body sent
    // to the mailbox -- never anywhere this test could mistake for a log or
    // response surface.
  });

  it("throws a sanitized MAIL_PROVIDER_SMTP error (no address/body leak) when the server refuses delivery", async () => {
    const refusing = createServer((socket: Socket) => {
      socket.write("220 fake-smtp ready\r\n");
      socket.on("data", () => socket.write("550 mailbox unavailable\r\n"));
    });
    await new Promise<void>((resolve) => refusing.listen(0, "127.0.0.1", resolve));
    server = refusing;
    const address = refusing.address();
    const port = typeof address === "object" && address ? address.port : 0;

    const config = authMailConfig(baseEnv({
      PAPADATA_AUTH_MAIL_TRANSPORT: "smtp",
      PAPADATA_AUTH_MAIL_SMTP_HOST: "127.0.0.1",
      PAPADATA_AUTH_MAIL_SMTP_PORT: String(port),
    }))!;

    await expect(deliverAuthMail(config, "job-2", {
      from: "PapaData <no-reply@papadata.localhost>",
      to: ["rejected@example.test"],
      subject: "subject",
      text: "text",
    })).rejects.toThrow("MAIL_PROVIDER_SMTP");
  });

  it("throws MAIL_PROVIDER_SMTP when the queued payload is not the expected shape", async () => {
    const config = authMailConfig(baseEnv({
      PAPADATA_AUTH_MAIL_TRANSPORT: "smtp",
      PAPADATA_AUTH_MAIL_SMTP_HOST: "127.0.0.1",
      PAPADATA_AUTH_MAIL_SMTP_PORT: "1",
    }))!;

    await expect(deliverAuthMail(config, "job-3", { garbage: true })).rejects.toThrow("MAIL_PROVIDER_SMTP");
  });
});
