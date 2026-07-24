import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class ReconciliationScheduler {
  private readonly logger = new Logger(ReconciliationScheduler.name);

  @Cron(process.env.RECONCILIATION_CRON ?? "0 */6 * * *")
  scheduleReconciliation(): void {
    this.logger.log("Scheduled reconciliation tick");
  }

  @Cron(process.env.RETENTION_CRON ?? "30 2 * * *")
  scheduleRetention(): void {
    this.logger.log("Scheduled retention and deletion-ledger tick");
  }
}
