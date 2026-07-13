import "reflect-metadata";
import { join } from "path";
import { DataSource } from "typeorm";
import { AdminActionLog } from "../admin/entities/admin-action-log.entity";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { Category } from "../categories/entities/category.entity";
import { SubCategory } from "../categories/entities/subcategory.entity";
import { Favorite } from "../favorites/entities/favorite.entity";
import { Image } from "../images/entities/image.entity";
import { Location } from "../locations/entities/location.entity";
import { Report } from "../reports/entities/report.entity";
import { SystemEventLog } from "../system-logs/entities/system-event-log.entity";
import { Role } from "../users/entities/role.entity";
import { User } from "../users/entities/user.entity";

const entities = [Role, User, Location, Category, SubCategory, Advertisement, Image, Favorite, Report, AdminActionLog, SystemEventLog];

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? "bozar_user",
  password: process.env.DB_PASSWORD ?? "bozar_password",
  database: process.env.DB_NAME ?? "bozar_db",
  entities,
  migrations: [join(__dirname, "migrations/*{.ts,.js}")],
  migrationsTableName: "typeorm_migrations",
  synchronize: false,
});

export const databaseEntities = entities;
