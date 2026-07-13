import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SystemEventLog } from "./entities/system-event-log.entity";
import { SystemLogsService } from "./system-logs.service";

@Module({
  imports: [TypeOrmModule.forFeature([SystemEventLog])],
  providers: [SystemLogsService],
  exports: [SystemLogsService],
})
export class SystemLogsModule {}
