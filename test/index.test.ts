import { oc, VariantsOf } from "../src/index";

describe("add()", () => {
  describe("string inputs", () => {
    test("returns empty string when called with no args", () => {
      expect(oc.add().resolve()).toBe("");
    });

    test("returns a single class", () => {
      expect(oc.add("a").resolve()).toBe("a");
    });

    test("joins multiple string args", () => {
      expect(oc.add("a", "b", "c").resolve()).toBe("a b c");
    });

    test("splits multi-token strings", () => {
      expect(oc.add("a b c").resolve()).toBe("a b c");
    });

    test("allows duplicate tokens", () => {
      expect(oc.add("a", "a").resolve()).toBe("a a");
      expect(oc.add("a a").resolve()).toBe("a a");
      expect(oc.add("a b", "b c").resolve()).toBe("a b b c");
    });

    test("trims leading and trailing whitespace", () => {
      expect(oc.add("  a  b  ").resolve()).toBe("a b");
    });

    test("handles tabs, newlines and other whitespace", () => {
      expect(oc.add("a\tb\nc\r\fd").resolve()).toBe("a b c d");
    });
  });

  describe("falsy values are ignored", () => {
    test("ignores null, undefined, false, true, empty string", () => {
      expect(oc.add(null).resolve()).toBe("");
      expect(oc.add(undefined).resolve()).toBe("");
      expect(oc.add(false).resolve()).toBe("");
      expect(oc.add(true).resolve()).toBe("");
      expect(oc.add("").resolve()).toBe("");
    });

    test("filters falsy values mixed with strings", () => {
      expect(oc.add("a", null, undefined, false, "b").resolve()).toBe("a b");
    });
  });

  describe("composing Outclass instances", () => {
    test("merges another Outclass via add()", () => {
      const child = oc.add("child");
      expect(oc.add("parent", child).resolve()).toBe("parent child");
    });

    test("merges multiple Outclass instances", () => {
      const a = oc.add("a");
      const b = oc.add("b");
      expect(oc.add(a, b).resolve()).toBe("a b");
    });
    test("deeply nested Outclass composition", () => {
      const inner = oc.add("inner");
      const mid = oc.add("mid", inner);
      const outer = oc.add("outer", mid);
      expect(outer.resolve()).toBe("outer mid inner");
    });
  });

  describe("chaining", () => {
    test("chained add() calls accumulate", () => {
      expect(oc.add("a").add("b").add("c").resolve()).toBe("a b c");
    });

    test("chained calls allow duplicates", () => {
      expect(oc.add("a").add("a").resolve()).toBe("a a");
    });
  });
});

describe("variant(name, options)", () => {
  test("without choosing, returns empty when no default", () => {
    expect(oc.variant("size", { sm: "p-2", lg: "p-4" }).resolve()).toBe("");
  });

  test("selects the default option automatically", () => {
    expect(oc.variant("size", { default: "p-3", lg: "p-6" }).resolve()).toBe(
      "p-3",
    );
  });

  test("selects a named option via resolve()", () => {
    const v = oc.variant("size", { sm: "p-2", lg: "p-4" });
    expect(v.resolve({ size: "sm" })).toBe("p-2");
    expect(v.resolve({ size: "lg" })).toBe("p-4");
  });

  test("falls back to default when choice is invalid", () => {
    const v = oc.variant("size", { default: "p-3", sm: "p-2" });
    expect(v.resolve({ size: "xl" as any })).toBe("p-3");
  });

  test("returns empty when choice is invalid and no default", () => {
    const v = oc.variant("size", { sm: "p-2" });
    expect(v.resolve({ size: "xl" as any })).toBe("");
  });

  test("multiple variants stack", () => {
    const v = oc
      .variant("size", { sm: "small", lg: "large" })
      .variant("color", { red: "r", blue: "b" });
    expect(v.resolve({ size: "sm", color: "blue" })).toBe("small b");
  });

  test("combines with add() strings", () => {
    expect(
      oc.add("base").variant("size", { sm: "sm" }).resolve({ size: "sm" }),
    ).toBe("base sm");
  });

  test("variant class is inserted at its position in the chain", () => {
    expect(
      oc.add("a").variant("x", { y: "b" }).add("c").resolve({ x: "y" }),
    ).toBe("a b c");
  });
});

