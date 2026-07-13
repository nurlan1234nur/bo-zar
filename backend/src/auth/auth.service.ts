import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { createHmac } from "crypto";
import { Repository } from "typeorm";
import { RoleName, UserStatus } from "../common/enums";
import { SystemLogsService } from "../system-logs/system-logs.service";
import { Role } from "../users/entities/role.entity";
import { User } from "../users/entities/user.entity";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { PasswordResetConfirmDto, PasswordResetRequestDto } from "./dto/password-reset.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    private readonly jwt: JwtService,
    private readonly systemLogs: SystemLogsService,
  ) {}

  async register(dto: RegisterDto) {
    const existingByPhone = await this.users.findOne({ where: { phone: dto.phone } });
    if (existingByPhone) {
      throw new ConflictException("Энэ утасны дугаар бүртгэлтэй байна");
    }

    if (dto.email) {
      const existingByEmail = await this.users.findOne({ where: { email: dto.email } });
      if (existingByEmail) {
        throw new ConflictException("Энэ email бүртгэлтэй байна");
      }
    }

    const role = await this.getOrCreateRole(RoleName.USER);
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.users.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
    });

    const saved = await this.users.save(user);
    await this.systemLogs.record({
      eventType: "AUTH_REGISTER",
      actorType: "USER",
      actorId: saved.userId,
      message: "User registered",
      metadata: { phone: saved.phone },
    });

    return {
      token: this.sign(saved),
      user: this.toAuthUser(saved),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.users
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("user.phone = :identifier", { identifier: dto.identifier })
      .orWhere("user.email = :identifier", { identifier: dto.identifier })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("Нэвтрэх мэдээлэл буруу байна");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Хэрэглэгчийн эрх идэвхгүй байна");
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Нэвтрэх мэдээлэл буруу байна");
    }

    await this.systemLogs.record({
      eventType: "AUTH_LOGIN",
      actorType: "USER",
      actorId: user.userId,
      message: "User logged in",
      metadata: { phone: user.phone, role: user.role.roleName },
    });

    return {
      token: this.sign(user),
      user: this.toAuthUser(user),
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { userId }, relations: ["role"] });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const passwordMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.users.save(user);
    await this.systemLogs.record({
      eventType: "AUTH_CHANGE_PASSWORD",
      actorType: "USER",
      actorId: user.userId,
      message: "User changed password",
    });

    return { changed: true };
  }

  async requestPasswordReset(dto: PasswordResetRequestDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.findByIdentifier(identifier);

    if (user) {
      await this.systemLogs.record({
        eventType: "AUTH_PASSWORD_RESET_REQUEST",
        actorType: "USER",
        actorId: user.userId,
        message: "Password reset requested",
        metadata: { identifier },
      });
    }

    const resetToken = this.createResetToken(identifier);
    return {
      accepted: true,
      requestId: this.createResetRequestId(identifier),
      expiresInMinutes: 15,
      ...(process.env.NODE_ENV === "production" ? {} : { resetToken }),
    };
  }

  async confirmPasswordReset(dto: PasswordResetConfirmDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    if (!this.isValidResetToken(identifier, dto.resetToken)) {
      throw new UnauthorizedException("Invalid reset token");
    }

    const user = await this.findByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException("Invalid reset token");
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.users.save(user);
    await this.systemLogs.record({
      eventType: "AUTH_PASSWORD_RESET_CONFIRM",
      actorType: "USER",
      actorId: user.userId,
      message: "Password reset confirmed",
    });

    return { reset: true };
  }

  private async getOrCreateRole(roleName: RoleName) {
    const existing = await this.roles.findOne({ where: { roleName } });
    if (existing) {
      return existing;
    }

    return this.roles.save(this.roles.create({ roleName }));
  }

  private sign(user: User) {
    return this.jwt.sign({
      sub: user.userId,
      phone: user.phone,
      role: user.role.roleName,
    });
  }

  private findByIdentifier(identifier: string) {
    return this.users
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("LOWER(user.phone) = :identifier", { identifier })
      .orWhere("LOWER(user.email) = :identifier", { identifier })
      .getOne();
  }

  private createResetToken(identifier: string) {
    return this.createResetTokenForWindow(identifier, Math.floor(Date.now() / (15 * 60 * 1000)));
  }

  private isValidResetToken(identifier: string, token: string) {
    const currentWindow = Math.floor(Date.now() / (15 * 60 * 1000));
    return [currentWindow, currentWindow - 1].some((window) => this.createResetTokenForWindow(identifier, window) === token);
  }

  private createResetTokenForWindow(identifier: string, window: number) {
    const secret = process.env.JWT_SECRET || "change_me";
    return createHmac("sha256", secret)
      .update(`${identifier}:${window}`)
      .digest("hex")
      .replace(/\D/g, "")
      .slice(0, 6)
      .padEnd(6, "0");
  }

  private createResetRequestId(identifier: string) {
    const secret = process.env.JWT_SECRET || "change_me";
    return createHmac("sha256", secret).update(identifier).digest("hex").slice(0, 16);
  }

  private toAuthUser(user: User) {
    return {
      userId: Number(user.userId),
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role.roleName,
    };
  }
}
