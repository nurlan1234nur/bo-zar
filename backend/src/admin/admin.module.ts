import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { Category } from "../categories/entities/category.entity";
import { SubCategory } from "../categories/entities/subcategory.entity";
import { Report } from "../reports/entities/report.entity";
import { User } from "../users/entities/user.entity";
import { AdminActionLog } from "./entities/admin-action-log.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [TypeOrmModule.forFeature([AdminActionLog, Advertisement, User, Report, Category, SubCategory])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
