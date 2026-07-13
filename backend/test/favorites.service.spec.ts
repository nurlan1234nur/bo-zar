import { FavoritesService } from "../src/favorites/favorites.service";

describe("FavoritesService", () => {
  function createService(favoriteRepository: Record<string, jest.Mock>, userRepository = {}, adRepository = {}) {
    return new FavoritesService(favoriteRepository as never, userRepository as never, adRepository as never);
  }

  it("creates a favorite when it does not already exist", async () => {
    const favoriteRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((payload) => payload),
      save: jest.fn().mockResolvedValue({}),
    };
    const userRepository = {
      findOneByOrFail: jest.fn().mockResolvedValue({ userId: "1" }),
    };
    const adRepository = {
      findOneByOrFail: jest.fn().mockResolvedValue({ adId: "2" }),
    };
    const service = createService(favoriteRepository, userRepository, adRepository);

    await expect(service.add("1", "2")).resolves.toEqual({ adId: 2, favorited: true });

    expect(favoriteRepository.save).toHaveBeenCalledWith({
      user: { userId: "1" },
      advertisement: { adId: "2" },
    });
  });

  it("does not duplicate an existing favorite", async () => {
    const favoriteRepository = {
      findOne: jest.fn().mockResolvedValue({ favoriteId: "9" }),
      create: jest.fn(),
      save: jest.fn(),
    };
    const service = createService(favoriteRepository);

    await expect(service.add("1", "2")).resolves.toEqual({ adId: 2, favorited: true });
    expect(favoriteRepository.save).not.toHaveBeenCalled();
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
});
