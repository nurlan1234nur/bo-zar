import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { Image } from "./entities/image.entity";

interface UploadedFileLike {
  filename?: string;
  originalname?: string;
  path?: string;
}

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image) private readonly imageRepository: Repository<Image>,
    @InjectRepository(Advertisement) private readonly advertisementRepository: Repository<Advertisement>,
  ) {}

  async upload(adId: string, files: UploadedFileLike[] = []) {
    if (files.length === 0) {
      throw new BadRequestException("Upload хийх зураг сонгоогүй байна");
    }

    const ad = await this.advertisementRepository.findOne({ where: { adId } });
    if (!ad) {
      throw new BadRequestException("Зар олдсонгүй");
    }

    const existingCount = await this.imageRepository.count({ where: { advertisement: { adId } } });
    const saved = [];

    for (const [index, file] of files.entries()) {
      const imageUrl = this.toPublicUrl(file);
      saved.push(
        await this.imageRepository.save(
          this.imageRepository.create({
            advertisement: ad,
            imageUrl,
            thumbnailUrl: imageUrl,
            isMain: existingCount === 0 && index === 0,
          }),
        ),
      );
    }

    return saved.map((image) => ({
      imageId: Number(image.imageId),
      adId: Number(adId),
      imageUrl: image.imageUrl,
      thumbnailUrl: image.thumbnailUrl,
      isMain: image.isMain,
    }));
  }

  async remove(imageId: string) {
    await this.imageRepository.delete({ imageId });

    return {
      imageId: Number(imageId),
      deleted: true,
    };
  }

  private toPublicUrl(file: UploadedFileLike, fallback = "image.jpg") {
    const filename = file.filename ?? file.originalname ?? fallback;
    return `/uploads/${filename}`;
  }
}
