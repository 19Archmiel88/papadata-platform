import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { readProductionConfig } from "../config.js";
export type PlatformJobPayload={readonly jobType:"report"|"privacy_request"|"reconciliation"|"retention"|"ai_evaluation";readonly tenantId:string;readonly workspaceId:string|null;readonly payload:Readonly<Record<string,unknown>>;readonly idempotencyKey:string};
@Injectable()
export class PlatformQueueService implements OnModuleDestroy{private readonly connection:IORedis;private readonly queue:Queue<PlatformJobPayload>;constructor(){this.connection=new IORedis(readProductionConfig().redisUrl,{maxRetriesPerRequest:null});this.queue=new Queue("papadata-platform-jobs",{connection:this.connection,defaultJobOptions:{attempts:5,backoff:{type:"exponential",delay:5000},removeOnComplete:1000,removeOnFail:5000}});}async enqueue(payload:PlatformJobPayload):Promise<void>{await this.queue.add(payload.jobType,payload,{jobId:payload.idempotencyKey});}async onModuleDestroy():Promise<void>{await this.queue.close();await this.connection.quit();}}
