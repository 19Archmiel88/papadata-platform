import { Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ method: string; headers: Record<string,string|undefined>; cookies: Record<string,string|undefined> }>();
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
    const header = request.headers["x-csrf-token"];
    const cookie = request.cookies["papadata_csrf"];
    if (!header || !cookie) return false;
    const left = Buffer.from(header); const right = Buffer.from(cookie);
    return left.length === right.length && timingSafeEqual(left, right);
  }
}
