import { out } from "../src/immutable";

describe("Immutable", () => {
  test("Parse", () => {
    const style = out.add("hello");
    expect(style.parse()).toBe("hello");

    expect(out.add(null).parse()).toBe("");
    expect(out.parse()).toBe("");
    expect(out.add("a").parse()).toBe("a");
    expect(out.remove("a").parse()).toBe("");
    expect(out.set("a").parse()).toBe("a");
    expect(out.set("a").add("b").parse()).toBe("a b");
    expect(out.set("a").set("b").parse()).toBe("b");
    expect(out.set("a").remove("a").parse()).toBe("");

    expect(out.with({ set: "a" }).parse()).toBe("a");
    expect(out.with({ add: "a" }).parse()).toBe("a");
    expect(out.with({ add: "a", remove: "a" }).parse()).toBe("");
    expect(out.with({ add: "a", set: "b" }).parse()).toBe("b");
    expect(out.with({ add: "a", set: "b", remove: "b" }).parse()).toBe("");

    expect(
      out
        .add("a b", ["flex"])
        .remove("b")
        .with({ add: "c", apply: out.add("d", "e") })
        .apply(out.add("er br"), out.remove("er"))
        .parse({ remove: "a" })
    ).toBe("flex c d e br");

    expect(out.parse({ add: "a" })).toBe("a");
    expect(
      out.parse({
        apply: out.with({ add: "a", apply: out.with({ add: "b" }) }),
      })
    ).toBe("a b");

    expect(out.parse({ set: "b", apply: out.with({ add: "a" }) })).toBe("b a");

    expect(
      out
        .apply(out.add("a"))
        .add("b")
        .with({ add: "c" })
        .parse({ apply: out.add("d") })
    ).toBe("b c a d");
  });
});
