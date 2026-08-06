import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectVersionsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Storage } from "@google-cloud/storage";
import { calculateSha256 } from "./checksum.js";

export { calculateSha256 } from "./checksum.js";

export type ObjectStorageConfig = {
  readonly driver: "minio" | "gcs";
  readonly bucket: string;
  readonly endpoint: string | null;
  readonly accessKey: string | null;
  readonly secretKey: string | null;
  readonly projectId: string | null;
};

export type StoredObject = {
  readonly bucket: string;
  readonly key: string;
  readonly checksumSha256: string;
  readonly sizeBytes: number;
};

export type DeleteObjectVersionsResult = {
  readonly bucket: string;
  readonly key: string;
  readonly versionsDeleted: number;
};

export class ObjectStorageClient {
  private readonly config: ObjectStorageConfig;
  private readonly s3: S3Client;
  private readonly gcs: Storage;

  constructor(config: ObjectStorageConfig) {
    this.config = config;
    this.s3 = new S3Client({
      region: "us-east-1",
      endpoint: config.endpoint ?? undefined,
      forcePathStyle: config.driver === "minio",
      credentials: config.accessKey && config.secretKey
        ? {
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
          }
        : undefined,
    });
    this.gcs = new Storage({ projectId: config.projectId ?? undefined });
  }

  async put(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<StoredObject> {
    const checksumSha256 = calculateSha256(body);
    if (this.config.driver === "gcs") {
      await this.gcs.bucket(this.config.bucket).file(key).save(body, {
        contentType,
        resumable: false,
        metadata: { metadata: { checksumSha256 } },
      });
    } else {
      await this.s3.send(new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: { checksumSha256 },
      }));
    }
    return {
      bucket: this.config.bucket,
      key,
      checksumSha256,
      sizeBytes: body.byteLength,
    };
  }

  async get(key: string): Promise<Buffer> {
    if (this.config.driver === "gcs") {
      const [data] = await this.gcs.bucket(this.config.bucket).file(key).download();
      return data;
    }
    const response = await this.s3.send(new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    }));
    if (!response.Body) throw new Error("Storage object has no body");
    return Buffer.from(await response.Body.transformToByteArray());
  }

  async exists(key: string): Promise<boolean> {
    if (this.config.driver === "gcs") {
      const [exists] = await this.gcs.bucket(this.config.bucket).file(key).exists();
      return exists;
    }
    try {
      await this.s3.send(new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    if (this.config.driver === "gcs") {
      await this.gcs.bucket(this.config.bucket).file(key).delete({
        ignoreNotFound: true,
      });
      return;
    }
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    }));
  }

  async deleteAllVersions(key: string): Promise<DeleteObjectVersionsResult> {
    if (this.config.driver === "gcs") {
      const [files] = await this.gcs.bucket(this.config.bucket).getFiles({
        prefix: key,
        versions: true,
      });
      const exact = files.filter((file) => file.name === key);
      await Promise.all(exact.map((file) => file.delete({ ignoreNotFound: true })));
      return {
        bucket: this.config.bucket,
        key,
        versionsDeleted: exact.length,
      };
    }

    let keyMarker: string | undefined;
    let versionIdMarker: string | undefined;
    let versionsDeleted = 0;

    do {
      const page = await this.s3.send(new ListObjectVersionsCommand({
        Bucket: this.config.bucket,
        Prefix: key,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
      }));
      const candidates = [
        ...(page.Versions ?? []),
        ...(page.DeleteMarkers ?? []),
      ]
        .filter((item) => item.Key === key && item.VersionId)
        .map((item) => ({ Key: item.Key!, VersionId: item.VersionId! }));

      for (let offset = 0; offset < candidates.length; offset += 1_000) {
        const objects = candidates.slice(offset, offset + 1_000);
        if (objects.length === 0) continue;
        await this.s3.send(new DeleteObjectsCommand({
          Bucket: this.config.bucket,
          Delete: { Objects: objects, Quiet: true },
        }));
        versionsDeleted += objects.length;
      }

      keyMarker = page.IsTruncated ? page.NextKeyMarker : undefined;
      versionIdMarker = page.IsTruncated ? page.NextVersionIdMarker : undefined;
    } while (keyMarker || versionIdMarker);

    return { bucket: this.config.bucket, key, versionsDeleted };
  }

  async createSignedDownloadUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<string> {
    if (this.config.driver === "gcs") {
      const [url] = await this.gcs.bucket(this.config.bucket).file(key).getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expiresInSeconds * 1_000,
      });
      return url;
    }
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}
