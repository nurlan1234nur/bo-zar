import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OwnerAdvertisement } from "@bozar/shared-types";
import { MyAdsList } from "./MyAdsList";
import { resolveImageUrlValue } from "../app-utils";

function ad(status: OwnerAdvertisement["status"], id: number): OwnerAdvertisement {
  return { adId: id, title: `${status} ad`, description: "description", categoryId: 1, locationId: 1,
    locationName: "Ulaanbaatar", sellerName: "Owner", contactPhone: "99112233", imageUrl: "", viewCount: 0,
    createdAt: "2026-07-15T00:00:00.000Z", status };
}
const baseProps = { ads: [] as OwnerAdvertisement[], resolveImageUrl: (url: string) => url, onRetry: vi.fn() };

describe("MyAdsList", () => {
  it("shows distinct loading and empty states", () => {
    const { rerender } = render(<MyAdsList {...baseProps} loading error="" />);
    expect(screen.getByRole("status")).toHaveTextContent("ачаалж байна");
    rerender(<MyAdsList {...baseProps} loading={false} error="" />);
    expect(screen.getByText("Одоогоор зар алга.")).toBeInTheDocument();
  });

  it("shows an error and retries", () => {
    const onRetry = vi.fn();
    render(<MyAdsList {...baseProps} loading={false} error="Network error" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    fireEvent.click(screen.getByRole("button", { name: /Дахин оролдох/ }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders every owner status including hidden and deleted", () => {
    const statuses: OwnerAdvertisement["status"][] = ["ACTIVE", "SOLD", "INACTIVE", "EXPIRED", "HIDDEN", "DELETED"];
    render(<MyAdsList {...baseProps} ads={statuses.map(ad)} loading={false} error="" />);
    for (const status of statuses) expect(screen.getByText(`${status} ad`)).toBeInTheDocument();
    expect(screen.getByText("Нуусан")).toHaveClass("status-hidden");
    expect(screen.getByText("Устгасан")).toHaveClass("status-deleted");
  });

  it("uses a neutral fallback for an unknown runtime status", () => {
    const malformed = { ...ad("ACTIVE", 9), status: undefined } as unknown as OwnerAdvertisement;
    render(<MyAdsList {...baseProps} ads={[malformed]} loading={false} error="" />);
    expect(screen.getByText("Unknown")).toHaveClass("status-unknown");
  });

  it("exposes edit, status, and delete actions only for manageable ads", () => {
    const onEdit = vi.fn();
    const onStatusChange = vi.fn();
    const onDelete = vi.fn();
    render(<MyAdsList {...baseProps} ads={[ad("ACTIVE", 1), ad("DELETED", 2)]} loading={false} error="" onEdit={onEdit} onStatusChange={onStatusChange} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Засах/ }));
    fireEvent.change(screen.getByRole("combobox", { name: "ACTIVE ad төлөв" }), { target: { value: "SOLD" } });
    fireEvent.click(screen.getByRole("button", { name: /Устгах/ }));

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ adId: 1 }));
    expect(onStatusChange).toHaveBeenCalledWith(expect.objectContaining({ adId: 1 }), "SOLD");
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ adId: 1 }));
    expect(screen.getAllByRole("button", { name: /Засах/ })).toHaveLength(1);
  });

  it("provides non-overflowing long-content hooks and full-value titles", () => {
    const longTitle = "Very long advertisement title ".repeat(10);
    const longLocation = "Very long location ".repeat(10);
    const { container } = render(<MyAdsList {...baseProps} ads={[{ ...ad("ACTIVE", 10), title: longTitle, locationName: longLocation }]} loading={false} error="" />);
    expect(container.querySelector(".owner-ad-title-row h3")).toHaveAttribute("title", longTitle);
    expect(container.querySelector(".owner-ad-location")).toHaveAttribute("title", longLocation);
  });

  it("accepts only upload paths and valid HTTP(S) absolute URLs", () => {
    expect(resolveImageUrlValue("/uploads/image.jpg", "http://localhost:8080")).toBe("http://localhost:8080/uploads/image.jpg");
    expect(resolveImageUrlValue("uploads/image.jpg", "http://localhost:8080")).toBe("http://localhost:8080/uploads/image.jpg");
    expect(resolveImageUrlValue("http://cdn.example.com/image.jpg", "http://localhost:8080")).toBe("http://cdn.example.com/image.jpg");
    expect(resolveImageUrlValue("https://cdn.example.com/image.jpg", "http://localhost:8080")).toBe("https://cdn.example.com/image.jpg");
    expect(resolveImageUrlValue("HTTP://cdn.example.com/image.jpg", "http://localhost:8080")).toBe("HTTP://cdn.example.com/image.jpg");
    expect(resolveImageUrlValue("HTTPS://cdn.example.com/image.jpg", "http://localhost:8080")).toBe("HTTPS://cdn.example.com/image.jpg");
  });

  it.each([
    "",
    "uploads/../internal/path",
    "/uploads/../internal/path",
    "uploads/%2e%2e/internal/path",
    "/uploads/%2E%2E/internal/path",
    "uploads/%2e./internal/path",
    "/uploads/.%2E/internal/path",
    "uploads/%2e%2e%2finternal/path",
    "/uploads/%252e%252e%252finternal/path",
    "uploads/%252e%252e/internal/path",
    "/internal/path",
    "images/file.jpg",
    "../file.jpg",
    "javascript:alert(1)",
    "data:image/png;base64,abc",
    "blob:https://example.com/id",
    "ftp://example.com/file.jpg",
    "http://",
  ])("rejects unsafe, traversing, or malformed image URL %p", (url) => {
    expect(resolveImageUrlValue(url, "http://localhost:8080")).toBe("");
  });

  it("shows a local placeholder for empty and failed images", () => {
    const withImage = { ...ad("ACTIVE", 11), title: "Image ad", imageUrl: "/uploads/missing.jpg" };
    const { rerender } = render(<MyAdsList {...baseProps} ads={[ad("ACTIVE", 10)]} loading={false} error="" />);
    expect(screen.getByRole("img", { name: "Зураггүй" })).toBeInTheDocument();
    rerender(<MyAdsList {...baseProps} ads={[withImage]} loading={false} error="" resolveImageUrl={(url) => `http://localhost:8080${url}`} />);
    const image = screen.getByRole("img", { name: "Image ad" });
    expect(image).toHaveAttribute("src", "http://localhost:8080/uploads/missing.jpg");
    fireEvent.error(image);
    expect(screen.getByRole("img", { name: "Зураггүй" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Image ad" })).not.toBeInTheDocument();
  });
});
