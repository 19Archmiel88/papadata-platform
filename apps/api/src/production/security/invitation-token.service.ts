import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { ProductionDatabase, SecurityRepository } from "@papadata/database";
@Injectable()
export class InvitationTokenService{
 private readonly repository:SecurityRepository;constructor(@Inject(ProductionDatabase) database:ProductionDatabase){this.repository=new SecurityRepository(database);}
 async issue(input:{tenantId:string;invitationId:string;tokenVersion:number;ttlHours?:number}):Promise<{token:string;expiresAt:string}>{const token=randomBytes(32).toString("base64url");const issuedAt=new Date();const expiresAt=new Date(issuedAt.getTime()+(input.ttlHours??48)*3600000);await this.repository.saveInvitationToken({tenantId:input.tenantId,invitationId:input.invitationId,tokenVersion:input.tokenVersion,tokenHash:createHash("sha256").update(token).digest("hex"),issuedAt:issuedAt.toISOString(),expiresAt:expiresAt.toISOString()});return{token,expiresAt:expiresAt.toISOString()};}
 consume(input:{tenantId:string;invitationId:string;token:string}):Promise<boolean>{return this.repository.consumeInvitationToken({tenantId:input.tenantId,invitationId:input.invitationId,tokenHash:createHash("sha256").update(input.token).digest("hex")});}
}
