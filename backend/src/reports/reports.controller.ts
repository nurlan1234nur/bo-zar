import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ok } from "../common/api-response";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateReportDto) {
    return ok(await this.reportsService.create(user.userId, body), "Report хүлээн авлаа");
  }
}
