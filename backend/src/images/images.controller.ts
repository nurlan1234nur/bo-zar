import { Controller, Delete, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CurrentUser, RequestUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ok } from "../common/api-response";
import { ImagesService } from "./images.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post("ads/:adId/images")
  @UseInterceptors(FilesInterceptor("files", 8, {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  }))
  async upload(@CurrentUser() user: RequestUser, @Param("adId") adId: string, @UploadedFiles() files: Express.Multer.File[] = []) {
    return ok(await this.imagesService.upload(user.userId, adId, files), "Зураг upload хийлээ");
  }

  @Delete("images/:imageId")
  async remove(@CurrentUser() user: RequestUser, @Param("imageId") imageId: string) {
    return ok(await this.imagesService.remove(user.userId, imageId), "Зураг устгалаа");
  }
}
