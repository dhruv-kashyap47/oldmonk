import { describe, expect, it } from "vitest";
import { categories, getCategory } from "./categories";

describe("categories", () => {
  it("has five categories in catalog order", () => {
    expect(categories.map((category) => category.slug)).toEqual([
      "developer",
      "text",
      "random",
      "timer",
      "test",
    ]);
    expect(categories.map((category) => category.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it("uses unique slugs and paths", () => {
    expect(new Set(categories.map((category) => category.slug)).size).toBe(categories.length);
    expect(new Set(categories.map((category) => category.path)).size).toBe(categories.length);
  });

  it("keeps copy inside the metadata bounds", () => {
    for (const category of categories) {
      expect(category.title.length).toBeLessThanOrEqual(50);
      expect(category.description.length).toBeGreaterThanOrEqual(120);
      expect(category.description.length).toBeLessThanOrEqual(165);
      expect(category.intro.trim().length).toBeGreaterThan(0);
      expect(category.name).toMatch(/^[A-Z]/);
    }
  });

  it("looks a category up by slug", () => {
    expect(getCategory("developer")?.path).toBe("/developer-tools");
    expect(getCategory("marketing")).toBeUndefined();
  });
});
