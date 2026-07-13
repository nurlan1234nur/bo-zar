import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CurrentUser, RequestUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ok } from "../common/api-response";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: RequestUser) {
    return ok(await this.usersService.findProfile(user.userId), "Current user");
  }

  @Get("me/ads")
  @UseGuards(JwtAuthGuard)
  async myAds(@CurrentUser() user: RequestUser) {
    return ok(await this.usersService.findMyAds(user.userId), "Миний зарууд");
  }

  @Put("me")
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: RequestUser, @Body() body: UpdateProfileDto) {
    return ok(await this.usersService.updateProfile(user.userId, body), "Профайл шинэчиллээ");
  }
}
