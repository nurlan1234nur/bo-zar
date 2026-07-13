import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { SubCategory } from "./entities/subcategory.entity";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";

@Module({
  imports: [TypeOrmModule.forFeature([Category, SubCategory])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
