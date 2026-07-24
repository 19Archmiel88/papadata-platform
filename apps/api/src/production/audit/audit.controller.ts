import { Body, Controller, Post } from "@nestjs/common";
import {
  AuditDeniedAccess,
  RequireAuthLevel,
  RequireCapabilities,
} from "../auth/route-policy.js";
import { AuditService } from "./audit.service.js";
@Controller("v1/audit")
export class AuditController{constructor(private readonly audit:AuditService){}@Post("verify")@RequireCapabilities("audit.verify")@RequireAuthLevel("step_up")@AuditDeniedAccess()verify(@Body()body:{chainScope:string}):Promise<object>{return this.audit.verify(body.chainScope);}}
