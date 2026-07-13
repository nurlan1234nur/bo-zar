import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { AdvertisementStatus } from "../../common/enums";

export class CreateAdDto {
  @IsString()
  @Length(3, 200)
  title!: string;

  @IsString()
  @Length(10, 5000)
  description!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @Type(() => Number)
  @IsInt()
  categoryId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subcategoryId?: number;

  @Type(() => Number)
  @IsInt()
  locationId!: number;

  @IsString()
  @Length(6, 20)
  contactPhone!: string;
}

export class UpdateAdDto {
  @IsOptional()
  @IsString()
  @Length(3, 200)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(10, 5000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subcategoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  contactPhone?: string;
}

export class UpdateAdStatusDto {
  @IsEnum(AdvertisementStatus)
  status!: AdvertisementStatus;
}
