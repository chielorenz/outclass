import { s } from "../lib/index.js";

test("Empty", () => {
  expect(s.parse()).toBe("");
  expect(s.parse(null)).toBe("");
  expect(s.parse(undefined)).toBe("");
  expect(s.parse("")).toBe("");
  expect(s.parse([])).toBe("");
  expect(s.parse({})).toBe("");
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

test("Cascading", () => {
  expect(s.parse("a b a")).toBe("b a");
  expect(s.parse("a b c b a")).toBe("c b a");
  expect(s.parse([["a"]], "b a")).toBe("b a");
  expect(s.parse({ b: { a: "a" } }, "b a")).toBe("b a");
});

test("Performance", () => {
  const length = 100000;
  const big = Array.from({ length }, () => "a");
  s.parse(big);
  const usedBytes = process.memoryUsage().heapUsed / 1024 / 1024;
  const usedMB = Math.round(usedBytes * 100) / 100;
  expect(usedMB).toBeLessThan(50);
});

test("Builder", () => {
  expect(s.from().parse()).toBe("");
  expect(s.from("a").parse()).toBe("a");
  expect(s.from("a").add("b").parse()).toBe("a b");
  expect(s.from("a").remove("a").parse()).toBe("");
  expect(s.from("a").remove("b").parse()).toBe("a");
});
