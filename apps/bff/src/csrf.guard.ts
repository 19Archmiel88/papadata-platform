import { Inject, Injectable } from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import type { BffConfig } from "./config.js";
import { BFF_CONFIG } from "./tokens.js";

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    @Inject(BFF_CONFIG)
    private readonly config: BffConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      method: string;
      headers: Record<string, string | string[] | undefined>;
      cookies: Record<string, string | undefined>;
    }>();

    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return true;
    }

    const header = readHeader(request.headers, this.config.csrfHeaderName);
    const cookie = request.cookies[this.config.csrfCookieName];

    if (!header || !cookie) {
      return false;
    }

    const left = Buffer.from(header);
    const right = Buffer.from(cookie);

    return left.length === right.length && timingSafeEqual(left, right);
  }
}

function readHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | null {
  const value = headers[name.toLowerCase()];
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" && first.length > 0 ? first : null;
}
