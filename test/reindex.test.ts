import { out } from "../src/reindex";

// ---------------------------------------------------------------------------
// class()
// ---------------------------------------------------------------------------
describe("class()", () => {
  describe("string inputs", () => {
    test("returns empty string when called with no args", () => {
      expect(out.class().parse()).toBe("");
    });

    test("returns a single class", () => {
      expect(out.class("a").parse()).toBe("a");
    });

    test("joins multiple string args", () => {
      expect(out.class("a", "b", "c").parse()).toBe("a b c");
    });

    test("splits multi-token strings", () => {
      expect(out.class("a b c").parse()).toBe("a b c");
    });

    test("deduplicates tokens", () => {
      expect(out.class("a", "a").parse()).toBe("a");
      expect(out.class("a a").parse()).toBe("a");
      expect(out.class("a b", "b c").parse()).toBe("a b c");
    });

    test("trims leading and trailing whitespace", () => {
      expect(out.class("  a  b  ").parse()).toBe("a b");
    });

    test("handles tabs, newlines and other whitespace", () => {
      expect(out.class("a\tb\nc\r\fd").parse()).toBe("a b c d");
    });
  });

  describe("falsy values are ignored", () => {
    test("ignores null, undefined, false, true, empty string", () => {
      expect(out.class(null as any).parse()).toBe("");
      expect(out.class(undefined as any).parse()).toBe("");
      expect(out.class(false as any).parse()).toBe("");
      expect(out.class(true as any).parse()).toBe("");
      expect(out.class("").parse()).toBe("");
    });

    test("filters falsy values mixed with strings", () => {
      expect(
        out
          .class("a", null as any, undefined as any, false as any, "b")
          .parse(),
      ).toBe("a b");
    });
  });

  describe("nested arrays", () => {
    test("flattens one level of nesting", () => {
      expect(out.class(["a", "b"]).parse()).toBe("a b");
    });

    test("flattens deeply nested arrays", () => {
      expect(out.class([[["a"]], [["b", "c"]]]).parse()).toBe("a b c");
    });

    test("handles empty arrays", () => {
      expect(out.class([]).parse()).toBe("");
      expect(out.class([], "a", []).parse()).toBe("a");
    });
  });

  describe("composing Outclass instances", () => {
    test("merges another Outclass via class()", () => {
      const child = out.class("child");
      expect(out.class("parent", child).parse()).toBe("parent child");
    });

    test("merges multiple Outclass instances", () => {
      const a = out.class("a");
      const b = out.class("b");
      expect(out.class(a, b).parse()).toBe("a b");
    });

    test("merges Outclass in nested arrays", () => {
      const child = out.class("child");
      expect(out.class(["parent", child]).parse()).toBe("parent child");
    });

    test("deeply nested Outclass composition", () => {
      const inner = out.class("inner");
      const mid = out.class("mid", inner);
      const outer = out.class("outer", mid);
      expect(outer.parse()).toBe("outer mid inner");
    });
  });

  describe("chaining", () => {
    test("chained class() calls accumulate", () => {
      expect(out.class("a").class("b").class("c").parse()).toBe("a b c");
    });

    test("chained calls still deduplicate", () => {
      expect(out.class("a").class("a").parse()).toBe("a");
    });
  });
});

// ---------------------------------------------------------------------------
// variant(name, options) — named variants
// ---------------------------------------------------------------------------
describe("variant(name, options)", () => {
  test("without choosing, returns empty when no default", () => {
    expect(out.variant("size", { sm: "p-2", lg: "p-4" }).parse()).toBe("");
  });

  test("selects the default option automatically", () => {
    expect(out.variant("size", { default: "p-3", lg: "p-6" }).parse()).toBe(
      "p-3",
    );
  });

  test("selects a named option via parse()", () => {
    const v = out.variant("size", { sm: "p-2", lg: "p-4" });
    expect(v.parse({ size: "sm" })).toBe("p-2");
    expect(v.parse({ size: "lg" })).toBe("p-4");
  });

  test("falls back to default when choice is invalid", () => {
    const v = out.variant("size", { default: "p-3", sm: "p-2" });
    expect(v.parse({ size: "xl" as any })).toBe("p-3");
  });

  test("returns empty when choice is invalid and no default", () => {
    const v = out.variant("size", { sm: "p-2" });
    expect(v.parse({ size: "xl" as any })).toBe("");
  });

  test("multiple variants stack", () => {
    const v = out
      .variant("size", { sm: "small", lg: "large" })
      .variant("color", { red: "r", blue: "b" });
    expect(v.parse({ size: "sm", color: "blue" })).toBe("small b");
  });

  test("combines with class() strings", () => {
    expect(
      out.class("base").variant("size", { sm: "sm" }).parse({ size: "sm" }),
    ).toBe("base sm");
  });

  test("variant class is inserted at its position in the chain", () => {
    expect(
      out.class("a").variant("x", { y: "b" }).class("c").parse({ x: "y" }),
    ).toBe("a b c");
  });
});

