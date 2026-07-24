import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
const parameters = {
  type: argon2.argon2id,
  memoryCost: Number(process.env.ARGON2_MEMORY_KIB ?? 65536),
  timeCost: Number(process.env.ARGON2_TIME_COST ?? 3),
  parallelism: Number(process.env.ARGON2_PARALLELISM ?? 1),
} satisfies argon2.HashOptions;
@Injectable()
export class Argon2PasswordService {
  async hash(secret: string): Promise<string> { return argon2.hash(secret, parameters); }
  async verify(hash: string, secret: string): Promise<boolean> { return argon2.verify(hash, secret); }
  needsRehash(hash: string): boolean {
    return argon2.needsRehash(hash, { memoryCost: parameters.memoryCost, timeCost: parameters.timeCost, parallelism: parameters.parallelism });
  }
}
