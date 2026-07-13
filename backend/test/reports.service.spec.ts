import { ReportReason, ReportStatus } from "../src/common/enums";
import { ReportsService } from "../src/reports/reports.service";

describe("ReportsService", () => {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");

  function createService(reportRepository: Record<string, jest.Mock>, userRepository = {}, adRepository = {}) {
    return new ReportsService(reportRepository as never, userRepository as never, adRepository as never);
  }

  it("returns an existing report instead of creating a duplicate", async () => {
    const existingReport = {
      reportId: "8",
      advertisement: { adId: "4" },
      reason: ReportReason.SPAM,
      comment: "duplicate",
      status: ReportStatus.PENDING,
      createdAt,
    };
    const reportRepository = {
      findOne: jest.fn().mockResolvedValue(existingReport),
      create: jest.fn(),
      save: jest.fn(),
    };
    const service = createService(reportRepository);

    await expect(service.create("1", { adId: 4, reason: ReportReason.SPAM, comment: "duplicate" })).resolves.toEqual({
      reportId: 8,
      adId: 4,
      reason: ReportReason.SPAM,
      comment: "duplicate",
      status: ReportStatus.PENDING,
      createdAt: createdAt.toISOString(),
    });
    expect(reportRepository.save).not.toHaveBeenCalled();
  });

  it("creates a pending report for a new ad report", async () => {
    const reportRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((payload) => ({ ...payload, reportId: "10", createdAt })),
      save: jest.fn((payload) => Promise.resolve(payload)),
    };
    const userRepository = {
      findOneByOrFail: jest.fn().mockResolvedValue({ userId: "1" }),
    };
    const adRepository = {
      findOneByOrFail: jest.fn().mockResolvedValue({ adId: "4" }),
    };
    const service = createService(reportRepository, userRepository, adRepository);

    await expect(service.create("1", { adId: 4, reason: ReportReason.FAKE, comment: "fake ad" })).resolves.toEqual({
      reportId: 10,
      adId: 4,
      reason: ReportReason.FAKE,
      comment: "fake ad",
      status: ReportStatus.PENDING,
      createdAt: createdAt.toISOString(),
    });

    expect(reportRepository.create).toHaveBeenCalledWith({
      reporter: { userId: "1" },
      advertisement: { adId: "4" },
      reason: ReportReason.FAKE,
      comment: "fake ad",
      status: ReportStatus.PENDING,
    });
  });
});