// ---------------------------------------------------------------------------
// variant(choice, value) — compound variants
// ---------------------------------------------------------------------------
describe("variant(choice, value) — compounds", () => {
  test("adds class when single choice matches", () => {
    const v = out.variant("size", { sm: "s", lg: "l" });
    const c = v.variant({ size: "sm" } as any, "extra-small");
    expect(c.parse({ size: "sm" })).toBe("s extra-small");
  });

  test("adds class when single choice matches and no prior classes exist", () => {
    const c = out.variant({ size: "sm" } as any, "extra-small");
    expect(c.parse({ size: "sm" })).toBe("extra-small");
  });

  test("does not add class when choice does not match", () => {
    const v = out.variant("size", { sm: "s", lg: "l" });
    const c = v.variant({ size: "sm" } as any, "extra-small");
    expect(c.parse({ size: "lg" })).toBe("l");
  });

  test("requires all choices to match for multi-key compound", () => {
    const v = out
      .variant("size", { sm: "s", lg: "l" })
      .variant("color", { red: "r", blue: "b" });
    const c = v.variant({ size: "sm", color: "red" } as any, "small-red");
    expect(c.parse({ size: "sm", color: "red" })).toBe("s r small-red");
    expect(c.parse({ size: "sm", color: "blue" })).toBe("s b");
    expect(c.parse({ size: "lg", color: "red" })).toBe("l r");
  });

  test("array choice matches any of the listed values", () => {
    const v = out.variant("size", { sm: "s", md: "m", lg: "l" });
    const c = v.variant({ size: ["sm", "md"] } as any, "not-large");
    expect(c.parse({ size: "sm" })).toBe("s not-large");
    expect(c.parse({ size: "md" })).toBe("m not-large");
    expect(c.parse({ size: "lg" })).toBe("l");
  });

  test("defaults to 'default' when no choice is provided", () => {
    const v = out.variant("size", { default: "d", sm: "s" });
    const c = v.variant({ size: "default" } as any, "is-default");
    expect(c.parse()).toBe("d is-default");
    expect(c.parse({ size: "sm" })).toBe("s");
  });
});

// ---------------------------------------------------------------------------
// slot()
// ---------------------------------------------------------------------------
describe("slot()", () => {
  test("single slot returns a record", () => {
    const res = out.class(out.slot("btn").class("btn-class")).parse();
    expect(res).toEqual({ btn: "btn-class" });
  });

  test("multiple slots return a record with all slot keys", () => {
    const res = out.class(out.slot("a").class("x"), out.slot("b").class("y")).parse();
    expect(res).toEqual({ a: "x", b: "y" });
  });

  test("unslotted classes go to the 'default' key", () => {
    const res = out.class("base", out.slot("btn").class("btn-class")).parse();
    expect(res).toEqual({ default: "base", btn: "btn-class" });
  });

  test("default key is absent when all classes are slotted", () => {
    const res = out.class(out.slot("a").class("x"), out.slot("b").class("y")).parse();
    expect(res).not.toHaveProperty("default");
  });

  test("no slots returns plain string", () => {
    const res = out.class("a").parse();
    expect(typeof res).toBe("string");
    expect(res).toBe("a");
  });

  test("slot with no classes produces empty string key", () => {
    const res = out.class(out.slot("empty")).parse();
    expect(res).toEqual({ empty: "" });
  });

  test("same slot name used twice merges classes", () => {
    const res = out
      .class(out.slot("a").class("x"), out.slot("b").class("y"), out.slot("a").class("z"))
      .parse();
    expect(res).toEqual({ a: "x z", b: "y" });
  });

  test("same slot deduplicates tokens", () => {
    const res = out
      .class(out.slot("a").class("x"), out.slot("b").class("y"), out.slot("a").class("x"))
      .parse();
    expect(res).toEqual({ a: "x", b: "y" });
  });

  test("slots propagate through class() composition", () => {
    const inner = out.slot("btn").class("btn-class");
    const outer = out.class("wrapper", inner);
    expect(outer.parse()).toEqual({ default: "wrapper", btn: "btn-class" });
  });

  test("slots from multiple composed instances", () => {
    const a = out.slot("x").class("x-class");
    const b = out.slot("y").class("y-class");
    const combined = out.class(a, b);
    expect(combined.parse()).toEqual({ x: "x-class", y: "y-class" });
  });

  test("slots in nested arrays", () => {
    const res = out.class([out.slot("btn").class("btn-class")]).parse();
    expect(res).toEqual({ btn: "btn-class" });
  });

  test("does not leak slot scope to sibling inputs in outer class()", () => {
    const inner = out.slot("alice").class("text-blue");
    const parent = out.class(inner, "flex");
    expect(parent.parse()).toEqual({ default: "flex", alice: "text-blue" });
  });

  test("does not leak slot scope when nesting slot definitions", () => {
    const res = out.class(out.slot("alice"), "flex").parse();
    expect(res).toEqual({ default: "flex", alice: "" });
  });
});

