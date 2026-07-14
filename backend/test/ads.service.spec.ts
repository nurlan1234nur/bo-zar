import { NotFoundException } from "@nestjs/common";
import { Between, FindOperator, ILike, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AdsController } from "../src/ads/ads.controller";
import { AdsService } from "../src/ads/ads.service";
import { AdvertisementStatus } from "../src/common/enums";

describe("AdsService", () => {
  const systemLogs = {
    record: jest.fn(),
  };

  function createService(repository: Record<string, jest.Mock>) {
    return new AdsService(repository as never, systemLogs as never);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-07-14T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function ad(status: AdvertisementStatus, expiredAt: Date | null, adId = "1") {
    return {
      adId,
      title: `Ad ${adId}`,
      description: "A public advertisement",
      price: "100",
      status,
      expiredAt: expiredAt ?? undefined,
      category: { categoryId: "1" },
      subcategory: undefined,
      location: { locationId: "1", name: "Ulgii" },
      user: { userId: "7", fullName: "Seller", phone: "00000000" },
      images: [],
      viewCount: 0,
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    };
  }

  function publicCutoff(where: Record<string, unknown>) {
    expect(where.status).toBe(AdvertisementStatus.ACTIVE);
    const expiration = where.expiredAt as FindOperator<Date>;
    expect(expiration.type).toBe("raw");
    const sql = expiration.getSql?.("expired_at");
    expect(sql).toBe("(expired_at IS NULL OR expired_at > :publicNow)");
    expect(sql).toMatch(/^\(.*\)$/);
    expect(sql).toContain("IS NULL");
    expect(sql).toContain(" > :publicNow");
    expect(sql).not.toContain(">=");
    expect(sql).not.toContain("IS NOT NULL");
    expect(expiration.objectLiteralParameters).toHaveProperty("publicNow");
    return expiration.objectLiteralParameters?.publicNow as Date;
  }

  function matchesPublicWhere(candidate: ReturnType<typeof ad>, where: Record<string, unknown>) {
    const cutoff = publicCutoff(where);
    return candidate.status === where.status && (!candidate.expiredAt || candidate.expiredAt > cutoff);
  }

  const nonPublicDetailCases: Array<[AdvertisementStatus, Date | null]> = [
    [AdvertisementStatus.ACTIVE, new Date("2026-07-14T11:59:59.999Z")],
    [AdvertisementStatus.ACTIVE, new Date("2026-07-14T12:00:00.000Z")],
    ...Object.values(AdvertisementStatus)
      .filter((status) => status !== AdvertisementStatus.ACTIVE)
      .map((status): [AdvertisementStatus, null] => [status, null]),
  ];

  it("builds search filters, pagination, and price range for list queries", async () => {
    const repository = {
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const service = createService(repository);

    await service.findAll({
      page: "2",
      size: "10",
      keyword: "apartment",
      categoryId: "3",
      subcategoryId: "4",
      locationId: "5",
      minPrice: "100",
      maxPrice: "900",
      sort: "priceAsc",
    });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: AdvertisementStatus.ACTIVE,
          title: ILike("%apartment%"),
          category: { categoryId: "3" },
          subcategory: { subcategoryId: "4" },
          location: { locationId: "5" },
          price: Between("100", "900"),
        }),
        order: { price: "ASC" },
        skip: 10,
        take: 10,
      }),
    );
  });

  it("uses one-sided price filters when only one bound is present", async () => {
    const repository = {
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const service = createService(repository);

    await service.findAll({ minPrice: "100" });
    expect(repository.findAndCount.mock.calls[0][0].where.price).toEqual(MoreThanOrEqual("100"));

    await service.findAll({ maxPrice: "900" });
    expect(repository.findAndCount.mock.calls[1][0].where.price).toEqual(LessThanOrEqual("900"));
  });

  it("creates an advertisement for the current user and records an event", async () => {
    const repository = {
      create: jest.fn((payload) => payload),
      save: jest.fn((payload) => Promise.resolve({ ...payload, adId: "42" })),
    };
    const service = createService(repository);

    await expect(
      service.create("7", {
        title: "Test ad",
        description: "Description",
        price: 123,
        categoryId: 1,
        locationId: 2,
        contactPhone: "99112233",
      }),
    ).resolves.toEqual({ adId: 42, status: AdvertisementStatus.ACTIVE });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: { userId: "7" },
        category: { categoryId: "1" },
        location: { locationId: "2" },
        price: "123",
      }),
    );
    expect(systemLogs.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "AD_CREATE", actorId: "7" }));
  });

  it("returns only ACTIVE ads with null or future expiration and ignores a caller-supplied status", async () => {
    const now = new Date("2026-07-14T12:00:00.000Z");
    const candidates = [
      ad(AdvertisementStatus.ACTIVE, null, "1"),
      ad(AdvertisementStatus.ACTIVE, new Date("2026-07-14T12:00:00.001Z"), "2"),
      ad(AdvertisementStatus.ACTIVE, new Date("2026-07-14T11:59:59.999Z"), "3"),
      ad(AdvertisementStatus.ACTIVE, now, "4"),
      ...Object.values(AdvertisementStatus)
        .filter((status) => status !== AdvertisementStatus.ACTIVE)
        .map((status, index) => ad(status, null, String(index + 10))),
    ];
    const repository = {
      findAndCount: jest.fn(async (options) => {
        const where = options.where as Record<string, unknown>;
        const visible = candidates.filter((candidate) => matchesPublicWhere(candidate, where));
        return [visible, visible.length];
      }),
    };
    const service = createService(repository);

    const result = await service.findAll({ status: AdvertisementStatus.DELETED });

    expect(result.items.map((item) => item.adId)).toEqual([1, 2]);
    expect(repository.findAndCount.mock.calls[0][0].where).toEqual(
      expect.objectContaining({ status: AdvertisementStatus.ACTIVE }),
    );
  });

  it("keeps existing public filters, pagination, and sorting with the visibility predicate", async () => {
    const repository = { findAndCount: jest.fn().mockResolvedValue([[], 0]) };
    const service = createService(repository);

    await service.findAll({
      page: "2",
      size: "10",
      keyword: "apartment",
      categoryId: "3",
      subcategoryId: "4",
      locationId: "5",
      minPrice: "100",
      maxPrice: "900",
      sort: "priceAsc",
    });

    const options = repository.findAndCount.mock.calls[0][0];
    expect(options).toEqual(expect.objectContaining({ order: { price: "ASC" }, skip: 10, take: 10 }));
    expect(options.where).toEqual(
      expect.objectContaining({
        status: AdvertisementStatus.ACTIVE,
        title: ILike("%apartment%"),
        category: { categoryId: "3" },
        subcategory: { subcategoryId: "4" },
        location: { locationId: "5" },
        price: Between("100", "900"),
      }),
    );
    expect(publicCutoff(options.where)).toEqual(new Date("2026-07-14T12:00:00.000Z"));
  });

  it.each([
    ["null expiration", null],
    ["future expiration", new Date("2026-07-14T12:00:00.001Z")],
  ])("returns public detail for ACTIVE ads with %s", async (_label, expiredAt) => {
    const candidate = ad(AdvertisementStatus.ACTIVE, expiredAt);
    const repository = {
      findOne: jest.fn(async (options) =>
        matchesPublicWhere(candidate, options.where as Record<string, unknown>) ? candidate : null,
      ),
    };
    const service = createService(repository);

    await expect(service.findOne("1")).resolves.toEqual(expect.objectContaining({ adId: 1, status: AdvertisementStatus.ACTIVE }));
  });

  it("preserves the standard success envelope for visible public detail", async () => {
    const candidate = ad(AdvertisementStatus.ACTIVE, null);
    const repository = {
      findOne: jest.fn(async (options) =>
        matchesPublicWhere(candidate, options.where as Record<string, unknown>) ? candidate : null,
      ),
    };
    const service = createService(repository);
    const controller = new AdsController(service);

    await expect(controller.findOne("1")).resolves.toEqual({
      success: true,
      message: expect.any(String),
      data: expect.objectContaining({ adId: 1, status: AdvertisementStatus.ACTIVE }),
    });
    expect(repository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ adId: "1", status: AdvertisementStatus.ACTIVE }) }),
    );
  });

  it.each(nonPublicDetailCases)("returns 404 for non-public detail with status %s and expiration %s", async (status, expiredAt) => {
    const candidate = ad(status, expiredAt);
    const repository = {
      findOne: jest.fn(async (options) =>
        matchesPublicWhere(candidate, options.where as Record<string, unknown>) ? candidate : null,
      ),
    };
    const service = createService(repository);
    const controller = new AdsController(service);

    await expect(controller.findOne("1")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns 404 for a missing public detail ID", async () => {
    const service = createService({ findOne: jest.fn().mockResolvedValue(null) });
    const controller = new AdsController(service);

    await expect(controller.findOne("404")).rejects.toBeInstanceOf(NotFoundException);
  });
});
