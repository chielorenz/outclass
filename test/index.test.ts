import { out } from "../src/index";

describe("Parser", () => {
  test("Empty", () => {
    expect(out.parse()).toBe("");
    expect(out.parse(null)).toBe("");
    expect(out.parse(undefined)).toBe("");
    expect(out.parse("")).toBe("");
    expect(out.parse([])).toBe("");
    expect(out.parse(true)).toBe("");
    expect(out.parse(false)).toBe("");
  });

  test("String", () => {
    expect(out.parse("a")).toBe("a");
    expect(out.parse("a b")).toBe("a b");
  });

  test("Array", () => {
    expect(out.parse(["a"])).toBe("a");
    expect(out.parse(["a", "b"])).toBe("a b");
  });

  test("Trim", () => {
    expect(out.parse(" a ")).toBe("a");
    expect(out.parse(" a  b ")).toBe("a b");
  });

  test("Sort", () => {
    expect(out.parse("a b")).toBe("a b");
    expect(out.parse("b a")).toBe("b a");

    expect(out.parse(["a", "b"])).toBe("a b");
    expect(out.parse(["b", "a"])).toBe("b a");
  });

  test("Multiple", () => {
    expect(out.parse("a", "b")).toBe("a b");
    expect(out.parse(["a"], ["b"])).toBe("a b");
  });

  test("Nesting", () => {
    expect(out.parse([["a"]])).toBe("a");
    expect(out.parse([["a"], ["b"]])).toBe("a b");
  });

  test("Repeated", () => {
    expect(out.parse("a a")).toBe("a");
    expect(out.parse("a", "a")).toBe("a");
    expect(out.parse("a a", "a a")).toBe("a");
  });

  test("Performance", () => {
    const length = 100000;
    const big = Array.from({ length }, () => "a");
    out.parse(big);
    const usedBytes = process.memoryUsage().heapUsed / 1024 / 1024;
    const usedMB = Math.round(usedBytes * 100) / 100;
    expect(usedMB).toBeLessThan(200);
  });
});

// describe("Slot", () => {
//   test("Test", () => {
//     expect(out.slot.set("a", "a", "b").parse()).toBe("a b");
//   });
// });
