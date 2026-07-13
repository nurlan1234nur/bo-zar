import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Length } from "class-validator";

export class AdminCategoryDto {
  @IsString()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  icon?: string;

  @IsOptional()
  @IsString()
  @Length(3, 1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminSubcategoryDto {
  @IsString()
  @Length(2, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(3, 1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminCreateSubcategoryDto extends AdminSubcategoryDto {
  @Type(() => Number)
  @IsInt()
  categoryId!: number;
}
