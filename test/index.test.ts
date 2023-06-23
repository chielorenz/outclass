import { out } from "../src/index";

describe("Parse", () => {
  test("Empty", () => {
    expect(out.parse()).toBe("");
    expect(out.parse(null)).toBe("");
    expect(out.parse(undefined)).toBe("");
    expect(out.parse("")).toBe("");
    expect(out.parse(" ")).toBe("");
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

  test("Map", () => {
    expect(out.parse({ add: "a" })).toBe("a");
    expect(out.parse({ remove: "a" })).toBe("");
    expect(out.parse({ set: "a" })).toBe("a");
    expect(out.parse({ apply: out.add("a") })).toBe("a");
    expect(out.parse({ apply: [out.add("a"), out.remove("a")] })).toBe("");
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
});

describe("Actions", () => {
  test("Sort", () => {
    expect(out.add("a").add("b").parse()).toBe("a b");
    expect(out.add("b").add("a").parse()).toBe("b a");
  });

  test("Priority", () => {
    expect(out.add("a").remove("a").parse()).toBe("");
    expect(out.remove("a").add("a").parse()).toBe("a");
    expect(out.add("a").set("b").parse()).toBe("b");
    expect(out.set("a").set("b").parse()).toBe("b");
    expect(out.remove("a").set("a").parse()).toBe("a");
  });
});

describe("Immutability", () => {
  test("Parse", () => {
    out.parse("a");
    expect(out.parse()).toBe("");
  });

  test("Actions", () => {
    out.add("a").remove("b").set("c").apply(out);
    expect(out.parse()).toBe("");
  });

  test("With", () => {
    out.with({ add: "a", remove: "b", set: "c", apply: out });
    expect(out.parse()).toBe("");
  });
});
