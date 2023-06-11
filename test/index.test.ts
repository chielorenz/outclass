import { s } from "../src/index";

describe("Parser", () => {
  test("Empty", () => {
    expect(s.parse()).toBe("");
    expect(s.parse(null)).toBe("");
    expect(s.parse(undefined)).toBe("");
    expect(s.parse("")).toBe("");
    expect(s.parse([])).toBe("");
    expect(s.parse(true)).toBe("");
    expect(s.parse(false)).toBe("");
  });

  test("String", () => {
    expect(s.parse("a")).toBe("a");
    expect(s.parse("a b")).toBe("a b");
  });

  test("Array", () => {
    expect(s.parse(["a"])).toBe("a");
    expect(s.parse(["a", "b"])).toBe("a b");
  });

  test("Trim", () => {
    expect(s.parse(" a ")).toBe("a");
    expect(s.parse(" a  b ")).toBe("a b");
  });

  test("Sort", () => {
    expect(s.parse("a b")).toBe("a b");
    expect(s.parse("b a")).toBe("b a");

    expect(s.parse(["a", "b"])).toBe("a b");
    expect(s.parse(["b", "a"])).toBe("b a");
  });

  test("Multiple", () => {
    expect(s.parse("a", "b")).toBe("a b");
    expect(s.parse(["a"], ["b"])).toBe("a b");
  });

  test("Nesting", () => {
    expect(s.parse([["a"]])).toBe("a");
    expect(s.parse([["a"], ["b"]])).toBe("a b");
  });

  test("Repeated", () => {
    expect(s.parse("a a")).toBe("a");
    expect(s.parse("a", "a")).toBe("a");
    expect(s.parse("a a", "a a")).toBe("a");
  });

  test("Performance", () => {
    const length = 100000;
    const big = Array.from({ length }, () => "a");
    s.parse(big);
    const usedBytes = process.memoryUsage().heapUsed / 1024 / 1024;
    const usedMB = Math.round(usedBytes * 100) / 100;
    expect(usedMB).toBeLessThan(200);
  });
});
