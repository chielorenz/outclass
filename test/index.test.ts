import { out } from "../src/index";

describe("The set method", () => {
  test("Handles blank parameters", () => {
    expect(out.set().parse()).toBe("");
    expect(out.set(null).parse()).toBe("");
    expect(out.set(undefined).parse()).toBe("");
    expect(out.set(true).parse()).toBe("");
    expect(out.set(false).parse()).toBe("");
    expect(out.set("").parse()).toBe("");
    expect(out.set([]).parse()).toBe("");
    expect(out.set(null, undefined, true, false, "", []).parse()).toBe("");
    expect(out.set([, null, undefined, true, false, "", []]).parse()).toBe("");
  });

  test("Handles strings", () => {
    expect(out.set("a").parse()).toBe("a");
    expect(out.set("a", "b").parse()).toBe("a b");
    expect(out.set(["a"]).parse()).toBe("a");
  });

  test("Is idempotent", () => {
    expect(out.set("a").parse()).toBe("a");
    expect(out.set("a a").parse()).toBe("a");
    expect(out.set("a", "a").parse()).toBe("a");
    expect(out.set(["a", "a"]).parse()).toBe("a");
    expect(out.set("a").set("a").parse()).toBe("a");
  });

  test("Trims white spaces", () => {
    expect(out.set("  a  b  ").parse()).toBe("a b");
  });

  test("Replaces the list of classes", () => {
    expect(out.set("a").set("b").parse()).toBe("b");
  });
});

describe("The add method", () => {
  test("Handles blank parameters", () => {
    expect(out.add().parse()).toBe("");
    expect(out.add(null).parse()).toBe("");
    expect(out.add(undefined).parse()).toBe("");
    expect(out.add(true).parse()).toBe("");
    expect(out.add(false).parse()).toBe("");
    expect(out.add("").parse()).toBe("");
    expect(out.add([]).parse()).toBe("");
    expect(out.add(null, undefined, true, false, "", []).parse()).toBe("");
    expect(out.add([, null, undefined, true, false, "", []]).parse()).toBe("");
  });

  test("Handles strings", () => {
    expect(out.add("a").parse()).toBe("a");
    expect(out.add("a", "b").parse()).toBe("a b");
    expect(out.add(["a"]).parse()).toBe("a");
  });

  test("Is idempotent", () => {
    expect(out.add("a").parse()).toBe("a");
    expect(out.add("a a").parse()).toBe("a");
    expect(out.add("a", "a").parse()).toBe("a");
    expect(out.add(["a", "a"]).parse()).toBe("a");
    expect(out.add("a").add("a").parse()).toBe("a");
  });

  test("Trims white spaces", () => {
    expect(out.add("  a  b  ").parse()).toBe("a b");
  });

  test("Adds to the list of classes", () => {
    expect(out.set("a").add("b").parse()).toBe("a b");
  });
});

describe("The remove method", () => {
  test("Handles blank parameters", () => {
    expect(out.remove().parse()).toBe("");
    expect(out.remove(null).parse()).toBe("");
    expect(out.remove(undefined).parse()).toBe("");
    expect(out.remove(true).parse()).toBe("");
    expect(out.remove(false).parse()).toBe("");
    expect(out.remove("").parse()).toBe("");
    expect(out.remove([]).parse()).toBe("");
    expect(out.remove(null, undefined, true, false, "", []).parse()).toBe("");
    expect(out.remove([, null, undefined, true, false, "", []]).parse()).toBe(
      "",
    );
  });

  test("Handles strings", () => {
    expect(out.remove("a").parse()).toBe("");
    expect(out.remove("a", "b").parse()).toBe("");
    expect(out.remove(["a"]).parse()).toBe("");
  });

  test("Is idempotent", () => {
    expect(out.set("a").remove("a").parse()).toBe("");
    expect(out.set("a").remove("a a").parse()).toBe("");
    expect(out.set("a").remove("a", "a").parse()).toBe("");
    expect(out.set("a").remove(["a", "a"]).parse()).toBe("");
    expect(out.set("a").remove("a").remove("a").parse()).toBe("");
  });

  test("Trims white spaces", () => {
    expect(out.set("a b").remove("  a  b  ").parse()).toBe("");
  });

  test("Removes from the list of classes", () => {
    expect(out.set("a").remove("a").parse()).toBe("");
    expect(out.set("a b").remove("b").parse()).toBe("a");
  });
});

