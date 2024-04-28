import { out } from "../src/index";

test("The parse method", () => {
  expect(out.parse()).toBe("");
  expect(out.parse(null)).toBe("");
  expect(out.parse(undefined)).toBe("");
  expect(out.parse(true)).toBe("");
  expect(out.parse(false)).toBe("");
  expect(out.parse("")).toBe("");
  expect(out.parse([])).toBe("");
  expect(out.parse(null, undefined, true, false, "", [])).toBe("");
  expect(out.parse([, null, undefined, true, false, "", []])).toBe("");
  expect(out.parse("a")).toBe("a");
  expect(out.parse(["a"])).toBe("a");
  expect(out.parse("a", "b")).toBe("a b");
  expect(out.parse("a a")).toBe("a");
  expect(out.parse("a", "a")).toBe("a");
  expect(out.parse(["a", "a"])).toBe("a");
  expect(out.parse({})).toBe("");
  expect(out.parse({ set: null })).toBe("");
  expect(out.parse({ set: undefined })).toBe("");
  expect(out.parse({ set: true })).toBe("");
  expect(out.parse({ set: false })).toBe("");
  expect(out.parse({ set: "" })).toBe("");
  expect(out.parse({ set: [] })).toBe("");
  expect(out.parse({ set: [, null, undefined, true, false, "", []] })).toBe("");
  expect(out.parse({ set: "a" })).toBe("a");
  expect(out.parse({ set: ["a"] })).toBe("a");
  expect(out.parse({ add: null })).toBe("");
  expect(out.parse({ add: undefined })).toBe("");
  expect(out.parse({ add: true })).toBe("");
  expect(out.parse({ add: false })).toBe("");
  expect(out.parse({ add: "" })).toBe("");
  expect(out.parse({ add: [] })).toBe("");
  expect(out.parse({ add: [, null, undefined, true, false, "", []] })).toBe("");
  expect(out.parse({ add: "a" })).toBe("a");
  expect(out.parse({ add: ["a"] })).toBe("a");
  expect(out.parse({ remove: null })).toBe("");
  expect(out.parse({ remove: undefined })).toBe("");
  expect(out.parse({ remove: true })).toBe("");
  expect(out.parse({ remove: false })).toBe("");
  expect(out.parse({ remove: "" })).toBe("");
  expect(out.parse({ remove: [] })).toBe("");
  expect(out.parse({ remove: [, null, undefined, true, false, "", []] })).toBe(
    ""
  );
  expect(out.parse({ remove: "a" })).toBe("");
  expect(out.parse({ remove: ["a"] })).toBe("");
  expect(out.set("a b").parse({ remove: "b" })).toBe("a");
  expect(out.parse({ apply: out })).toBe("");
  expect(out.parse({ apply: [out] })).toBe("");
  expect(out.parse({ apply: out.set("a") })).toBe("a");
  expect(out.set("a").parse({ apply: out.set("b") })).toBe("b");
  expect(out.parse({ add: "a b", remove: "b" })).toBe("a");
  expect(out.parse({ remove: "a", add: "a b" })).toBe("a b");
  expect(out.parse({ apply: out.remove("a"), add: "a b" })).toBe("b");
  expect(out.parse({ apply: [out.add("a b"), out.remove("b")] })).toBe("a");
  // expect(out.parse({ variant: "" })).toBe("");
  // expect(out.parse({ choose: "" })).toBe("");
});

test("The set method", () => {
  expect(out.set().parse()).toBe("");
  expect(out.set(null).parse()).toBe("");
  expect(out.set(undefined).parse()).toBe("");
  expect(out.set(true).parse()).toBe("");
  expect(out.set(false).parse()).toBe("");
  expect(out.set("").parse()).toBe("");
  expect(out.set([]).parse()).toBe("");
  expect(out.set(null, undefined, true, false, "", []).parse()).toBe("");
  expect(out.set([, null, undefined, true, false, "", []]).parse()).toBe("");
  expect(out.set("a").parse()).toBe("a");
  expect(out.set("a", "b").parse()).toBe("a b");
  expect(out.set(["a"]).parse()).toBe("a");
  expect(out.add("a").set("b").parse()).toBe("b");
  expect(out.set("a").set("b").parse()).toBe("b");
});

