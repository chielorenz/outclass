import { s } from "../lib/index.js";

describe("Parser", () => {
  test("Empty", () => {
    expect(s.parse()).toBe("");
    expect(s.parse(null)).toBe("");
    expect(s.parse(undefined)).toBe("");
    expect(s.parse("")).toBe("");
    expect(s.parse([])).toBe("");
    expect(s.parse({})).toBe("");
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

  test("Object", () => {
    expect(s.parse({ a: "a" })).toBe("a");
    expect(s.parse({ a: "a", b: "b" })).toBe("a b");
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

    expect(s.parse({ a: "a", b: "b" })).toBe("a b");
    expect(s.parse({ b: "b", a: "a" })).toBe("b a");
  });

  test("Multiple", () => {
    expect(s.parse("a", "b")).toBe("a b");
    expect(s.parse(["a"], ["b"])).toBe("a b");
    expect(s.parse({ a: "a" }, { b: "b" })).toBe("a b");
  });

  test("Nesting", () => {
    expect(s.parse([["a"]])).toBe("a");
    expect(s.parse([{ a: "a" }])).toBe("a");
    expect(s.parse({ b: { a: "a" } })).toBe("a");
    expect(s.parse({ a: ["a"] })).toBe("a");
  });

  test("Repeated", () => {
    expect(s.parse("a a")).toBe("a");
    expect(s.parse("a", "a")).toBe("a");
  });

  test("Performance", () => {
    const length = 100000;
    const big = Array.from({ length }, () => "a");
    s.parse(big);
    const usedBytes = process.memoryUsage().heapUsed / 1024 / 1024;
    const usedMB = Math.round(usedBytes * 100) / 100;
    expect(usedMB).toBeLessThan(100);
  });
});

describe("Builder", () => {
  test("Creation", () => {
    expect(s.from().parse()).toBe("");
    expect(s.from("a").parse()).toBe("a");
  });

  test("Add and remove", () => {
    expect(s.from().add("a").parse()).toBe("a");
    expect(s.from().add("a").remove("a").parse()).toBe("");
    expect(s.from().add("a").remove("b").parse()).toBe("a");
    expect(s.from().remove("b").parse()).toBe("");
  });

  test("Set and delete", () => {
    expect(s.from().set("1", "a").parse()).toBe("a");
    expect(s.from().set("1", "a").set("2", "b").parse()).toBe("a b");
    expect(s.from().set("1", "a").delete("1").parse()).toBe("");
    expect(s.from().delete("1").parse()).toBe("");
  });
});
