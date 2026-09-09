import {Injectable,Logger,type OnModuleDestroy} from '@nestjs/common';
import {Interval} from '@nestjs/schedule';
import {PlatformDatabase} from '@papadata/database';
import {readWorkerConfig} from './config.js';
/** Bounded deletion of explicitly ephemeral ZIP 4 data. Never deletes conversation/audit history. */
@Injectable()
export class AssistantRetentionWorker implements OnModuleDestroy {
 private readonly logger=new Logger(AssistantRetentionWorker.name);
 private busy=false;private db:PlatformDatabase|null=null;
 @Interval(60000)
 async tick():Promise<void>{
  if(this.busy||process.env.PAPADATA_ASSISTANT_RETENTION_ENABLED!=='true')return;this.busy=true;
  try{const config=readWorkerConfig();this.db??=new PlatformDatabase({connectionString:config.schedulerDatabaseUrl,max:1,statementTimeoutMs:10000});
   await this.db.withTransaction(async c=>{
    await c.query(`DELETE FROM app.assistant_text_attachments WHERE id IN(SELECT id FROM app.assistant_text_attachments WHERE expires_at<=now() ORDER BY expires_at LIMIT 500 FOR UPDATE SKIP LOCKED)`);
    await c.query(`DELETE FROM app.assistant_memory_notes WHERE id IN(SELECT id FROM app.assistant_memory_notes WHERE expires_at<=now() ORDER BY expires_at LIMIT 500 FOR UPDATE SKIP LOCKED)`);
    await c.query(`UPDATE app.assistant_generation_runs SET partial_text='',result=NULL WHERE id IN(SELECT id FROM app.assistant_generation_runs WHERE status NOT IN('queued','running') AND updated_at<now()-interval '7 days' AND (partial_text<>'' OR result IS NOT NULL) ORDER BY updated_at LIMIT 500 FOR UPDATE SKIP LOCKED)`);
   });
  }catch{this.logger.error('Assistant retention unavailable; verify ZIP 4 migrations and platform database configuration.');}finally{this.busy=false;}
 }
 async onModuleDestroy(){await this.db?.close();}
}
