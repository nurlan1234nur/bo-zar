import { IsOptional, IsString, Length } from "class-validator";

export class PasswordResetRequestDto {
  @IsString()
  @Length(3, 150)
  identifier!: string;
}

export class PasswordResetConfirmDto {
  @IsString()
  @Length(3, 150)
  identifier!: string;

  @IsString()
  @Length(6, 128)
  resetToken!: string;

  @IsString()
  @Length(8, 128)
  newPassword!: string;

  @IsOptional()
  @IsString()
  requestId?: string;
}
