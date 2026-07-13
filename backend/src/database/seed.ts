import "reflect-metadata";
import * as bcrypt from "bcrypt";
import { AppDataSource } from "./data-source";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { Category } from "../categories/entities/category.entity";
import { SubCategory } from "../categories/entities/subcategory.entity";
import { AdvertisementStatus, ReportReason, ReportStatus, RoleName, UserStatus } from "../common/enums";
import { publicAds, publicAdminReports, publicCategories, publicLocations, publicSubcategories } from "../common/public-catalog";
import { Favorite } from "../favorites/entities/favorite.entity";
import { Image } from "../images/entities/image.entity";
import { Location } from "../locations/entities/location.entity";
import { Report } from "../reports/entities/report.entity";
import { AdminActionLog } from "../admin/entities/admin-action-log.entity";
import { Role } from "../users/entities/role.entity";
import { User } from "../users/entities/user.entity";

function assertSeedAllowed() {
  const isProduction = process.env.NODE_ENV === "production";
  const allowProdSeed = process.env.ALLOW_SEED_IN_PRODUCTION === "1";

  if (isProduction && !allowProdSeed) {
    throw new Error("Seed is disabled in production. Set ALLOW_SEED_IN_PRODUCTION=1 to override.");
  }
}

const dataSource = AppDataSource;

async function seedRoles() {
  const repository = dataSource.getRepository(Role);
  for (const roleName of Object.values(RoleName)) {
    const existing = await repository.findOne({ where: { roleName } });
    if (!existing) {
      await repository.save(repository.create({ roleName }));
    }
  }
}

async function seedLocations() {
  const repository = dataSource.getRepository(Location);
  for (const location of publicLocations) {
    const existing = await repository.findOne({ where: { locationId: String(location.locationId) } });
    const entity = repository.create({
      ...(existing ?? {}),
      locationId: String(location.locationId),
      name: location.name,
      parentLocationId: location.parentLocationId ? String(location.parentLocationId) : undefined,
      type: location.type,
    });
    await repository.save(entity);
  }
}

async function seedCategories() {
  const categoryRepository = dataSource.getRepository(Category);
  const subcategoryRepository = dataSource.getRepository(SubCategory);

  for (const category of publicCategories) {
    const existing = await categoryRepository.findOne({ where: { categoryId: String(category.categoryId) } });
    await categoryRepository.save(
      categoryRepository.create({
        ...(existing ?? {}),
        categoryId: String(category.categoryId),
        name: category.name,
        icon: category.icon,
        description: category.description,
        isActive: true,
      }),
    );
  }

  for (const subcategory of publicSubcategories) {
    const existing = await subcategoryRepository.findOne({ where: { subcategoryId: String(subcategory.subcategoryId) } });
    await subcategoryRepository.save(
      subcategoryRepository.create({
        ...(existing ?? {}),
        subcategoryId: String(subcategory.subcategoryId),
        category: { categoryId: String(subcategory.categoryId) } as Category,
        name: subcategory.name,
        isActive: true,
      }),
    );
  }
}

async function seedDemoUser() {
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);
  const userRole = await roleRepository.findOneOrFail({ where: { roleName: RoleName.USER } });
  const existing = await userRepository.findOne({ where: { phone: "99112233" } });

  if (existing) {
    return existing;
  }

  return userRepository.save(
    userRepository.create({
      fullName: "Demo хэрэглэгч",
      phone: "99112233",
      email: "demo@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      role: userRole,
      status: UserStatus.ACTIVE,
      location: { locationId: "3" } as Location,
    }),
  );
}

async function seedAdminUser() {
  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);
  const adminRole = await roleRepository.findOneOrFail({ where: { roleName: RoleName.ADMIN } });
  const existing = await userRepository.findOne({ where: { phone: "99000000" } });

  if (existing) {
    return existing;
  }

  return userRepository.save(
    userRepository.create({
      fullName: "Admin хэрэглэгч",
      phone: "99000000",
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: adminRole,
      status: UserStatus.ACTIVE,
      location: { locationId: "3" } as Location,
    }),
  );
}

async function seedAds(user: User) {
  const adRepository = dataSource.getRepository(Advertisement);
  const imageRepository = dataSource.getRepository(Image);

  for (const publicAd of publicAds) {
    const existing = await adRepository.findOne({
      where: { adId: String(publicAd.adId) },
      relations: ["images"],
    });

    const savedAd = await adRepository.save(
      adRepository.create({
        ...(existing ?? {}),
        adId: String(publicAd.adId),
        user,
        category: { categoryId: String(publicAd.categoryId) } as Category,
        subcategory: publicAd.subcategoryId ? ({ subcategoryId: String(publicAd.subcategoryId) } as SubCategory) : undefined,
        location: { locationId: String(publicAd.locationId) } as Location,
        title: publicAd.title,
        description: publicAd.description,
        price: publicAd.price !== undefined ? String(publicAd.price) : undefined,
        status: publicAd.status as AdvertisementStatus,
        viewCount: publicAd.viewCount,
        contactPhone: publicAd.contactPhone,
      }),
    );

    const existingMainImage = await imageRepository.findOne({
      where: {
        advertisement: { adId: savedAd.adId },
        isMain: true,
      },
      relations: ["advertisement"],
    });

    await imageRepository.save(
      imageRepository.create({
        ...(existingMainImage ?? {}),
        advertisement: savedAd,
        imageUrl: publicAd.imageUrl,
        thumbnailUrl: publicAd.imageUrl,
        isMain: true,
      }),
    );
  }
}

async function seedReports(user: User) {
  const reportRepository = dataSource.getRepository(Report);

  for (const publicReport of publicAdminReports) {
    const existing = await reportRepository.findOne({
      where: {
        reporter: { userId: user.userId },
        advertisement: { adId: String(publicReport.adId) },
      },
      relations: ["reporter", "advertisement"],
    });

    if (existing) {
      continue;
    }

    await reportRepository.save(
      reportRepository.create({
        reporter: user,
        advertisement: { adId: String(publicReport.adId) } as Advertisement,
        reason: publicReport.reason as ReportReason,
        comment: publicReport.comment,
        status: publicReport.status as ReportStatus,
      }),
    );
  }
}

async function main() {
  assertSeedAllowed();
  await dataSource.initialize();
  await dataSource.runMigrations();
  await seedRoles();
  await seedLocations();
  await seedCategories();
  const user = await seedDemoUser();
  await seedAdminUser();
  await seedAds(user);
  await seedReports(user);
  await dataSource.destroy();
  console.log("Seed completed");
}

void main().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
