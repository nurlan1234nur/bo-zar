import { describe, expect, it } from "vitest";
import { parseBrowseFilters, serializeBrowseFilters } from "./app-utils";

describe("browse filter URL helpers", () => {
  it("parses supported values and rejects malformed query input", () => {
    expect(parseBrowseFilters("?keyword=%20phone%20&categoryId=3&subcategoryId=4&locationId=5&minPrice=100&maxPrice=900&sort=priceDesc&page=2")).toEqual({ keyword: "phone", categoryId: 3, subcategoryId: 4, locationId: 5, minPrice: "100", maxPrice: "900", sort: "priceDesc", page: 2 });
    expect(parseBrowseFilters("?categoryId=-1&locationId=x&minPrice=-5&sort=unsafe&page=0")).toMatchObject({ categoryId: 0, locationId: 0, minPrice: "", sort: "newest", page: 1 });
  });

  it("serializes only active non-default filters", () => {
    expect(serializeBrowseFilters({ keyword: " phone ", categoryId: 3, subcategoryId: 0, locationId: 5, minPrice: "", maxPrice: "900", sort: "newest", page: 1 })).toBe("keyword=phone&categoryId=3&locationId=5&maxPrice=900");
  });
});
