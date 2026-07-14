import { NotFoundException } from "@nestjs/common";
import { FindOperator } from "typeorm";
import { publicAdvertisementVisibilityWhere } from "../src/ads/public-ad-visibility";
import { AdvertisementStatus } from "../src/common/enums";
import { FavoritesService } from "../src/favorites/favorites.service";

describe("FavoritesService", () => {
  const now = new Date("2026-07-14T12:00:00.000Z");

  function createService(favoriteRepository: Record<string, jest.Mock>, userRepository = {}, adRepository = {}) {
    return new FavoritesService(favoriteRepository as never, userRepository as never, adRepository as never);
  }

  function ad(status: AdvertisementStatus, expiredAt: Date | null, adId = "2") {
    return {
      adId,
      title: `Ad ${adId}`,
      description: `Description ${adId}`,
      price: "100",
      status,
      expiredAt: expiredAt ?? undefined,
      category: { categoryId: "1" },
      subcategory: undefined,
      location: { locationId: "1", name: "Ulgii" },
      user: { userId: "99", fullName: `Seller ${adId}`, phone: `phone-${adId}` },
      images: [{ imageId: adId, imageUrl: `/restricted-${adId}.jpg`, isMain: true }],
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
    expect(expiration.objectLiteralParameters?.publicNow).toEqual(now);
    return expiration.objectLiteralParameters?.publicNow as Date;
  }

  function matchesPublicWhere(candidate: ReturnType<typeof ad>, where: Record<string, unknown>) {
    const cutoff = publicCutoff(where);
    return candidate.status === where.status && (!candidate.expiredAt || candidate.expiredAt > cutoff);
  }

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates a favorite for a non-owner when the ACTIVE ad has null expiration", async () => {
    const candidate = ad(AdvertisementStatus.ACTIVE, null);
    const favoriteRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue({}),
    };
    const user = { userId: "1" };
    const userRepository = { findOneByOrFail: jest.fn().mockResolvedValue(user) };
    const adRepository = {
      findOne: jest.fn(async (options) =>
        matchesPublicWhere(candidate, options.where as Record<string, unknown>) ? candidate : null,
      ),
    };
    const service = createService(favoriteRepository, userRepository, adRepository);

    await expect(service.add("1", "2")).resolves.toEqual({ adId: 2, favorited: true });
    expect(favoriteRepository.save).toHaveBeenCalledWith({ user, advertisement: candidate });
  });

  it("creates a favorite for a non-owner when the ACTIVE ad expires in the future", async () => {
    const candidate = ad(AdvertisementStatus.ACTIVE, new Date("2026-07-14T12:00:00.001Z"));
    const favoriteRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue({}),
    };
    const userRepository = { findOneByOrFail: jest.fn().mockResolvedValue({ userId: "1" }) };
    const adRepository = {
      findOne: jest.fn(async (options) =>
        matchesPublicWhere(candidate, options.where as Record<string, unknown>) ? candidate : null,
      ),
    };
    const service = createService(favoriteRepository, userRepository, adRepository);

    await expect(service.add("1", "2")).resolves.toEqual({ adId: 2, favorited: true });
    expect(publicCutoff(adRepository.findOne.mock.calls[0][0].where)).toEqual(now);
  });

  const restrictedAddCases: Array<[string, ReturnType<typeof ad> | null]> = [
    ["missing", null],
    ["past expiration", ad(AdvertisementStatus.ACTIVE, new Date("2026-07-14T11:59:59.999Z"))],
    ["equal expiration", ad(AdvertisementStatus.ACTIVE, now)],
    ...Object.values(AdvertisementStatus)
      .filter((status) => status !== AdvertisementStatus.ACTIVE)
      .map((status): [string, ReturnType<typeof ad>] => [status, ad(status, null)]),
  ];

  it.each(restrictedAddCases)("rejects %s favorite targets without creating a row", async (_label, candidate) => {
    const favoriteRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    const adRepository = {
      findOne: jest.fn(async (options) => {
        const where = options.where as Record<string, unknown>;
        publicCutoff(where);
        return candidate && matchesPublicWhere(candidate, where) ? candidate : null;
      }),
    };
    const service = createService(favoriteRepository, {}, adRepository);

    await expect(service.add("1", "2")).rejects.toBeInstanceOf(NotFoundException);
    expect(favoriteRepository.findOne).not.toHaveBeenCalled();
    expect(favoriteRepository.create).not.toHaveBeenCalled();
    expect(favoriteRepository.save).not.toHaveBeenCalled();
  });

  it("keeps an existing visible favorite idempotent", async () => {
    const candidate = ad(AdvertisementStatus.ACTIVE, null);
    const favoriteRepository = {
      findOne: jest.fn().mockResolvedValue({ favoriteId: "9" }),
      create: jest.fn(),
      save: jest.fn(),
    };
    const adRepository = {
      findOne: jest.fn(async (options) =>
        matchesPublicWhere(candidate, options.where as Record<string, unknown>) ? candidate : null,
      ),
    };
    const service = createService(favoriteRepository, {}, adRepository);

    await expect(service.add("1", "2")).resolves.toEqual({ adId: 2, favorited: true });
    expect(favoriteRepository.save).not.toHaveBeenCalled();
  });

  it("returns only ACTIVE favorites with null or future expiration using a nested database condition", async () => {
    const candidates = [
      ad(AdvertisementStatus.ACTIVE, null, "1"),
      ad(AdvertisementStatus.ACTIVE, new Date("2026-07-14T12:00:00.001Z"), "2"),
      ad(AdvertisementStatus.ACTIVE, new Date("2026-07-14T11:59:59.999Z"), "3"),
      ad(AdvertisementStatus.ACTIVE, now, "4"),
      ...Object.values(AdvertisementStatus)
        .filter((status) => status !== AdvertisementStatus.ACTIVE)
        .map((status, index) => ad(status, null, String(index + 10))),
    ];
    const favoriteRepository = {
      find: jest.fn(async (options) => {
        const advertisementWhere = options.where.advertisement as Record<string, unknown>;
        return candidates
          .filter((candidate) => matchesPublicWhere(candidate, advertisementWhere))
          .map((advertisement) => ({ advertisement }));
      }),
    };
    const service = createService(favoriteRepository);

    const result = await service.findAll("1");

    expect(result.map((item) => item.adId)).toEqual([1, 2]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("restricted-3");
    expect(serialized).not.toContain("Seller 3");
    expect(serialized).not.toContain("phone-3");
    expect(favoriteRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user: { userId: "1" },
          advertisement: expect.objectContaining({ status: AdvertisementStatus.ACTIVE }),
        }),
        order: { createdAt: "DESC" },
      }),
    );
    expect(publicCutoff(favoriteRepository.find.mock.calls[0][0].where.advertisement)).toEqual(now);
  });

  it("removes a favorite by user and ad", async () => {
    const favoriteRepository = {
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const service = createService(favoriteRepository);

    await expect(service.remove("1", "2")).resolves.toEqual({ adId: 2, favorited: false });
    expect(favoriteRepository.delete).toHaveBeenCalledWith({
      user: { userId: "1" },
      advertisement: { adId: "2" },
    });
  });

  it("exposes the same production visibility operator used by ads and favorites", () => {
    expect(publicCutoff(publicAdvertisementVisibilityWhere(now) as Record<string, unknown>)).toEqual(now);
  });
});