// ---------------------------------------------------------------------------
// use()
// ---------------------------------------------------------------------------
describe("use()", () => {
  test("applies a single modifier", () => {
    expect(
      out
        .class("hello world")
        .use((v) => v.toUpperCase())
        .parse(),
    ).toBe("HELLO WORLD");
  });

  test("applies multiple modifiers in order", () => {
    expect(
      out
        .class("a b")
        .use((v) => v.replace("a", "x"))
        .use((v) => v.replace(" ", "-"))
        .parse(),
    ).toBe("x-b");
  });

  test("accepts multiple args in a single call", () => {
    expect(
      out
        .class("a b")
        .use(
          (v) => v.replace("a", "x"),
          (v) => v.replace(" ", "-"),
        )
        .parse(),
    ).toBe("x-b");
  });

  test("accepts nested arrays of modifiers", () => {
    expect(
      out
        .class("a")
        .use([(v) => v.toUpperCase()])
        .parse(),
    ).toBe("A");
  });

  test("modifiers apply per slot", () => {
    const res = out
      .class(out.slot("a").class("hello"), out.slot("b").class("world"))
      .use((v) => v.toUpperCase())
      .parse();
    expect(res).toEqual({ a: "HELLO", b: "WORLD" });
  });

  test("modifiers are inherited through class() composition", () => {
    const modified = out.class("a").use((v) => v.toUpperCase());
    expect(out.class(modified).parse()).toBe("A");
  });
});

// ---------------------------------------------------------------------------
// parse()
// ---------------------------------------------------------------------------
describe("parse()", () => {
  test("empty outclass returns empty string", () => {
    expect(out.parse()).toBe("");
  });

  test("parse with no matching variants returns empty", () => {
    expect(out.variant("x", { a: "A" }).parse()).toBe("");
  });

  test("parse with default variant returns default", () => {
    expect(out.variant("x", { default: "D", a: "A" }).parse()).toBe("D");
  });

  test("parse with choice selects variant", () => {
    expect(out.variant("x", { a: "A", b: "B" }).parse({ x: "a" })).toBe("A");
  });

  test("parse without slots returns string", () => {
    const result = out.class("a").parse();
    expect(typeof result).toBe("string");
  });

  test("parse with slots returns record", () => {
    const result = out.class(out.slot("x").class("a")).parse();
    expect(typeof result).toBe("object");
    expect(result).toEqual({ x: "a" });
  });
});