test("The add method", () => {
  expect(out.add().parse()).toBe("");
  expect(out.add(null).parse()).toBe("");
  expect(out.add(undefined).parse()).toBe("");
  expect(out.add(true).parse()).toBe("");
  expect(out.add(false).parse()).toBe("");
  expect(out.add("").parse()).toBe("");
  expect(out.add([]).parse()).toBe("");
  expect(out.add(null, undefined, true, false, "", []).parse()).toBe("");
  expect(out.add([, null, undefined, true, false, "", []]).parse()).toBe("");
  expect(out.add("a").parse()).toBe("a");
  expect(out.add("a", "b").parse()).toBe("a b");
  expect(out.add(["a"]).parse()).toBe("a");
  expect(out.add("a").add("b").parse()).toBe("a b");
  expect(out.add("a a").parse()).toBe("a");
  expect(out.add("a", "a").parse()).toBe("a");
  expect(out.add(["a", "a"]).parse()).toBe("a");
  expect(out.add("a").add("a").parse()).toBe("a");
});

test("The remove method", () => {
  expect(out.remove().parse()).toBe("");
  expect(out.remove(null).parse()).toBe("");
  expect(out.remove(undefined).parse()).toBe("");
  expect(out.remove(true).parse()).toBe("");
  expect(out.remove(false).parse()).toBe("");
  expect(out.remove("").parse()).toBe("");
  expect(out.remove([]).parse()).toBe("");
  expect(out.remove(null, undefined, true, false, "", []).parse()).toBe("");
  expect(out.remove([, null, undefined, true, false, "", []]).parse()).toBe("");
  expect(out.remove("a").parse()).toBe("");
  expect(out.remove(["a"]).parse()).toBe("");
  expect(out.remove("a", "b").parse()).toBe("");
  expect(out.set("a").remove("a").parse()).toBe("");
  expect(out.set("a b").remove("b").parse()).toBe("a");
});

test("The apply method", () => {
  expect(out.apply().parse()).toBe("");
  expect(out.apply(out).parse()).toBe("");
  expect(out.apply(out.add("a")).parse()).toBe("a");
  expect(out.add("a").apply(out.remove("a")).parse()).toBe("");
  expect(out.apply(out.remove("a")).add("a").parse()).toBe("");
  expect(out.apply(out.add("a")).apply(out.add("b")).parse()).toBe("a b");
});

