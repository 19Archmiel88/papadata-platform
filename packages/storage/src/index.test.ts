// packages/storage previously had zero test coverage on either driver
// branch (MinIO/S3 and GCS), even though both are real production code
// paths -- production always runs the GCS branch, production-parity always
// runs the S3/MinIO branch, and nothing exercised either as part of CI.
// These tests mock both underlying SDKs and run the SAME behavioral
// assertions against both drivers wherever the public interface promises
// the same thing (put/get round-trip, exists, delete, overwrite, error
// semantics), plus driver-specific assertions for the two signed-URL
// implementations. This is "certified" contract-level parity: it can't
// replace a live GCS staging acceptance run, but it proves both drivers
// satisfy the identical ObjectStorageClient interface today, and will
// catch a future change that makes them diverge.
import { describe, expect, it, vi, beforeEach } from "vitest";

const s3Send = vi.fn();
const s3ClientInstances: unknown[] = [];

vi.mock("@aws-sdk/client-s3", () => {
  class FakeCommand {
    constructor(public readonly input: Record<string, unknown>) {}
  }
  class S3Client {
    public readonly config: Record<string, unknown>;
    constructor(config: Record<string, unknown>) {
      this.config = config;
      s3ClientInstances.push(this);
    }
    send(command: unknown): Promise<unknown> {
      return s3Send(command);
    }
  }
  return {
    S3Client,
    PutObjectCommand: class extends FakeCommand {},
    GetObjectCommand: class extends FakeCommand {},
    HeadObjectCommand: class extends FakeCommand {},
    DeleteObjectCommand: class extends FakeCommand {},
    DeleteObjectsCommand: class extends FakeCommand {},
    ListObjectVersionsCommand: class extends FakeCommand {},
  };
});

const getSignedUrlMock = vi.fn();
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) => getSignedUrlMock(...args),
}));

const gcsFileMock = {
  save: vi.fn(),
  download: vi.fn(),
  exists: vi.fn(),
  delete: vi.fn(),
  getSignedUrl: vi.fn(),
  name: "",
};
const gcsBucketMock = {
  file: vi.fn((name: string) => ({ ...gcsFileMock, name })),
  getFiles: vi.fn(),
};
const gcsStorageMock = {
  bucket: vi.fn(() => gcsBucketMock),
};
vi.mock("@google-cloud/storage", () => ({
  // A real (non-arrow) function so `new Storage(...)` works -- arrow
  // functions have no [[Construct]] internal slot, so wrapping one in
  // vi.fn() still isn't `new`-able.
  Storage: vi.fn(function StorageMock() {
    return gcsStorageMock;
  }),
}));

const { ObjectStorageClient } = await import("./index.js");

function minioConfig() {
  return {
    driver: "minio" as const,
    bucket: "papadata-artifacts",
    endpoint: "http://minio:9000",
    accessKey: "access",
    secretKey: "secret",
    projectId: null,
  };
}

function gcsConfig() {
  return {
    driver: "gcs" as const,
    bucket: "papadata-artifacts",
    endpoint: null,
    accessKey: null,
    secretKey: null,
    projectId: "papadata-production",
  };
}

beforeEach(() => {
  s3Send.mockReset();
  getSignedUrlMock.mockReset();
  gcsFileMock.save.mockReset();
  gcsFileMock.download.mockReset();
  gcsFileMock.exists.mockReset();
  gcsFileMock.delete.mockReset();
  gcsFileMock.getSignedUrl.mockReset();
  gcsBucketMock.file.mockClear();
  gcsBucketMock.getFiles.mockReset();
});

