export type Value = string | undefined | null | boolean;

export type Items = Value | Items[];

export type Action =
  | {
      type: "add" | "remove" | "set";
      value: Items;
    }
  | {
      type: "apply";
      value: Action[];
    };

export type Map = {
  set?: Items;
  add?: Items;
  remove?: Items;
  apply?: Outclass | Outclass[];
};

function parse(...items: Items[]): string[] {
  const tokens: string[] = [];

  for (const item of items) {
    if (item instanceof Array) {
      tokens.push(...parse(...item));
    } else if (typeof item === "string") {
      tokens.push(...item.split(" "));
    }
  }

  return tokens;
}

class Outclass {
  #actions: Action[] = [];

  // TODO rename mitosis to something better
  #mitosis(actions: Action[] = []) {
    return new Outclass([...this.#actions, ...actions]);
  }

  #parseMap(map: Map): Action[] {
    let actions: Action[] = [];

    let type: keyof Map;
    for (type in map) {
      if (type === "apply") {
        let outs = map.apply || [];
        outs = Array.isArray(outs) ? outs : [outs];
        for (const out of outs) {
          actions.push({ type, value: out.#actions });
        }
      } else {
        actions.push({ type, value: map[type] });
      }
    }

    return actions;
  }

  public constructor(actions: Action[] = []) {
    this.#actions = actions;
  }

  public add(...items: Items[]): Outclass {
    return this.#mitosis([{ type: "add", value: items }]);
  }

  public remove(...items: Items[]): Outclass {
    return this.#mitosis([{ type: "remove", value: items }]);
  }

  public set(...items: Items[]): Outclass {
    return this.#mitosis([{ type: "set", value: items }]);
  }

  public apply(...patches: Outclass[]): Outclass {
    const actions: Action[] = [];
    for (const out of patches) {
      actions.push({ type: "apply", value: out.#actions });
    }
    return this.#mitosis(actions);
  }

  public with(map: Map): Outclass {
    return this.#mitosis(this.#parseMap(map));
  }

  // TODO can parse take map | Items[]?
  public parse(map?: Map): string {
    let tokens = new Set<string>();
    const actions = [...this.#actions];

    if (map) {
      actions.push(...this.#parseMap(map));
    }

    while (actions.length > 0) {
      const action = actions.shift();
      if (!action) continue;

      if (action.type === "apply") {
        actions.push(...action.value);
      } else {
        const items = parse(action.value);
        if (action.type === "add") {
          for (const item of items) tokens.add(item);
        } else if (action.type === "remove") {
          for (const item of items) tokens.delete(item);
        } else if (action.type === "set") {
          tokens = new Set(items);
        }
      }
    }

    return [...tokens].join(" ");
  }
}

const out = new Outclass();
export { out };