describe("The apply method", () => {
  test("Handles blank parameters", () => {
    expect(out.apply().parse()).toBe("");
  });

  test("Handles Outclass", () => {
    expect(out.apply(out).parse()).toBe("");
    expect(out.apply([out]).parse()).toBe("");
    expect(out.apply(out, out).parse()).toBe("");
  });

  test("Evaluates applied Outclass", () => {
    expect(out.apply(out.set("a")).parse()).toBe("a");
    expect(out.set("a").apply(out.remove("a")).parse()).toBe("");
  });

  test("Evaluates applied Outclass last", () => {
    expect(out.apply(out.remove("a")).set("a").parse()).toBe("");
  });

  test("Keeps the order of applied Outclass", () => {
    expect(out.apply(out.set("a"), out.set("b")).parse()).toBe("b");
    expect(out.apply(out.set("a")).apply(out.set("b")).parse()).toBe("b");
  });

  test("Evaluates nested applied Outclass", () => {
    const patch = out.apply(out.set("a")).apply(out.remove("a").add("b"));
    expect(out.apply(patch).parse()).toBe("b");
  });
});

describe("The with method", () => {
  test("Handles blank parameters", () => {
    expect(out.with({}).parse()).toBe("");
    expect(out.with({}, {}).parse()).toBe("");
    expect(out.with([{}]).parse()).toBe("");
  });

  test("Keeps actions order", () => {
    expect(out.with({ set: "a b", remove: "b" }).parse()).toBe("a");
    expect(out.with({ remove: "a", set: "a b" }).parse()).toBe("a b");
    expect(out.with({ apply: out.remove("a"), set: "a b" }).parse()).toBe("b");
  });

  describe("Takes a set action that", () => {
    test("Handles blank parameters", () => {
      expect(out.with({ set: null }).parse()).toBe("");
      expect(out.with({ set: undefined }).parse()).toBe("");
      expect(out.with({ set: true }).parse()).toBe("");
      expect(out.with({ set: false }).parse()).toBe("");
      expect(out.with({ set: "" }).parse()).toBe("");
      expect(out.with({ set: [] }).parse()).toBe("");
      expect(
        out.with({ set: [, null, undefined, true, false, "", []] }).parse(),
      ).toBe("");
    });

    test("Handles strings", () => {
      expect(out.with({ set: "a" }).parse()).toBe("a");
      expect(out.with({ set: ["a"] }).parse()).toBe("a");
    });

    test("Is idempotent", () => {
      expect(out.with({ set: "a" }).parse()).toBe("a");
      expect(out.with({ set: "a a" }).parse()).toBe("a");
      expect(out.with({ set: ["a", "a"] }).parse()).toBe("a");
      expect(out.with({ set: "a" }).with({ set: "a" }).parse()).toBe("a");
    });

    test("Trims white spaces", () => {
      expect(out.with({ set: "  a  b  " }).parse()).toBe("a b");
    });

    test("Replaces the list of classes", () => {
      expect(out.set("a").with({ set: "b" }).parse()).toBe("b");
    });
  });

  describe("Takes an add action that", () => {
    test("Handles blank parameters", () => {
      expect(out.with({ add: null }).parse()).toBe("");
      expect(out.with({ add: undefined }).parse()).toBe("");
      expect(out.with({ add: true }).parse()).toBe("");
      expect(out.with({ add: false }).parse()).toBe("");
      expect(out.with({ add: "" }).parse()).toBe("");
      expect(out.with({ add: [] }).parse()).toBe("");
      expect(
        out.with({ add: [, null, undefined, true, false, "", []] }).parse(),
      ).toBe("");
    });

    test("Handles strings", () => {
      expect(out.with({ add: "a" }).parse()).toBe("a");
      expect(out.with({ add: ["a"] }).parse()).toBe("a");
    });

    test("Is idempotent", () => {
      expect(out.with({ add: "a" }).parse()).toBe("a");
      expect(out.with({ add: "a a" }).parse()).toBe("a");
      expect(out.with({ add: ["a", "a"] }).parse()).toBe("a");
      expect(out.with({ add: "a" }).with({ add: "a" }).parse()).toBe("a");
    });

    test("Trims white spaces", () => {
      expect(out.with({ add: "  a  b  " }).parse()).toBe("a b");
    });

    test("Adds to the list of classes", () => {
      expect(out.set("a").with({ add: "b" }).parse()).toBe("a b");
    });
  });

  describe("Takes a remove action that", () => {
    test("Handles blank parameters", () => {
      expect(out.with({ remove: null }).parse()).toBe("");
      expect(out.with({ remove: undefined }).parse()).toBe("");
      expect(out.with({ remove: true }).parse()).toBe("");
      expect(out.with({ remove: false }).parse()).toBe("");
      expect(out.with({ remove: "" }).parse()).toBe("");
      expect(out.with({ remove: [] }).parse()).toBe("");
      expect(
        out.with({ remove: [, null, undefined, true, false, "", []] }).parse(),
      ).toBe("");
    });

    test("Handles strings", () => {
      expect(out.with({ remove: "a" }).parse()).toBe("");
      expect(out.with({ remove: ["a"] }).parse()).toBe("");
    });

    test("Is idempotent", () => {
      expect(out.set("a").with({ remove: "a" }).parse()).toBe("");
      expect(out.set("a").with({ remove: "a a" }).parse()).toBe("");
      expect(
        out
          .set("a")
          .with({ remove: ["a", "a"] })
          .parse(),
      ).toBe("");
      expect(out.set("a").with({ remove: "a" }, { remove: "a" }).parse()).toBe(
        "",
      );
      expect(
        out.set("a").with({ remove: "a" }).with({ remove: "a" }).parse(),
      ).toBe("");
    });

    test("Trims white spaces", () => {
      expect(out.set("a b").with({ remove: "  a  b  " }).parse()).toBe("");
    });

    test("Removes from the list of classes", () => {
      expect(out.set("a").with({ remove: "a" }).parse()).toBe("");
      expect(out.set("a b").with({ remove: "b" }).parse()).toBe("a");
    });
  });

  describe("Takes an apply action that", () => {
    test("Handles Outclass", () => {
      expect(out.with({ apply: out }).parse()).toBe("");
      expect(out.with({ apply: [out] }).parse()).toBe("");
    });

    test("Evaluates applied Outclass", () => {
      expect(out.with({ apply: out.set("a") }).parse()).toBe("a");
      expect(
        out
          .set("a")
          .with({ apply: out.remove("a") })
          .parse(),
      ).toBe("");
    });

    test("Evaluates applied Outclass last", () => {
      expect(
        out
          .with({ apply: out.remove("a") })
          .set("a")
          .parse(),
      ).toBe("");
    });

    test("Keeps the order of applied Outclass", () => {
      expect(out.with({ apply: [out.set("a"), out.set("b")] }).parse()).toBe(
        "b",
      );
      expect(
        out
          .with({ apply: out.set("a") })
          .with({ apply: out.set("b") })
          .parse(),
      ).toBe("b");
    });
  });

  describe("Takes a variant action that", () => {
    test("Handles blank parameters", () => {
      expect(out.with({ variant: {} }).parse()).toBe("");
      expect(out.with({ variant: [{}] }).parse()).toBe("");
    });

    test("Takes Variants", () => {
      expect(out.with({ variant: { a: "a" } }).parse()).toBe("");
      expect(out.with({ variant: [{ a: "a" }, { b: "b" }] }).parse()).toBe("");
    });
  });

  describe("Takes a use action that", () => {
    test("Applies modifiers", () => {
      expect(
        out
          .set("a")
          .with({ use: (v) => v.replace("a", "b") })
          .parse(),
      ).toBe("b");
    });
  });

  describe("Takes a choose action that", () => {
    test("Handles blank parameters", () => {
      expect(out.with({ choose: null }).parse()).toBe("");
      expect(out.with({ choose: undefined }).parse()).toBe("");
      expect(out.with({ choose: true }).parse()).toBe("");
      expect(out.with({ choose: false }).parse()).toBe("");
      expect(out.with({ choose: "" }).parse()).toBe("");
      expect(out.with({ choose: null }).parse()).toBe("");
      expect(
        out.with({ choose: [, null, undefined, true, false, "", []] }).parse(),
      ).toBe("");
    });

    test("Handles strings", () => {
      expect(out.with({ choose: "a" }).parse()).toBe("");
      expect(out.with({ choose: ["a", "b"] }).parse()).toBe("");
    });

    test("Chooses variants", () => {
      expect(out.variant({ a: "a" }).with({ choose: "a" }).parse()).toBe("a");
      expect(
        out.variant({ a: "a", b: "b" }).with({ choose: "a" }).parse(),
      ).toBe("a");
      expect(
        out
          .variant({ a: "a", b: "b" }, { 1: "1", 2: "2" })
          .with({ choose: "a 2" })
          .parse(),
      ).toBe("a 2");
    });

    test("Replaces previous chosen variants", () => {
      expect(
        out.variant({ a: "a", b: "b" }).with({ choose: "a b" }).parse(),
      ).toBe("b");
      expect(
        out
          .variant({ a: "a", b: "b" })
          .with({ choose: ["a", "b"] })
          .parse(),
      ).toBe("b");
      expect(
        out
          .variant({ a: "a", b: "b" })
          .with({ choose: "a" })
          .with({ choose: "b" })
          .parse(),
      ).toBe("b");
    });

    test("Handles compound variants", () => {
      expect(out.variant({ "a b": "a b" }).with({ choose: "a" }).parse()).toBe(
        "",
      );
      expect(out.variant({ "a b": "a b" }).with({ choose: "b" }).parse()).toBe(
        "",
      );
      expect(
        out.variant({ "a b": "a b" }).with({ choose: "a b" }).parse(),
      ).toBe("");
      expect(
        out
          .variant({ a: "a" }, { b: "b", "a b": "ab" })
          .with({ choose: "a b" })
          .parse(),
      ).toBe("a ab");
    });
  });
});

