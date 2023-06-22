export type Value = string | undefined | null | boolean;

export type Item = Value | Array<Item>;

export type Action =
  | {
      type: "add" | "remove" | "set";
      items: Item;
    }
  | {
      type: "apply";
      items: Outclass;
    };

export type Map = {
  set?: Item;
  add?: Item;
  remove?: Item;
  // TODO should we take Outclass | Outclass[] ?
  apply?: Outclass;
};

function parse(...params: Item[]): Set<string> {
  const tokens = new Set<string>();

  function eat(param: Item): Iterable<string> {
    if (param instanceof Array) {
      return parse(...param);
    } else if (typeof param === "string") {
      return param.split(" ");
    } else {
      return [];
    }
  }

  for (const param of params) {
    for (const token of eat(param)) {
      if (token) tokens.add(token);
    }
  }

  return tokens;
}

class Outclass {
  #actions: Action[] = [];

  #mitosis(actions: Action[] = []) {
    return new Outclass([...this.#actions, ...actions]);
  }

  #parseMap(map: Map): Action[] {
    let actions: Action[] = [];

    let type: keyof Map;
    for (type in map) {
      if (type === "apply") {
        const out = map[type];
        if (out) actions.push({ type, items: out });
      } else {
        actions.push({ type, items: map[type] });
      }
    }

    return actions;
  }

  #patch(): Action[] {
    return this.#actions;
  }

  public constructor(actions: Action[] = []) {
    this.#actions = actions;
  }

  public add(...items: Item[]): Outclass {
    return this.#mitosis([{ type: "add", items }]);
  }

  public remove(...items: Item[]): Outclass {
    return this.#mitosis([{ type: "remove", items }]);
  }

  public set(...items: Item[]): Outclass {
    return this.#mitosis([{ type: "set", items }]);
  }

  public apply(...outs: Outclass[]): Outclass {
    const actions: Action[] = [];
    for (const out of outs) {
      actions.push({ type: "apply", items: out });
    }
    return this.#mitosis(actions);
  }

  public with(map: Map): Outclass {
    return this.#mitosis(this.#parseMap(map));
  }

  public parse(map?: Map): string {
    let tokens = new Set<string>();
    const actions = [...this.#actions];

    if (map) {
      actions.push(...this.#parseMap(map));
    }

    while (actions.length > 0) {
      const action = actions.shift();
      if (action) {
        if (action.type === "add") {
          const parsed = parse(action.items);
          parsed.forEach((item) => tokens.add(item));
        } else if (action.type === "remove") {
          const parsed = parse(action.items);
          parsed.forEach((item) => tokens.delete(item));
        } else if (action.type === "set") {
          const parsed = parse(action.items);
          tokens = parsed;
        } else if (action.type === "apply") {
          actions.push(...action.items.#patch());
        }
      }
    }

    return [...tokens].join(" ");
  }
}

const out = new Outclass();

export { out };
