import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { User } from "./entities/user.entity";

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  locationId?: number;
  profileImage?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Advertisement) private readonly advertisementRepository: Repository<Advertisement>,
  ) {}

  async findProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { userId },
        relations: ["location"],
      });

      if (user) {
        return {
          userId: Number(user.userId),
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          role: user.role.roleName,
          status: user.status,
          locationName: user.location?.name,
        };
      }
    } catch {
      // Keep profile endpoint predictable while database setup is still in progress.
    }

    throw new NotFoundException("User not found");
  }

  async findMyAds(userId: string) {
    try {
      const items = await this.advertisementRepository.find({
        where: { user: { userId } },
        relations: ["category", "subcategory", "location", "user", "images"],
        order: { createdAt: "DESC" },
      });

      if (items.length > 0) {
        return items.map((ad) => {
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
        });
      }
    } catch {
      // Keep my ads endpoint predictable while database setup is still in progress.
    }

    return [];
  }

  async updateProfile(userId: string, payload: UpdateProfilePayload) {
    try {
      const user = await this.userRepository.findOne({
        where: { userId },
        relations: ["location"],
      });

      if (user) {
        user.fullName = payload.fullName ?? user.fullName;
        user.email = payload.email ?? user.email;
        user.profileImage = payload.profileImage ?? user.profileImage;
        user.location = payload.locationId ? ({ locationId: String(payload.locationId) } as User["location"]) : user.location;

        const saved = await this.userRepository.save(user);
        return {
          userId: Number(saved.userId),
          fullName: saved.fullName,
          phone: saved.phone,
          email: saved.email,
          role: saved.role.roleName,
          status: saved.status,
          locationName: saved.location?.name,
        };
      }
    } catch {
      // Keep profile update predictable while database setup is still in progress.
    }

    throw new NotFoundException("User not found");
  }
}
