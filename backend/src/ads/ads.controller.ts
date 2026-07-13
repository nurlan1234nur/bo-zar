import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ok } from "../common/api-response";
import { AdsService } from "./ads.service";
import { CreateAdDto, UpdateAdDto, UpdateAdStatusDto } from "./dto/ad.dto";

@Controller("ads")
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  async findAll(@Query() query: Record<string, string | undefined>) {
    return ok(await this.adsService.findAll(query), "Зарын жагсаалт");
  }

  @Get(":adId")
  async findOne(@Param("adId") adId: string) {
    const ad = await this.adsService.findOne(adId);
    if (!ad) {
      throw new NotFoundException("Зар олдсонгүй");
    }
    return ok(ad, "Зарын дэлгэрэнгүй");
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: RequestUser, @Body() body: CreateAdDto) {
    return ok(await this.adsService.create(user.userId, body), "Зар үүсгэх endpoint бэлэн");
  }

  @Put(":adId")
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user: RequestUser, @Param("adId") adId: string, @Body() body: UpdateAdDto) {
    return ok(await this.adsService.update(user.userId, adId, body), "Зар шинэчиллээ");
  }

  @Delete(":adId")
  @UseGuards(JwtAuthGuard)
  async remove(@CurrentUser() user: RequestUser, @Param("adId") adId: string) {
    return ok(await this.adsService.remove(user.userId, adId), "Зар устгалаа");
  }

  @Patch(":adId/status")
  @UseGuards(JwtAuthGuard)
  async updateStatus(@CurrentUser() user: RequestUser, @Param("adId") adId: string, @Body() body: UpdateAdStatusDto) {
    return ok(await this.adsService.updateStatus(user.userId, adId, body.status), "Зарын төлөв шинэчиллээ");
  }
}
