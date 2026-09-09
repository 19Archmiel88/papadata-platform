import {Injectable,Logger,type OnModuleDestroy} from '@nestjs/common';
import {Interval} from '@nestjs/schedule';
import {ProductionDatabase,PlatformDatabase,IdentityRepository,EmailVerificationRepository,PasswordResetRepository} from '@papadata/database';
import {authMailConfig,openAuthMail,sealAuthMail,deliverAuthMail} from '@papadata/integrations';
import {readWorkerConfig} from './config.js';
type MailRow={id:string;kind:'verify'|'recover';encrypted_address:string;encrypted_payload:string|null;attempts:number;created_at:Date};
@Injectable()
export class AccessMailWorker implements OnModuleDestroy{
 private readonly logger=new Logger(AccessMailWorker.name);private busy=false;
 private db:ProductionDatabase|null=null;private platform:PlatformDatabase|null=null;
 @Interval(5000)
 async tick():Promise<void>{
  if(this.busy)return;let mail:ReturnType<typeof authMailConfig>;try{mail=authMailConfig();}catch{this.logger.error('Auth mail configuration unavailable.');return;}if(!mail)return;this.busy=true;
  try{
   const config=readWorkerConfig();this.db??=new ProductionDatabase({connectionString:config.databaseUrl,max:2,statementTimeoutMs:10000});this.platform??=new PlatformDatabase({connectionString:config.schedulerDatabaseUrl,max:1,statementTimeoutMs:10000});
   await this.platform.query(`UPDATE app.access_mail_outbox SET status='failed',error_code='MAIL_RETRIES_EXHAUSTED',encrypted_address='',encrypted_payload=NULL,completed_at=now() WHERE status='sending' AND available_at<now() AND attempts>=5 RETURNING id`);
   await this.platform.query(`DELETE FROM app.access_mail_outbox WHERE created_at<now()-interval '7 days' RETURNING id`);
   const rows=await this.platform.withTransaction(async c=>{const r=await c.query<MailRow>(`SELECT * FROM app.access_mail_outbox WHERE ((status='queued' AND available_at<=now()) OR (status='sending' AND available_at<now())) AND attempts<5 ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED`);const row=r.rows[0];if(row)await c.query(`UPDATE app.access_mail_outbox SET status='sending',attempts=attempts+1,available_at=now()+interval '2 minutes' WHERE id=$1`,[row.id]);return r.rows;});
   const row=rows[0];if(!row)return;
   try{
    if(Date.now()-new Date(row.created_at).getTime()>3600000)throw new Error('MAIL_QUEUE_EXPIRED');
    let payload=row.encrypted_payload?JSON.parse(openAuthMail(row.encrypted_payload,mail.key)) as unknown:null;
    if(!payload){
     const email=openAuthMail(row.encrypted_address,mail.key),user=await new IdentityRepository(this.db).findByEmail(email);
     if(!user||user.status!=='active'||(row.kind==='verify'&&user.emailVerifiedAt!==null)){
      await this.platform.query(`UPDATE app.access_mail_outbox SET status='sent',completed_at=now(),encrypted_address='',encrypted_payload=NULL WHERE id=$1 RETURNING id`,[row.id]);return;
     }
     const token=row.kind==='verify'?await new EmailVerificationRepository(this.db).createVerificationToken({user,ttlHours:24}):await new PasswordResetRepository(this.db).createResetToken({user,ttlHours:2});
     const url=new URL(row.kind==='verify'?'/auth/verify-email':'/auth/new-password',mail.webOrigin);
     // Fragment avoids proxy/access log/referrer exposure. The UI never copies this into product context.
     url.hash=new URLSearchParams({[row.kind==='verify'?'token':'resetToken']:token.token}).toString();
     payload={from:mail.from,to:[email],subject:row.kind==='verify'?'PapaData - potwierdzenie adresu e-mail':'PapaData - odzyskiwanie dostepu',text:`Otworz link i potwierdz operacje w PapaData:\n${url.href}\n\nWazny do: ${token.expiresAt}. Jesli nie proszono o te operacje, zignoruj wiadomosc.`};
     await this.platform.query(`UPDATE app.access_mail_outbox SET encrypted_payload=$2 WHERE id=$1 RETURNING id`,[row.id,sealAuthMail(JSON.stringify(payload),mail.key)]);
    }
    await deliverAuthMail(mail,row.id,payload);
    await this.platform.query(`UPDATE app.access_mail_outbox SET status='sent',completed_at=now(),encrypted_address='',encrypted_payload=NULL,error_code=NULL WHERE id=$1 RETURNING id`,[row.id]);
   }catch(error){
    const code=error instanceof Error&&/^MAIL_[A-Z_0-9]+$/.test(error.message)?error.message:'MAIL_DELIVERY_FAILED';
    const final=row.attempts>=4||code==='MAIL_QUEUE_EXPIRED';
    await this.platform.query(`UPDATE app.access_mail_outbox SET status=$2,error_code=$3,available_at=now()+interval '2 minutes',encrypted_address=CASE WHEN $4 THEN '' ELSE encrypted_address END,encrypted_payload=CASE WHEN $4 THEN NULL ELSE encrypted_payload END WHERE id=$1 RETURNING id`,[row.id,final?'failed':'queued',code,final]);
    this.logger.warn(`Auth mail job ${row.id}: ${code}`);
   }
   await this.platform.query(`DELETE FROM app.access_mail_outbox WHERE created_at<now()-interval '7 days' RETURNING id`);
  }catch{this.logger.error('Auth mail worker unavailable; inspect configuration/migrations without logging message contents.');}
  finally{this.busy=false;}
 }
 async onModuleDestroy(){await this.db?.close();await this.platform?.close();}
}
