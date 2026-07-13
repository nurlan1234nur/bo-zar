import { Type } from "class-transformer";
import { IsEmail, IsInt, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number;

  @IsOptional()
  @IsUrl()
  profileImage?: string;
}
