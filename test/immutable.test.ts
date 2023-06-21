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
        .with({ add: "c", patch: out.add("d").patch({ add: "e" }) })
        .apply(out.add("er br").patch(), out.remove("er").patch())
        .parse({ remove: "a" })
    ).toBe("flex c d e br");

    expect(out.parse({ add: "a" })).toBe("a");
    expect(
      out.parse({
        patch: out.patch({ add: "a", patch: out.patch({ add: "b" }) }),
      })
    ).toBe("a b");

    expect(out.parse({ set: "b", patch: out.patch({ add: "a" }) })).toBe("b a");
  });
});