describe("variant(choice, value) — compounds", () => {
  test("adds class when single choice matches", () => {
    const v = oc.variant("size", { sm: "s", lg: "l" });
    const c = v.variant({ size: "sm" }, "extra-small");
    expect(c.resolve({ size: "sm" })).toBe("s extra-small");
  });

  test("adds class when single choice matches and no prior classes exist", () => {
    const c = oc.variant({ size: "sm" } as any, "extra-small");
    expect(c.resolve({ size: "sm" })).toBe("extra-small");
  });

  test("does not add class when choice does not match", () => {
    const v = oc.variant("size", { sm: "s", lg: "l" });
    const c = v.variant({ size: "sm" }, "extra-small");
    expect(c.resolve({ size: "lg" })).toBe("l");
  });

  test("requires all choices to match for multi-key compound", () => {
    const v = oc
      .variant("size", { sm: "s", lg: "l" })
      .variant("color", { red: "r", blue: "b" });
    const c = v.variant({ size: "sm", color: "red" }, "small-red");
    expect(c.resolve({ size: "sm", color: "red" })).toBe("s r small-red");
    expect(c.resolve({ size: "sm", color: "blue" })).toBe("s b");
    expect(c.resolve({ size: "lg", color: "red" })).toBe("l r");
  });

  test("array choice matches any of the listed values", () => {
    const v = oc.variant("size", { sm: "s", md: "m", lg: "l" });
    const c = v.variant({ size: ["sm", "md"] }, "not-large");
    expect(c.resolve({ size: "sm" })).toBe("s not-large");
    expect(c.resolve({ size: "md" })).toBe("m not-large");
    expect(c.resolve({ size: "lg" })).toBe("l");
  });

  test("defaults to 'default' when no choice is provided", () => {
    const v = oc.variant("size", { default: "d", sm: "s" });
    const c = v.variant({ size: "default" }, "is-default");
    expect(c.resolve()).toBe("d is-default");
    expect(c.resolve({ size: "sm" })).toBe("s");
  });

  test("empty choice object behaves like no choice", () => {
    const v = oc.variant("size", { default: "d", sm: "s" });
    const c = v.variant({ size: "default" }, "is-default");
    expect(c.resolve({})).toBe("d is-default");
  });

  test("falsy choice value falls back to default", () => {
    const v = oc.variant("size", { default: "d", sm: "s" });
    const c = v.variant({ size: "default" }, "is-default");
    expect(c.resolve({ size: "" as any })).toBe("d is-default");
  });
});

describe("slot()", () => {
  test("single slot returns a record", () => {
    const res = oc.add(oc.slot("btn").add("btn-class")).resolve();
    expect(res).toEqual({ btn: "btn-class" });
  });

  test("multiple slots return a record with all slot keys", () => {
    const res = oc.add(oc.slot("a").add("x"), oc.slot("b").add("y")).resolve();
    expect(res).toEqual({ a: "x", b: "y" });
  });

  test("unslotted classes go to the 'base' key", () => {
    const res = oc.add("base", oc.slot("btn").add("btn-class")).resolve();
    expect(res).toEqual({ base: "base", btn: "btn-class" });
  });

  test("base key is absent when all classes are slotted", () => {
    const res = oc.add(oc.slot("a").add("x"), oc.slot("b").add("y")).resolve();
    expect(res).not.toHaveProperty("base");
  });

  test("no slots returns plain string", () => {
    const res = oc.add("a").resolve();
    expect(typeof res).toBe("string");
    expect(res).toBe("a");
  });

  test("standalone slot without add() wrapping", () => {
    const res = oc.slot("header").add("p-2").resolve();
    expect(res).toEqual({ header: "p-2" });
  });

  test("slot with no classes produces empty string key", () => {
    const res = oc.add(oc.slot("empty")).resolve();
    expect(res).toEqual({ empty: "" });
  });

  test("same slot name used twice merges classes", () => {
    const res = oc
      .add(oc.slot("a").add("x"), oc.slot("b").add("y"), oc.slot("a").add("z"))
      .resolve();
    expect(res).toEqual({ a: "x z", b: "y" });
  });

  test("same slot allows duplicate tokens", () => {
    const res = oc
      .add(oc.slot("a").add("x"), oc.slot("b").add("y"), oc.slot("a").add("x"))
      .resolve();
    expect(res).toEqual({ a: "x x", b: "y" });
  });

  test("slots propagate through add() composition", () => {
    const inner = oc.slot("btn").add("btn-class");
    const outer = oc.add("wrapper", inner);
    expect(outer.resolve()).toEqual({ base: "wrapper", btn: "btn-class" });
  });

  test("slots from multiple composed instances", () => {
    const a = oc.slot("x").add("x-class");
    const b = oc.slot("y").add("y-class");
    const combined = oc.add(a, b);
    expect(combined.resolve()).toEqual({ x: "x-class", y: "y-class" });
  });
  test("same slot merged through composed children", () => {
    const a = oc.slot("icon").add("w-4");
    const b = oc.slot("icon").add("h-4");
    const combined = oc.add(a, b);
    expect(combined.resolve()).toEqual({ icon: "w-4 h-4" });
  });

  test("does not leak slot scope to sibling inputs in outer add()", () => {
    const inner = oc.slot("alice").add("text-blue");
    const parent = oc.add(inner, "flex");
    expect(parent.resolve()).toEqual({ base: "flex", alice: "text-blue" });
  });

  test("does not leak slot scope when nesting slot definitions", () => {
    const res = oc.add(oc.slot("alice"), "flex").resolve();
    expect(res).toEqual({ base: "flex", alice: "" });
  });
});

