import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateProfileDto } from "../src/users/dto/update-profile.dto";

async function validationErrors(payload: Record<string, unknown>) {
  return validate(plainToInstance(UpdateProfileDto, payload));
}

describe("UpdateProfileDto nullable validation", () => {
  it("accepts omitted fields", async () => {
    await expect(validationErrors({})).resolves.toHaveLength(0);
  });

  it("accepts explicit null clears", async () => {
    await expect(validationErrors({ email: null, locationId: null, profileImage: null })).resolves.toHaveLength(0);
  });

  it("accepts valid non-null values", async () => {
    await expect(validationErrors({ fullName: "Updated Owner", email: "owner@example.com", locationId: 12, profileImage: "https://example.com/profile.jpg" })).resolves.toHaveLength(0);
  });

  it("rejects an explicit null fullName", async () => {
    const errors = await validationErrors({ fullName: null });
    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ property: "fullName" })]));
  });

  it("rejects an invalid non-null email", async () => {
    const errors = await validationErrors({ email: "not-an-email" });
    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ property: "email" })]));
  });

  it.each([1.5, "not-a-number"])("rejects invalid non-null locationId %p", async (locationId) => {
    const errors = await validationErrors({ locationId });
    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ property: "locationId" })]));
  });

  it("rejects an invalid non-null profile image URL", async () => {
    const errors = await validationErrors({ profileImage: "not-a-url" });
    expect(errors).toEqual(expect.arrayContaining([expect.objectContaining({ property: "profileImage" })]));
  });
});
