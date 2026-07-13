import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../common/api-response";
import { CategoriesService } from "./categories.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return ok(await this.categoriesService.findAll(), "Ангиллын жагсаалт");
  }

  @Get(":categoryId/subcategories")
  async subcategories(@Param("categoryId") categoryId: string) {
    return ok(await this.categoriesService.findSubcategories(categoryId), "Дэд ангиллын жагсаалт");
  }
}
