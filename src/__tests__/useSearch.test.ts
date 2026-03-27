import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useSearch } from "../useSearch";
import type { Service } from "../types";

const services: Service[] = [
  { id: "pg", name: "PostgreSQL", tags: ["db", "production"] },
  { id: "redis", name: "Redis", tags: ["db", "cache"] },
  { id: "nginx", name: "Nginx", tags: ["web", "proxy"] },
];

describe("useSearch", () => {
  it("returns null for empty query", () => {
    const { result } = renderHook(() => useSearch(services, ""));
    expect(result.current).toBeNull();
  });

  it("finds by name", () => {
    const { result } = renderHook(() => useSearch(services, "redis"));
    expect(result.current).not.toBeNull();
    expect(result.current![0]!.service.id).toBe("redis");
  });

  it("finds by tag", () => {
    const { result } = renderHook(() => useSearch(services, "[cache]"));
    expect(result.current).not.toBeNull();
    expect(result.current![0]!.service.id).toBe("redis");
  });

  it("returns results for partial match", () => {
    const { result } = renderHook(() => useSearch(services, "post"));
    expect(result.current).not.toBeNull();
    expect(result.current!.length).toBeGreaterThan(0);
  });
});
