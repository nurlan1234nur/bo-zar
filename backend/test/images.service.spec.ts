import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { AdvertisementStatus } from "../src/common/enums";
import { Advertisement } from "../src/ads/entities/advertisement.entity";
import { Image } from "../src/images/entities/image.entity";
import { ImageStorageService } from "../src/images/image-storage.service";
import { ImagesService } from "../src/images/images.service";

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webp = Buffer.from("RIFF0000WEBP", "ascii");

function file(buffer = jpeg, originalname = "photo.jpg", mimetype = "image/jpeg", size = buffer.length) {
  return { buffer, originalname, mimetype, size, fieldname: "files", encoding: "7bit" } as Express.Multer.File;
}

function ad(userId = "1", status = AdvertisementStatus.ACTIVE) {
  return { adId: "10", user: { userId }, status };
}

function manager(overrides: Record<string, jest.Mock> = {}) {
  let nextId = 1;
  return {
    findOne: jest.fn().mockResolvedValue(ad()),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn((_entity, value) => value),
    save: jest.fn(async (_entity, values) => {
      const list = Array.isArray(values) ? values : [values];
      list.forEach((value) => { value.imageId ??= String(nextId++); });
      return values;
    }),
    remove: jest.fn().mockResolvedValue(undefined),
    find: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function deleteManager(target: Record<string, unknown>, overrides: Record<string, jest.Mock> = {}) {
  const base = manager();
  base.findOne = jest.fn(async (entity) => entity === Advertisement ? ad("1") : target);
  return Object.assign(base, overrides);
}

function serviceWith(currentManager: ReturnType<typeof manager>, storageOverrides: Record<string, jest.Mock> = {}) {
  const dataSource = { transaction: jest.fn((callback) => callback(currentManager)) };
  const storage = {
    write: jest.fn().mockResolvedValue("/uploads/generated.jpg"),
    remove: jest.fn().mockResolvedValue(undefined),
    stageDeletion: jest.fn().mockResolvedValue(undefined),
    commitDeletion: jest.fn().mockResolvedValue(undefined),
    rollbackDeletion: jest.fn().mockResolvedValue(undefined),
    ...storageOverrides,
  };
  return { service: new ImagesService(dataSource as never, storage as never), dataSource, storage };
}

describe("ImagesService authorization and lifecycle", () => {
  it.each([
    ["JPEG", file(jpeg, "photo.jpeg", "image/pjpeg")],
    ["PNG", file(png, "photo.png", "image/x-png")],
    ["WEBP", file(webp, "photo.webp", "image/webp")],
  ])("allows owner upload for valid %s content", async (_label, uploaded) => {
    const currentManager = manager();
    const { service, storage } = serviceWith(currentManager);
    await expect(service.upload("1", "10", [uploaded])).resolves.toEqual([
      expect.objectContaining({ adId: 10, imageUrl: "/uploads/generated.jpg", isMain: true }),
    ]);
    expect(storage.write).toHaveBeenCalledWith(uploaded.buffer, expect.stringMatching(/^\.(jpg|png|webp)$/));
  });

  it("rejects a non-owner upload with 403", async () => {
    const currentManager = manager({ findOne: jest.fn().mockResolvedValue(ad("2")) });
    const { service, storage } = serviceWith(currentManager);
    await expect(service.upload("1", "10", [file()])).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.write).not.toHaveBeenCalled();
  });

  it("does not grant a generic staff ownership override", async () => {
    const currentManager = manager({ findOne: jest.fn().mockResolvedValue(ad("2")) });
    const { service } = serviceWith(currentManager);
    await expect(service.upload("staff-user-id", "10", [file()])).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns 404 for a missing advertisement", async () => {
    const currentManager = manager({ findOne: jest.fn().mockResolvedValue(null) });
    const { service } = serviceWith(currentManager);
    await expect(service.upload("1", "404", [file()])).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([AdvertisementStatus.HIDDEN, AdvertisementStatus.DELETED])("rejects uploads to %s advertisements", async (status) => {
    const currentManager = manager({ findOne: jest.fn().mockResolvedValue(ad("1", status)) });
    const { service } = serviceWith(currentManager);
    await expect(service.upload("1", "10", [file()])).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    ["empty request", []],
    ["empty file", [file(Buffer.alloc(0), "empty.jpg", "image/jpeg", 0)]],
    ["invalid MIME", [file(jpeg, "photo.jpg", "text/plain")]],
    ["invalid content", [file(Buffer.from("not an image"), "photo.jpg", "image/jpeg")]],
    ["spoofed extension", [file(png, "photo.jpg", "image/png")]],
    ["oversized file", [file(jpeg, "photo.jpg", "image/jpeg", 5 * 1024 * 1024 + 1)]],
  ])("rejects %s before storage or database work", async (_label, files) => {
    const currentManager = manager();
    const { service, dataSource, storage } = serviceWith(currentManager);
    await expect(service.upload("1", "10", files as Express.Multer.File[])).rejects.toBeInstanceOf(BadRequestException);
    expect(dataSource.transaction).not.toHaveBeenCalled();
    expect(storage.write).not.toHaveBeenCalled();
  });

  it("enforces eight total images per advertisement", async () => {
    const currentManager = manager({ count: jest.fn().mockResolvedValue(8) });
    const { service, storage } = serviceWith(currentManager);
    await expect(service.upload("1", "10", [file()])).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.write).not.toHaveBeenCalled();
  });

  it("never passes an unsafe original filename to permanent storage", async () => {
    const currentManager = manager();
    const { service, storage } = serviceWith(currentManager);
    await service.upload("1", "10", [file(jpeg, "../../owner-photo.jpeg", "image/jpeg")]);
    expect(storage.write).toHaveBeenCalledWith(jpeg, ".jpg");
    expect(JSON.stringify(storage.write.mock.calls)).not.toContain("owner-photo");
    expect(JSON.stringify(storage.write.mock.calls)).not.toContain("..");
  });

  it("uses the advertisement row as the upload concurrency boundary before image reads", async () => {
    const events: string[] = [];
    const currentManager = manager();
    currentManager.findOne = jest.fn(async (entity, options) => {
      events.push(options.lock ? "lock-ad" : "authorize-ad");
      return ad("1");
    });
    currentManager.count.mockImplementation(async () => { events.push("count-images"); return 0; });
    await serviceWith(currentManager).service.upload("1", "10", [file()]);
    expect(events.slice(0, 3)).toEqual(["lock-ad", "authorize-ad", "count-images"]);
    expect(currentManager.findOne).toHaveBeenNthCalledWith(1, Advertisement, { where: { adId: "10" }, lock: { mode: "pessimistic_write" } });
  });

  it("cleans files created before a filesystem failure", async () => {
    const currentManager = manager();
    const write = jest.fn().mockResolvedValueOnce("/uploads/first.jpg").mockRejectedValueOnce(new Error("disk full"));
    const { service, storage } = serviceWith(currentManager, { write });
    await expect(service.upload("1", "10", [file(), file()])).rejects.toThrow("disk full");
    expect(storage.remove).toHaveBeenCalledWith("/uploads/first.jpg");
    expect(currentManager.save).not.toHaveBeenCalled();
  });

  it("cleans every request file when the database transaction fails", async () => {
    const currentManager = manager({ save: jest.fn().mockRejectedValue(new Error("database failed")) });
    const write = jest.fn().mockResolvedValueOnce("/uploads/one.jpg").mockResolvedValueOnce("/uploads/two.jpg");
    const { service, storage } = serviceWith(currentManager, { write });
    await expect(service.upload("1", "10", [file(), file()])).rejects.toThrow("database failed");
    expect(storage.remove).toHaveBeenCalledTimes(2);
  });

  it("deletes an owner's image and selects a deterministic replacement main", async () => {
    const target = { imageId: "5", imageUrl: "/uploads/old.jpg", isMain: true, advertisement: ad("1") };
    const replacement = { imageId: "6", imageUrl: "/uploads/new.jpg", isMain: false, uploadedAt: new Date() };
    const currentManager = deleteManager(target, {
      find: jest.fn().mockResolvedValue([replacement]),
    });
    const staged = { originalPath: "old", tombstonePath: "tombstone" };
    const { service, storage } = serviceWith(currentManager, { stageDeletion: jest.fn().mockResolvedValue(staged) });
    await expect(service.remove("1", "5")).resolves.toEqual({ imageId: 5, deleted: true });
    expect(replacement.isMain).toBe(true);
    expect(currentManager.save).toHaveBeenCalledWith(expect.anything(), [replacement]);
    expect(storage.commitDeletion).toHaveBeenCalledWith(staged);
  });

  it("locks the parent advertisement before the scoped image and replacement query", async () => {
    const events: string[] = [];
    const target = { imageId: "5", imageUrl: "/uploads/old.jpg", isMain: true, advertisement: ad("1") };
    const replacement = { imageId: "6", imageUrl: "/uploads/new.jpg", isMain: false, uploadedAt: new Date() };
    const currentManager = manager();
    currentManager.findOne = jest.fn(async (entity, options) => {
      if (entity === Advertisement && options.lock) { events.push("lock-ad"); return ad("1"); }
      if (entity === Advertisement) { events.push("authorize-ad"); return ad("1"); }
      if (options.lock) { events.push("lock-image"); return target; }
      events.push("resolve-image"); return target;
    });
    currentManager.find.mockImplementation(async () => { events.push("replacement-query"); return [replacement]; });
    await serviceWith(currentManager).service.remove("1", "5");
    expect(events).toEqual(["resolve-image", "lock-ad", "authorize-ad", "lock-image", "replacement-query"]);
    expect(currentManager.findOne).toHaveBeenNthCalledWith(4, Image, {
      where: { imageId: "5", advertisement: { adId: "10" } },
      lock: { mode: "pessimistic_write" },
    });
  });

  it("uses the same parent lock strategy for upload and delete mutations", async () => {
    const uploadManager = manager();
    await serviceWith(uploadManager).service.upload("1", "10", [file()]);
    const target = { imageId: "5", imageUrl: "/uploads/old.jpg", isMain: false, advertisement: ad("1") };
    const removalManager = deleteManager(target);
    await serviceWith(removalManager).service.remove("1", "5");
    const expectedLock = [Advertisement, { where: { adId: "10" }, lock: { mode: "pessimistic_write" } }];
    expect(uploadManager.findOne.mock.calls).toContainEqual(expectedLock);
    expect(removalManager.findOne.mock.calls).toContainEqual(expectedLock);
  });

  it("makes concurrent main-delete/upload paths request the same parent lock before image mutation", async () => {
    const uploadManager = manager();
    const target = { imageId: "5", imageUrl: "/uploads/old.jpg", isMain: true, advertisement: ad("1") };
    const removalManager = deleteManager(target);
    await Promise.all([
      serviceWith(uploadManager).service.upload("1", "10", [file()]),
      serviceWith(removalManager).service.remove("1", "5"),
    ]);
    for (const currentManager of [uploadManager, removalManager]) {
      const lockIndex = currentManager.findOne.mock.calls.findIndex(([entity, options]) => entity === Advertisement && options.lock?.mode === "pessimistic_write");
      expect(lockIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it("makes delete/delete paths lock the same parent before either target image lock", async () => {
    const targetOne = { imageId: "5", imageUrl: "/uploads/one.jpg", isMain: false, advertisement: ad("1") };
    const targetTwo = { imageId: "6", imageUrl: "/uploads/two.jpg", isMain: false, advertisement: ad("1") };
    const managers = [deleteManager(targetOne), deleteManager(targetTwo)];
    await Promise.all([
      serviceWith(managers[0]).service.remove("1", "5"),
      serviceWith(managers[1]).service.remove("1", "6"),
    ]);
    for (const currentManager of managers) {
      const adLock = currentManager.findOne.mock.calls.findIndex(([entity, options]) => entity === Advertisement && options.lock);
      const imageLock = currentManager.findOne.mock.calls.findIndex(([entity, options]) => entity === Image && options.lock);
      expect(adLock).toBeGreaterThanOrEqual(0);
      expect(imageLock).toBeGreaterThan(adLock);
    }
  });

  it("returns 404 if the image disappears after initial resolution but before its scoped lock", async () => {
    const target = { imageId: "5", imageUrl: "/uploads/old.jpg", isMain: false, advertisement: ad("1") };
    const currentManager = manager();
    currentManager.findOne = jest.fn(async (entity, options) => {
      if (entity === Advertisement) return ad("1");
      return options.lock ? null : target;
    });
    const { service, storage } = serviceWith(currentManager);
    await expect(service.remove("1", "5")).rejects.toBeInstanceOf(NotFoundException);
    expect(storage.stageDeletion).not.toHaveBeenCalled();
  });

  it("keeps last-image deletion successful without creating a replacement", async () => {
    const target = { imageId: "5", imageUrl: "/uploads/only.jpg", isMain: true, advertisement: ad("1") };
    const currentManager = deleteManager(target, { find: jest.fn().mockResolvedValue([]) });
    await expect(serviceWith(currentManager).service.remove("1", "5")).resolves.toEqual({ imageId: 5, deleted: true });
    expect(currentManager.find).toHaveBeenCalledWith(Image, {
      where: { advertisement: { adId: "10" } },
      order: { uploadedAt: "ASC", imageId: "ASC" },
    });
    expect(currentManager.save).not.toHaveBeenCalled();
  });

  it("allows an owner to delete an existing image from a hidden or deleted ad", async () => {
    for (const status of [AdvertisementStatus.HIDDEN, AdvertisementStatus.DELETED]) {
      const currentManager = manager({ findOne: jest.fn().mockResolvedValue({ imageId: "5", imageUrl: "/uploads/old.jpg", isMain: false, advertisement: ad("1", status) }) });
      currentManager.findOne = jest.fn(async (entity) => entity === Advertisement ? ad("1", status) : { imageId: "5", imageUrl: "/uploads/old.jpg", isMain: false, advertisement: ad("1", status) });
      await expect(serviceWith(currentManager).service.remove("1", "5")).resolves.toEqual({ imageId: 5, deleted: true });
    }
  });

  it("rejects non-owner delete, including staff, with 403", async () => {
    const target = { imageId: "5", imageUrl: "/uploads/old.jpg", advertisement: ad("owner") };
    const currentManager = deleteManager(target);
    currentManager.findOne = jest.fn(async (entity, options) => entity === Advertisement && options.relations ? ad("owner") : entity === Advertisement ? ad("1") : target);
    await expect(serviceWith(currentManager).service.remove("staff-user-id", "5")).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("returns 404 for a missing image", async () => {
    const currentManager = manager({ findOne: jest.fn().mockResolvedValue(null) });
    await expect(serviceWith(currentManager).service.remove("1", "404")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("restores a staged physical file when database deletion fails", async () => {
    const target = { imageId: "5", imageUrl: "/uploads/old.jpg", isMain: false, advertisement: ad("1") };
    const currentManager = deleteManager(target, { remove: jest.fn().mockRejectedValue(new Error("delete failed")) });
    const staged = { originalPath: "old", tombstonePath: "tombstone" };
    const { service, storage } = serviceWith(currentManager, { stageDeletion: jest.fn().mockResolvedValue(staged) });
    await expect(service.remove("1", "5")).rejects.toThrow("delete failed");
    expect(storage.rollbackDeletion).toHaveBeenCalledWith(staged);
    expect(storage.commitDeletion).not.toHaveBeenCalled();
  });
});

describe("ImageStorageService", () => {
  let root: string;
  beforeEach(async () => { root = await mkdtemp(join(tmpdir(), "bozar-images-")); });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it("uses unique UUID filenames and ignores unsafe original names", async () => {
    const storage = new ImageStorageService({ get: () => root } as unknown as ConfigService);
    const first = await storage.write(jpeg, ".jpg");
    const second = await storage.write(jpeg, ".jpg");
    expect(first).toMatch(/^\/uploads\/[0-9a-f-]{36}\.jpg$/);
    expect(second).not.toBe(first);
    expect(await readFile(join(root, first.slice("/uploads/".length)))).toEqual(jpeg);
    expect(first).not.toContain("..");
  });

  it("rejects a stored path that escapes the upload root", async () => {
    const storage = new ImageStorageService({ get: () => root } as unknown as ConfigService);
    await expect(storage.remove("/uploads/../outside.jpg")).rejects.toThrow("Unsafe stored image path");
  });
});
