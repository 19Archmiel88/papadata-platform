import { Injectable } from "@nestjs/common";
import { ObjectStorageClient, type StoredObject } from "@papadata/storage";
import { readProductionConfig } from "../config.js";
@Injectable()
export class ObjectStorageService{private readonly client:ObjectStorageClient;constructor(){const c=readProductionConfig();this.client=new ObjectStorageClient({driver:c.storageDriver,bucket:c.storageBucket,endpoint:c.storageEndpoint,accessKey:c.storageAccessKey,secretKey:c.storageSecretKey,projectId:c.gcpProjectId});}put(key:string,body:Buffer,contentType:string):Promise<StoredObject>{return this.client.put(key,body,contentType);}get(key:string):Promise<Buffer>{return this.client.get(key);}delete(key:string):Promise<void>{return this.client.delete(key);}createSignedDownloadUrl(key:string,expiresInSeconds:number):Promise<string>{return this.client.createSignedDownloadUrl(key,expiresInSeconds);}}
