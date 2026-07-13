import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleName } from "../common/enums";
import { RequestUser } from "./current-user.decorator";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    return Boolean(request.user?.role && requiredRoles.includes(request.user.role as RoleName));
  }
}
