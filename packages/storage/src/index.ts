import { calculateSha256 } from "./checksum.js";
export { calculateSha256 } from "./checksum.js";
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Storage } from "@google-cloud/storage";
export type ObjectStorageConfig={readonly driver:"minio"|"gcs";readonly bucket:string;readonly endpoint:string|null;readonly accessKey:string|null;readonly secretKey:string|null;readonly projectId:string|null};
export type StoredObject={readonly bucket:string;readonly key:string;readonly checksumSha256:string;readonly sizeBytes:number};
export class ObjectStorageClient{
 private readonly config:ObjectStorageConfig;private readonly s3:S3Client;private readonly gcs:Storage;
 constructor(config:ObjectStorageConfig){this.config=config;this.s3=new S3Client({region:"us-east-1",endpoint:config.endpoint??undefined,forcePathStyle:config.driver==="minio",credentials:config.accessKey&&config.secretKey?{accessKeyId:config.accessKey,secretAccessKey:config.secretKey}:undefined});this.gcs=new Storage({projectId:config.projectId??undefined});}
 async put(key:string,body:Buffer,contentType:string):Promise<StoredObject>{const checksumSha256=calculateSha256(body);if(this.config.driver==="gcs"){await this.gcs.bucket(this.config.bucket).file(key).save(body,{contentType,resumable:false,metadata:{metadata:{checksumSha256}}});}else{await this.s3.send(new PutObjectCommand({Bucket:this.config.bucket,Key:key,Body:body,ContentType:contentType,Metadata:{checksumSha256}}));}return{bucket:this.config.bucket,key,checksumSha256,sizeBytes:body.byteLength};}
 async get(key:string):Promise<Buffer>{if(this.config.driver==="gcs"){const[data]=await this.gcs.bucket(this.config.bucket).file(key).download();return data;}const response=await this.s3.send(new GetObjectCommand({Bucket:this.config.bucket,Key:key}));if(!response.Body)throw new Error("Storage object has no body");return Buffer.from(await response.Body.transformToByteArray());}
 async exists(key:string):Promise<boolean>{if(this.config.driver==="gcs"){const[exists]=await this.gcs.bucket(this.config.bucket).file(key).exists();return exists;}try{await this.s3.send(new HeadObjectCommand({Bucket:this.config.bucket,Key:key}));return true;}catch{return false;}}
 async delete(key:string):Promise<void>{if(this.config.driver==="gcs"){await this.gcs.bucket(this.config.bucket).file(key).delete({ignoreNotFound:true});return;}await this.s3.send(new DeleteObjectCommand({Bucket:this.config.bucket,Key:key}));}
 async createSignedDownloadUrl(key:string,expiresInSeconds:number):Promise<string>{if(this.config.driver==="gcs"){const[url]=await this.gcs.bucket(this.config.bucket).file(key).getSignedUrl({version:"v4",action:"read",expires:Date.now()+expiresInSeconds*1000});return url;}return getSignedUrl(this.s3,new GetObjectCommand({Bucket:this.config.bucket,Key:key}),{expiresIn:expiresInSeconds});}
}