describe("transform()", () => {
  test("applies a single modifier", () => {
    expect(
      oc
        .add("hello world")
        .transform((v) => v.toUpperCase())
        .resolve(),
    ).toBe("HELLO WORLD");
  });

  test("applies multiple modifiers in order", () => {
    expect(
      oc
        .add("a b")
        .transform((v) => v.replace("a", "x"))
        .transform((v) => v.replace(" ", "-"))
        .resolve(),
    ).toBe("x-b");
  });

  test("accepts multiple args in a single call", () => {
    expect(
      oc
        .add("a b")
        .transform(
          (v) => v.replace("a", "x"),
          (v) => v.replace(" ", "-"),
        )
        .resolve(),
    ).toBe("x-b");
  });

  test("modifiers apply per slot", () => {
    const res = oc
      .add(oc.slot("a").add("hello"), oc.slot("b").add("world"))
      .transform((v) => v.toUpperCase())
      .resolve();
    expect(res).toEqual({ a: "HELLO", b: "WORLD" });
  });

  test("modifiers are inherited through add() composition", () => {
    const modified = oc.add("a").transform((v) => v.toUpperCase());
    expect(oc.add(modified).resolve()).toBe("A");
  });

  test("transform inside a slot applies only to that slot", () => {
    const res = oc
      .add(
        oc
          .slot("a")
          .add("hello")
          .transform((v) => v.toUpperCase()),
        oc.slot("b").add("world"),
      )
      .resolve();
    expect(res).toEqual({ a: "HELLO", b: "world" });
  });

  test("transform outside slots applies to all slots", () => {
    const res = oc
      .transform((v) => v.toUpperCase())
      .add(oc.slot("a").add("hello"), oc.slot("b").add("world"))
      .resolve();
    expect(res).toEqual({ a: "HELLO", b: "WORLD" });
  });

  test("scoped mods run before global mods", () => {
    const prefix = (v: string) =>
      v
        .split(" ")
        .map((t) => "pfx-" + t)
        .join(" ");
    const res = oc
      .transform((v) => v.toUpperCase())
      .add(
        oc.slot("a").add("hello").transform(prefix),
        oc.slot("b").add("world"),
      )
      .resolve();
    // "a": prefix first → "pfx-hello", then toUpperCase → "PFX-HELLO"
    // "b": no scoped mod, then toUpperCase → "WORLD"
    expect(res).toEqual({ a: "PFX-HELLO", b: "WORLD" });
  });

  test("composed child transform does not leak to parent slots", () => {
    const child = oc
      .slot("icon")
      .add("w-4")
      .transform((v) => v.toUpperCase());
    const parent = oc.add("flex", child);
    expect(parent.resolve()).toEqual({ base: "flex", icon: "W-4" });
  });

  test("multiple transforms on the same slot both apply", () => {
    const res = oc
      .add(
        oc
          .slot("a")
          .add("hello")
          .transform((v) => v.toUpperCase())
          .transform((v) => v + "!"),
      )
      .resolve();
    expect(res).toEqual({ a: "HELLO!" });
  });

  test("slot skips scoped mod if it is already in global mods", () => {
    const mod = (v: string) => v + "!";
    // parent has the mod globally
    const parent = oc.transform(mod);
    // child explicitly adds it to a slot (flattened into parent later)
    const child = oc.slot("a").add("hello").transform(mod);
    const combined = parent.add(child);
    // It should output 'hello!' not 'hello!!'
    expect(combined.resolve()).toEqual({ a: "hello!" });
  });
});

