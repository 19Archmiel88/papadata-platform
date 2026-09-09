import {AssistantRetentionWorker} from './assistant-retention.service.js';
import {AccessMailWorker} from './access-mail-worker.service.js';
import { Module } from "@nestjs/common";import { ScheduleModule } from "@nestjs/schedule";import { IntegrationWorkerService } from "./worker.service.js";import { PlatformWorkerService } from "./platform-worker.service.js";import { ReconciliationScheduler } from "./scheduler.service.js";import { SyncDispatchScheduler } from "./sync-dispatch-scheduler.service.js";
@Module({imports:[ScheduleModule.forRoot()],providers:[AssistantRetentionWorker,AccessMailWorker,IntegrationWorkerService,PlatformWorkerService,ReconciliationScheduler,SyncDispatchScheduler]})export class WorkerProductionModule{}
