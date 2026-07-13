import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { SubCategory } from "./entities/subcategory.entity";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory) private readonly subcategoryRepository: Repository<SubCategory>,
  ) {}

  async findAll() {
    try {
      const categories = await this.categoryRepository.find({
        where: { isActive: true },
        order: { categoryId: "ASC" },
      });

      if (categories.length > 0) {
        return categories.map((category) => ({
          categoryId: Number(category.categoryId),
          name: category.name,
          icon: category.icon ?? "tag",
          description: category.description ?? "",
          count: 0,
        }));
      }
    } catch {
      // Keep public catalog usable while database setup is still in progress.
    }

    return [];
  }

  async findSubcategories(categoryId: string) {
    try {
      const items = await this.subcategoryRepository.find({
        where: {
          category: { categoryId },
          isActive: true,
        },
        relations: ["category"],
        order: { subcategoryId: "ASC" },
      });

      if (items.length > 0) {
        return {
          categoryId: Number(categoryId),
          items: items.map((item) => ({
            subcategoryId: Number(item.subcategoryId),
            categoryId: Number(item.category.categoryId),
            name: item.name,
          })),
        };
      }
    } catch {
      // Keep public catalog usable while database setup is still in progress.
    }

    return {
      categoryId: Number(categoryId),
      items: [],
    };
  }
}
