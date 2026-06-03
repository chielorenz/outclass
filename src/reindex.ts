type Variant = { name: string; options: Record<string, string> };

type Compound = { choice: Record<string, string | string[]>; value: string };

type Mod = (v: string) => string;

type Op =
  | { type: "input"; value: string }
  | { type: "variant"; value: Variant }
  | { type: "compound"; value: Compound }
  | { type: "mod"; value: Mod }
  | { type: "slot"; value: string }
  | { type: "push-slot" }
  | { type: "pop-slot" };

type Nested<T> = T | readonly Nested<T>[];



type ExtractV<T> = T extends { parse(choice?: Partial<infer V>): any }
  ? V
  : T extends readonly (infer U)[]
    ? ExtractV<U>
    : never;

type ExtractS<T> = T extends { readonly " $slots": infer S }
  ? S
  : T extends readonly (infer U)[]
    ? ExtractS<U>
    : never;

type ExtractD<T> = T extends { readonly " $hasDefault": infer D }
  ? D
  : T extends readonly (infer U)[]
    ? ExtractD<U>
    : false;

type IsString<T> = T extends string ? true : false;

type IsTrue<T> = true extends T ? true : false;

type Or<X extends boolean, Y extends boolean> = true extends X
  ? true
  : true extends Y
    ? true
    : false;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type VariantsOf<T> =
  T extends { parse(choice?: Partial<infer V>): any } ? V : never;

function each<T>(node: Nested<T>, visit: (item: T) => void): void {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) each(node[i], visit);
  } else visit(node as T);
}

function isObject(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

class Outclass<
  V = {},
  S extends string = never,
  D extends boolean = false,
  A extends string = "default",
> {
  declare readonly " $slots": S;
  declare readonly " $hasDefault": D;

  #parent?: Outclass<any, any, any, any>;
  #ops: Op[];

  constructor(parent?: Outclass<any, any, any, any>, ops?: Op[]) {
    this.#parent = parent;
    this.#ops = ops ?? [];
  }

  static #collect(out: Outclass<any, any, any, any>): Op[] {
    const chunks: Op[][] = [];
    for (
      let cur: Outclass<any, any, any, any> | undefined = out;
      cur;
      cur = cur.#parent
    ) {
      chunks.push(cur.#ops);
    }
    const ops: Op[] = [];
    for (let i = chunks.length - 1; i >= 0; i--) {
      for (const op of chunks[i]) ops.push(op);
    }
    return ops;
  }

  variant<K extends string, O extends Record<string, string>>(
    name: K,
    options: O,
  ): Outclass<
    V & Partial<Record<K, keyof O & string>>,
    S,
    Or<D, A extends "default" ? true : false>,
    A
  >;
  variant(
    choice: Partial<V>,
    value: string,
  ): Outclass<V, S, Or<D, A extends "default" ? true : false>, A>;
  variant(arg1: any, arg2: any): any {
    if (typeof arg1 === "string" && isObject(arg2)) {
      return new Outclass(this, [
        { type: "variant", value: { name: arg1, options: arg2 } },
      ]);
    }

    if (isObject(arg1) && typeof arg2 === "string") {
      return new Outclass(this, [
        { type: "compound", value: { choice: arg1, value: arg2 } },
      ]);
    }
    throw new Error(
      "Invalid arguments passed to variant(). Expected (name, options) or (choice, value).",
    );
  }

  slot<K extends string>(name: K): Outclass<V, S | K, D, K> {
    return new Outclass<V, S | K, D, K>(this as any, [
      { type: "slot", value: name },
    ]);
  }

  use(...values: Nested<Mod>[]): Outclass<V, S, D, A> {
    const ops: Op[] = [];
    each(values, (value) => {
      if (typeof value === "function") ops.push({ type: "mod", value });
    });
    return new Outclass(this, ops);
  }

  class<C extends Nested<unknown>[]>(
    ...values: C
  ): Outclass<
    V & UnionToIntersection<ExtractV<C[number]>>,
    S | (ExtractS<C[number]> & string),
    Or<D, A extends "default" ? Or<IsTrue<ExtractD<C[number]>>, IsTrue<IsString<C[number]>>> : false>,
    A
  > {
    const ops: Op[] = [];
    each(values, (value) => {
      if (value instanceof Outclass) {
        ops.push(
          { type: "push-slot" },
          ...Outclass.#collect(value),
          { type: "pop-slot" },
        );
      } else if (typeof value === "string") {
        ops.push({ type: "input", value });
      }
    });
    return new Outclass(this as any, ops);
  }

  parse(
    choice?: Partial<V>,
  ): [S] extends [never]
    ? string
    : [D] extends [true]
      ? Record<S | "default", string>
      : Record<S, string>;
  parse(choice?: Record<string, any>) {
    const ops = Outclass.#collect(this);
    const variants: Variant[] = [];
    const mods: Mod[] = [];

    for (const op of ops) {
      if (op.type === "variant") variants.push(op.value);
      else if (op.type === "mod") mods.push(op.value);
    }

    const selection: Record<string, string> = {};
    for (const variant of variants) {
      const choosen = choice?.[variant.name];
      if (choosen && variant.options[choosen]) {
        selection[variant.name] = variant.options[choosen];
      } else if (variant.options.default) {
        selection[variant.name] = variant.options.default;
      }
    }

    const slotStack = ["default"];
    const classes: Record<string, Set<string>> = {};
    for (const op of ops) {
      const currentSlot = slotStack[slotStack.length - 1]!;
      if (op.type === "input") {
        const tokens = op.value.split(/\s+/);
        for (const token of tokens) {
          if (token) (classes[currentSlot] ??= new Set()).add(token);
        }
      } else if (op.type === "variant") {
        const selected = selection[op.value.name];
        if (selected) (classes[currentSlot] ??= new Set()).add(selected);
      } else if (op.type === "compound") {
        let isActive = true;
        for (const variantName in op.value.choice) {
          const variantOption = op.value.choice[variantName];
          const selectedOption = choice?.[variantName] || "default";
          const isMatch = Array.isArray(variantOption)
            ? variantOption.includes(selectedOption)
            : variantOption === selectedOption;
          if (!isMatch) {
            isActive = false;
            break;
          }
        }
        if (isActive) (classes[currentSlot] ??= new Set()).add(op.value.value);
      } else if (op.type === "slot") {
        slotStack[slotStack.length - 1] = op.value;
        classes[op.value] ??= new Set();
      } else if (op.type === "push-slot") {
        slotStack.push(currentSlot);
      } else if (op.type === "pop-slot") {
        slotStack.pop();
      }
    }

    const slotsObj: Record<string, string> = {};
    for (const slotName in classes) {
      const slotString = [...classes[slotName]].join(" ");
      slotsObj[slotName] = mods.reduce((v, mod) => mod(v), slotString);
    }

    const hasSlot = ops.some((op) => op.type === "slot");

    return (hasSlot ? slotsObj : (slotsObj.default ?? "")) as any;
  }
}

const out = new Outclass();

export { out, Outclass };
