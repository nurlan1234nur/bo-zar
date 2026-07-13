import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { Image } from "./entities/image.entity";
import { ImagesController } from "./images.controller";
import { ImagesService } from "./images.service";

@Module({
  imports: [TypeOrmModule.forFeature([Image, Advertisement])],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