test("The with method", () => {
  expect(out.with({}).parse()).toBe("");
  expect(out.with({ set: null }).parse()).toBe("");
  expect(out.with({ set: undefined }).parse()).toBe("");
  expect(out.with({ set: true }).parse()).toBe("");
  expect(out.with({ set: false }).parse()).toBe("");
  expect(out.with({ set: "" }).parse()).toBe("");
  expect(out.with({ set: [] }).parse()).toBe("");
  expect(
    out.with({ set: [, null, undefined, true, false, "", []] }).parse()
  ).toBe("");
  expect(out.with({ set: "a" }).parse()).toBe("a");
  expect(out.with({ set: ["a"] }).parse()).toBe("a");
  expect(out.with({ add: null }).parse()).toBe("");
  expect(out.with({ add: undefined }).parse()).toBe("");
  expect(out.with({ add: true }).parse()).toBe("");
  expect(out.with({ add: false }).parse()).toBe("");
  expect(out.with({ add: "" }).parse()).toBe("");
  expect(out.with({ add: [] }).parse()).toBe("");
  expect(
    out.with({ add: [, null, undefined, true, false, "", []] }).parse()
  ).toBe("");
  expect(out.with({ add: "a" }).parse()).toBe("a");
  expect(out.with({ add: ["a"] }).parse()).toBe("a");
  expect(out.with({ remove: null }).parse()).toBe("");
  expect(out.with({ remove: undefined }).parse()).toBe("");
  expect(out.with({ remove: true }).parse()).toBe("");
  expect(out.with({ remove: false }).parse()).toBe("");
  expect(out.with({ remove: "" }).parse()).toBe("");
  expect(out.with({ remove: [] }).parse()).toBe("");
  expect(
    out.with({ remove: [, null, undefined, true, false, "", []] }).parse()
  ).toBe("");
  expect(out.with({ remove: "a" }).parse()).toBe("");
  expect(out.with({ remove: ["a"] }).parse()).toBe("");
  expect(out.set("a b").with({ remove: "b" }).parse()).toBe("a");
  expect(out.with({ apply: out }).parse()).toBe("");
  expect(out.with({ apply: [out] }).parse()).toBe("");
  expect(out.with({ apply: out.set("a") }).parse()).toBe("a");
  expect(
    out
      .set("a")
      .with({ apply: out.set("b") })
      .parse()
  ).toBe("b");
  expect(out.with({ add: "a b", remove: "b" }).parse()).toBe("a");
  expect(out.with({ remove: "a", add: "a b" }).parse()).toBe("a b");
  expect(out.with({ apply: out.remove("a"), add: "a b" }).parse()).toBe("b");
  expect(out.with({ apply: [out.add("a b"), out.remove("b")] }).parse()).toBe(
    "a"
  );
  // expect(out.with({ variant: "" }).parse()).toBe("");
  // expect(out.with({ choose: "" }).parse()).toBe("");
});

test("The variant and choose methods", () => {
  expect(out.variant().parse()).toBe("");
  expect(out.variant({}).parse()).toBe("");
  expect(out.variant({}, {}).parse()).toBe("");
  expect(out.variant([{}]).parse()).toBe("");
  expect(out.choose().parse()).toBe("");
  expect(out.choose("a").parse()).toBe("");
  expect(out.choose(["a"]).parse()).toBe("");
  expect(out.choose("a", "b").parse()).toBe("");
  expect(out.variant({ a: "a" }).parse()).toBe("");
  expect(out.variant({ a: "a" }).choose("a").parse()).toBe("a");
  expect(out.variant({ a: "a", b: "b" }).choose("a").parse()).toBe("a");
  expect(out.variant({ a: "a", b: "b" }).choose("b").parse()).toBe("b");
  expect(out.variant({ a: "a", b: "b" }).choose("a").choose("b").parse()).toBe(
    "b"
  );
  expect(out.variant({ a: "a", b: "b" }).choose("a b").parse()).toBe("b");
  expect(
    out
      .variant({ a: "a", b: "b" })
      .variant({ 1: "1", 2: "2" })
      .choose("a 1")
      .parse()
  ).toBe("a 1");
  expect(
    out
      .variant({ a: "a", b: "b" })
      .variant({ 1: "1", 2: "2" })
      .choose("b 2")
      .parse()
  ).toBe("b 2");
  expect(
    out
      .variant({ a: "a", b: "b" })
      .variant({ 1: "1", 2: "2" })
      .choose("a 1")
      .choose("2")
      .parse()
  ).toBe("a 2");
  expect(
    out
      .variant({ a: "a", b: "b" })
      .variant({ 1: "1", 2: "2" })
      .choose("a 1")
      .choose("b")
      .parse()
  ).toBe("b 1");
  expect(
    out
      .variant({ a: "a", b: "b" })
      .variant({ 1: "1", 2: "2" })
      .choose("a 1")
      .choose("b 2")
      .parse()
  ).toBe("b 2");
  expect(
    out
      .variant({ a: "a", b: "b" })
      .variant({ "1 a": "1" })
      .choose("a 1")
      .parse()
  ).toBe("a 1");
  expect(
    out
      .variant({ a: "a", b: "b" })
      .variant({ "1 a": "1" })
      .choose("b 1")
      .parse()
  ).toBe("b");
});
