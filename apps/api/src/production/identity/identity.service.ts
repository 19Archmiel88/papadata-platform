import { Inject } from "@nestjs/common";
import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { tenantOwnerBootstrapCapabilities } from "@papadata/contracts";
import { IdentityRepository, type IdentityMembershipRow } from "@papadata/database";
import { ProductionDatabase } from "@papadata/database";
import { Argon2PasswordService } from "../security/argon2.service.js";
import type { IdentityLoginDto, IdentityRegisterDto } from "./identity.dto.js";

export type IdentityBootstrap = {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly memberships: readonly IdentityMembershipRow[];
};

@Injectable()
export class IdentityService {
  private readonly repository: IdentityRepository;

  constructor(
    @Inject(ProductionDatabase) database: ProductionDatabase,
    @Inject(Argon2PasswordService) private readonly passwords: Argon2PasswordService,
  ) {
    this.repository = new IdentityRepository(database);
  }

  async register(input: IdentityRegisterDto): Promise<IdentityBootstrap> {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) throw new ConflictException("Account already exists.");
    const passwordHash = await this.passwords.hash(input.password);
    try {
      const result = await this.repository.register({
        email: input.email,
        passwordHash,
        displayName: input.displayName.trim(),
        tenantName: input.organizationName.trim(),
        workspaceName: input.workspaceName.trim(),
        capabilities: tenantOwnerBootstrapCapabilities,
      });
      return {
        userId: result.user.userId,
        email: result.user.normalizedEmail,
        displayName: result.user.displayName,
        memberships: [result.membership],
      };
    } catch (error) {
      if (error instanceof Error && error.message === "IDENTITY_EMAIL_EXISTS") {
        throw new ConflictException("Account already exists.");
      }
      throw error;
    }
  }

  async login(
    input: IdentityLoginDto,
    context: { readonly correlationId: string | null; readonly ipAddress: string | null },
  ): Promise<IdentityBootstrap> {
    const user = await this.repository.findByEmail(input.email);
    if (!user || user.status !== "active" || (user.lockedUntil && Date.parse(user.lockedUntil) > Date.now())) {
      throw new UnauthorizedException("Invalid credentials.");
    }
    const valid = await this.passwords.verify(user.passwordHash, input.password);
    await this.repository.recordLogin({
      user,
      outcome: valid ? "success" : "denied",
      correlationId: context.correlationId,
      ipHash: context.ipAddress ? hashIp(context.ipAddress) : null,
      ...(valid ? {} : { failureReason: "invalid_password" }),
    });
    if (!valid) throw new UnauthorizedException("Invalid credentials.");
    const memberships = await this.repository.listMemberships(user);
    if (memberships.length === 0) throw new UnauthorizedException("No active membership.");
    if (this.passwords.needsRehash(user.passwordHash)) {
      // Rehash is intentionally deferred to a dedicated command to avoid extending login latency.
    }
    return {
      userId: user.userId,
      email: user.normalizedEmail,
      displayName: user.displayName,
      memberships,
    };
  }
}

function hashIp(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
