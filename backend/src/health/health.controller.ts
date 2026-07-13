import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Controller("health")
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  live() {
    return {
      status: "ok",
      service: "bozar-backend",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("ready")
  async ready() {
    if (!this.dataSource.isInitialized) {
      throw new ServiceUnavailableException("Database connection is not ready");
    }

    try {
      await this.dataSource.query("SELECT 1");
      return {
        status: "ok",
        database: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException("Database connection is not ready");
    }
  }
}
