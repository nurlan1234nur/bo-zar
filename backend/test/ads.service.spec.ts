import { Between, ILike, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
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
  });

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
});
