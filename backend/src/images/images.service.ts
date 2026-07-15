import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DataSource, EntityManager } from "typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { AdvertisementStatus } from "../common/enums";
import { Image } from "./entities/image.entity";
import { canonicalExtension, validateImageFile } from "./image-file-validation";
import { ImageStorageService, StagedImageDeletion } from "./image-storage.service";

const MAX_IMAGES_PER_AD = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_IMAGES_PER_AD * MAX_FILE_SIZE;

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(private readonly dataSource: DataSource, private readonly storage: ImageStorageService) {}

  async upload(userId: string, adId: string, files: Express.Multer.File[] = []) {
    this.assertRequestLimits(files);
    const types = files.map(validateImageFile);
    const createdUrls: string[] = [];

    try {
      return await this.dataSource.transaction(async (manager) => {
        const ad = await this.lockOwnedAdvertisement(manager, adId, userId);
        if (ad.status === AdvertisementStatus.HIDDEN || ad.status === AdvertisementStatus.DELETED) {
          throw new BadRequestException("Images cannot be uploaded to hidden or deleted advertisements");
        }

        const existingCount = await manager.count(Image, { where: { advertisement: { adId } } });
        if (existingCount + files.length > MAX_IMAGES_PER_AD) {
          throw new BadRequestException(`An advertisement can have at most ${MAX_IMAGES_PER_AD} images`);
        }

        const images: Image[] = [];
        for (const [index, file] of files.entries()) {
          const imageUrl = await this.storage.write(file.buffer, canonicalExtension(types[index]));
          createdUrls.push(imageUrl);
          images.push(manager.create(Image, {
            advertisement: ad,
            imageUrl,
            thumbnailUrl: imageUrl,
            isMain: existingCount === 0 && index === 0,
          }));
        }
        const saved = await manager.save(Image, images);
        return saved.map((image) => ({
          imageId: Number(image.imageId),
          adId: Number(adId),
          imageUrl: image.imageUrl,
          thumbnailUrl: image.thumbnailUrl,
          isMain: image.isMain,
        }));
      });
    } catch (error) {
      await this.cleanupCreatedFiles(createdUrls);
      throw error;
    }
  }

  async remove(userId: string, imageId: string) {
    let staged: StagedImageDeletion | undefined;
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const image = await manager.findOne(Image, {
          where: { imageId },
          relations: ["advertisement"],
        });
        if (!image) throw new NotFoundException("Image not found");
        const adId = image.advertisement.adId;
        await this.lockOwnedAdvertisement(manager, adId, userId);
        const lockedImage = await manager.findOne(Image, {
          where: { imageId, advertisement: { adId } },
          lock: { mode: "pessimistic_write" },
        });
        if (!lockedImage) throw new NotFoundException("Image not found");

        staged = await this.storage.stageDeletion(lockedImage.imageUrl);
        await manager.remove(Image, lockedImage);
        if (lockedImage.isMain) await this.replaceMainImage(manager, adId);
        return { imageId: Number(imageId), deleted: true };
      });

      try { await this.storage.commitDeletion(staged); }
      catch (error) { this.logger.error("Failed to remove staged image tombstone", error instanceof Error ? error.stack : String(error)); }
      return result;
    } catch (error) {
      if (staged) {
        try { await this.storage.rollbackDeletion(staged); }
        catch (rollbackError) { this.logger.error("Failed to restore image after database rollback", rollbackError instanceof Error ? rollbackError.stack : String(rollbackError)); }
      }
      throw error;
    }
  }

  private assertRequestLimits(files: Express.Multer.File[]) {
    if (files.length === 0) throw new BadRequestException("At least one image is required");
    if (files.length > MAX_IMAGES_PER_AD) throw new BadRequestException(`At most ${MAX_IMAGES_PER_AD} images are allowed`);
    let total = 0;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE || file.buffer.length > MAX_FILE_SIZE) throw new BadRequestException("Each image must be 5 MB or smaller");
      total += Math.max(file.size, file.buffer.length);
    }
    if (total > MAX_REQUEST_BYTES) throw new BadRequestException("Image request is too large");
  }

  private assertOwner(ad: Advertisement, userId: string) {
    if (ad.user?.userId !== userId) throw new ForbiddenException("Only the advertisement owner can manage its images");
  }

  private async lockOwnedAdvertisement(manager: EntityManager, adId: string, userId: string) {
    const lockedAd = await manager.findOne(Advertisement, { where: { adId }, lock: { mode: "pessimistic_write" } });
    if (!lockedAd) throw new NotFoundException("Advertisement not found");
    const authorizedAd = await manager.findOne(Advertisement, { where: { adId }, relations: ["user"] });
    if (!authorizedAd) throw new NotFoundException("Advertisement not found");
    this.assertOwner(authorizedAd, userId);
    return lockedAd;
  }

  private async replaceMainImage(manager: EntityManager, adId: string) {
    const remaining = await manager.find(Image, {
      where: { advertisement: { adId } },
      order: { uploadedAt: "ASC", imageId: "ASC" },
    });
    for (const [index, image] of remaining.entries()) image.isMain = index === 0;
    if (remaining.length > 0) await manager.save(Image, remaining);
  }

  private async cleanupCreatedFiles(urls: string[]) {
    const results = await Promise.allSettled(urls.map((url) => this.storage.remove(url)));
    results.forEach((result) => {
      if (result.status === "rejected") this.logger.error("Failed to clean up an image after upload failure", result.reason);
    });
  }
}
