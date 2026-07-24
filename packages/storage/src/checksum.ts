import { createHash } from "node:crypto";

export function calculateSha256(body: Buffer): string {
  return createHash("sha256").update(body).digest("hex");
}
