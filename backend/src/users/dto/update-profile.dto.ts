import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsInt, IsOptional, IsString, IsUrl, Length, ValidateIf } from "class-validator";

export class UpdateProfileDto {
  @ValidateIf((_object, value) => value !== undefined)
  @IsDefined()
  @IsString()
  @Length(2, 150)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number | null;

  @IsOptional()
  @IsUrl()
  profileImage?: string | null;
}
