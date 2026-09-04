import { NotFoundException } from "@nestjs/common";
import { AdminService } from "../src/admin/admin.service";
import { AdvertisementStatus, UserStatus } from "../src/common/enums";

describe("AdminService", () => {
  function createService({
    logRepository = { create: jest.fn((payload) => payload), save: jest.fn().mockResolvedValue({}) },
    adRepository = {},
    userRepository = {},
    reportRepository = {},
    categoryRepository = {},
    subcategoryRepository = {},
  }: {
    logRepository?: Record<string, jest.Mock>;
    adRepository?: Record<string, jest.Mock>;
    userRepository?: Record<string, jest.Mock>;
    reportRepository?: Record<string, jest.Mock>;
    categoryRepository?: Record<string, jest.Mock>;
    subcategoryRepository?: Record<string, jest.Mock>;
  }) {
    return new AdminService(
      logRepository as never,
      adRepository as never,
      userRepository as never,
      reportRepository as never,
      categoryRepository as never,
      subcategoryRepository as never,
    );
  }

  it("hides an advertisement and records an admin action", async () => {
    const ad = { adId: "3", status: AdvertisementStatus.ACTIVE };
    const logRepository = {
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue({}),
    };
    const adRepository = {
      findOne: jest.fn().mockResolvedValue(ad),
      save: jest.fn().mockResolvedValue(ad),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ userId: "99" }),
    };
    const service = createService({ logRepository, adRepository, userRepository });

    await expect(service.hideAd("3")).resolves.toEqual({ adId: 3, status: AdvertisementStatus.HIDDEN });

    expect(ad.status).toBe(AdvertisementStatus.HIDDEN);
    expect(adRepository.save).toHaveBeenCalledWith(ad);
    expect(logRepository.save).toHaveBeenCalledWith(expect.objectContaining({ actionType: "HIDE_AD", targetId: "3" }));
  });

  it("blocks a user and records an admin action", async () => {
    const user = { userId: "4", status: UserStatus.ACTIVE };
    const logRepository = {
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue({}),
    };
    const userRepository = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce({ userId: "99" }),
      save: jest.fn().mockResolvedValue(user),
    };
    const service = createService({ logRepository, userRepository });

    await expect(service.blockUser("4")).resolves.toEqual({ userId: 4, status: UserStatus.BLOCKED });

    expect(user.status).toBe(UserStatus.BLOCKED);
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(logRepository.save).toHaveBeenCalledWith(expect.objectContaining({ actionType: "BLOCK_USER", targetType: "USER" }));
  });

  it("creates categories with active default", async () => {
    const logRepository = {
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue({}),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue({ userId: "99" }),
    };
    const categoryRepository = {
      create: jest.fn((payload) => payload),
      save: jest.fn((payload) => Promise.resolve({ ...payload, categoryId: "12" })),
    };
    const service = createService({ logRepository, userRepository, categoryRepository });

    await expect(service.createCategory({ name: "Housing", icon: "home" })).resolves.toEqual({
      categoryId: 12,
      name: "Housing",
      icon: "home",
      description: undefined,
      isActive: true,
    });

    expect(categoryRepository.create).toHaveBeenCalledWith({
      name: "Housing",
      icon: "home",
      description: undefined,
      isActive: true,
    });
    expect(logRepository.save).toHaveBeenCalledWith(expect.objectContaining({ actionType: "CREATE_CATEGORY", targetType: "CATEGORY" }));
  });

  it("returns truthful zero dashboard statistics", async () => {
    const service = createService({ userRepository: { count: jest.fn().mockResolvedValue(0) }, adRepository: { count: jest.fn().mockResolvedValue(0) }, reportRepository: { count: jest.fn().mockResolvedValue(0) }, categoryRepository: { count: jest.fn().mockResolvedValue(0) } });
    await expect(service.stats()).resolves.toEqual({ users: 0, ads: 0, activeAds: 0, reports: 0, categories: 0 });
  });

  it("propagates dashboard read failures instead of returning synthetic empty data", async () => {
    const failure = new Error("database unavailable");
    const service = createService({ reportRepository: { find: jest.fn().mockRejectedValue(failure) } });
    await expect(service.reports()).rejects.toBe(failure);
  });

  it("returns not found for missing moderation targets", async () => {
    await expect(createService({ adRepository: { findOne: jest.fn().mockResolvedValue(null) } }).hideAd("404")).rejects.toBeInstanceOf(NotFoundException);
    await expect(createService({ userRepository: { findOne: jest.fn().mockResolvedValue(null) } }).blockUser("404")).rejects.toBeInstanceOf(NotFoundException);
    await expect(createService({ reportRepository: { findOne: jest.fn().mockResolvedValue(null) } }).resolveReport("404")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns not found for missing catalog targets and parent categories", async () => {
    const categoryRepository = { findOne: jest.fn().mockResolvedValue(null) };
    await expect(createService({ categoryRepository }).updateCategory("404", { name: "Missing" })).rejects.toBeInstanceOf(NotFoundException);
    await expect(createService({ categoryRepository }).deleteCategory("404")).rejects.toBeInstanceOf(NotFoundException);
    await expect(createService({ categoryRepository }).createSubcategory("404", { name: "Missing child" })).rejects.toBeInstanceOf(NotFoundException);
    const subcategoryRepository = { findOne: jest.fn().mockResolvedValue(null) };
    await expect(createService({ subcategoryRepository }).updateSubcategory("404", { name: "Missing" })).rejects.toBeInstanceOf(NotFoundException);
    await expect(createService({ subcategoryRepository }).deleteSubcategory("404")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("propagates moderation persistence failures instead of reporting success", async () => {
    const failure = new Error("write failed");
    const ad = { adId: "3", status: AdvertisementStatus.ACTIVE };
    const service = createService({ adRepository: { findOne: jest.fn().mockResolvedValue(ad), save: jest.fn().mockRejectedValue(failure) } });
    await expect(service.hideAd("3")).rejects.toBe(failure);
  });
});
