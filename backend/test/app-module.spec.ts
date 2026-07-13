import { validateEnv } from "../src/app.module";

describe("validateEnv", () => {
  it("applies sensible defaults in development", () => {
    const env = validateEnv({ NODE_ENV: "development" });

    expect(env.NODE_ENV).toBe("development");
    expect(env.DB_HOST).toBe("localhost");
    expect(env.DB_PORT).toBe(5432);
    expect(env.JWT_SECRET).toBe("change_me");
  });

  it("fails fast in production when required env is missing", () => {
    expect(() =>
      validateEnv({
        NODE_ENV: "production",
        DB_HOST: "localhost",
        DB_USER: "bozar_user",
        DB_PASSWORD: "bozar_password",
        DB_NAME: "bozar_db",
      }),
    ).toThrow("Missing required environment variables: JWT_SECRET");
  });
});
