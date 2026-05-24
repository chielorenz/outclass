type Input = string | undefined | null | boolean;

type Variant = { [k: string]: string };

type Mod = (v: string) => string;

type Def = Partial<{
  set: Nested<Input>;
  add: Nested<Input>;
  remove: Nested<Input>;
  apply: Nested<Out>;
  variant: Nested<Variant>;
  choose: Nested<Input>;
  use: Nested<Mod>;
}>;

type Op =
  | { type: "set"; value: string[] }
  | { type: "add"; value: string[] }
  | { type: "remove"; value: string[] }
  | { type: "apply"; value: Out<any> }
  | { type: "variant"; value: Variant }
  | { type: "choose"; value: string[] }
  | { type: "use"; value: Mod };

type Nested<Type> = Type | Nested<Type>[];

type Split<S extends string> = S extends `${infer First} ${infer Rest}`
  ? (First extends "" ? never : First) | Split<Rest>
  : S extends ""
    ? never
    : S;

type FindInvalidToken<S extends string, Valid extends string> =
  Split<S> extends infer Token
    ? Token extends string
      ? Token extends any
        ? [Token] extends [Valid]
          ? never
          : Token
        : never
      : never
    : never;

type ValidateCompound<S extends string, U extends string> =
  FindInvalidToken<S, U> extends never
    ? S
    : `Error: Variant '${FindInvalidToken<S, U>}' does not exist`;

type Validated<T, U extends string> = T extends string
  ? T extends `${string} ${string}`
    ? ValidateCompound<T, U>
    : U
  : never;

type ValidatedMapped<TArgs extends readonly any[], U extends string> = {
  [K in keyof TArgs]: Validated<TArgs[K], U>;
} & readonly any[];

type ExtractVariantTokens<T> = T extends readonly (infer Item)[]
  ? ExtractVariantTokens<Item>
  : T extends Record<string, string>
    ? ExtractVariantTokens<keyof T & string>
    : T extends string
      ? Split<T>
      : never;

function each<Type>(node: Nested<Type>, visit: (item: Type) => void): void {
  if (Array.isArray(node)) for (const child of node) each(child, visit);
  else visit(node);
}

function tokenize(items: Nested<Input>): string[] {
  const tokens: string[] = [];
  each(items, (item) => {
    if (typeof item !== "string") return;
    const match = item.match(/\S+/g);
    if (match) tokens.push(...match);
  });
  return tokens;
}

function opsFromDef(def: Def, ops: Op[]): void {
  for (const type in def) {
    if (type === "apply")
      each(def.apply!, (value) => ops.push({ type: "apply", value }));
    else if (type === "variant")
      each(def.variant!, (v) => ops.push({ type: "variant", value: v }));
    else if (type === "use")
      each(def.use!, (value) => ops.push({ type: "use", value }));
    else if (type === "choose")
      ops.push({ type: "choose", value: tokenize(def.choose) });
    else if (type === "set" || type === "add" || type === "remove")
      ops.push({ type, value: tokenize(def[type]) });
  }
}

function parseOps(ops: Op[]): string {
  const variants: Variant[] = [];
  const choices: string[] = [];
  const mods: Mod[] = [];

  for (const op of ops) {
    if (op.type === "variant") variants.push(op.value);
    else if (op.type === "choose") for (const v of op.value) choices.push(v);
    else if (op.type === "use") mods.push(op.value);
  }

  const selected = new Map<Variant, string>();
  const compiled = new Map<
    Variant,
    {
      values: Map<string, string[]>;
      compound: Array<{ choice: string; keys: string[] }>;
    }
  >();

  for (const variant of variants) {
    if (!compiled.has(variant)) {
      const values = new Map<string, string[]>();
      const compound: Array<{ choice: string; keys: string[] }> = [];
      for (const choice in variant) {
        values.set(choice, tokenize(variant[choice]));
        if (choice.includes(" ")) {
          compound.push({ choice, keys: tokenize(choice) });
        }
      }
      compiled.set(variant, { values, compound });
    }
  }

  for (const choice of choices) {
    for (const variant of variants) {
      if (compiled.get(variant)!.values.has(choice)) {
        selected.set(variant, choice);
        break;
      }
    }
  }

  const chosen = new Set(selected.values());
  for (const variant of variants) {
    for (const { choice, keys } of compiled.get(variant)!.compound) {
      if (keys.every((key) => chosen.has(key))) {
        selected.set(variant, choice);
        break;
      }
    }
  }

  const classes = new Set<string>();
  for (const op of ops) {
    if (op.type === "set") {
      classes.clear();
      for (const v of op.value) classes.add(v);
    } else if (op.type === "add") {
      for (const v of op.value) classes.add(v);
    } else if (op.type === "remove") {
      for (const v of op.value) classes.delete(v);
    } else if (op.type === "variant") {
      const choice = selected.get(op.value);
      if (choice) {
        for (const v of compiled.get(op.value)!.values.get(choice)!) {
          classes.add(v);
        }
      }
    }
  }

  return mods.reduce((v, mod) => mod(v), [...classes].join(" "));
}

