import { Global, Injectable, Module, type OnModuleDestroy } from "@nestjs/common";
import { ProductionDatabase } from "@papadata/database";
import { readProductionConfig } from "./config.js";

@Injectable()
export class ProductionDatabaseProvider
  extends ProductionDatabase
  implements OnModuleDestroy
{
  constructor() {
    const config = readProductionConfig();
    super({
      connectionString: config.databaseUrl,
      max: config.databasePoolMax,
      statementTimeoutMs: config.databaseStatementTimeoutMs,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}

@Global()
@Module({
  providers: [
    ProductionDatabaseProvider,
    {
      provide: ProductionDatabase,
      useExisting: ProductionDatabaseProvider,
    },
  ],
  exports: [ProductionDatabase, ProductionDatabaseProvider],
})
export class DatabaseModule {}
