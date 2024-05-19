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
type Nested<Type> = Type | Nested<Type>[];

function flat<Type>(
  ...items: Nested<Type | undefined | null | boolean>[]
): Type[] {
  const values: Type[] = [];
  for (const item of items) {
    if (item instanceof Array) {
      values.push(...flat(...item));
    } else if (item && typeof item !== "boolean") {
      values.push(item);
    }
  }
  return values;
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
          this.#patches.push(...flat(map.apply));
        } else if (type === "variant") {
          this.#variants.push(...flat(map.variant));
        } else if (type === "choose") {
          this.#choices.push(...flat(map.choose));
        } else {
          this.#actions.push({ type, value: flat(map[type]) });
        }
      }
    }
  }

  add(...items: Nested<Input>[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "add", value: flat(items) });
    return out;
  }

  remove(...items: Nested<Input>[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "remove", value: flat(items) });
    return out;
  }

  set(...items: Nested<Input>[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "set", value: flat(items) });
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
    out.#choices.push(...flat(choices));
    return out;
  }

  parse(...params: Array<Nested<Map> | Nested<Input>>): string {
    const out = this.#clone();
    const classes = new Set<string>();
    const choices: string[] = [];

    for (const param of flat(params)) {
      if (typeof param === "object") {
        out.#processMaps(param);
      } else {
        out.#actions.push({ type: "add", value: [param] });
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
      const items = action.value
        .join(" ")
        .split(" ")
        .filter((i) => i.trim().length);
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
    while (out.#choices.length > 0) {
      const flatChoice = out.#choices.pop()!.split(" ");
      for (const variant of out.#variants) {
        const keys = Object.keys(variant);
        for (const key of keys) {
          if (key.split(" ").every((k) => choices.includes(k))) {
            for (const otherKey of keys) {
              if (!otherKey.includes(" ") && otherKey != key) {
                flatChoice.slice(flatChoice.indexOf(otherKey));
              }
            }
          }
        }
      }
      choices.push(...flatChoice);
    }

    // Apply variants
    for (const variant of out.#variants) {
      const selection: string[] = [];
      for (const [key, value] of Object.entries(variant)) {
        const keys = key.split(" ");
        if (keys.every((p) => choices.includes(p))) {
          selection[keys.length] = value;
        }
      }
      if (selection.length > 0) {
        const items = selection.pop()!.split(" ");
        for (const item of items) classes.add(item);
      }
    }

    return [...classes].join(" ");
  }
}

const out = new Out();
export { out };
