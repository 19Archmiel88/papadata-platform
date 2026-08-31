import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { ProductionDatabase, SecurityRepository } from "@papadata/database";
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const encode=(input:Buffer):string=>{let bits="";for(const byte of input)bits+=byte.toString(2).padStart(8,"0");let output="";for(let i=0;i<bits.length;i+=5)output+=alphabet[Number.parseInt(bits.slice(i,i+5).padEnd(5,"0"),2)];return output;};
const decode=(value:string):Buffer=>{let bits="";for(const char of value.replace(/=+$/u,"").toUpperCase()){const index=alphabet.indexOf(char);if(index<0)throw new Error("Invalid base32 secret");bits+=index.toString(2).padStart(5,"0");}const bytes:number[]=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(Number.parseInt(bits.slice(i,i+8),2));return Buffer.from(bytes);};
@Injectable()
export class TotpService{
 private readonly repository:SecurityRepository;constructor(@Inject(ProductionDatabase) database:ProductionDatabase){this.repository=new SecurityRepository(database);}
 private key():Buffer{const value=process.env.MFA_ENCRYPTION_KEY;if(!value)throw new Error("MFA_ENCRYPTION_KEY is required");const key=Buffer.from(value,/^[0-9a-f]{64}$/iu.test(value)?"hex":"base64");if(key.length!==32)throw new Error("MFA_ENCRYPTION_KEY must decode to 32 bytes");return key;}
 private encrypt(secret:string):string{const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",this.key(),iv);const data=Buffer.concat([cipher.update(secret,"utf8"),cipher.final()]);return[iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),data.toString("base64url")].join(".");}
 private decrypt(value:string):string{const[iv,tag,data]=value.split(".");if(!iv||!tag||!data)throw new Error("Invalid encrypted MFA secret");const decipher=createDecipheriv("aes-256-gcm",this.key(),Buffer.from(iv,"base64url"));decipher.setAuthTag(Buffer.from(tag,"base64url"));return Buffer.concat([decipher.update(Buffer.from(data,"base64url")),decipher.final()]).toString("utf8");}
 private code(secret:string,time:number):string{const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(time/30000)));const digest=createHmac("sha1",decode(secret)).update(counter).digest();const offset=digest[digest.length-1]!&15;const binary=((digest[offset]!&127)<<24)|((digest[offset+1]!&255)<<16)|((digest[offset+2]!&255)<<8)|(digest[offset+3]!&255);return String(binary%1000000).padStart(6,"0");}
 async enroll(input:{tenantId:string;userId:string;accountName:string}):Promise<{secret:string;otpauthUri:string;recoveryCodes:readonly string[]}>{const secret=encode(randomBytes(20));const recoveryCodes=Array.from({length:10},()=>randomBytes(8).toString("hex"));const recoveryCodeHashes=recoveryCodes.map(value=>this.hashRecoveryCode(value));await this.repository.saveMfaEnrollment({tenantId:input.tenantId,userId:input.userId,encryptedSecret:this.encrypt(secret),recoveryCodeHashes});return{secret,otpauthUri:`otpauth://totp/${encodeURIComponent(`PapaData:${input.accountName}`)}?secret=${secret}&issuer=PapaData&algorithm=SHA1&digits=6&period=30`,recoveryCodes};}
 // Activates a pending enrollment (first-time, or a freshly re-enrolled
 // secret). Anti-replay applies here too -- see matchStep -- so the same
 // code cannot both confirm the enrollment and be reused a second time.
 async confirm(input:{tenantId:string;userId:string;code:string}):Promise<boolean>{const row=await this.repository.findMfaEnrollment(input.tenantId,input.userId);if(!row||row.status!=="pending")return false;const step=this.matchStep(this.decrypt(String(row.encrypted_secret)),input.code);if(step===null)return false;if(!await this.repository.advanceTotpStep({tenantId:input.tenantId,userId:input.userId,step}))return false;await this.repository.activateMfaEnrollment(input.tenantId,input.userId);return true;}
 // Verifies a code against an already-active enrollment -- used both for
 // the per-login MFA challenge (see BffSessionAssuranceService.verifyMfa)
 // and to gate step-up proof issuance. A code accepted once here (or by
 // confirm/step-up) cannot be presented again: advanceTotpStep only
 // succeeds for a step strictly newer than the last one accepted for this
 // enrollment, so a captured/replayed code fails even within its own
 // 30-second acceptance window.
 async verify(input:{tenantId:string;userId:string;code:string}):Promise<boolean>{const row=await this.repository.findMfaEnrollment(input.tenantId,input.userId);if(!row||row.status!=="active")return false;const step=this.matchStep(this.decrypt(String(row.encrypted_secret)),input.code);if(step===null)return false;return this.repository.advanceTotpStep({tenantId:input.tenantId,userId:input.userId,step});}
 // Redeems one of the ten recovery codes issued at enroll time as an
 // alternate second factor when the TOTP device is unavailable. Each code
 // is single-use, enforced atomically by the repository (see
 // SecurityRepository.redeemRecoveryCode's row-level-lock comment).
 async redeemRecoveryCode(input:{tenantId:string;userId:string;code:string}):Promise<boolean>{const row=await this.repository.findMfaEnrollment(input.tenantId,input.userId);if(!row||row.status!=="active")return false;return this.repository.redeemRecoveryCode({tenantId:input.tenantId,userId:input.userId,codeHash:this.hashRecoveryCode(input.code)});}
 // Disables/revokes the enrollment. The caller (SecurityController) is
 // responsible for the "security changed" fallout of this -- see
 // BffSessionAssuranceService.disableMfa, which revokes every session for
 // the account, including the current one, since removing the account's
 // only second factor is the most severe self-service security downgrade
 // available and warrants forcing a full fresh login afterward.
 async disable(input:{tenantId:string;userId:string}):Promise<void>{await this.repository.revokeMfaEnrollment(input.tenantId,input.userId);}
 private hashRecoveryCode(value:string):string{return createHmac("sha256",this.key()).update(value.trim().toLowerCase()).digest("hex");}
 // Returns the matched TOTP time-step (not just a boolean) so confirm/verify
 // can atomically record it via advanceTotpStep -- the anti-replay check
 // needs to know *which* step matched, not merely that some step in the
 // +/-30s tolerance window did.
 private matchStep(secret:string,supplied:string):number|null{const now=Date.now();for(const offset of[-1,0,1]){const time=now+offset*30000;const expected=this.code(secret,time);const left=Buffer.from(expected),right=Buffer.from(supplied);if(left.length===right.length&&timingSafeEqual(left,right))return Math.floor(time/30000);}return null;}
}
