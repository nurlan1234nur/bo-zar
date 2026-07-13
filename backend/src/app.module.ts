import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { AdminModule } from "./admin/admin.module";
import { AdsModule } from "./ads/ads.module";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { ImagesModule } from "./images/images.module";
import { LocationsModule } from "./locations/locations.module";
import { HealthController } from "./health/health.controller";
import { ReportsModule } from "./reports/reports.module";
import { UsersModule } from "./users/users.module";

export function validateEnv(env: Record<string, unknown>) {
  const nodeEnv = String(env.NODE_ENV ?? "development");
  const isProduction = nodeEnv === "production";
  const requiredKeys = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"];
  const missing = requiredKeys.filter((key) => isProduction && !String(env[key] ?? "").trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const port = Number(env.PORT ?? 8080);
  const dbPort = Number(env.DB_PORT ?? 5432);

  return {
    NODE_ENV: nodeEnv,
    PORT: Number.isFinite(port) ? port : 8080,
    DB_HOST: String(env.DB_HOST ?? "localhost"),
    DB_PORT: Number.isFinite(dbPort) ? dbPort : 5432,
    DB_USER: String(env.DB_USER ?? "bozar_user"),
    DB_PASSWORD: String(env.DB_PASSWORD ?? "bozar_password"),
    DB_NAME: String(env.DB_NAME ?? "bozar_db"),
    JWT_SECRET: String(env.JWT_SECRET ?? (isProduction ? "" : "change_me")),
    JWT_EXPIRES_IN: String(env.JWT_EXPIRES_IN ?? "7d"),
    CORS_ORIGINS: String(env.CORS_ORIGINS ?? ""),
    IMAGE_STORAGE_PATH: String(env.IMAGE_STORAGE_PATH ?? "uploads"),
  };
}

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST") ?? "localhost",
        port: config.get<number>("DB_PORT") ?? 5432,
        username: config.get<string>("DB_USER") ?? "bozar_user",
        password: config.get<string>("DB_PASSWORD") ?? "bozar_password",
        database: config.get<string>("DB_NAME") ?? "bozar_db",
        autoLoadEntities: true,
        migrations: [join(__dirname, "database/migrations/*{.ts,.js}")],
        migrationsRun: config.get<string>("RUN_MIGRATIONS") !== "false",
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    AdsModule,
    CategoriesModule,
    LocationsModule,
    FavoritesModule,
    ReportsModule,
    AdminModule,
    ImagesModule,
  ],
})
export class AppModule {}
