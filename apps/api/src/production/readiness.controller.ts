import { Controller, Get } from "@nestjs/common";
import { ProductionDatabase } from "@papadata/database";
import { createClient } from "redis";
import { ObjectStorageService } from "./storage/object-storage.service.js";
import { readProductionConfig } from "./config.js";
import { PublicEndpoint } from "./auth/route-policy.js";
@Controller()
export class ReadinessController{constructor(private readonly database:ProductionDatabase,private readonly storage:ObjectStorageService){}@Get("healthz")@PublicEndpoint()health():object{return{status:"alive"};}@Get("readyz")@PublicEndpoint()async ready():Promise<object>{const dependencies:Array<{name:string;ready:boolean}>=[];try{dependencies.push({name:"postgresql",ready:await this.database.checkHealth()});}catch{dependencies.push({name:"postgresql",ready:false});}const redis=createClient({url:readProductionConfig().redisUrl});try{await redis.connect();dependencies.push({name:"redis",ready:await redis.ping()==="PONG"});}catch{dependencies.push({name:"redis",ready:false});}finally{if(redis.isOpen)await redis.quit();}try{const key=`readiness/${Date.now()}.txt`;await this.storage.put(key,Buffer.from("ok"),"text/plain");await this.storage.delete(key);dependencies.push({name:"storage",ready:true});}catch{dependencies.push({name:"storage",ready:false});}return{status:dependencies.every(item=>item.ready)?"ready":"blocked",dependencies};}@Get("startupz")@PublicEndpoint()startup():object{return{status:"started"};}}