describe("The parse method", () => {
  test("Handles blank parameters", () => {
    expect(out.parse()).toBe("");
    expect(out.parse(null)).toBe("");
    expect(out.parse(undefined)).toBe("");
    expect(out.parse(true)).toBe("");
    expect(out.parse(false)).toBe("");
    expect(out.parse("")).toBe("");
    expect(out.parse([])).toBe("");
    expect(out.parse({})).toBe("");
    expect(out.parse(null, undefined, true, false, "", [], {})).toBe("");
    expect(out.parse([, null, undefined, true, false, "", []], [{}])).toBe("");
  });

  test("Handles array-like objects as Maps", () => {
    expect(out.parse({ add: "a", 0: "b" })).toBe("a");
  });

  test("Handles strings", () => {
    expect(out.parse("a")).toBe("a");
    expect(out.parse("a", "b")).toBe("a b");
    expect(out.parse(["a"])).toBe("a");
  });

  test("Is idempotent", () => {
    expect(out.parse("a")).toBe("a");
    expect(out.parse("a a")).toBe("a");
    expect(out.parse("a", "a")).toBe("a");
    expect(out.parse(["a", "a"])).toBe("a");
  });

  test("Trims white spaces", () => {
    expect(out.parse("  a  b  ")).toBe("a b");
  });

  describe("Handles Maps", () => {
    test("Keeps actions order", () => {
      expect(out.parse({ set: "a", remove: "a" })).toBe("");
      expect(out.parse({ remove: "a", set: "a" })).toBe("a");
      expect(out.parse({ apply: [out.set("a"), out.remove("a")] })).toBe("");
      expect(out.parse({ apply: [out.remove("a"), out.set("a")] })).toBe("a");
    });

    describe("Takes a set action that", () => {
      test("Handles blank parameters", () => {
        expect(out.parse({ set: null })).toBe("");
        expect(out.parse({ set: undefined })).toBe("");
        expect(out.parse({ set: true })).toBe("");
        expect(out.parse({ set: false })).toBe("");
        expect(out.parse({ set: "" })).toBe("");
        expect(out.parse({ set: [] })).toBe("");
        expect(
          out.parse({ set: [, null, undefined, true, false, "", []] }),
        ).toBe("");
      });

      test("Handles strings", () => {
        expect(out.parse({ set: "a" })).toBe("a");
        expect(out.parse({ set: ["a"] })).toBe("a");
      });

      test("Is idempotent", () => {
        expect(out.parse({ set: "a a" })).toBe("a");
        expect(out.parse({ set: ["a", "a"] })).toBe("a");
      });

      test("Trims white spaces", () => {
        expect(out.parse({ set: "  a  b  " })).toBe("a b");
      });
    });

    describe("Takes an add action that", () => {
      test("Handles blank parameters", () => {
        expect(out.parse({ add: null })).toBe("");
        expect(out.parse({ add: undefined })).toBe("");
        expect(out.parse({ add: true })).toBe("");
        expect(out.parse({ add: false })).toBe("");
        expect(out.parse({ add: "" })).toBe("");
        expect(out.parse({ add: [] })).toBe("");
        expect(
          out.parse({ add: [, null, undefined, true, false, "", []] }),
        ).toBe("");
      });

      test("Handles strings", () => {
        expect(out.parse({ add: "a" })).toBe("a");
        expect(out.parse({ add: ["a"] })).toBe("a");
      });

      test("Is idempotent", () => {
        expect(out.parse({ add: "a a" })).toBe("a");
        expect(out.parse({ add: ["a", "a"] })).toBe("a");
      });

      test("Trims strings", () => {
        expect(out.parse({ add: "  a  b  " })).toBe("a b");
      });
    });

    describe("Takes a remove action that", () => {
      test("Handles blank parameters", () => {
        expect(out.parse({ remove: null })).toBe("");
        expect(out.parse({ remove: undefined })).toBe("");
        expect(out.parse({ remove: true })).toBe("");
        expect(out.parse({ remove: false })).toBe("");
        expect(out.parse({ remove: "" })).toBe("");
        expect(out.parse({ remove: [] })).toBe("");
        expect(
          out.parse({ remove: [, null, undefined, true, false, "", []] }),
        ).toBe("");
      });

      test("Handles strings", () => {
        expect(out.parse({ remove: "a" })).toBe("");
        expect(out.parse({ remove: ["a"] })).toBe("");
        expect(out.set("a b").parse({ remove: "a" })).toBe("b");
      });

      test("Is idempotent", () => {
        expect(out.set("a b").parse({ remove: "a" })).toBe("b");
        expect(out.set("a b").parse({ remove: "a a" })).toBe("b");
        expect(out.set("a b").parse({ remove: ["a", "a"] })).toBe("b");
      });

      test("Trims strings", () => {
        expect(out.set("a b").parse({ remove: "  a  b  " })).toBe("");
      });
    });

    describe("Takes an apply action that", () => {
      test("Handles Outclass", () => {
        expect(out.parse({ apply: out })).toBe("");
        expect(out.parse({ apply: [out] })).toBe("");
      });

      test("Evaluates applied Outclass", () => {
        expect(out.parse({ apply: out.set("a") })).toBe("a");
        expect(out.set("a").parse({ apply: out.remove("a") })).toBe("");
      });

      test("Evaluates applied Outclass last", () => {
        expect(out.parse({ apply: out.remove("a"), set: "a" })).toBe("");
      });

      test("Keeps the order of applied Outclass", () => {
        expect(out.parse({ apply: [out.set("a"), out.set("b")] })).toBe("b");
      });
    });

    describe("Takes a variant action that", () => {
      test("Handles blank parameters", () => {
        expect(out.parse({ variant: {} })).toBe("");
        expect(out.parse({ variant: [{}] })).toBe("");
      });

      test("Takes Variants", () => {
        expect(out.parse({ variant: { a: "a" } })).toBe("");
        expect(out.parse({ variant: [{ a: "a" }, { b: "b" }] })).toBe("");
      });
    });

    describe("Takes a use action that", () => {
      test("Applies modifiers", () => {
        expect(out.set("a").parse({ use: (v) => v.replace("a", "b") })).toBe(
          "b",
        );
      });
    });

    describe("Takes a choose action that", () => {
      test("Handles blank parameters", () => {
        expect(out.parse({ choose: null })).toBe("");
        expect(out.parse({ choose: undefined })).toBe("");
        expect(out.parse({ choose: true })).toBe("");
        expect(out.parse({ choose: false })).toBe("");
        expect(out.parse({ choose: "" })).toBe("");
        expect(
          out.parse({ choose: [, null, undefined, true, false, "", []] }),
        ).toBe("");
      });

      test("Handles strings", () => {
        expect(out.parse({ choose: "a" })).toBe("");
        expect(out.parse({ choose: ["a", "b"] })).toBe("");
      });

      test("Chooses variants", () => {
        expect(out.variant({ a: "a" }).parse({ choose: "a" })).toBe("a");
        expect(out.variant({ a: "a", b: "b" }).parse({ choose: "a" })).toBe(
          "a",
        );
        expect(
          out
            .variant({ a: "a", b: "b" }, { 1: "1", 2: "2" })
            .parse({ choose: "a 2" }),
        ).toBe("a 2");
      });

      test("Replaces previous chosen variants", () => {
        expect(out.variant({ a: "a", b: "b" }).parse({ choose: "a b" })).toBe(
          "b",
        );
        expect(
          out.variant({ a: "a", b: "b" }).parse({ choose: ["a", "b"] }),
        ).toBe("b");
      });

      test("Handles compound variants", () => {
        expect(out.variant({ "a b": "a b" }).parse({ choose: "a" })).toBe("");
        expect(out.variant({ "a b": "a b" }).parse({ choose: "b" })).toBe("");
        expect(out.variant({ "a b": "a b" }).parse({ choose: "a b" })).toBe("");
        expect(
          out
            .variant({ a: "a" }, { b: "b", "a b": "ab" })
            .parse({ choose: "a b" }),
        ).toBe("a ab");
      });
    });
  });
});

