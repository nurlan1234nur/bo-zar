import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { Category } from "../categories/entities/category.entity";
import { SubCategory } from "../categories/entities/subcategory.entity";
import { AdvertisementStatus, ReportStatus, UserStatus } from "../common/enums";
import { Report } from "../reports/entities/report.entity";
import { User } from "../users/entities/user.entity";
import { AdminCategoryDto, AdminSubcategoryDto } from "./dto/admin-category.dto";
import { AdminActionLog } from "./entities/admin-action-log.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminActionLog) private readonly logRepository: Repository<AdminActionLog>,
    @InjectRepository(Advertisement) private readonly adRepository: Repository<Advertisement>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory) private readonly subcategoryRepository: Repository<SubCategory>,
  ) {}

  async reports() {
    const reports = await this.reportRepository.find({ relations: ["advertisement", "reporter"], order: { createdAt: "DESC" } });
    return reports.map((report) => ({ reportId: Number(report.reportId), adId: Number(report.advertisement.adId), adTitle: report.advertisement.title, reporterName: report.reporter.fullName, reason: report.reason, comment: report.comment, status: report.status, createdAt: report.createdAt.toISOString() }));
  }

  async users() {
    const users = await this.userRepository.find({ relations: ["role", "location", "advertisements"], order: { createdAt: "DESC" }, take: 100 });
    return users.map((user) => ({ userId: Number(user.userId), fullName: user.fullName, phone: user.phone, email: user.email, role: user.role.roleName, status: user.status, locationName: user.location?.name, adCount: user.advertisements?.length ?? 0, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }));
  }

  async stats() {
    const [users, ads, activeAds, reports, categories] = await Promise.all([this.userRepository.count(), this.adRepository.count(), this.adRepository.count({ where: { status: AdvertisementStatus.ACTIVE } }), this.reportRepository.count(), this.categoryRepository.count({ where: { isActive: true } })]);
    return { users, ads, activeAds, reports, categories };
  }

  async logs() {
    const logs = await this.logRepository.find({ relations: ["adminUser"], order: { createdAt: "DESC" }, take: 20 });
    return logs.map((log) => ({ logId: Number(log.logId), adminName: log.adminUser?.fullName ?? "Admin", actionType: log.actionType, targetType: log.targetType, targetId: Number(log.targetId), description: log.description, createdAt: log.createdAt.toISOString() }));
  }

  async hideAd(adId: string) {
    const ad = await this.adRepository.findOne({ where: { adId } });
    if (!ad) throw new NotFoundException("Advertisement not found");
    ad.status = AdvertisementStatus.HIDDEN;
    await this.adRepository.save(ad);
    await this.log("HIDE_AD", "ADVERTISEMENT", adId, "Admin hid advertisement");
    return { adId: Number(adId), status: AdvertisementStatus.HIDDEN };
  }

  async blockUser(userId: string) {
    return this.updateUserStatus(userId, UserStatus.BLOCKED, "BLOCK_USER");
  }

  async suspendUser(userId: string) {
    return this.updateUserStatus(userId, UserStatus.SUSPENDED, "SUSPEND_USER");
  }

  async resolveReport(reportId: string) {
    const report = await this.reportRepository.findOne({ where: { reportId } });
    if (!report) throw new NotFoundException("Report not found");
    report.status = ReportStatus.RESOLVED;
    report.reviewedAt = new Date();
    await this.reportRepository.save(report);
    await this.log("RESOLVE_REPORT", "REPORT", reportId, "Admin resolved report");
    return { reportId: Number(reportId), status: ReportStatus.RESOLVED };
  }

  async createCategory(body: AdminCategoryDto) {
    const category = await this.categoryRepository.save(
      this.categoryRepository.create({
        name: body.name,
        icon: body.icon,
        description: body.description,
        isActive: body.isActive ?? true,
      }),
    );
    await this.log("CREATE_CATEGORY", "CATEGORY", category.categoryId, `Created category ${category.name}`);
    return this.toCategoryResponse(category);
  }

  async updateCategory(categoryId: string, body: AdminCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { categoryId } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    category.name = body.name ?? category.name;
    category.icon = body.icon ?? category.icon;
    category.description = body.description ?? category.description;
    category.isActive = body.isActive ?? category.isActive;
    const saved = await this.categoryRepository.save(category);
    await this.log("UPDATE_CATEGORY", "CATEGORY", categoryId, `Updated category ${saved.name}`);
    return this.toCategoryResponse(saved);
  }

  async deleteCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({ where: { categoryId } });
    if (!category) throw new NotFoundException("Category not found");
    category.isActive = false;
    await this.categoryRepository.save(category);
    await this.log("DISABLE_CATEGORY", "CATEGORY", categoryId, `Disabled category ${category.name}`);
    return { categoryId: Number(categoryId), isActive: false };
  }

  async createSubcategory(categoryId: string, body: AdminSubcategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { categoryId } });
    if (!category) throw new NotFoundException("Category not found");
    const subcategory = await this.subcategoryRepository.save(
      this.subcategoryRepository.create({
        category,
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? true,
      }),
    );
    await this.log("CREATE_SUBCATEGORY", "SUBCATEGORY", subcategory.subcategoryId, `Created subcategory ${subcategory.name}`);
    return this.toSubcategoryResponse(subcategory, Number(categoryId));
  }

  async updateSubcategory(subcategoryId: string, body: AdminSubcategoryDto) {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { subcategoryId },
      relations: ["category"],
    });
    if (!subcategory) {
      throw new NotFoundException("Subcategory not found");
    }

    subcategory.name = body.name ?? subcategory.name;
    subcategory.description = body.description ?? subcategory.description;
    subcategory.isActive = body.isActive ?? subcategory.isActive;
    const saved = await this.subcategoryRepository.save(subcategory);
    await this.log("UPDATE_SUBCATEGORY", "SUBCATEGORY", subcategoryId, `Updated subcategory ${saved.name}`);
    return this.toSubcategoryResponse(saved, Number(saved.category.categoryId));
  }

  async deleteSubcategory(subcategoryId: string) {
    const subcategory = await this.subcategoryRepository.findOne({ where: { subcategoryId } });
    if (!subcategory) throw new NotFoundException("Subcategory not found");
    subcategory.isActive = false;
    await this.subcategoryRepository.save(subcategory);
    await this.log("DISABLE_SUBCATEGORY", "SUBCATEGORY", subcategoryId, `Disabled subcategory ${subcategory.name}`);
    return { subcategoryId: Number(subcategoryId), isActive: false };
  }

  private async updateUserStatus(userId: string, status: UserStatus, actionType: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException("User not found");
    user.status = status;
    await this.userRepository.save(user);
    await this.log(actionType, "USER", userId, `Admin set user status to ${status}`);
    return { userId: Number(userId), status };
  }

  private async log(actionType: string, targetType: string, targetId: string, description: string) {
    const admin = await this.userRepository.findOne({ where: { phone: "99000000" } });
    if (!admin) return;

    await this.logRepository.save(
      this.logRepository.create({
        adminUser: admin,
        actionType,
        targetType,
        targetId,
        description,
      }),
    );
  }

  private toCategoryResponse(category: Category) {
    return {
      categoryId: Number(category.categoryId),
      name: category.name,
      icon: category.icon,
      description: category.description,
      isActive: category.isActive,
    };
  }

  private toSubcategoryResponse(subcategory: SubCategory, categoryId: number) {
    return {
      subcategoryId: Number(subcategory.subcategoryId),
      categoryId,
      name: subcategory.name,
      description: subcategory.description,
      isActive: subcategory.isActive,
    };
  }
}
