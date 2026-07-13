import "reflect-metadata";
import { AppDataSource } from "./data-source";

async function main() {
  await AppDataSource.initialize();
  await AppDataSource.undoLastMigration({ transaction: "all" });
  console.log("Reverted last migration.");
  await AppDataSource.destroy();
}

void main().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
