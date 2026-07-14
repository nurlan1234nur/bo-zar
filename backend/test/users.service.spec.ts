import { UsersService } from "../src/users/users.service";
import { AdvertisementStatus } from "../src/common/enums";

describe("UsersService", () => {
  it("keeps non-public advertisements visible in the authenticated owner's my-ads query", async () => {
    const hiddenAd = {
      adId: "7",
      title: "Hidden owner ad",
      description: "Still available to its owner",
      price: "100",
      status: AdvertisementStatus.HIDDEN,
      category: { categoryId: "1" },
      subcategory: undefined,
      location: { locationId: "2", name: "Ulgii" },
      user: { userId: "42", fullName: "Owner", phone: "00000000" },
      images: [],
      viewCount: 0,
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    };
    const advertisementRepository = {
      find: jest.fn().mockResolvedValue([hiddenAd]),
    };
    const service = new UsersService({} as never, advertisementRepository as never);

    await expect(service.findMyAds("42")).resolves.toEqual([
      expect.objectContaining({ adId: 7, status: AdvertisementStatus.HIDDEN }),
    ]);
    expect(advertisementRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user: { userId: "42" } } }),
    );
  });
});
