export type Value = string | undefined | null | boolean;

export type Items = Value | Items[];

export type Variant = { [key: string]: string };

export type Variants = Variant | Variants[];

export type Choice = string;

export type Choices = Choice | Choices[];

type Slot<Type> = Type;

type Slots<Type> = Slot<Type> | Slots<Type>[];

export type Action =
  | {
      type: "add" | "remove" | "set";
      value: Items;
    }
  | {
      type: "apply";
      value: Outclass;
    }
  | {
      type: "variant";
      value: Variants;
    };

export type Map = Partial<{
  set: Items;
  add: Items;
  remove: Items;
  apply: Outclass | Outclass[];
  // variant: Variants;
  // choose: string[];
}>;

function parse(...items: Items[]): string[] {
  const tokens: string[] = [];

  for (const item of items) {
    if (item instanceof Array) {
      tokens.push(...parse(...item));
    } else if (typeof item === "string") {
      const split = item.split(" ");
      for (const token of split) {
        if (token) tokens.push(token);
      }
    }
  }

  return tokens;
}

function flat<Type>(...items: Slots<Type>[]): Slot<Type>[] {
  const list: Type[] = [];
  for (const item of items) {
    if (item instanceof Array) {
      list.push(...flat(...item));
    } else {
      list.push(item);
    }
  }
  return list;
}

class Outclass {
  #actions: Action[] = [];
  #choices: Choices[] = [];

  #clone(): Outclass {
    const out = new Outclass();
    // TODO use structuredClone() instead?
    out.#actions = [...this.#actions];
    out.#choices = [...this.#choices];
    return out;
  }

  #process(map: Map): Action[] {
    let actions: Action[] = [];

    let type: keyof Map;
    for (type in map) {
      if (type === "apply") {
        let outs = map.apply!;
        outs = Array.isArray(outs) ? outs : [outs];
        for (const out of outs) {
          actions.push({ type, value: out });
        }
      } else {
        actions.push({ type, value: map[type] });
      }
    }

    return actions;
  }

  add(...items: Items[]): Outclass {
    const out = this.#clone();
    out.#actions.push({ type: "add", value: items });
    return out;
  }

  remove(...items: Items[]): Outclass {
    const out = this.#clone();
    out.#actions.push({ type: "remove", value: items });
    return out;
  }

  set(...items: Items[]): Outclass {
    const out = this.#clone();
    out.#actions.push({ type: "set", value: items });
    return out;
  }

  apply(...patches: Outclass[]): Outclass {
    const out = this.#clone();
    for (const patch of patches) {
      out.#actions.push({ type: "apply", value: patch });
    }
    return out;
  }

  with(...maps: Map[]): Outclass {
    const out = this.#clone();
    for (const map of maps) {
      out.#actions.push(...this.#process(map));
    }
    return out;
  }

  variant(...items: Variants[]): Outclass {
    const out = this.#clone();
    out.#actions.push({ type: "variant", value: items });
    return out;
  }

  choose(...choices: Choices[]): Outclass {
    const out = this.#clone();
    out.#choices.push(choices);
    return out;
  }

  parse(...params: Map[] | Items[]): string {
    const actions = [...this.#actions];
    const tokens = new Set<string>();

    // Handle parse(parameter)
    for (const param of params) {
      if (
        typeof param === "object" &&
        param !== null &&
        !Array.isArray(param)
      ) {
        actions.push(...this.#process(param));
      } else {
        actions.push({ type: "add", value: param });
      }
    }

    // Join all variant choices
    const variants: Variant[] = [];
    for (const action of actions) {
      if (action.type === "variant") {
        variants.push(...flat(action.value));
      }
    }

    const flatChoices: string[][] = [];
    for (const choice of this.#choices) {
      const flatChoice = flat(choice).join(" ").split(" ");
      flatChoices.push(flatChoice);
    }
    const choices: string[] = [];

    while (flatChoices.length > 0) {
      let choice = flatChoices.pop()!;
      for (const variant of variants) {
        const keys = Object.keys(variant);
        for (const key of keys) {
          if (key.split(" ").every((k) => choices.includes(k))) {
            for (const otherKey of keys) {
              if (!otherKey.includes(" ") && otherKey != key) {
                choice = choice.filter((c) => c != otherKey);
              }
            }
          }
        }
      }
      choices.push(...choice);
    }

    while (actions.length > 0) {
      const action = actions.shift()!;

      if (action.type === "apply") {
        actions.push(...action.value.#actions);
      } else if (action.type === "variant") {
        const variants = flat(action.value);
        for (const variant of variants) {
          const counts: string[] = [];
          for (const [key, value] of Object.entries(variant)) {
            const keys = key.split(" ");
            if (keys.every((p) => choices.includes(p))) {
              counts[keys.length] = value;
            }
          }
          if (counts.length > 0) {
            const items = counts.pop()!.split(" ");
            for (const item of items) tokens.add(item);
          }
        }
      } else {
        const items = parse(action.value);
        if (action.type === "remove") {
          for (const item of items) tokens.delete(item);
        } else {
          if (action.type === "set") {
            tokens.clear();
          }
          for (const item of items) tokens.add(item);
        }
      }
    }

    return [...tokens].join(" ");
  }
}

const out = new Outclass();
export { out };
