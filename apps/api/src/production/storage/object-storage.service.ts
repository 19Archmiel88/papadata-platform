import { Injectable } from "@nestjs/common";
import { ObjectStorageClient, type StoredObject } from "@papadata/storage";
import { readProductionConfig } from "../config.js";

@Injectable()
export class ObjectStorageService {
  private readonly client: ObjectStorageClient;

  constructor() {
    const config = readProductionConfig();
    this.client = new ObjectStorageClient({
      driver: config.storageDriver,
      bucket: config.storageBucket,
      endpoint: config.storageEndpoint,
      accessKey: config.storageAccessKey,
      secretKey: config.storageSecretKey,
      projectId: config.gcpProjectId,
    });
  }

  put(key: string, body: Buffer, contentType: string): Promise<StoredObject> {
    return this.client.put(key, body, contentType);
  }

  get(key: string): Promise<Buffer> {
    return this.client.get(key);
  }

  exists(key: string): Promise<boolean> {
    return this.client.exists(key);
  }

  delete(key: string): Promise<void> {
    return this.client.delete(key);
  }

  createSignedDownloadUrl(
    key: string,
    expiresInSeconds: number,
  ): Promise<string> {
    return this.client.createSignedDownloadUrl(key, expiresInSeconds);
  }
}