// ---------------------------------------------------------------------------
// Immutability
// ---------------------------------------------------------------------------
describe("immutability", () => {
  test("branching does not mutate the parent", () => {
    const base = out.class("a");
    const branch = base.class("b");
    expect(base.parse()).toBe("a");
    expect(branch.parse()).toBe("a b");
  });

  test("sibling branches are isolated", () => {
    const base = out.class("x");
    const left = base.class("y");
    const right = base.class("z");
    expect(base.parse()).toBe("x");
    expect(left.parse()).toBe("x y");
    expect(right.parse()).toBe("x z");
  });

  test("variant choices do not affect the base", () => {
    const base = out.variant("x", { a: "A", b: "B" });
    expect(base.parse({ x: "a" })).toBe("A");
    expect(base.parse({ x: "b" })).toBe("B");
    expect(base.parse()).toBe("");
  });

  test("slots do not leak between branches", () => {
    const base = out.class("shared");
    const withSlot = base.class(out.slot("btn").class("btn-class"));
    expect(base.parse()).toBe("shared");
    expect(withSlot.parse()).toEqual({
      default: "shared",
      btn: "btn-class",
    });
  });

  test("use() does not affect the parent", () => {
    const base = out.class("hello");
    const modified = base.use((v) => v.toUpperCase());
    expect(base.parse()).toBe("hello");
    expect(modified.parse()).toBe("HELLO");
  });
});

// ---------------------------------------------------------------------------
// Composition — complex scenarios
// ---------------------------------------------------------------------------
describe("composition", () => {
  test("variant defined in child is selectable from parent", () => {
    const child = out.variant("size", { sm: "small", lg: "large" });
    const parent = out.class("base", child);
    expect(parent.parse({ size: "sm" })).toBe("base small");
  });

  test("multiple children with different variants", () => {
    const a = out.variant("size", { sm: "sm" });
    const b = out.variant("color", { red: "r" });
    const combined = out.class(a, b);
    expect(combined.parse({ size: "sm", color: "red" })).toBe("sm r");
  });

  test("slots and variants composed together", () => {
    const btnClass = out
      .class("btn")
      .variant("size", { sm: "btn-sm", lg: "btn-lg" });
    const popupClass = out.class("popup");
    const comp = out.class(
      out.slot("btn").class(btnClass),
      out.slot("popup").class(popupClass),
    );
    expect(comp.parse({ size: "sm" })).toEqual({
      btn: "btn btn-sm",
      popup: "popup",
    });
  });

  test("compound variant in composed child", () => {
    const child = out
      .variant("size", { sm: "s", lg: "l" })
      .variant({ size: "sm" } as any, "tiny");
    const parent = out.class("base", child);
    expect(parent.parse({ size: "sm" })).toBe("base s tiny");
    expect(parent.parse({ size: "lg" })).toBe("base l");
  });

  test("modifier in composed child applies to merged output", () => {
    const child = out.class("hello").use((v) => v.toUpperCase());
    const parent = out.class("world", child);
    // modifier applies to entire joined string after merge
    expect(parent.parse()).toBe("WORLD HELLO");
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
describe("error handling", () => {
  test("variant() throws on invalid arguments", () => {
    expect(() => (out as any).variant(123, 456)).toThrow();
  });

  test("variant() throws when first arg is string but second is not object", () => {
    expect(() => (out as any).variant("name", "not-object")).toThrow();
  });

  test("variant() throws when first arg is object but second is not string", () => {
    expect(() => (out as any).variant({}, {})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("edge cases", () => {
  test("empty chain returns empty string", () => {
    expect(out.parse()).toBe("");
    expect(out.class().parse()).toBe("");
    expect(out.class("").parse()).toBe("");
  });

  test("only whitespace returns empty", () => {
    expect(out.class("   ").parse()).toBe("");
    expect(out.class("\t\n").parse()).toBe("");
  });

  test("class() ignores non-string non-Outclass values", () => {
    expect(out.class(42 as any, {} as any, "a").parse()).toBe("a");
  });

  test("deeply chained tree flattens correctly", () => {
    let chain = out.class("root");
    for (let i = 0; i < 20; i++) {
      chain = chain.class(`c${i}`);
    }
    const result = chain.parse();
    expect(result).toContain("root");
    expect(result).toContain("c0");
    expect(result).toContain("c19");
  });

  test("variant with empty options object", () => {
    expect(out.variant("x", {}).parse()).toBe("");
  });

  test("use() with no modifiers is a no-op", () => {
    expect(out.class("a").use().parse()).toBe("a");
  });

  test("multiple parse calls return consistent results", () => {
    const instance = out.class("a").variant("x", { b: "B" });
    expect(instance.parse({ x: "b" })).toBe("a B");
    expect(instance.parse({ x: "b" })).toBe("a B");
    expect(instance.parse()).toBe("a");
    expect(instance.parse()).toBe("a");
  });
});
