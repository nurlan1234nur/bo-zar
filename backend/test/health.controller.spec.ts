import { ServiceUnavailableException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { HealthController } from "../src/health/health.controller";

describe("HealthController", () => {
  it("reports live status", () => {
    const controller = new HealthController({} as DataSource);
    const result = controller.live();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("bozar-backend");
  });

  it("reports ready when the database is initialized and query succeeds", async () => {
    const controller = new HealthController({
      isInitialized: true,
      query: jest.fn().mockResolvedValue(undefined),
    } as unknown as DataSource);

    await expect(controller.ready()).resolves.toMatchObject({
      status: "ok",
      database: "ready",
    });
  });

  it("rejects readiness when the database is not available", async () => {
    const controller = new HealthController({
      isInitialized: false,
      query: jest.fn(),
    } as unknown as DataSource);

    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
