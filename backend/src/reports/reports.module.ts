import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { User } from "../users/entities/user.entity";
import { Report } from "./entities/report.entity";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Advertisement])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
