import "reflect-metadata";
import { getMetadataArgsStorage } from "typeorm";
import { User } from "../src/users/entities/user.entity";

describe("User entity column metadata", () => {
  it.each([
    ["email", 150, true],
    ["profileImage", 500, false],
  ] as const)("defines %s as an explicit nullable varchar column", (propertyName, length, unique) => {
    const column = getMetadataArgsStorage().columns.find(
      (metadata) => metadata.target === User && metadata.propertyName === propertyName,
    );

    expect(column).toBeDefined();
    expect(column?.options).toEqual(expect.objectContaining({
      type: "varchar",
      length,
      nullable: true,
      ...(unique ? { unique: true } : {}),
    }));
  });
});
