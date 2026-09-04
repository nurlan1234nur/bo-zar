import { UnauthorizedException } from "@nestjs/common";
import { RoleName, UserStatus } from "../src/common/enums";
import { JwtStrategy } from "../src/auth/jwt.strategy";

describe("JwtStrategy", () => {
  const config = { getOrThrow: jest.fn().mockReturnValue("test-secret") };
  const payload = { sub: "7", phone: "stale-phone", role: RoleName.USER };

  function strategy(user: unknown) {
    const users = { findOne: jest.fn().mockResolvedValue(user) };
    return { instance: new JwtStrategy(config as never, users as never), users };
  }

  it("uses current database identity and role for an active token subject", async () => {
    const active = { userId: "7", phone: "99112233", status: UserStatus.ACTIVE, role: { roleName: RoleName.MODERATOR } };
    const { instance, users } = strategy(active);
    await expect(instance.validate(payload)).resolves.toEqual({ userId: "7", phone: "99112233", role: RoleName.MODERATOR });
    expect(users.findOne).toHaveBeenCalledWith({ where: { userId: "7" }, relations: ["role"] });
  });

  it.each([UserStatus.BLOCKED, UserStatus.SUSPENDED])("rejects a previously issued token when the user is %s", async (status) => {
    const { instance } = strategy({ userId: "7", phone: "99112233", status, role: { roleName: RoleName.USER } });
    await expect(instance.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a validly signed token when its user no longer exists", async () => {
    const { instance } = strategy(null);
    await expect(instance.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
