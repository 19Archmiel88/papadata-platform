import { Injectable } from "@nestjs/common";
import { AuditRepository, ProductionDatabase } from "@papadata/database";
import type { AuditEventInput } from "@papadata/contracts";
@Injectable()
export class AuditService{private readonly repository:AuditRepository;constructor(database:ProductionDatabase){this.repository=new AuditRepository(database);}append(input:AuditEventInput):Promise<Record<string,unknown>>{return this.repository.append({...input,chainScope:input.tenantId??"platform"});}verify(chainScope:string):Promise<{valid:boolean;checkedEvents:number;firstInvalidSequence:string|null;latestHash:string|null}>{return this.repository.verify(chainScope);}}
