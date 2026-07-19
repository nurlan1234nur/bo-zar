import { UsersService } from "../src/users/users.service";
import { AdvertisementStatus } from "../src/common/enums";

describe("UsersService", () => {
  const profileUser = {
    userId: "42",
    fullName: "Owner",
    phone: "99112233",
    email: "owner@example.com",
    profileImage: "https://example.com/profile.jpg",
    role: { roleName: "USER" },
    status: "ACTIVE",
    location: { locationId: "2", name: "Ulgii" },
  };

  it("returns the complete current profile contract", async () => {
    const userRepository = { findOne: jest.fn().mockResolvedValue(profileUser) };
    const service = new UsersService(userRepository as never, {} as never);

    await expect(service.findProfile("42")).resolves.toEqual({
      userId: 42,
      fullName: "Owner",
      phone: "99112233",
      email: "owner@example.com",
      role: "USER",
      status: "ACTIVE",
      locationId: 2,
      locationName: "Ulgii",
      profileImage: "https://example.com/profile.jpg",
    });
  });

  it("refreshes location data after updating the whitelisted profile fields", async () => {
    const editable = { ...profileUser, location: { ...profileUser.location } };
    const refreshed = { ...editable, fullName: "Updated Owner", email: "updated@example.com", location: { locationId: "3", name: "Ulaanbaatar" } };
    const userRepository = {
      findOne: jest.fn().mockResolvedValueOnce(editable).mockResolvedValueOnce(refreshed),
      save: jest.fn(async (user) => user),
    };
    const service = new UsersService(userRepository as never, {} as never);

    await expect(service.updateProfile("42", { fullName: "Updated Owner", email: "updated@example.com", locationId: 3 })).resolves.toEqual(
      expect.objectContaining({ fullName: "Updated Owner", email: "updated@example.com", locationId: 3, locationName: "Ulaanbaatar" }),
    );
    expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      fullName: "Updated Owner",
      email: "updated@example.com",
      location: { locationId: "3" },
    }));
  });

  it("clears nullable profile fields and returns the same stable nullable shape", async () => {
    const editable = { ...profileUser, location: { ...profileUser.location } };
    const cleared = { ...editable, email: null, profileImage: null, location: null };
    const userRepository = {
      findOne: jest.fn().mockResolvedValueOnce(editable).mockResolvedValueOnce(cleared),
      save: jest.fn(async (user) => user),
    };
    const service = new UsersService(userRepository as never, {} as never);

    const updated = await service.updateProfile("42", { email: null, locationId: null, profileImage: null });
    expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ email: null, location: null, profileImage: null }));
    expect(updated).toEqual({
      userId: 42, fullName: "Owner", phone: "99112233", email: null, role: "USER", status: "ACTIVE",
      locationId: null, locationName: null, profileImage: null,
    });
  });

  it("uses the same nullable profile mapper for GET and PUT responses", async () => {
    const nullableUser = { ...profileUser, email: null, profileImage: null, location: null };
    const getRepository = { findOne: jest.fn().mockResolvedValue(nullableUser) };
    const putRepository = { findOne: jest.fn().mockResolvedValueOnce({ ...nullableUser }).mockResolvedValueOnce(nullableUser), save: jest.fn(async (user) => user) };
    const getService = new UsersService(getRepository as never, {} as never);
    const putService = new UsersService(putRepository as never, {} as never);
    await expect(putService.updateProfile("42", { fullName: "Owner" })).resolves.toEqual(await getService.findProfile("42"));
  });

  it("defensively rejects a null fullName before loading or saving the entity", async () => {
    const userRepository = { findOne: jest.fn(), save: jest.fn() };
    const service = new UsersService(userRepository as never, {} as never);

    await expect(service.updateProfile("42", { fullName: null } as never)).rejects.toMatchObject({ status: 400 });
    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

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
      expect.objectContaining({ adId: 7, status: AdvertisementStatus.HIDDEN, imageUrl: "" }),
    ]);
    expect(advertisementRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { user: { userId: "42" } } }),
    );
  });

  it("maps the main image, falls back to the first image, and never invents an external placeholder", async () => {
    const baseAd = {
      adId: "7", title: "Owner ad", description: "Owner data", price: "100", status: AdvertisementStatus.ACTIVE,
      category: { categoryId: "1" }, subcategory: undefined, location: { locationId: "2", name: "Ulgii" },
      user: { userId: "42", fullName: "Owner", phone: "00000000" }, viewCount: 0,
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
    };
    const advertisementRepository = { find: jest.fn().mockResolvedValue([
      { ...baseAd, adId: "7", images: [{ imageUrl: "/uploads/first.jpg", isMain: false }, { imageUrl: "/uploads/main.jpg", isMain: true }] },
      { ...baseAd, adId: "8", images: [{ imageUrl: "/uploads/fallback.jpg", isMain: false }] },
      { ...baseAd, adId: "9", images: [] },
    ]) };
    const service = new UsersService({} as never, advertisementRepository as never);

    await expect(service.findMyAds("42")).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ adId: 7, imageUrl: "/uploads/main.jpg" }),
      expect.objectContaining({ adId: 8, imageUrl: "/uploads/fallback.jpg" }),
      expect.objectContaining({ adId: 9, imageUrl: "" }),
    ]));
  });
});
