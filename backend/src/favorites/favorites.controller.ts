import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ok } from "../common/api-response";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(":adId")
  async add(@CurrentUser() user: RequestUser, @Param("adId") adId: string) {
    return ok(await this.favoritesService.add(user.userId, adId), "Favorite нэмлээ");
  }

  @Get()
  async findAll(@CurrentUser() user: RequestUser) {
    return ok(await this.favoritesService.findAll(user.userId), "Favorite жагсаалт");
  }

  @Delete(":adId")
  async remove(@CurrentUser() user: RequestUser, @Param("adId") adId: string) {
    return ok(await this.favoritesService.remove(user.userId, adId), "Favorite устгалаа");
  }
}