describe("Immutability", () => {
  test("Keeps previous snapshots intact", () => {
    const base = out.add("a");
    const next = base.add("b");

    expect(base.parse()).toBe("a");
    expect(next.parse()).toBe("a b");
  });

  test("Does not leak across sibling branches", () => {
    const base = out.add("x");
    const left = base.add("y");
    const right = base.add("z");

    expect(base.parse()).toBe("x");
    expect(left.parse()).toBe("x y");
    expect(right.parse()).toBe("x z");
  });

  test("Variants are isolated across derived instances", () => {
    const base = out.variant({ a: "a", b: "b" });
    const picked = base.choose("a");

    expect(base.parse()).toBe("");
    expect(picked.parse()).toBe("a");
  });

  test("Patches do not mutate their target", () => {
    const patch = out.remove("a").add("b");
    const target = out.set("a");

    expect(target.apply(patch).parse()).toBe("b");
    expect(target.parse()).toBe("a");
    expect(patch.parse()).toBe("b");
  });
});

describe("Parse caching", () => {
  test("Returns the same string for repeated zero-arg calls", () => {
    const instance = out.add("a").variant({ s: "p-2" }).choose("s");

    expect(instance.parse()).toBe("a p-2");
    expect(instance.parse()).toBe("a p-2");
  });

  test("Does not poison cache with runtime params", () => {
    const instance = out.add("a");

    expect(instance.parse({ add: "b" })).toBe("a b");
    expect(instance.parse()).toBe("a");
    expect(instance.parse("c")).toBe("a c");
    expect(instance.parse()).toBe("a");
  });
});

