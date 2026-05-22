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
  | { type: "apply"; value: Out }
  | { type: "variant"; value: Variant }
  | { type: "choose"; value: string[] }
  | { type: "use"; value: Mod };

type Nested<Type> = Type | Nested<Type>[];

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

class Out {
  #parent?: Out;
  #op?: Op;
  #parsed?: string;

  constructor(parent?: Out, op?: Op) {
    this.#parent = parent;
    this.#op = op;
  }

  static #collect(out: Out): Op[] {
    const ops: Op[] = [];
    for (let cur: Out | undefined = out; cur; cur = cur.#parent) {
      if (cur.#op) ops.push(cur.#op);
    }
    return ops.reverse();
  }

  static #resolve(ops: Op[]): Op[] {
    const direct: Op[] = [];
    const patches: Out[] = [];
    for (const op of ops) {
      if (op.type === "apply") patches.push(op.value);
      else direct.push(op);
    }
    for (const patch of patches)
      direct.push(...Out.#resolve(Out.#collect(patch)));
    return direct;
  }

  #chain(ops: Op[]): Out {
    let out: Out = this;
    for (const op of ops) out = new Out(out, op);
    return out;
  }

  add(...items: Nested<Input>[]): Out {
    return new Out(this, { type: "add", value: tokenize(items) });
  }

  remove(...items: Nested<Input>[]): Out {
    return new Out(this, { type: "remove", value: tokenize(items) });
  }

  set(...items: Nested<Input>[]): Out {
    return new Out(this, { type: "set", value: tokenize(items) });
  }

  choose(...choices: Nested<Input>[]): Out {
    return new Out(this, { type: "choose", value: tokenize(choices) });
  }

  apply(...outs: Nested<Out>[]): Out {
    const ops: Op[] = [];
    each(outs, (value) => ops.push({ type: "apply", value }));
    return this.#chain(ops);
  }

  variant(...variants: Nested<Variant>[]): Out {
    const ops: Op[] = [];
    each(variants, (v) => ops.push({ type: "variant", value: v }));
    return this.#chain(ops);
  }

  with(...defs: Nested<Def>[]): Out {
    const ops: Op[] = [];
    each(defs, (def) => opsFromDef(def, ops));
    return this.#chain(ops);
  }

  use(...mods: Nested<Mod>[]): Out {
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
export { out };
