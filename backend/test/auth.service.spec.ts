import * as bcrypt from "bcrypt";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../src/auth/auth.service";
import { RoleName, UserStatus } from "../src/common/enums";

describe("AuthService", () => {
  const role = { roleName: RoleName.USER };
  const user = {
    userId: "1",
    fullName: "Demo User",
    phone: "99112233",
    email: "demo@example.com",
    passwordHash: "",
    role,
    status: UserStatus.ACTIVE,
  };

  const jwt = {
    sign: jest.fn(() => "signed-token"),
  };
  const systemLogs = {
    record: jest.fn().mockResolvedValue(undefined),
  };

  function createUsersRepository(overrides: Record<string, unknown> = {}) {
    return {
      findOne: jest.fn(),
      findOneByOrFail: jest.fn(),
      save: jest.fn((payload) => Promise.resolve(payload)),
      create: jest.fn((payload) => payload),
      createQueryBuilder: jest.fn(),
      ...overrides,
    };
  }

  function createService(usersRepository: Record<string, unknown>) {
    return new AuthService(usersRepository as never, {} as never, jwt as never, systemLogs as never);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("changes password when the current password matches", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    const usersRepository = createUsersRepository({
      findOne: jest.fn().mockResolvedValue({ ...user, passwordHash }),
    });
    const service = createService(usersRepository);

    await expect(
      service.changePassword("1", {
        currentPassword: "password123",
        newPassword: "password1234",
      }),
    ).resolves.toEqual({ changed: true });

    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "1",
        passwordHash: expect.any(String),
      }),
    );
    expect(systemLogs.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "AUTH_CHANGE_PASSWORD" }));
  });

  it("rejects password change when the current password is wrong", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    const usersRepository = createUsersRepository({
      findOne: jest.fn().mockResolvedValue({ ...user, passwordHash }),
    });
    const service = createService(usersRepository);

    await expect(
      service.changePassword("1", {
        currentPassword: "wrong-password",
        newPassword: "password1234",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersRepository.save).not.toHaveBeenCalled();
  });

  it("returns a development reset token and accepts it to reset password", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ ...user, passwordHash: "old" }),
    };
    const usersRepository = createUsersRepository({
      createQueryBuilder: jest.fn(() => queryBuilder),
    });
    const service = createService(usersRepository);

    const resetRequest = await service.requestPasswordReset({ identifier: "99112233" });
    expect(resetRequest).toEqual(
      expect.objectContaining({
        accepted: true,
        requestId: expect.any(String),
        resetToken: expect.any(String),
      }),
    );

    await expect(
      service.confirmPasswordReset({
        identifier: "99112233",
        resetToken: resetRequest.resetToken!,
        newPassword: "password123",
      }),
    ).resolves.toEqual({ reset: true });

    expect(usersRepository.save).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: expect.any(String) }));
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("does not reveal reset tokens in production", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    const usersRepository = createUsersRepository({
      createQueryBuilder: jest.fn(() => queryBuilder),
    });
    const service = createService(usersRepository);

    await expect(service.requestPasswordReset({ identifier: "99112233" })).resolves.toEqual({
      accepted: true,
      requestId: expect.any(String),
      expiresInMinutes: 15,
    });

    process.env.NODE_ENV = previousNodeEnv;
  });
});
