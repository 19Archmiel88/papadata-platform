import { Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { AuditRepository, ProductionDatabase } from "@papadata/database";
import type { AuditEventInput } from "@papadata/contracts";

export type TenantAuditEventInput = Omit<AuditEventInput, "tenantId"> & {
  readonly tenantId: string;
};

@Injectable()
export class AuditService {
  private readonly repository: AuditRepository;

  constructor(@Inject(ProductionDatabase) database: ProductionDatabase) {
    this.repository = new AuditRepository(database);
  }

  append(input: TenantAuditEventInput): Promise<Record<string, unknown>> {
    return this.repository.append({
      ...input,
      chainScope: input.tenantId,
    });
  }

  verify(
    tenantId: string,
    chainScope: string,
  ): Promise<{
    valid: boolean;
    checkedEvents: number;
    firstInvalidSequence: string | null;
    latestHash: string | null;
  }> {
    if (chainScope !== tenantId) {
      throw new Error("Audit chain scope must match the authenticated tenant.");
    }
    return this.repository.verify(tenantId, chainScope);
  }
}
