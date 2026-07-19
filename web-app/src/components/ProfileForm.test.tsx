import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { UserProfile } from "@bozar/shared-types";
import { ProfileForm } from "./ProfileForm";

const profile: UserProfile = {
  userId: 7, fullName: "Owner Name", phone: "99112233", email: "owner@example.com",
  role: "USER", status: "ACTIVE", locationId: 1, locationName: "Ulaanbaatar", profileImage: null,
};
const locations = [{ locationId: 1, name: "Ulaanbaatar", type: "city" as const, count: 0 }];

describe("ProfileForm", () => {
  it("renders profile fields and keeps phone, role, and status read-only", () => {
    render(<ProfileForm profile={profile} locations={locations} saving={false} onSave={vi.fn()} />);
    expect(screen.getByLabelText("Бүтэн нэр")).toHaveValue("Owner Name");
    const metadata = screen.getByLabelText("Бүртгэлийн өөрчлөх боломжгүй мэдээлэл");
    expect(metadata).toHaveTextContent("99112233");
    expect(metadata).toHaveTextContent("USER");
    expect(metadata).toHaveTextContent("ACTIVE");
    expect(screen.queryByRole("textbox", { name: "Утас" })).not.toBeInTheDocument();
  });

  it("submits only the profile update allowlist", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ProfileForm profile={profile} locations={locations} saving={false} onSave={onSave} />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Бүтэн нэр"));
    await user.type(screen.getByLabelText("Бүтэн нэр"), "Updated Owner");
    await user.click(screen.getByRole("button", { name: "Профайл хадгалах" }));
    expect(onSave).toHaveBeenCalledWith({ fullName: "Updated Owner", email: "owner@example.com", locationId: 1 });
  });

  it("sends explicit nulls when email and location are cleared", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<ProfileForm profile={profile} locations={locations} saving={false} onSave={onSave} />);
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText("Email"));
    await user.selectOptions(screen.getByLabelText("Байршил"), "");
    await user.click(screen.getByRole("button", { name: "Профайл хадгалах" }));
    expect(onSave).toHaveBeenCalledWith({ fullName: "Owner Name", email: null, locationId: null });
  });

  it("shows validation and API errors", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Server rejected update"));
    render(<ProfileForm profile={profile} locations={locations} saving={false} onSave={onSave} />);
    const name = screen.getByLabelText("Бүтэн нэр");
    fireEvent.change(name, { target: { value: "x" } });
    fireEvent.submit(screen.getByRole("form", { name: "Профайл засах" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("2–150");
    fireEvent.change(name, { target: { value: "Valid Owner" } });
    fireEvent.submit(screen.getByRole("form", { name: "Профайл засах" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Server rejected update");
  });

  it("prevents a second submission while pending", async () => {
    let resolve!: () => void;
    const onSave = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    const { rerender } = render(<ProfileForm profile={profile} locations={locations} saving={false} onSave={onSave} />);
    fireEvent.submit(screen.getByRole("form", { name: "Профайл засах" }));
    rerender(<ProfileForm profile={profile} locations={locations} saving onSave={onSave} />);
    fireEvent.submit(screen.getByRole("form", { name: "Профайл засах" }));
    expect(onSave).toHaveBeenCalledTimes(1);
    resolve();
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
  });
});
