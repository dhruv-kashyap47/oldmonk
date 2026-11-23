import { describe, expect, it } from "vitest";
import {
  canonicalRoutes,
  categoryRoutes,
  findPageRoute,
  homeRoute,
  staticRoutes,
  toolPaths,
  toolRoutes,
  topicRoutes,
} from "./routes";

describe("route manifest", () => {
  it("has one entry per canonical path", () => {
    const paths = canonicalRoutes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths[0]).toBe("/");
  });

  it("uses root-level, lowercase, hyphenated paths with no trailing slash", () => {
    for (const route of canonicalRoutes) {
      expect(route.path.startsWith("/")).toBe(true);
      expect(route.path).toBe(route.path.toLowerCase());
      if (route.path !== "/") {
        expect(route.path.endsWith("/")).toBe(false);
        expect(route.path).toMatch(/^\/[a-z0-9-]+$/);
      }
    }
  });

  it("keeps titles and descriptions inside the build bounds", () => {
    for (const route of canonicalRoutes) {
      expect(route.title.length).toBeLessThanOrEqual(50);
      expect(route.description.length).toBeGreaterThanOrEqual(120);
      expect(route.description.length).toBeLessThanOrEqual(165);
    }
  });

  it("includes the hub, topic, and static pages", () => {
    expect(categoryRoutes).toHaveLength(5);
    expect(topicRoutes.map((route) => route.path)).toContain("/json-tools");
    expect(staticRoutes.map((route) => route.path)).toEqual([
      "/about",
      "/privacy",
      "/terms",
      "/contact",
      "/notices",
    ]);
  });

  it("lists every shipped tool", () => {
    expect(toolRoutes.length).toBe(toolPaths.size);
    expect(toolPaths.has("/json-formatter")).toBe(true);
  });

  it("finds a route by path and returns undefined for a miss", () => {
    expect(findPageRoute("/")?.title).toBe(homeRoute.title);
    expect(findPageRoute("/missing")).toBeUndefined();
  });
});
