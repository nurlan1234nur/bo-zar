import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "../users/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { AuthService } from "./auth.service";
import { SystemLogsModule } from "../system-logs/system-logs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    SystemLogsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRES_IN") ?? "7d" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
