import { Global, Module } from "@nestjs/common";
import { ProductionDatabase } from "@papadata/database";
import { readProductionConfig } from "./config.js";

@Global()
@Module({
  providers: [
    {
      provide: ProductionDatabase,
      useFactory: () => {
        const config = readProductionConfig();
        return new ProductionDatabase({
          connectionString: config.databaseUrl,
          max: Number(process.env.DB_POOL_MAX ?? 20),
          statementTimeoutMs: Number(process.env.DB_STATEMENT_TIMEOUT_MS ?? 30000),
        });
      },
    },
  ],
  exports: [ProductionDatabase],
})
export class DatabaseModule {}
