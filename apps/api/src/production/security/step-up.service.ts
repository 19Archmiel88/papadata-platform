import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { ProductionDatabase, SecurityRepository } from "@papadata/database";
@Injectable()
export class StepUpService{
 private readonly repository:SecurityRepository;constructor(database:ProductionDatabase){this.repository=new SecurityRepository(database);}
 async issue(input:{tenantId:string;userId:string;sessionId:string;assuranceLevel:"aal2"|"aal3";operationScope:string;targetReference:string|null;ttlSeconds?:number}):Promise<{proof:string;expiresAt:string}>{const proof=randomBytes(32).toString("base64url");const issuedAt=new Date();const expiresAt=new Date(issuedAt.getTime()+(input.ttlSeconds??300)*1000);await this.repository.saveStepUpProof({...input,proofHash:createHash("sha256").update(proof).digest("hex"),issuedAt:issuedAt.toISOString(),expiresAt:expiresAt.toISOString()});return{proof,expiresAt:expiresAt.toISOString()};}
 consume(input:{tenantId:string;userId:string;sessionId:string;proof:string;operationScope:string;targetReference:string|null}):Promise<boolean>{return this.repository.consumeStepUpProof({...input,proofHash:createHash("sha256").update(input.proof).digest("hex")});}
}
