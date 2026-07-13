import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { ok } from "../common/api-response";
import { RoleName } from "../common/enums";
import { AdminCategoryDto, AdminSubcategoryDto } from "./dto/admin-category.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.MODERATOR)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("reports")
  async reports() {
    return ok(await this.adminService.reports(), "Report list");
  }

  @Get("users")
  async users() {
    return ok(await this.adminService.users(), "User list");
  }

  @Patch("ads/:adId/hide")
  async hideAd(@Param("adId") adId: string) {
    return ok(await this.adminService.hideAd(adId), "Advertisement hidden");
  }

  @Patch("users/:userId/block")
  async blockUser(@Param("userId") userId: string) {
    return ok(await this.adminService.blockUser(userId), "User blocked");
  }

  @Patch("users/:userId/suspend")
  async suspendUser(@Param("userId") userId: string) {
    return ok(await this.adminService.suspendUser(userId), "User suspended");
  }

  @Patch("reports/:reportId/resolve")
  async resolveReport(@Param("reportId") reportId: string) {
    return ok(await this.adminService.resolveReport(reportId), "Report resolved");
  }

  @Get("dashboard/stats")
  async stats() {
    return ok(await this.adminService.stats(), "Dashboard stats");
  }

  @Get("logs")
  async logs() {
    return ok(await this.adminService.logs(), "Admin action logs");
  }

  @Post("categories")
  async createCategory(@Body() body: AdminCategoryDto) {
    return ok(await this.adminService.createCategory(body), "Category created");
  }

  @Put("categories/:categoryId")
  async updateCategory(@Param("categoryId") categoryId: string, @Body() body: AdminCategoryDto) {
    return ok(await this.adminService.updateCategory(categoryId, body), "Category updated");
  }

  @Delete("categories/:categoryId")
  async deleteCategory(@Param("categoryId") categoryId: string) {
    return ok(await this.adminService.deleteCategory(categoryId), "Category disabled");
  }

  @Post("categories/:categoryId/subcategories")
  async createSubcategory(@Param("categoryId") categoryId: string, @Body() body: AdminSubcategoryDto) {
    return ok(await this.adminService.createSubcategory(categoryId, body), "Subcategory created");
  }

  @Put("subcategories/:subcategoryId")
  async updateSubcategory(@Param("subcategoryId") subcategoryId: string, @Body() body: AdminSubcategoryDto) {
    return ok(await this.adminService.updateSubcategory(subcategoryId, body), "Subcategory updated");
  }

  @Delete("subcategories/:subcategoryId")
  async deleteSubcategory(@Param("subcategoryId") subcategoryId: string) {
    return ok(await this.adminService.deleteSubcategory(subcategoryId), "Subcategory disabled");
  }
}