describe("resolve()", () => {
  test("empty outclass returns empty string", () => {
    expect(oc.resolve()).toBe("");
  });

  test("resolve with no matching variants returns empty", () => {
    expect(oc.variant("x", { a: "A" }).resolve()).toBe("");
  });

  test("resolve with default variant returns default", () => {
    expect(oc.variant("x", { default: "D", a: "A" }).resolve()).toBe("D");
  });

  test("resolve with choice selects variant", () => {
    expect(oc.variant("x", { a: "A", b: "B" }).resolve({ x: "a" })).toBe("A");
  });

  test("resolve without slots returns string", () => {
    const result = oc.add("a").resolve();
    expect(typeof result).toBe("string");
  });

  test("resolve with slots returns record", () => {
    const result = oc.add(oc.slot("x").add("a")).resolve();
    expect(typeof result).toBe("object");
    expect(result).toEqual({ x: "a" });
  });
});

describe("immutability", () => {
  test("branching does not mutate the parent", () => {
    const base = oc.add("a");
    const branch = base.add("b");
    expect(base.resolve()).toBe("a");
    expect(branch.resolve()).toBe("a b");
  });

  test("sibling branches are isolated", () => {
    const base = oc.add("x");
    const left = base.add("y");
    const right = base.add("z");
    expect(base.resolve()).toBe("x");
    expect(left.resolve()).toBe("x y");
    expect(right.resolve()).toBe("x z");
  });

  test("variant choices do not affect the base", () => {
    const base = oc.variant("x", { a: "A", b: "B" });
    expect(base.resolve({ x: "a" })).toBe("A");
    expect(base.resolve({ x: "b" })).toBe("B");
    expect(base.resolve()).toBe("");
  });

  test("slots do not leak between branches", () => {
    const base = oc.add("shared");
    const withSlot = base.add(oc.slot("btn").add("btn-class"));
    expect(base.resolve()).toBe("shared");
    expect(withSlot.resolve()).toEqual({
      base: "shared",
      btn: "btn-class",
    });
  });

  test("transform() does not affect the parent", () => {
    const base = oc.add("hello");
    const modified = base.transform((v) => v.toUpperCase());
    expect(base.resolve()).toBe("hello");
    expect(modified.resolve()).toBe("HELLO");
  });
});

describe("composition", () => {
  test("variant defined in child is selectable from parent", () => {
    const child = oc.variant("size", { sm: "small", lg: "large" });
    const parent = oc.add("base", child);
    expect(parent.resolve({ size: "sm" })).toBe("base small");
  });

  test("multiple children with different variants", () => {
    const a = oc.variant("size", { sm: "sm" });
    const b = oc.variant("color", { red: "r" });
    const combined = oc.add(a, b);
    expect(combined.resolve({ size: "sm", color: "red" })).toBe("sm r");
  });

  test("slots and variants composed together", () => {
    const btnClass = oc
      .add("btn")
      .variant("size", { sm: "btn-sm", lg: "btn-lg" });
    const popupClass = oc.add("popup");
    const comp = oc.add(
      oc.slot("btn").add(btnClass),
      oc.slot("popup").add(popupClass),
    );
    expect(comp.resolve({ size: "sm" })).toEqual({
      btn: "btn btn-sm",
      popup: "popup",
    });
  });

  test("compound variant in composed child", () => {
    const child = oc
      .variant("size", { sm: "s", lg: "l" })
      .variant({ size: "sm" }, "tiny");
    const parent = oc.add("base", child);
    expect(parent.resolve({ size: "sm" })).toBe("base s tiny");
    expect(parent.resolve({ size: "lg" })).toBe("base l");
  });

  test("modifier in composed child applies to merged output", () => {
    const child = oc.add("hello").transform((v) => v.toUpperCase());
    const parent = oc.add("world", child);
    // modifier applies to entire joined string after merge
    expect(parent.resolve()).toBe("WORLD HELLO");
  });
});

