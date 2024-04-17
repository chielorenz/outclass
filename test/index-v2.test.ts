import { o } from "../src/index-v2";

test("Empty", () => {
  expect(o.pick()).toBe("");
  expect(o.variants([{ a: "a" }]).pick()).toBe("");
});

test("Base", () => {
  expect(o.base("a").pick()).toBe("a");
});

test("Variants", () => {
  expect(o.variants([{ a: "a", b: "b" }]).pick("a")).toBe("a");
  expect(o.variants([{ a: "a", b: "b" }]).pick("b")).toBe("b");

  expect(
    o
      .variants([
        { a: "a", b: "b" },
        { c: "c", d: "d" },
      ])
      .pick("a c")
  ).toBe("a c");

  expect(
    o
      .variants([
        { a: "a", b: "b" },
        { c: "c", d: "d" },
      ])
      .pick("b d")
  ).toBe("b d");
});

test("Defaults", () => {
  expect(
    o
      .variants([{ a: "a", b: "b" }])
      .defaults("a")
      .pick()
  ).toBe("a");

  expect(
    o
      .variants([{ a: "a", b: "b" }])
      .defaults("b")
      .pick()
  ).toBe("b");

  expect(
    o
      .variants([
        { a: "a", b: "b" },
        { c: "c", d: "d" },
      ])
      .defaults("a c")
      .pick()
  ).toBe("a c");

  expect(
    o
      .variants([
        { a: "a", b: "b" },
        { c: "c", d: "d" },
      ])
      .defaults("b d")
      .pick()
  ).toBe("b d");

  expect(
    o
      .variants([
        { "a b": "ab", b: "b" },
        { c: "c", "d a": "da" },
      ])
      .defaults("a c")
      .pick("a b d")
  ).toBe("ab da");

  expect(
    o
      .base("font-bold")
      .variants([
        {
          sm: "py-1 px-2 text-sm rounded-sm",
          md: "py-2 px-4 text-base rounded-md",
          lg: "px-8 py-4 text-lg rounded-lg",
        },
        {
          disabled: "cursor-auto",
        },
        {
          indigo: "bg-indigo-600 text-indigo-50 hover:bg-indigo-500",
          orange: "bg-orange-600 text-orange-50 hover:bg-orange-500",
          "indigo disabled": "bg-indigo-600/50 text-indigo-50",
          "orange disabled": "bg-orange-600/50 text-orange-50",
        },
      ])
      .defaults("md indigo")
      .pick("disabled")
  ).toBe(
    "font-bold py-2 px-4 text-base rounded-md cursor-auto bg-indigo-600/50 text-indigo-50"
  );
});
