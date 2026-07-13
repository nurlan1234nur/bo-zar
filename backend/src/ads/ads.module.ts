import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Advertisement } from "./entities/advertisement.entity";
import { AdsController } from "./ads.controller";
import { AdsService } from "./ads.service";
import { SystemLogsModule } from "../system-logs/system-logs.module";

@Module({
  imports: [TypeOrmModule.forFeature([Advertisement]), SystemLogsModule],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
