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
});

describe("Layer", () => {
  test("Empty", () => {
    expect(out.layer.parse()).toBe("");
    expect(out.layer.set().parse()).toBe("");
    expect(out.layer.add().parse()).toBe("");
    expect(out.layer.remove().parse()).toBe("");
  });

  test("Set", () => {
    expect(out.layer.set("a").parse()).toBe("a");
    expect(out.layer.set("a").set("b").parse()).toBe("b");
  });

  test("Add", () => {
    expect(out.layer.add("a").parse()).toBe("a");
    expect(out.layer.add("a").add("a").parse()).toBe("a");
    expect(out.layer.add("a", "b").parse()).toBe("a b");
    expect(out.layer.add("a").add("b").parse()).toBe("a b");
  });

  test("Remove", () => {
    expect(out.layer.remove("a").parse()).toBe("");
    expect(out.layer.set("a").remove("a").parse()).toBe("");
    expect(out.layer.set("a b").remove("a").parse()).toBe("b");
  });

  test("With", () => {
    expect(out.layer.with({ set: "a" }).parse()).toBe("a");
    expect(out.layer.with({ add: "a" }).parse()).toBe("a");
    expect(out.layer.with({ remove: "a" }).parse()).toBe("");

    const map = {
      set: "a",
      add: "b",
      remove: "a",
      patch: out.layer.remove("b").patch,
    };
    expect(out.layer.with(map).parse()).toBe("");

    const patch = out.layer.add("a").patch;
    expect(out.layer.with({ patch }).parse()).toBe("a");

    const patches = [out.layer.add("a").patch, out.layer.add("b").patch];
    expect(out.layer.with({ patch: patches }).parse()).toBe("a b");
  });

  test("Parse", () => {
    expect(out.layer.parse()).toBe("");

    const map = {
      set: "a",
      add: "b",
      remove: "a",
      patch: out.layer.remove("b").patch,
    };
    expect(out.layer.parse(map)).toBe("");
  });
});
