import { st } from "../lib/index.js";

test("Empty", () => {
  expect(st()).toBe("");
  expect(st(null)).toBe("");
  expect(st(undefined)).toBe("");
  expect(st("")).toBe("");
  expect(st([])).toBe("");
  expect(st({})).toBe("");
});

test("String", () => {
  expect(st("a")).toBe("a");
  expect(st("a b")).toBe("a b");
});

test("Array", () => {
  expect(st(["a"])).toBe("a");
  expect(st(["a", "b"])).toBe("a b");
});

test("Object", () => {
  expect(st({ a: "a" })).toBe("a");
  expect(st({ a: "a", b: "b" })).toBe("a b");
});

test("Trim", () => {
  expect(st(" a ")).toBe("a");
  expect(st(" a  b ")).toBe("a b");
});

test("Sort", () => {
  expect(st("a b")).toBe("a b");
  expect(st("b a")).toBe("b a");

  expect(st(["a", "b"])).toBe("a b");
  expect(st(["b", "a"])).toBe("b a");

  expect(st({ a: "a", b: "b" })).toBe("a b");
  expect(st({ b: "b", a: "a" })).toBe("b a");
});

test("Multiple", () => {
  expect(st("a", "b")).toBe("a b");
  expect(st(["a"], ["b"])).toBe("a b");
  expect(st({ a: "a" }, { b: "b" })).toBe("a b");
});

test("Nesting", () => {
  expect(st([["a"]])).toBe("a");
  expect(st([{ a: "a" }])).toBe("a");
  expect(st({ b: { a: "a" } })).toBe("a");
  expect(st({ a: ["a"] })).toBe("a");
});

test("Cascading", () => {
  expect(st("a b a")).toBe("b a");
  expect(st("a b c b a")).toBe("c b a");
  expect(st([["a"]], "b a")).toBe("b a");
  expect(st({ b: { a: "a" } }, "b a")).toBe("b a");
});

test("Performance", () => {
  const length = 100000;
  const big = Array.from({ length }, () => "a");
  expect(st(big)).toBe("a");

  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`${length} items used ${Math.round(used * 100) / 100} MB`);
});