describe("Whitespace handling", () => {
  test("Splits on tabs, newlines, carriage returns and form feeds", () => {
    expect(out.add("a\tb").parse()).toBe("a b");
    expect(out.add("a\nb").parse()).toBe("a b");
    expect(out.add("a\rb").parse()).toBe("a b");
    expect(out.add("a\fb").parse()).toBe("a b");
    expect(out.add("a\t\n\r\f b").parse()).toBe("a b");
  });

  test("Trims mixed leading and trailing whitespace", () => {
    expect(out.add("\t\n a b \r\f").parse()).toBe("a b");
  });
});

describe("Deeply nested inputs", () => {
  test("Flattens arbitrary nesting in add", () => {
    expect(out.add([[[["a"]]]], [[["b"], "c"]]).parse()).toBe("a b c");
  });

  test("Flattens arbitrary nesting in variant and choose", () => {
    expect(
      out
        .variant([[{ a: "a" }], [[{ b: "b" }]]])
        .choose([["a"], "b"])
        .parse(),
    ).toBe("a b");
  });

  test("Flattens arbitrary nesting in parse params", () => {
    expect(out.parse([[[["a", ["b"]]]]])).toBe("a b");
  });
});

describe("Mixed parse params", () => {
  test("Combines maps and inputs in a single call", () => {
    expect(out.parse({ add: "a" }, "b", { add: "c" })).toBe("a b c");
  });

  test("Keeps order across maps and inputs", () => {
    expect(out.parse("a", { set: "b" }, "c")).toBe("b c");
  });

  test("Handles maps and inputs interleaved with patches", () => {
    expect(out.parse({ set: "a" }, "b", { apply: out.remove("a") })).toBe("b");
  });
});

