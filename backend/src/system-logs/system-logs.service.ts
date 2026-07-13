import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SystemEventLog } from "./entities/system-event-log.entity";

export interface CreateSystemEventInput {
  eventType: string;
  actorType?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  requestId?: string;
  httpMethod?: string;
  path?: string;
  statusCode?: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class SystemLogsService {
  constructor(@InjectRepository(SystemEventLog) private readonly logs: Repository<SystemEventLog>) {}

  async record(input: CreateSystemEventInput) {
    return this.logs.save(
      this.logs.create({
        eventType: input.eventType,
        actorType: input.actorType,
        actorId: input.actorId,
        targetType: input.targetType,
        targetId: input.targetId,
        requestId: input.requestId,
        httpMethod: input.httpMethod,
        path: input.path,
        statusCode: input.statusCode,
        message: input.message,
        metadata: input.metadata,
      }),
    );
  }
}
