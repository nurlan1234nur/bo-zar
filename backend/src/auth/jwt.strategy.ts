import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { UserStatus } from "../common/enums";
import { User } from "../users/entities/user.entity";

export interface JwtPayload {
  sub: string;
  phone: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, @InjectRepository(User) private readonly users: Repository<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.users.findOne({ where: { userId: payload.sub }, relations: ["role"] });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Account is not active");
    }
    return {
      userId: user.userId,
      phone: user.phone,
      role: user.role.roleName,
    };
  }
}