describe("Variants inside patches", () => {
  test("Patch variants are merged when applied", () => {
    const patch = out.variant({ s: "p-2", l: "p-4" }).choose("s");
    expect(out.apply(patch).parse()).toBe("p-2");
  });

  test("Patch choose overrides outer choose for same variant", () => {
    const base = out.variant({ s: "p-2", l: "p-4" }).choose("l");
    const patch = out.choose("s");
    expect(base.apply(patch).parse()).toBe("p-2");
  });

  test("Compound variants are evaluated after patches merge", () => {
    const base = out.variant({ a: "a" });
    const patch = out.variant({ b: "b", "a b": "ab" }).choose("a b");
    expect(base.apply(patch).parse()).toBe("a ab");
  });
});

describe("The variant method", () => {
  test("Handles blank parameters", () => {
    expect(out.variant().parse()).toBe("");
    expect(out.variant({}).parse()).toBe("");
    expect(out.variant({}, {}).parse()).toBe("");
    expect(out.variant([{}]).parse()).toBe("");
  });

  test("Takes Variants", () => {
    expect(out.variant({ a: "a" }).parse()).toBe("");
    expect(out.variant({ a: "a" }, { b: "b" }).parse()).toBe("");
  });
});

describe("The choose method", () => {
  test("Handles blank parameters", () => {
    expect(out.choose().parse()).toBe("");
    expect(out.choose(null).parse()).toBe("");
    expect(out.choose(undefined).parse()).toBe("");
    expect(out.choose(true).parse()).toBe("");
    expect(out.choose(false).parse()).toBe("");
    expect(out.choose("").parse()).toBe("");
    expect(out.choose([]).parse()).toBe("");
    expect(out.choose([, null, undefined, true, false, "", []]).parse()).toBe(
      "",
    );
  });

  test("Handles strings", () => {
    expect(out.choose("a").parse()).toBe("");
    expect(out.choose(["a"]).parse()).toBe("");
    expect(out.choose("a", "b").parse()).toBe("");
  });

  test("Chooses variants", () => {
    expect(out.variant({ a: "a" }).choose("a").parse()).toBe("a");
    expect(out.variant({ a: "a", b: "b" }).choose("b").parse()).toBe("b");
    expect(
      out.variant({ a: "a", b: "b" }, { 1: "1", 2: "2" }).choose("a 2").parse(),
    ).toBe("a 2");
  });

  test("Replaces previous chosen variants", () => {
    expect(out.variant({ a: "a", b: "b" }).choose("a b").parse()).toBe("b");
    expect(
      out.variant({ a: "a", b: "b" }).choose("a").choose("b").parse(),
    ).toBe("b");
  });

  test("Handles compound variants", () => {
    expect(out.variant({ "a b": "a b" }).choose("a").parse()).toBe("");
    expect(out.variant({ "a b": "a b" }).choose("b").parse()).toBe("");
    expect(out.variant({ "a b": "a b" }).choose("a b").parse()).toBe("");
    expect(
      out.variant({ a: "a" }, { b: "b", "a b": "ab" }).choose("a b").parse(),
    ).toBe("a ab");
  });
});

describe("The use method", () => {
  test("Applies a modifier to the output", () => {
    expect(
      out
        .set("a b")
        .use((v) => v.replace("a", "x"))
        .parse(),
    ).toBe("x b");
  });

  test("Applies multiple modifiers in order", () => {
    expect(
      out
        .set("a b")
        .use((v) => v.replace("a", "x"))
        .use((v) => v.replace(" ", "-"))
        .parse(),
    ).toBe("x-b");
  });

  test("Accepts multiple parameters", () => {
    expect(
      out
        .set("a b")
        .use(
          (v) => v.replace("a", "x"),
          (v) => v.replace(" ", "-"),
        )
        .parse(),
    ).toBe("x-b");
  });

  test("Works with patches", () => {
    const patch = out.use((v) => v.replace("a", "x"));
    expect(out.set("a").apply(patch).parse()).toBe("x");
  });
});