describe("error handling", () => {
  test("variant() throws on invalid arguments", () => {
    expect(() => (oc as any).variant(123, 456)).toThrow();
  });

  test("variant() throws when first arg is string but second is not object", () => {
    expect(() => (oc as any).variant("name", "not-object")).toThrow();
  });

  test("variant() throws when first arg is object but second is not string", () => {
    expect(() => (oc as any).variant({}, {})).toThrow();
  });
});

describe("edge cases", () => {
  test("empty chain returns empty string", () => {
    expect(oc.resolve()).toBe("");
    expect(oc.add().resolve()).toBe("");
    expect(oc.add("").resolve()).toBe("");
  });

  test("only whitespace returns empty", () => {
    expect(oc.add("   ").resolve()).toBe("");
    expect(oc.add("\t\n").resolve()).toBe("");
  });

  test("add() ignores non-string non-Outclass values", () => {
    expect(oc.add(42, {}, "a").resolve()).toBe("a");
  });

  test("deeply chained tree flattens correctly", () => {
    let chain = oc.add("root");
    for (let i = 0; i < 20; i++) {
      chain = chain.add(`c${i}`);
    }
    const result = chain.resolve();
    expect(result).toContain("root");
    expect(result).toContain("c0");
    expect(result).toContain("c19");
  });

  test("variant with empty options object", () => {
    expect(oc.variant("x", {}).resolve()).toBe("");
  });

  test("transform() with no modifiers is a no-op", () => {
    expect(oc.add("a").transform().resolve()).toBe("a");
  });

  test("multiple resolve calls return consistent results", () => {
    const instance = oc.add("a").variant("x", { b: "B" });
    expect(instance.resolve({ x: "b" })).toBe("a B");
    expect(instance.resolve({ x: "b" })).toBe("a B");
    expect(instance.resolve()).toBe("a");
  });
});

describe("resolve types", () => {
  type AssertEqual<T, U> = [T] extends [U]
    ? [U] extends [T]
      ? true
      : false
    : false;

  test("VariantsOf extracts variant types", () => {
    const withVariants = oc.variant("color", {
      red: "text-red",
      blue: "text-blue",
    });
    type Extracted = VariantsOf<typeof withVariants>;
    const _check: AssertEqual<Extracted, { color?: "red" | "blue" }> = true;
    void _check;
    expect(withVariants.resolve({ color: "red" })).toBe("text-red");
  });

  test("without slots returns string", () => {
    const result: string = oc.add("a").resolve();
    expect(result).toBe("a");
  });

  test("with only slotted classes returns Record<S, string>", () => {
    const result: Record<"btn", string> = oc
      .add(oc.slot("btn").add("a"))
      .resolve();
    expect(result).toEqual({ btn: "a" });
  });

  test("with slots and base returns Record<S | 'base', string>", () => {
    const result: Record<"btn" | "base", string> = oc
      .add("base-class")
      .slot("btn")
      .add("btn-class")
      .resolve();
    expect(result).toEqual({ base: "base-class", btn: "btn-class" });
  });
});

describe("integration — README composability example", () => {
  test("produces the documented output", () => {
    const prefixer = (v: string) =>
      v
        .split(" ")
        .map((t) => "tw-" + t)
        .join(" ");
    const prefixedOc = oc.transform(prefixer);

    const surface = prefixedOc.add("order border-slate-200");
    const titleSlot = prefixedOc.slot("title");
    const spacingVariant = prefixedOc.variant("spacing", {
      compact: "p-4",
      relaxed: "p-8",
    });
    const toneVariant = prefixedOc.variant("tone", {
      default: "text-slate-900",
      muted: "text-slate-500",
    });
    const makeImportant = prefixedOc.transform((v: string) =>
      v
        .split(" ")
        .map((t) => t + "!")
        .join(" "),
    );

    const card = prefixedOc.add(
      "flex flex-col",
      surface,
      titleSlot.add(spacingVariant, makeImportant),
      prefixedOc.slot("body").add("text-sm", spacingVariant, toneVariant),
    );

    const interactiveCard = card.add(
      "hover:shadow-lg",
      titleSlot.add("hover:text-blue-600"),
    );

    const result = interactiveCard.resolve({
      spacing: "relaxed",
      tone: "default",
    });

    expect(result).toEqual({
      base: "tw-flex tw-flex-col tw-order tw-border-slate-200 tw-hover:shadow-lg",
      title: "tw-p-8! tw-hover:text-blue-600!",
      body: "tw-text-sm tw-p-8 tw-text-slate-900",
    });
  });
});
