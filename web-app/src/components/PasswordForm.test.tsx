import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PasswordForm } from "./PasswordForm";

function fill(current: string, next: string, confirmation: string) {
  fireEvent.change(screen.getByLabelText("Одоогийн нууц үг"), { target: { value: current } });
  fireEvent.change(screen.getByLabelText("Шинэ нууц үг"), { target: { value: next } });
  fireEvent.change(screen.getByLabelText("Шинэ нууц үг давтах"), { target: { value: confirmation } });
  fireEvent.submit(screen.getByRole("form", { name: "Нууц үг солих" }));
}

describe("PasswordForm", () => {
  it("validates confirmation and prevents password reuse", () => {
    const onSave = vi.fn(); render(<PasswordForm saving={false} onSave={onSave} />);
    fill("password123", "password123", "password123");
    expect(screen.getByRole("alert")).toHaveTextContent("одоогийн нууц үгээс өөр");
    fill("password123", "different123", "mismatch123");
    expect(screen.getByRole("alert")).toHaveTextContent("таарахгүй");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits and clears password fields", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined); render(<PasswordForm saving={false} onSave={onSave} />);
    fill("password123", "different123", "different123");
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("password123", "different123"));
    expect(screen.getByRole("status")).toHaveTextContent("амжилттай");
    expect(screen.getByLabelText("Одоогийн нууц үг")).toHaveValue("");
  });

  it("shows a sanitized parent error", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Одоогийн нууц үг буруу байна.")); render(<PasswordForm saving={false} onSave={onSave} />);
    fill("wrong-pass", "different123", "different123");
    expect(await screen.findByRole("alert")).toHaveTextContent("Одоогийн нууц үг буруу");
  });
});
