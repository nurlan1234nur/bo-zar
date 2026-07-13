import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Length } from "class-validator";
import { ReportReason } from "../../common/enums";

export class CreateReportDto {
  @Type(() => Number)
  @IsInt()
  adId!: number;

  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsOptional()
  @IsString()
  @Length(3, 1000)
  comment?: string;
}
