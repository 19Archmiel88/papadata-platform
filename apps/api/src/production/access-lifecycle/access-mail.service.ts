import {Inject,Injectable,ServiceUnavailableException,BadRequestException} from '@nestjs/common';
import {ProductionDatabase} from '@papadata/database';
import {authMailConfig,authMailDigest,sealAuthMail} from '@papadata/integrations';
@Injectable()
export class AccessMailService{
 constructor(@Inject(ProductionDatabase) private readonly db:ProductionDatabase){}
 available():boolean{try{return authMailConfig()!==null;}catch{return false;}}
 async enqueue(kind:'verify'|'recover',rawEmail:string):Promise<{accepted:true;disclosureSafe:true;deliveryStatus:'queued'}>{
  let config:ReturnType<typeof authMailConfig>;try{config=authMailConfig();}catch{throw new ServiceUnavailableException('Email delivery configuration is unavailable.');}if(!config)throw new ServiceUnavailableException('Email delivery is not configured. No token is disclosed by this endpoint.');
  const email=rawEmail.trim().toLowerCase();if(email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw new BadRequestException('Invalid email.');
  await this.db.withSystem(async c=>{await c.query(`INSERT INTO app.access_mail_outbox(kind,encrypted_address,request_digest) VALUES($1,$2,$3) ON CONFLICT(request_digest) DO NOTHING`,[kind,sealAuthMail(email,config.key),authMailDigest(kind,email,config.key)]);});
  return {accepted:true,disclosureSafe:true,deliveryStatus:'queued'};
 }
}