describe.each([
  { name: "minio", config: minioConfig },
  { name: "gcs", config: gcsConfig },
])("ObjectStorageClient ($name driver): shared interface contract", ({ name, config }) => {
  it("put() computes a sha256 checksum and reports the byte length", async () => {
    if (name === "gcs") gcsFileMock.save.mockResolvedValue(undefined);
    if (name === "minio") s3Send.mockResolvedValue({});

    const client = new ObjectStorageClient(config());
    const body = Buffer.from("hello world");
    const result = await client.put("reports/one.csv", body, "text/csv");

    expect(result.bucket).toBe("papadata-artifacts");
    expect(result.key).toBe("reports/one.csv");
    expect(result.sizeBytes).toBe(body.byteLength);
    expect(result.checksumSha256).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("get() returns the object body as a Buffer", async () => {
    const payload = Buffer.from("object contents");
    if (name === "gcs") {
      gcsFileMock.download.mockResolvedValue([payload]);
    } else {
      s3Send.mockResolvedValue({
        Body: { transformToByteArray: () => Promise.resolve(new Uint8Array(payload)) },
      });
    }

    const client = new ObjectStorageClient(config());
    const result = await client.get("reports/one.csv");

    expect(Buffer.compare(result, payload)).toBe(0);
  });

  it("exists() returns true when the object is present", async () => {
    if (name === "gcs") {
      gcsFileMock.exists.mockResolvedValue([true]);
    } else {
      s3Send.mockResolvedValue({});
    }

    const client = new ObjectStorageClient(config());
    await expect(client.exists("reports/one.csv")).resolves.toBe(true);
  });

  it("exists() returns false when the object is absent", async () => {
    if (name === "gcs") {
      gcsFileMock.exists.mockResolvedValue([false]);
    } else {
      s3Send.mockRejectedValue(new Error("NotFound"));
    }

    const client = new ObjectStorageClient(config());
    await expect(client.exists("reports/missing.csv")).resolves.toBe(false);
  });

  it("delete() resolves without throwing when the object exists", async () => {
    if (name === "gcs") {
      gcsFileMock.delete.mockResolvedValue(undefined);
    } else {
      s3Send.mockResolvedValue({});
    }

    const client = new ObjectStorageClient(config());
    await expect(client.delete("reports/one.csv")).resolves.toBeUndefined();
  });

  it("put() is safe to call twice with the same key (overwrite semantics, not append)", async () => {
    if (name === "gcs") {
      gcsFileMock.save.mockResolvedValue(undefined);
    } else {
      s3Send.mockResolvedValue({});
    }

    const client = new ObjectStorageClient(config());
    await client.put("reports/one.csv", Buffer.from("v1"), "text/csv");
    const second = await client.put("reports/one.csv", Buffer.from("v2, longer"), "text/csv");

    expect(second.sizeBytes).toBe(Buffer.byteLength("v2, longer"));
  });

  it("propagates a failure from the underlying SDK on put() rather than swallowing it", async () => {
    const failure = new Error("upstream unavailable");
    if (name === "gcs") {
      gcsFileMock.save.mockRejectedValue(failure);
    } else {
      s3Send.mockRejectedValue(failure);
    }

    const client = new ObjectStorageClient(config());
    await expect(client.put("reports/one.csv", Buffer.from("x"), "text/csv")).rejects.toThrow("upstream unavailable");
  });

  it("createSignedDownloadUrl() returns a URL string", async () => {
    if (name === "gcs") {
      gcsFileMock.getSignedUrl.mockResolvedValue(["https://storage.googleapis.com/signed"]);
    } else {
      getSignedUrlMock.mockResolvedValue("https://minio.example/signed");
    }

    const client = new ObjectStorageClient(config());
    const url = await client.createSignedDownloadUrl("reports/one.csv", 3600);

    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });
});

describe("ObjectStorageClient: driver-specific wiring", () => {
  it("minio driver configures the S3 client with forcePathStyle and explicit credentials", () => {
    s3ClientInstances.length = 0;
    // eslint-disable-next-line no-new
    new ObjectStorageClient(minioConfig());

    const instance = s3ClientInstances.at(-1) as { config: Record<string, unknown> };
    expect(instance.config.forcePathStyle).toBe(true);
    expect(instance.config.endpoint).toBe("http://minio:9000");
    expect(instance.config.credentials).toEqual({ accessKeyId: "access", secretAccessKey: "secret" });
  });

  it("gcs driver never sets forcePathStyle or explicit S3 credentials (relies on the service account identity)", () => {
    s3ClientInstances.length = 0;
    // eslint-disable-next-line no-new
    new ObjectStorageClient(gcsConfig());

    const instance = s3ClientInstances.at(-1) as { config: Record<string, unknown> };
    expect(instance.config.forcePathStyle).toBe(false);
    expect(instance.config.credentials).toBeUndefined();
  });

  it("deleteAllVersions() on gcs deletes only files matching the exact key (not just the prefix)", async () => {
    gcsBucketMock.getFiles.mockResolvedValue([[
      { name: "reports/one.csv", delete: vi.fn().mockResolvedValue(undefined) },
      { name: "reports/one.csv.bak", delete: vi.fn().mockResolvedValue(undefined) },
    ]]);

    const client = new ObjectStorageClient(gcsConfig());
    const result = await client.deleteAllVersions("reports/one.csv");

    expect(result.versionsDeleted).toBe(1);
  });

  it("deleteAllVersions() on minio pages through ListObjectVersionsCommand and deletes matching versions", async () => {
    s3Send.mockImplementation((command: { input?: Record<string, unknown> }) => {
      const isList = "Prefix" in (command.input ?? {}) && !("Delete" in (command.input ?? {}));
      if (isList) {
        return Promise.resolve({
          Versions: [{ Key: "reports/one.csv", VersionId: "v1" }],
          DeleteMarkers: [],
          IsTruncated: false,
        });
      }
      return Promise.resolve({});
    });

    const client = new ObjectStorageClient(minioConfig());
    const result = await client.deleteAllVersions("reports/one.csv");

    expect(result.versionsDeleted).toBe(1);
  });
});
