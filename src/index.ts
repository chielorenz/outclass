export type Value = string | undefined | null | boolean;
export type Items = Value | Items[];
export type Variant = { [key: string]: string };
export type Variants = Variant | Variants[];
export type Maps = Map | Maps[];
export type Outs = Out | Outs[];
export type Action =
  | {
      type: "set" | "add" | "remove";
      value: Items;
    }
  | {
      type: "apply";
      value: Outs;
    }
  | {
      type: "variant";
      value: Variants;
    };
export type Map = Partial<{
  set: Items;
  add: Items;
  remove: Items;
  apply: Outs;
  variant: Variants;
  choose: Items;
}>;
type Slot<Type> = Type;
type Slots<Type> = Slot<Type> | Slots<Type>[];

// Flattens an infinitely nested array
function flat<Type>(...items: Slots<Type>[]): Slot<Type>[] {
  const values: Type[] = [];
  for (const item of items) {
    if (item instanceof Array) {
      values.push(...flat(...item));
    } else {
      values.push(item);
    }
  }
  return values;
}

// Convert an array of Maps into an array of Actions
function processMaps(...maps: Maps[]): { actions: Action[]; choices: Items[] } {
  const actions: Action[] = [];
  const choices: Items[] = [];
  let type: keyof Map;
  for (const map of flat(maps)) {
    for (type in map) {
      if (type === "apply") {
        actions.push({ type, value: map.apply! });
      } else if (type === "variant") {
        actions.push({ type, value: map.variant! });
      } else if (type === "choose") {
        choices.push(map.choose);
      } else {
        actions.push({ type, value: map[type] });
      }
    }
  }
  return { actions, choices };
}

class Out {
  #actions: Action[] = [];
  #choices: Items[] = [];

  #clone(): Out {
    const out = new Out();
    out.#actions = [...this.#actions];
    out.#choices = [...this.#choices];
    return out;
  }

  add(...items: Items[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "add", value: items });
    return out;
  }

  remove(...items: Items[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "remove", value: items });
    return out;
  }

  set(...items: Items[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "set", value: items });
    return out;
  }

  apply(...outs: Outs[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "apply", value: outs });
    return out;
  }

  with(...maps: Maps[]): Out {
    const out = this.#clone();
    const { actions, choices } = processMaps(maps);
    out.#actions.push(...actions);
    out.#choices.push(...choices);
    return out;
  }

  variant(...variants: Variants[]): Out {
    const out = this.#clone();
    out.#actions.push({ type: "variant", value: variants });
    return out;
  }

  choose(...choices: Items[]): Out {
    const out = this.#clone();
    out.#choices.push(choices);
    return out;
  }

  parse(...params: Array<Maps | Items>): string {
    const actions = [...this.#actions];
    const choices = [...this.#choices];

    const variants: Variant[] = [];
    const flatChoices: string[][] = [];
    const mergedChoices: string[] = [];
    const classes = new Set<string>();

    // Handle function parameters
    for (const param of flat(params)) {
      if (
        typeof param === "object" &&
        param !== null &&
        !Array.isArray(param)
      ) {
        const items = processMaps(param);
        actions.push(...items.actions);
        choices.push(...items.choices);
      } else {
        actions.push({ type: "add", value: param });
      }
    }

    // Retrieve all variants
    for (const action of actions) {
      if (action.type === "variant") {
        variants.push(...flat(action.value));
      }
    }

    // Retrieve and merge all choices
    for (const choice of this.#choices) {
      const choices = flat(choice)
        .filter((c) => typeof c === "string")
        .join(" ")
        .split(" ")
        .filter((c) => c.trim().length);
      if (choices.length) {
        flatChoices.push(choices);
      }
    }
    while (flatChoices.length > 0) {
      const flatChoice = flatChoices.pop()!;
      for (const variant of variants) {
        const keys = Object.keys(variant);
        for (const key of keys) {
          if (key.split(" ").every((k) => mergedChoices.includes(k))) {
            for (const otherKey of keys) {
              if (!otherKey.includes(" ") && otherKey != key) {
                flatChoice.slice(flatChoice.indexOf(otherKey));
              }
            }
          }
        }
      }
      mergedChoices.push(...flatChoice);
    }

    // Build the list of classes
    while (actions.length > 0) {
      const action = actions.shift()!;

      if (action.type === "apply") {
        for (const out of flat(action.value)) {
          actions.push(...out.#actions);
        }
      } else if (action.type === "variant") {
        for (const variant of flat(action.value)) {
          const selection: string[] = [];
          for (const [key, value] of Object.entries(variant)) {
            const keys = key.split(" ");
            if (keys.every((p) => mergedChoices.includes(p))) {
              selection[keys.length] = value;
            }
          }
          if (selection.length > 0) {
            const items = selection.pop()!.split(" ");
            for (const item of items) classes.add(item);
          }
        }
      } else {
        const items = flat(action.value)
          .filter((i) => typeof i === "string")
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
    }

    return [...classes].join(" ");
  }
}

const out = new Out();
export { out };
export default out;
