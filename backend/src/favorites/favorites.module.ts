import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Advertisement } from "../ads/entities/advertisement.entity";
import { User } from "../users/entities/user.entity";
import { Favorite } from "./entities/favorite.entity";
import { FavoritesController } from "./favorites.controller";
import { FavoritesService } from "./favorites.service";

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, Advertisement])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
