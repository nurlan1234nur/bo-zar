import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, FindOptionsOrder, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { AdvertisementStatus } from "../common/enums";
import { SystemLogsService } from "../system-logs/system-logs.service";
import { Advertisement } from "./entities/advertisement.entity";
import { publicAdvertisementVisibilityWhere } from "./public-ad-visibility";

export interface PublicAdPayload {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  subcategoryId?: number;
  locationId?: number;
  contactPhone?: string;
}

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Advertisement) private readonly advertisementRepository: Repository<Advertisement>,
    private readonly systemLogs: SystemLogsService,
  ) {}

  async findAll(query: Record<string, string | undefined>) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const size = Math.min(Math.max(Number(query.size ?? 20), 1), 50);
    const keyword = query.keyword?.trim();
    const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
    const subcategoryId = query.subcategoryId ? Number(query.subcategoryId) : undefined;
    const locationId = query.locationId ? Number(query.locationId) : undefined;
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
    const where = publicAdvertisementVisibilityWhere(new Date());

    if (categoryId) {
      where.category = { categoryId: String(categoryId) };
    }

    if (subcategoryId) {
      where.subcategory = { subcategoryId: String(subcategoryId) };
    }

    if (locationId) {
      where.location = { locationId: String(locationId) };
    }

    if (keyword) {
      where.title = ILike(`%${keyword}%`);
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(String(minPrice), String(maxPrice));
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(String(minPrice));
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(String(maxPrice));
    }

    const order = this.resolveOrder(query.sort);
    const [items, total] = await this.advertisementRepository.findAndCount({
      where,
      relations: ["category", "subcategory", "location", "user", "images"],
      order,
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: items.map((ad) => this.toPublicAd(ad)),
      meta: {
        page,
        size,
        total,
        totalPages: Math.max(Math.ceil(total / size), 1),
      },
    };
  }

  async findOne(adId: string) {
    const ad = await this.advertisementRepository.findOne({
      where: { adId, ...publicAdvertisementVisibilityWhere(new Date()) },
      relations: ["category", "subcategory", "location", "user", "images"],
    });

    return ad ? this.toPublicAd(ad) : null;
  }

  async create(userId: string, body: PublicAdPayload) {
    const ad = this.advertisementRepository.create({
      title: body.title ?? "Шинэ зар",
      description: body.description ?? "Тайлбар оруулаагүй",
      price: body.price !== undefined ? String(body.price) : undefined,
      contactPhone: body.contactPhone,
      status: AdvertisementStatus.ACTIVE,
      user: { userId } as Advertisement["user"],
      category: body.categoryId ? ({ categoryId: String(body.categoryId) } as Advertisement["category"]) : undefined,
      subcategory: body.subcategoryId ? ({ subcategoryId: String(body.subcategoryId) } as Advertisement["subcategory"]) : undefined,
      location: body.locationId ? ({ locationId: String(body.locationId) } as Advertisement["location"]) : undefined,
    });
    const saved = await this.advertisementRepository.save(ad);
    await this.systemLogs.record({
      eventType: "AD_CREATE",
      actorType: "USER",
      actorId: userId,
      targetType: "ADVERTISEMENT",
      targetId: saved.adId,
      message: "Advertisement created",
      metadata: { title: saved.title, categoryId: body.categoryId, subcategoryId: body.subcategoryId },
    });

    return {
      adId: Number(saved.adId),
      status: saved.status,
    };
  }

  async update(userId: string, adId: string, body: PublicAdPayload) {
    const ad = await this.advertisementRepository.findOne({
      where: { adId },
      relations: ["category", "subcategory", "location", "user", "images"],
    });

    if (!ad) {
      throw new NotFoundException("Зар олдсонгүй");
    }

    this.assertOwner(ad, userId);
    ad.title = body.title ?? ad.title;
    ad.description = body.description ?? ad.description;
    ad.price = body.price !== undefined ? String(body.price) : ad.price;
    ad.contactPhone = body.contactPhone ?? ad.contactPhone;
    ad.category = body.categoryId ? ({ categoryId: String(body.categoryId) } as Advertisement["category"]) : ad.category;
    ad.subcategory = body.subcategoryId ? ({ subcategoryId: String(body.subcategoryId) } as Advertisement["subcategory"]) : ad.subcategory;
    ad.location = body.locationId ? ({ locationId: String(body.locationId) } as Advertisement["location"]) : ad.location;
    const saved = await this.advertisementRepository.save(ad);
    return this.toPublicAd(saved);
  }

  async remove(userId: string, adId: string) {
    const ad = await this.advertisementRepository.findOne({ where: { adId }, relations: ["user"] });
    if (!ad) {
      throw new NotFoundException("Зар олдсонгүй");
    }

    this.assertOwner(ad, userId);
    ad.status = AdvertisementStatus.DELETED;
    await this.advertisementRepository.save(ad);
    return {
      adId: Number(adId),
      status: AdvertisementStatus.DELETED,
    };
  }

  async updateStatus(userId: string, adId: string, status: AdvertisementStatus) {
    const ad = await this.advertisementRepository.findOne({ where: { adId }, relations: ["user"] });
    if (!ad) {
      throw new NotFoundException("Зар олдсонгүй");
    }

    this.assertOwner(ad, userId);
    ad.status = status;
    await this.advertisementRepository.save(ad);
    return {
      adId: Number(adId),
      status,
    };
  }

  private resolveOrder(sort?: string): FindOptionsOrder<Advertisement> {
    switch (sort) {
      case "oldest":
        return { createdAt: "ASC" };
      case "mostViewed":
        return { viewCount: "DESC" };
      case "priceAsc":
        return { price: "ASC" };
      case "priceDesc":
        return { price: "DESC" };
      case "newest":
      default:
        return { createdAt: "DESC" };
    }
  }

  private assertOwner(ad: Advertisement, userId: string) {
    if (ad.user?.userId && ad.user.userId !== userId) {
      throw new ForbiddenException("Зөвхөн өөрийн зараа өөрчилж болно");
    }
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
      imageUrl: image?.imageUrl ?? "",
      viewCount: ad.viewCount,
      createdAt: ad.createdAt.toISOString(),
    };
  }
}
