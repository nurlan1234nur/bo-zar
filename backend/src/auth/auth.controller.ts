import { Body, Controller, Patch, Post, UseGuards } from "@nestjs/common";
import { ok } from "../common/api-response";
import { AuthService } from "./auth.service";
import { CurrentUser, RequestUser } from "./current-user.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { PasswordResetConfirmDto, PasswordResetRequestDto } from "./dto/password-reset.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    return ok(await this.authService.register(body), "Registration successful");
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    return ok(await this.authService.login(body), "Login successful");
  }

  @Post("logout")
  logout() {
    return ok(null, "Logout accepted");
  }

  @Patch("change-password")
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user: RequestUser, @Body() body: ChangePasswordDto) {
    return ok(await this.authService.changePassword(user.userId, body), "Password changed");
  }

  @Post("password-reset/request")
  async requestPasswordReset(@Body() body: PasswordResetRequestDto) {
    return ok(await this.authService.requestPasswordReset(body), "Password reset request accepted");
  }

  @Post("password-reset/confirm")
  async confirmPasswordReset(@Body() body: PasswordResetConfirmDto) {
    return ok(await this.authService.confirmPasswordReset(body), "Password reset confirmed");
  }
}