class Out<U extends string = never> {
  #parent?: Out<any>;
  #op?: Op;
  #parsed?: string;

  constructor(parent?: Out<any>, op?: Op) {
    this.#parent = parent;
    this.#op = op;
  }

  static #collect(out: Out<any>): Op[] {
    const ops: Op[] = [];
    for (let cur: Out | undefined = out; cur; cur = cur.#parent) {
      if (cur.#op) ops.push(cur.#op);
    }
    return ops.reverse();
  }

  static #resolve(ops: Op[]): Op[] {
    const direct: Op[] = [];
    const patches: Out<any>[] = [];
    for (const op of ops) {
      if (op.type === "apply") patches.push(op.value);
      else direct.push(op);
    }
    for (const patch of patches)
      direct.push(...Out.#resolve(Out.#collect(patch)));
    return direct;
  }

  #chain(ops: Op[]): Out<U> {
    let out: Out<any> = this;
    for (const op of ops) out = new Out(out, op);
    return out as Out<U>;
  }

  add(...items: Nested<Input>[]): Out<U> {
    return new Out(this, { type: "add", value: tokenize(items) });
  }

  remove(...items: Nested<Input>[]): Out<U> {
    return new Out(this, { type: "remove", value: tokenize(items) });
  }

  set(...items: Nested<Input>[]): Out<U> {
    return new Out(this, { type: "set", value: tokenize(items) });
  }

  choose<T = U>(
    ...choices: [T] extends [never] ? Nested<Input>[] : U[]
  ): Out<U>;
  choose<T = U>(
    ...choices: [T] extends [never] ? Nested<Input>[] : Nested<U>[]
  ): Out<U>;
  choose<const TArgs extends readonly string[], T = U>(
    ...choices: [T] extends [never]
      ? Nested<Input>[]
      : ValidatedMapped<TArgs, U>
  ): Out<U>;
  choose(...choices: any[]): Out<U> {
    return new Out(this, { type: "choose", value: tokenize(choices) });
  }

  apply(...outs: Nested<Out<any>>[]): Out<U> {
    const ops: Op[] = [];
    each(outs, (value) => ops.push({ type: "apply", value }));
    return this.#chain(ops);
  }

  variant<const V extends Variant>(
    ...variants: Nested<V>[]
  ): Out<U | ExtractVariantTokens<V>> {
    const ops: Op[] = [];
    each(variants, (v) => ops.push({ type: "variant", value: v as Variant }));
    return this.#chain(ops) as any;
  }

  with(...defs: Nested<Def>[]): Out<U> {
    const ops: Op[] = [];
    each(defs, (def) => opsFromDef(def, ops));
    return this.#chain(ops);
  }

  use(...mods: Nested<Mod>[]): Out<U> {
    const ops: Op[] = [];
    each(mods, (mod) => ops.push({ type: "use", value: mod }));
    return this.#chain(ops);
  }

  parse(...params: Array<Nested<Def> | Nested<Input>>): string {
    if (params.length === 0 && this.#parsed !== undefined) return this.#parsed;

    const ops = Out.#collect(this);
    each(params, (param) => {
      if (typeof param === "object" && param !== null)
        opsFromDef(param as Def, ops);
      else ops.push({ type: "add", value: tokenize(param as Input) });
    });

    const parsed = parseOps(Out.#resolve(ops));
    if (params.length === 0) this.#parsed = parsed;
    return parsed;
  }
}

const out = new Out();
export type VariantsOf<T extends Out<any>> = T extends Out<infer U> ? U : never;
export { out };
