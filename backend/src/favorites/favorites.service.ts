import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { publicAdvertisementVisibilityWhere } from "../ads/public-ad-visibility";
import { User } from "../users/entities/user.entity";
import { Favorite } from "./entities/favorite.entity";

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite) private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Advertisement) private readonly advertisementRepository: Repository<Advertisement>,
  ) {}

  async add(userId: string, adId: string) {
    const publicNow = new Date();
    const advertisement = await this.advertisementRepository.findOne({
      where: { adId, ...publicAdvertisementVisibilityWhere(publicNow) },
    });
    if (!advertisement) {
      throw new NotFoundException("Advertisement not found");
    }

    const existing = await this.favoriteRepository.findOne({
      where: { user: { userId }, advertisement: { adId } },
      relations: ["user", "advertisement"],
    });

    if (!existing) {
      const user = await this.userRepository.findOneByOrFail({ userId });
      await this.favoriteRepository.save(this.favoriteRepository.create({ user, advertisement }));
    }

    return { adId: Number(adId), favorited: true };
  }

  async findAll(userId: string) {
    try {
      const publicNow = new Date();
      const favorites = await this.favoriteRepository.find({
        where: {
          user: { userId },
          advertisement: publicAdvertisementVisibilityWhere(publicNow),
        },
        relations: ["advertisement", "advertisement.category", "advertisement.subcategory", "advertisement.location", "advertisement.user", "advertisement.images"],
        order: { createdAt: "DESC" },
      });

      if (favorites.length > 0) {
        return favorites.map((favorite) => this.toPublicAd(favorite.advertisement));
      }
    } catch {
      // Keep UI usable while DB setup is still in progress.
    }

    return [];
  }

  async remove(userId: string, adId: string) {
    try {
      await this.favoriteRepository.delete({
        user: { userId },
        advertisement: { adId },
      });
    } catch {
      // Keep UI usable while DB setup is still in progress.
    }

    return { adId: Number(adId), favorited: false };
  }

  private toPublicAd(ad: Advertisement) {
    const image = ad.images?.find((item) => item.isMain) ?? ad.images?.[0];
    return {
      adId: Number(ad.adId),
      title: ad.title,
      description: ad.description,
      price: ad.price ? Number(ad.price) : undefined,
      status: ad.status,
      categoryId: Number(ad.category.categoryId),
      subcategoryId: ad.subcategory ? Number(ad.subcategory.subcategoryId) : undefined,
      locationId: ad.location ? Number(ad.location.locationId) : 0,
      locationName: ad.location?.name ?? "Байршил оруулаагүй",
      sellerName: ad.user?.fullName ?? "Хэрэглэгч",
      contactPhone: ad.contactPhone ?? ad.user?.phone ?? "",
      imageUrl: image?.imageUrl ?? "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&h=700&fit=crop&auto=format",
      viewCount: ad.viewCount,
      createdAt: ad.createdAt.toISOString(),
    };
  }
}
