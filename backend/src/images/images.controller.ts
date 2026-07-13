import { BadRequestException, Controller, Delete, Param, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ok } from "../common/api-response";
import { ImagesService } from "./images.service";

const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

@Controller()
@UseGuards(JwtAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post("ads/:adId/images")
  @UseInterceptors(
    FilesInterceptor("files", 8, {
      storage: diskStorage({
        destination: process.env.IMAGE_STORAGE_PATH ?? "uploads",
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          const safeBase = file.originalname
            .replace(extension, "")
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .slice(0, 48);
          callback(null, `${Date.now()}-${safeBase}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        if (!allowedImageExtensions.has(extension)) {
          callback(new BadRequestException("Зөвхөн JPG, PNG, WEBP зураг upload хийнэ"), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(@Param("adId") adId: string, @UploadedFiles() files: Express.Multer.File[] = []) {
    return ok(await this.imagesService.upload(adId, files), "Зураг upload хийлээ");
  }

  @Delete("images/:imageId")
  async remove(@Param("imageId") imageId: string) {
    return ok(await this.imagesService.remove(imageId), "Зураг устгалаа");
  }
}
