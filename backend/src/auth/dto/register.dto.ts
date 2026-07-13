import { IsEmail, IsOptional, IsString, Length, Matches } from "class-validator";

export class RegisterDto {
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @IsString()
  @Matches(/^[0-9+ -]{6,20}$/)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Length(8, 72)
  password!: string;
}
