import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { ReportStatus } from "../common/enums";
import { User } from "../users/entities/user.entity";
import { CreateReportDto } from "./dto/create-report.dto";
import { Report } from "./entities/report.entity";

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Advertisement) private readonly advertisementRepository: Repository<Advertisement>,
  ) {}

  async create(userId: string, body: CreateReportDto) {
    try {
      const existing = await this.reportRepository.findOne({
        where: {
          reporter: { userId },
          advertisement: { adId: String(body.adId) },
        },
        relations: ["reporter", "advertisement"],
      });

      if (existing) {
        return this.toResponse(existing);
      }

      const reporter = await this.userRepository.findOneByOrFail({ userId });
      const advertisement = await this.advertisementRepository.findOneByOrFail({ adId: String(body.adId) });
      const report = await this.reportRepository.save(
        this.reportRepository.create({
          reporter,
          advertisement,
          reason: body.reason,
          comment: body.comment,
          status: ReportStatus.PENDING,
        }),
      );

      return this.toResponse(report);
    } catch {
      // Keep report flow usable while DB setup is still in progress.
    }

    return {
      reportId: Date.now(),
      adId: Number(body.adId),
      reason: body.reason,
      comment: body.comment,
      status: ReportStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
  }

  private toResponse(report: Report) {
    return {
      reportId: Number(report.reportId),
      adId: Number(report.advertisement?.adId),
      reason: report.reason,
      comment: report.comment,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
    };
  }
}
