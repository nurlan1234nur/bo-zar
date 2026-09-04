import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicAdvertisement } from "@bozar/shared-types";
import { SavedAdsView } from "./SavedAdsView";

const saved: PublicAdvertisement = { adId: 4, title: "Saved ad", description: "Saved description", price: 4500, status: "ACTIVE", categoryId: 1, locationId: 1, locationName: "Ulaanbaatar", sellerName: "Seller", contactPhone: "99112233", imageUrl: "", viewCount: 0, createdAt: "2026-08-01T00:00:00.000Z" };
const base = { loading: false, error: "", resolveImageUrl: (url: string) => url, onBack: vi.fn(), onRetry: vi.fn(), onOpen: vi.fn(), onRemove: vi.fn() };

describe("SavedAdsView", () => {
  it("renders empty and error states", () => {
    const { rerender } = render(<SavedAdsView {...base} ads={[]} />);
    expect(screen.getByText("Хадгалсан зар алга.")).toBeInTheDocument();
    rerender(<SavedAdsView {...base} ads={[]} error="Network error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
  });

  it("opens and removes a saved advertisement", () => {
    const onOpen = vi.fn(); const onRemove = vi.fn();
    render(<SavedAdsView {...base} ads={[saved]} onOpen={onOpen} onRemove={onRemove} />);
    fireEvent.click(screen.getByText("Saved ad"));
    expect(onOpen).toHaveBeenCalledWith(saved);
    fireEvent.click(screen.getByTitle("Хадгалснаас хасах"));
    expect(onRemove).toHaveBeenCalledWith(4);
  });
});
