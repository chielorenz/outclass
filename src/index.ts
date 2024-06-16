export type Input = string | undefined | null | boolean;
export type Variant = { [key: string]: string };
export type Action = {
  type: "set" | "add" | "remove";
  value: string[];
};
export type Map = Partial<{
  set: Nested<Input>;
  add: Nested<Input>;
  remove: Nested<Input>;
  apply: Nested<Out>;
  variant: Nested<Variant>;
  choose: Nested<Input>;
}>;
export type Nested<Type> = Type | Nested<Type>[];

function flat<Type>(...items: Nested<Type>[]): Type[] {
  // @ts-ignore
  return items.flat(Infinity);
}

function tokenize(...items: Nested<Input>[]): string[] {
  return flat(items)
    .filter((item) => item && typeof item !== "boolean")
    .join(" ")
    .split(" ")
    .filter((item) => item.trim().length);
}

class Out {
  #actions: Action[] = [];
  #patches: Out[] = [];
  #variants: Variant[] = [];
  #choices: string[] = [];

  #clone(): Out {
    const out = new Out();
    out.#actions = [...this.#actions];
    out.#patches = [...this.#patches];
    out.#variants = [...this.#variants];
    out.#choices = [...this.#choices];
    return out;
  }

  #processMaps(...maps: Nested<Map>[]): void {
    let type: keyof Map;
    for (const map of flat(maps)) {
      for (type in map) {
        if (type === "apply") {
          this.#patches.push(...flat(map.apply!));
        } else if (type === "variant") {
          this.#variants.push(...flat(map.variant!));
        } else if (type === "choose") {
          this.#choices.push(...tokenize(map.choose));
        } else {
          this.#actions.push({ type, value: tokenize(map[type]) });
        }
      }
    }
  }

  add(...items: Nested<Input>[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "add", value: tokenize(items) });
    return out;
  }

  remove(...items: Nested<Input>[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "remove", value: tokenize(items) });
    return out;
  }

  set(...items: Nested<Input>[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "set", value: tokenize(items) });
    return out;
  }

  apply(...outs: Nested<Out>[]): Out {
    const out = this.#clone();
    out.#patches.push(...flat(outs));
    return out;
  }

  with(...maps: Nested<Map>[]): Out {
    const out = this.#clone();
    out.#processMaps(maps);
    return out;
  }

  variant(...variants: Nested<Variant>[]): Out {
    const out = this.#clone();
    out.#variants.push(...flat(variants));
    return out;
  }

  choose(...choices: Nested<Input>[]): Out {
    const out = this.#clone();
    out.#choices.push(...tokenize(choices));
    return out;
  }

  parse(...params: Array<Nested<Map> | Nested<Input>>): string {
    const out = this.#clone();
    const classes = new Set<string>();
    const choices = new Map<Variant, string>();

    for (const param of flat(params)) {
      if (typeof param === "object" && param !== null) {
        out.#processMaps(param);
      } else {
        out.#actions.push({ type: "add", value: tokenize(param) });
      }
    }

    // Apply patches
    for (const patch of out.#patches) {
      out.#actions.push(...patch.#actions);
      out.#variants.push(...patch.#variants);
      out.#choices.push(...patch.#choices);
    }

    // Parse actions
    while (out.#actions.length > 0) {
      const action = out.#actions.shift()!;
      const items = action.value;
      if (action.type === "remove") {
        for (const item of items) classes.delete(item);
      } else {
        if (action.type === "set") {
          classes.clear();
        }
        for (const item of items) classes.add(item);
      }
    }

    // Merge choices
    for (const choice of out.#choices) {
      for (const variant of out.#variants) {
        if (Object.keys(variant).includes(choice)) {
          choices.set(variant, choice);
          break;
        }
      }
    }
    const values = [...choices.values()];
    for (const variant of out.#variants) {
      for (const key of Object.keys(variant)) {
        const isCompound = key.includes(" ");
        if (isCompound) {
          if (tokenize(key).every((k) => values.includes(k))) {
            choices.set(variant, key);
            break;
          }
        }
      }
    }

    // Apply variants
    for (const variant of out.#variants) {
      const choice = choices.get(variant);
      if (choice) {
        const items = tokenize(variant[choice]);
        for (const item of items) classes.add(item);
      }
    }

    return [...classes].join(" ");
  }
}

const out = new Out();
export { out };
