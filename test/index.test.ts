import out from "../src/index";

describe("Parse", () => {
  test("Empty", () => {
    expect(out.parse()).toBe("");
    expect(out.parse(null)).toBe("");
    expect(out.parse(undefined)).toBe("");
    expect(out.parse("")).toBe("");
    expect(out.parse(" ")).toBe("");
    expect(out.parse([])).toBe("");
    expect(out.parse([[]])).toBe("");
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
    expect(
      out.parse({ set: "a", add: "b z", remove: "z", apply: out.add("c") })
    ).toBe("a b c");
    expect(out.parse({ add: "a" }, { add: "b" })).toBe("a b");
  });

  test("Trim", () => {
    expect(out.parse(" a ")).toBe("a");
    expect(out.parse(" a  b ")).toBe("a b");
    expect(out.parse(" a  b ", " c d ")).toBe("a b c d");
  });

  test("Sort", () => {
    expect(out.parse("a b")).toBe("a b");
    expect(out.parse("b a")).toBe("b a");

    expect(out.parse(["a", "b"])).toBe("a b");
    expect(out.parse(["b", "a"])).toBe("b a");
  });

  test("Multiple items", () => {
    expect(out.parse("a", "b")).toBe("a b");
    expect(out.parse(["a"], ["b"])).toBe("a b");
  });

  test("Nesting", () => {
    expect(out.parse([["a"]])).toBe("a");
    expect(out.parse([["a"], ["b"]])).toBe("a b");
  });

  test("Repeated items", () => {
    expect(out.parse("a a")).toBe("a");
    expect(out.parse("a", "a")).toBe("a");
    expect(out.parse("a a", "a a")).toBe("a");
  });
});

describe("Actions", () => {
  test("Priority", () => {
    expect(out.add("a").add("b").parse()).toBe("a b");
    expect(out.add("a").remove("a").parse()).toBe("");
    expect(out.add("a").set("b").parse()).toBe("b");
    expect(out.add("a").apply(out.add("b")).parse()).toBe("a b");

    expect(out.remove("a").remove("b").parse()).toBe("");
    expect(out.remove("a").add("b").parse()).toBe("b");
    expect(out.remove("a").set("b").parse()).toBe("b");
    expect(out.remove("a").apply(out.add("a")).parse()).toBe("a");

    expect(out.set("a").set("b").parse()).toBe("b");
    expect(out.add("a").set("b").parse()).toBe("b");
    expect(out.remove("a").set("b").parse()).toBe("b");
    expect(out.apply(out.add("a")).set("b").parse()).toBe("b a");

    expect(out.apply(out.add("a")).apply(out.add("b")).parse()).toBe("a b");
    expect(out.apply(out.add("a")).add("b").parse()).toBe("b a");
    expect(out.apply(out.add("a")).remove("b").parse()).toBe("a");
    expect(out.apply(out.add("a")).set("b").parse()).toBe("b a");
  });
});

describe("Immutability", () => {
  test("Actions", () => {
    out.add("a").remove("b").set("c").apply(out);
    expect(out.parse()).toBe("");
  });

  test("Parse", () => {
    out.parse("a");
    expect(out.parse()).toBe("");
  });

  test("With", () => {
    out.with({ add: "a", remove: "b", set: "c", apply: out });
    expect(out.parse()).toBe("");
  });
});
