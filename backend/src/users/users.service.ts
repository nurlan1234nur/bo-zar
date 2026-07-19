import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { User } from "./entities/user.entity";

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string | null;
  locationId?: number | null;
  profileImage?: string | null;
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
        return this.toProfile(user);
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
            imageUrl: image?.imageUrl ?? "",
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
    if ((payload as UpdateProfilePayload & { fullName?: string | null }).fullName === null) {
      throw new BadRequestException("fullName must be a string");
    }
    try {
      const user = await this.userRepository.findOne({
        where: { userId },
        relations: ["location"],
      });

      if (user) {
        if (payload.fullName !== undefined) user.fullName = payload.fullName;
        if (payload.email !== undefined) user.email = payload.email;
        if (payload.profileImage !== undefined) user.profileImage = payload.profileImage;
        if (payload.locationId !== undefined) {
          user.location = payload.locationId === null ? null : ({ locationId: String(payload.locationId) } as User["location"]);
        }

        const saved = await this.userRepository.save(user);
        const refreshed = await this.userRepository.findOne({ where: { userId: saved.userId }, relations: ["location"] });
        if (refreshed) return this.toProfile(refreshed);
      }
    } catch {
      // Keep profile update predictable while database setup is still in progress.
    }

    throw new NotFoundException("User not found");
  }

  private toProfile(user: User) {
    return {
      userId: Number(user.userId),
      fullName: user.fullName,
      phone: user.phone,
      email: user.email ?? null,
      role: user.role.roleName,
      status: user.status,
      locationId: user.location ? Number(user.location.locationId) : null,
      locationName: user.location?.name ?? null,
      profileImage: user.profileImage ?? null,
    };
  }
}
