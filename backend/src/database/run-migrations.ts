import "reflect-metadata";
import { AppDataSource } from "./data-source";

async function main() {
  await AppDataSource.initialize();
  const migrations = await AppDataSource.runMigrations({ transaction: "all" });
  console.log(`Applied ${migrations.length} migration(s).`);
  await AppDataSource.destroy();
}

void main().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
